<?php
/**
 * D Loop 3D — Pay0 Create Order API Endpoint
 * POST /api/pay0_create_order.php
 * https://pay0.shop/docs
 */

require_once __DIR__ . '/pay0_config.php';

header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => false, 'message' => 'Only POST requests are accepted.']);
    exit;
}

// Retrieve POST variables (support JSON body or x-www-form-urlencoded)
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

$customerMobile = isset($postData['customer_mobile']) ? preg_replace('/\D/', '', $postData['customer_mobile']) : '9876543210';
if (strlen($customerMobile) > 10) {
    $customerMobile = substr($customerMobile, -10);
}

$customerName = isset($postData['customer_name']) ? trim($postData['customer_name']) : 'DLoop Customer';
$amount = isset($postData['amount']) ? floatval($postData['amount']) : 1.00;
$orderId = isset($postData['order_id']) ? trim($postData['order_id']) : ('DL3D-' . time());
$redirectUrl = isset($postData['redirect_url']) ? trim($postData['redirect_url']) : 'https://dloopstore.in/account.html';
$remark1 = isset($postData['remark1']) ? trim($postData['remark1']) : 'DLoop 3D Order';
$remark2 = isset($postData['remark2']) ? trim($postData['remark2']) : '';

$apiPayload = [
    'customer_mobile' => $customerMobile,
    'customer_name'   => $customerName,
    'user_token'      => PAY0_API_KEY,
    'amount'          => number_format($amount, 2, '.', ''),
    'order_id'        => $orderId,
    'redirect_url'    => $redirectUrl,
    'remark1'         => $remark1,
    'remark2'         => $remark2
];

// Call Pay0 API via cURL
$ch = curl_init(PAY0_BASE_URL . '/create-order');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($apiPayload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/x-www-form-urlencoded'
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 15);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
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
