<?php
/**
 * D Loop 3D — Pay0 Instant Webhook Handler
 * POST /api/pay0_webhook.php
 * https://pay0.shop/docs
 */

require_once __DIR__ . '/pay0_config.php';

header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => false, 'message' => 'Only POST requests are allowed.']);
    exit;
}

$postData = $_POST;
if (empty($postData)) {
    $rawInput = file_get_contents('php://input');
    if (!empty($rawInput)) {
        $json = json_decode($rawInput, true);
        if (is_array($json)) {
            $postData = $json;
        } else {
            parse_str($rawInput, $postData);
        }
    }
}

// Log incoming webhook data safely
$logDir = __DIR__ . '/logs';
if (!is_dir($logDir)) {
    @mkdir($logDir, 0755, true);
}

$logEntry = date('Y-m-d H:i:s') . " | PAY0 WEBHOOK: " . json_encode($postData) . PHP_EOL;
@file_put_contents($logDir . '/pay0_webhooks.log', $logEntry, FILE_APPEND);

$orderStatus = isset($postData['status']) ? strtoupper(trim($postData['status'])) : '';
$orderId = isset($postData['order_id']) ? trim($postData['order_id']) : '';
$customerMobile = isset($postData['customer_mobile']) ? trim($postData['customer_mobile']) : '';
$amount = isset($postData['amount']) ? trim($postData['amount']) : '';
$utr = isset($postData['utr']) ? trim($postData['utr']) : (isset($postData['remark1']) ? trim($postData['remark1']) : '');

if (empty($orderId)) {
    echo json_encode(['status' => false, 'message' => 'Order ID is empty']);
    exit;
}

// Respond with 200 OK to Pay0
echo json_encode([
    'status' => true,
    'message' => 'Webhook received successfully',
    'order_id' => $orderId,
    'order_status' => $orderStatus
]);
