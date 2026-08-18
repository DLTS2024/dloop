<?php
/**
 * D Loop 3D — Pay0 Check Order Status API Endpoint
 * POST /api/pay0_status.php
 * https://pay0.shop/docs
 */

require_once __DIR__ . '/pay0_config.php';

header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => false, 'message' => 'Only POST requests are accepted.']);
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

$orderId = isset($postData['order_id']) ? trim($postData['order_id']) : '';

if (empty($orderId)) {
    http_response_code(400);
    echo json_encode(['status' => false, 'message' => 'Missing required parameter: order_id']);
    exit;
}

$apiPayload = [
    'user_token' => PAY0_API_KEY,
    'order_id'   => $orderId
];

$ch = curl_init(PAY0_BASE_URL . '/check-order-status');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($apiPayload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/x-www-form-urlencoded'
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 15);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

$response = curl_exec($ch);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    http_response_code(500);
    echo json_encode([
        'status' => false,
        'message' => 'cURL Error: ' . $curlError
    ]);
    exit;
}

echo $response;
