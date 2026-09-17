<?php
// Customer-scoped order status lookup. It never returns orders for another customer.
require_once __DIR__ . '/db_config.php';
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'message' => 'Only GET requests are accepted.']);
    exit;
}

$orderId = trim((string)($_GET['orderId'] ?? ''));
$phone = preg_replace('/\D+/', '', (string)($_GET['phone'] ?? ''));
$email = strtolower(trim((string)($_GET['email'] ?? '')));
if (!$orderId || (!$phone && !$email)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'message' => 'Order and customer details are required.']);
    exit;
}

try {
    $stmt = dloop_db()->prepare('SELECT order_id, customer_phone, customer_email, payment_method, payment_status, utr, order_status FROM orders WHERE order_id = ? LIMIT 1');
    $stmt->execute([$orderId]);
    $order = $stmt->fetch();
    $storedPhone = preg_replace('/\D+/', '', (string)($order['customer_phone'] ?? ''));
    $storedEmail = strtolower(trim((string)($order['customer_email'] ?? '')));
    $authorized = $order && (($phone && ($phone === $storedPhone || str_ends_with($phone, $storedPhone) || str_ends_with($storedPhone, $phone))) || ($email && $email === $storedEmail));
    if (!$authorized) {
        http_response_code(404);
        echo json_encode(['ok' => false, 'message' => 'Order not found.']);
        exit;
    }
    echo json_encode(['ok' => true, 'order' => [
        'orderId' => $order['order_id'],
        'paymentMethod' => $order['payment_method'],
        'paymentStatus' => strtoupper($order['payment_status']),
        'utr' => $order['utr'],
        'status' => $order['order_status']
    ]]);
} catch (Throwable $e) {
    error_log('D Loop order status API: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['ok' => false, 'message' => 'Unable to load order status.']);
}
