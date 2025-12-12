<?php

declare(strict_types=1);

// ----------------------------------------------------------------------
// API: Get Detailed Billing Info (Replica of get_billing_details.php)
// ----------------------------------------------------------------------

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database Connection
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

try {
    $patientId = isset($_GET['patient_id']) ? (int)$_GET['patient_id'] : 0;
    
    if ($patientId <= 0) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid Patient ID']);
        exit();
    }

    // Query 1: Info & Totals
    $stmt = $pdo->prepare("
        SELECT
            p.patient_id,
            r.patient_name,
            r.age,
            r.gender,
            r.phone_number,
            r.patient_photo_path,
            pm.patient_uid,
            p.assigned_doctor,
            p.status AS patient_status,
            p.total_amount,
            p.due_amount,
            
            (SELECT COALESCE(SUM(amount), 0) 
             FROM payments 
             WHERE patient_id = p.patient_id) AS total_paid,
             
            (SELECT COALESCE(SUM(amount), 0) 
             FROM payments 
             WHERE patient_id = p.patient_id AND payment_date = CURDATE()) AS today_paid
             
        FROM patients p
        LEFT JOIN registration r ON p.registration_id = r.registration_id
        LEFT JOIN patient_master pm ON r.master_patient_id = pm.master_patient_id
        WHERE p.patient_id = :patient_id
    ");
    $stmt->execute(['patient_id' => $patientId]);
    $data = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$data) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Patient not found']);
        exit();
    }

    // Query 2: Transactions
    $stmtPayments = $pdo->prepare("
        SELECT payment_id, payment_date, amount, mode, remarks
        FROM payments
        WHERE patient_id = :patient_id
        ORDER BY payment_date DESC, created_at DESC
    ");
    $stmtPayments->execute([':patient_id' => $patientId]);
    $payments = $stmtPayments->fetchAll(PDO::FETCH_ASSOC);

    $data['payments'] = $payments;

    // Formatting
    $data['total_amount'] = (float)$data['total_amount'];
    $data['total_paid'] = (float)$data['total_paid'];
    // Recalculate due for frontend consistency
    $data['due_amount'] = $data['total_amount'] - $data['total_paid']; 
    $data['today_paid'] = (float)$data['today_paid'];

    echo json_encode([
        'status' => 'success',
        'data' => $data
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
