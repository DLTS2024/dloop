<?php
// Authenticated administration endpoint for orders and manual payment confirmation.
require_once __DIR__ . '/db_config.php';
header('Content-Type: application/json; charset=utf-8');

if (!hash_equals(ADMIN_SYNC_PASSWORD, $_SERVER['HTTP_X_DLOOP_ADMIN_PASSWORD'] ?? '')) {
    http_response_code(401);
    echo json_encode(['ok' => false, 'message' => 'Admin authentication required.']);
    exit;
}
$db = dloop_db();
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $orders = $db->query('SELECT * FROM orders ORDER BY created_at DESC')->fetchAll();
    $items = $db->query('SELECT * FROM order_items ORDER BY id')->fetchAll();
    $grouped = [];
    foreach ($items as $item) $grouped[$item['order_id']][] = $item;
    foreach ($orders as &$order) {
        $order['orderId'] = $order['order_id'];
        $order['customer'] = $order['customer_name'];
        $order['phone'] = $order['customer_phone'];
        $order['email'] = $order['customer_email'];
        $order['total'] = (float)$order['total_amount'];
        $order['subtotal'] = (float)$order['subtotal'];
        $order['paymentMethod'] = !empty($order['payment_method']) ? $order['payment_method'] : 'whatsapp';
        $order['paymentStatus'] = strtoupper($order['payment_status']);
        $order['status'] = $order['order_status'];
        $order['utr'] = $order['utr'] ?? null;
        $order['notes'] = $order['notes'] ?? null;
        $order['createdAt'] = strtotime($order['created_at']) * 1000;
        $order['items'] = array_map(fn($item) => [
            'name' => $item['item_name'], 'details' => $item['details'], 'qty' => (int)$item['quantity'],
            'price' => (float)$item['unit_price'], 'total' => (float)$item['total_price'],
            'fileName' => $item['stl_file_name'], 'isCustomStl' => (bool)$item['is_custom_stl'],
            'productId' => $item['product_id'],
            'filamentProductId' => $item['filament_product_id'], 'filamentColorName' => $item['filament_color_name']
        ], $grouped[$order['order_id']] ?? []);
    }
    echo json_encode(['ok' => true, 'orders' => $orders]);
    exit;
}

$payload = json_decode(file_get_contents('php://input'), true) ?: [];
$orderId = trim((string)($payload['orderId'] ?? ''));
$action = $payload['action'] ?? '';
if (!$orderId || !in_array($action, ['mark_paid', 'set_status'], true)) {
    http_response_code(400); echo json_encode(['ok' => false, 'message' => 'Invalid request.']); exit;
}
if ($action === 'mark_paid') {
    $stmt = $db->prepare("UPDATE orders SET payment_status = 'paid' WHERE order_id = ?");
    $stmt->execute([$orderId]);
} else {
    $status = $payload['status'] ?? '';
    if (!in_array($status, ['new','processing','shipped','delivered','cancelled'], true)) {
        http_response_code(400); echo json_encode(['ok' => false, 'message' => 'Invalid order status.']); exit;
    }
    $stmt = $db->prepare('UPDATE orders SET order_status = ? WHERE order_id = ?');
    $stmt->execute([$status, $orderId]);
}
echo json_encode(['ok' => true]);
