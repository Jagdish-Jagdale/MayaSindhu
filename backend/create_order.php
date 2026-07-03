<?php
require_once 'config.php';
require_once 'vendor/autoload.php';

use Razorpay\Api\Api;

header('Content-Type: application/json');

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['amount'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid request. Amount is required.']);
    exit;
}

$amount = $input['amount']; // Amount in smallest currency unit (paise for INR)
$currency = isset($input['currency']) ? $input['currency'] : 'INR';
$receipt = isset($input['receipt']) ? $input['receipt'] : 'order_' . time();

try {
    $api = new Api(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET);
    
    $orderData = [
        'receipt'         => $receipt,
        'amount'          => $amount,
        'currency'        => $currency,
        'payment_capture' => 1 // Auto capture
    ];
    
    $razorpayOrder = $api->order->create($orderData);
    
    echo json_encode([
        'success' => true,
        'order_id' => $razorpayOrder['id'],
        'currency' => $razorpayOrder['currency'],
        'amount' => $razorpayOrder['amount']
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
