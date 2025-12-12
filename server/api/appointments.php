<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../../common/db.php';

try {
    // Determine Start (Sunday) and End (Saturday) of current week
    // If today is Sunday, 'last sunday' might jump back a week depending on logic, so be careful.
    // 'sunday this week' works in PHP 5.3+ ?
    // Simpler: 
    $today = new DateTime();
    $dayOfWeek = $today->format('w'); // 0 (Sun) - 6 (Sat)
    
    $startOfWeek = clone $today;
    $startOfWeek->modify("-$dayOfWeek days"); // Go back to Sunday
    
    $endOfWeek = clone $startOfWeek;
    $endOfWeek->modify("+6 days"); // Go forward to Saturday
    
    $startDate = $startOfWeek->format('Y-m-d');
    $endDate = $endOfWeek->format('Y-m-d');

    $branchId = isset($_GET['branch_id']) ? (int)$_GET['branch_id'] : 1; 

    $stmt = $pdo->prepare("
        SELECT 
            registration_id, 
            patient_name, 
            appointment_time, 
            appointment_date,
            status, 
            phone_number,
            gender,
            age
        FROM registration 
        WHERE branch_id = :bid 
          AND appointment_date BETWEEN :start AND :end
        ORDER BY appointment_date DESC, appointment_time DESC
    ");
    
    $stmt->execute([
        'bid' => $branchId, 
        'start' => $startDate, 
        'end' => $endDate
    ]);
    $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "data" => $appointments,
        "period" => "$startDate to $endDate"
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
