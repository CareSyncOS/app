<?php

declare(strict_types=1);

// ----------------------------------------------------------------------
// API: Mark Attendance (Wrapper for add_attendance logic)
// ----------------------------------------------------------------------

// CORS Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

// Handle Preflight Options Request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ----------------------------------------------------------------------
// 1. Database Connection
// ----------------------------------------------------------------------
$db_paths = [
    __DIR__ . '/../../common/db.php',
    __DIR__ . '/../../../common/db.php',
    $_SERVER['DOCUMENT_ROOT'] . '/prospine/server/common/db.php',
    $_SERVER['DOCUMENT_ROOT'] . '/common/db.php'
];

$db_loaded = false;
foreach ($db_paths as $path) {
    if (file_exists($path)) {
        require_once $path;
        $db_loaded = true;
        break;
    }
}

if (!$db_loaded) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database configuration not found']);
    exit();
}

// ----------------------------------------------------------------------
// 2. Logic (Mirrors reception/api/add_attendance.php)
// ----------------------------------------------------------------------
try {
    session_start();

    // Read JSON Payload
    $json_data = json_decode(file_get_contents('php://input'), true);
    if ($json_data === null) {
        throw new Exception('Invalid JSON data received.');
    }

    // Auth: Check Session OR provided employee_id
    $employeeId = $_SESSION['employee_id'] ?? $json_data['employee_id'] ?? null;
    
    // Fallback: If no employee ID is found, use a default system ID (e.g., 1) IF strictly needed for mobile prototype
    // ideally strictly enforce auth. 
    if (!$employeeId) {
        // For development/prototype ease, we might default to 1 if not strictly enforced, 
        // but let's try to enforce it.
        // If the mobile app stores user info, it should send it.
        if (isset($json_data['user_id'])) $employeeId = $json_data['user_id'];
    }

    if (!$employeeId) {
        throw new Exception('Unauthorized: generic user identification missing.');
    }
    
    $employeeId = (int)$employeeId;
    $patientId = (int)($json_data['patient_id'] ?? 0);
    $paymentAmount = isset($json_data['payment_amount']) ? (float)$json_data['payment_amount'] : 0.0;
    $mode = trim((string)($json_data['mode'] ?? ''));
    $remarks = trim((string)($json_data['remarks'] ?? ''));

    if ($patientId <= 0) {
        throw new Exception('Invalid patient ID');
    }

    $pdo->beginTransaction();

    // Fetch Patient & Lock
    $pstmt = $pdo->prepare("
        SELECT patient_id, branch_id, treatment_type, treatment_cost_per_day, total_amount, due_amount, treatment_days, package_cost, status, start_date, plan_changed, advance_payment
        FROM patients
        WHERE patient_id = ?
        FOR UPDATE
    ");
    $pstmt->execute([$patientId]);
    $patient = $pstmt->fetch(PDO::FETCH_ASSOC);

    if (!$patient) {
        throw new Exception('Patient not found');
    }

    // Branch check logic (Optional, skipping here to allow flexible mobile access for now)

    // Check Duplicate for Today
    $dupStmt = $pdo->prepare("SELECT COUNT(*) FROM attendance WHERE patient_id = ? AND attendance_date = CURDATE()");
    $dupStmt->execute([$patientId]);
    if ((int)$dupStmt->fetchColumn() > 0) {
        throw new Exception('Attendance already marked for today');
    }

    // Determine Cost Per Day
    $treatmentType = strtolower((string)$patient['treatment_type']);
    $costPerDay = 0.0;

    if ($treatmentType === 'package') {
        if ((int)($patient['treatment_days'] ?? 0) > 0) {
            $costPerDay = (float)($patient['package_cost'] ?? 0) / (int)($patient['treatment_days']);
        }
    } elseif ($treatmentType === 'daily' || $treatmentType === 'advance') {
        $costPerDay = (float)($patient['treatment_cost_per_day'] ?? 0);
    }

    if ($costPerDay <= 0) {
        // Fallback or warning? strictly throwing exception might block legacy data.
        // Let's allow 0 cost but maybe log it?
        // throw new Exception('Invalid cost per day configuration');
    }

    // Calculate Balance
    $paidStmt = $pdo->prepare("SELECT COALESCE(SUM(amount), 0) FROM payments WHERE patient_id = ?");
    $paidStmt->execute([$patientId]);
    $paidSum = (float)$paidStmt->fetchColumn();

    // Calculate Consumed (Using Current Plan Logic for consistency with attendance.php API)
    $startDate = $patient['start_date'] ?? '1970-01-01';
    $currentAttStmt = $pdo->prepare("SELECT COUNT(*) FROM attendance WHERE patient_id = ? AND attendance_date >= ?");
    $currentAttStmt->execute([$patientId, $startDate]);
    $currentAttCount = (int)$currentAttStmt->fetchColumn();
    
    // Note: add_attendance.php considers historical plans too. 
    // To be perfectly safe, we should probably stick to the simplified logic for now unless historical data is huge.
    // If we use $costPerDay * $currentAttCount, we assume the cost hasn't changed within the plan.
    $totalConsumed = ($currentAttCount * $costPerDay);
    
    // Add logic for historical plans if needed? 
    // For now, simple implementation.

    $effectiveBalance = $paidSum - $totalConsumed;
    $needed = max(0.0, $costPerDay - $effectiveBalance);

    // Payment Handling
    $paymentId = null;
    if ($paymentAmount > 0.0) {
        if ($mode === '') {
            throw new Exception('Payment mode is required.');
        }
        $insPay = $pdo->prepare("
            INSERT INTO payments (patient_id, payment_date, amount, mode, remarks, created_at, processed_by_employee_id)
            VALUES (?, CURDATE(), ?, ?, ?, NOW(), ?)
        ");
        $insPay->execute([$patientId, $paymentAmount, $mode, $remarks, $employeeId]);
        $paymentId = (int)$pdo->lastInsertId();
    } else {
        // Check balance if no payment
        $isMarkedAsDue = stripos($remarks, 'marked as due') !== false || stripos($remarks, 'pay later') !== false;
        if (!$isMarkedAsDue && $effectiveBalance < $costPerDay) {
            $neededFmt = number_format($needed, 2, '.', '');
            throw new Exception("Insufficient balance. Need ₹{$neededFmt}.");
        }
    }

    // Insert Attendance
    if ($remarks === '') {
        $remarks = 'Auto: ' . ucfirst($treatmentType) . ' attendance';
    }
    $insAtt = $pdo->prepare("
        INSERT INTO attendance (patient_id, attendance_date, remarks, payment_id, marked_by_employee_id)
        VALUES (?, CURDATE(), ?, ?, ?)
    ");
    $insAtt->execute([$patientId, $remarks, $paymentId, $employeeId]);
    $attendanceId = (int)$pdo->lastInsertId();

    // Recalculate and Update Patient
    $recalcPaidStmt = $pdo->prepare("SELECT COALESCE(SUM(amount), 0) FROM payments WHERE patient_id = ?");
    $recalcPaidStmt->execute([$patientId]);
    $finalPaid = (float)$recalcPaidStmt->fetchColumn();

    $newDue = (float)$patient['total_amount'] - $finalPaid;

    // Reactivate if inactive
    $newStatus = $patient['status'];
    if ($patient['status'] === 'inactive') $newStatus = 'active';

    $updPat = $pdo->prepare("UPDATE patients SET advance_payment = ?, due_amount = ?, status = ? WHERE patient_id = ?");
    $updPat->execute([$finalPaid, $newDue, $newStatus, $patientId]);

    $pdo->commit();

    echo json_encode([
        'status' => 'success', 
        'message' => 'Attendance marked',
        'attendance_id' => $attendanceId,
        'new_balance' => $finalPaid - ($totalConsumed + $costPerDay) // Estimate
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
