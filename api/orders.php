<?php
// Public order submission endpoint. Database credentials stay server-side.
require_once __DIR__ . '/db_config.php';
header('Content-Type: application/json; charset=utf-8');

function body(): array {
    $data = json_decode(file_get_contents('php://input'), true);
    return is_array($data) ? $data : [];
}
function fail(string $message, int $status = 400): never {
    http_response_code($status);
    echo json_encode(['ok' => false, 'message' => $message]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Only POST requests are accepted.', 405);
$order = body();
foreach (['orderId', 'customer', 'phone', 'email'] as $field) {
    if (empty($order[$field]) || !is_string($order[$field])) fail("Missing {$field}.");
}
$items = isset($order['items']) && is_array($order['items']) ? $order['items'] : [];
if (!$items) fail('At least one item is required.');

try {
    $db = dloop_db();
    $db->beginTransaction();
    $exists = $db->prepare('SELECT order_id FROM orders WHERE order_id = ? FOR UPDATE');
    $exists->execute([$order['orderId']]);
    if (!$exists->fetch()) {
        $insert = $db->prepare('INSERT INTO orders
          (order_id, user_id, customer_name, customer_phone, customer_email, delivery_method, delivery_charge,
           shipping_city, shipping_pincode, shipping_full_address, subtotal, total_amount, payment_method, payment_status, order_status, utr, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $method = in_array($order['deliveryMethod'] ?? '', ['courier', 'pickup'], true) ? $order['deliveryMethod'] : 'courier';
        $payMethod = !empty($order['paymentMethod']) ? (string)$order['paymentMethod'] : 'whatsapp';
        $payStatus = !empty($order['paymentStatus']) ? strtolower((string)$order['paymentStatus']) : 'pending';
        $orderStatus = !empty($order['status']) ? (string)$order['status'] : 'new';
        $utr = !empty($order['utr']) ? (string)$order['utr'] : null;
        $notes = !empty($order['notes']) ? (string)$order['notes'] : null;

        $insert->execute([
            $order['orderId'], $order['userId'] ?? null, $order['customer'], $order['phone'], $order['email'], $method,
            (float)($order['deliveryCharge'] ?? 0), $order['city'] ?? 'Chennai', $order['pincode'] ?? '', $order['address'] ?? '',
            (float)($order['subtotal'] ?? 0), (float)($order['total'] ?? 0), $payMethod, $payStatus, $orderStatus, $utr, $notes
        ]);
        $itemInsert = $db->prepare('INSERT INTO order_items
          (order_id, product_id, item_name, details, is_custom_stl, stl_file_name, filament_product_id, filament_color_name, quantity, unit_price, total_price)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        foreach ($items as $item) {
            $itemInsert->execute([
                $order['orderId'], $item['productId'] ?? ($item['id'] ?? null), (string)($item['name'] ?? 'Item'), (string)($item['details'] ?? ''),
                !empty($item['isCustomStl']) ? 1 : 0, $item['fileName'] ?? null, $item['filamentProductId'] ?? null,
                $item['filamentColorName'] ?? null, max(1, (int)($item['qty'] ?? 1)), (float)($item['price'] ?? 0), (float)($item['total'] ?? 0)
            ]);
        }
    }
    $db->commit();
    echo json_encode(['ok' => true, 'orderId' => $order['orderId']]);
} catch (Throwable $e) {
    if (isset($db) && $db->inTransaction()) $db->rollBack();
    error_log('D Loop order API: ' . $e->getMessage());
    fail('Unable to save the order right now.', 500);
}
