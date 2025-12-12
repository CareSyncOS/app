<?php

declare(strict_types=1);

// ----------------------------------------------------------------------
// API: Test Details
// ----------------------------------------------------------------------

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../common/db.php';

try {
    $testId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    
    if (!$testId) {
        throw new Exception("Invalid Test ID");
    }

    // 1. Fetch Header
    $stmt = $pdo->prepare("SELECT * FROM tests WHERE test_id = ?");
    $stmt->execute([$testId]);
    $header = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$header) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Test not found']);
        exit();
    }

    // 2. Fetch Items
    $stmtItems = $pdo->prepare("SELECT * FROM test_items WHERE test_id = ? ORDER BY item_id ASC");
    $stmtItems->execute([$testId]);
    $items = $stmtItems->fetchAll(PDO::FETCH_ASSOC);

    // Format
    $header['total_amount'] = (float)$header['total_amount'];
    $header['advance_amount'] = (float)$header['advance_amount'];
    $header['due_amount'] = (float)$header['due_amount'];
    $header['discount'] = (float)($header['discount'] ?? 0);

    foreach ($items as &$item) {
        $item['total_amount'] = (float)$item['total_amount'];
        $item['advance_amount'] = (float)$item['advance_amount'];
        $item['due_amount'] = (float)$item['due_amount'];
    }

    $header['items'] = $items;

    echo json_encode([
        'status' => 'success',
        'data' => $header
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
