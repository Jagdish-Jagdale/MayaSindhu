<?php
require_once 'config.php';
require_once 'vendor/autoload.php';

use Razorpay\Api\Api;

header('Content-Type: application/json');

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['razorpay_order_id']) || !isset($input['razorpay_payment_id']) || !isset($input['razorpay_signature'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid request. Required payment details are missing.']);
    exit;
}

$razorpayOrderId = $input['razorpay_order_id'];
$razorpayPaymentId = $input['razorpay_payment_id'];
$razorpaySignature = $input['razorpay_signature'];

try {
    $api = new Api(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET);
    
    // Verify the signature
    $attributes = [
        'razorpay_order_id'   => $razorpayOrderId,
        'razorpay_payment_id'  => $razorpayPaymentId,
        'razorpay_signature'  => $razorpaySignature
    ];
    
    $api->utility->verifyPaymentSignature($attributes);
    
    // Payment signature is valid
    echo json_encode([
        'success' => true,
        'message' => 'Payment verified successfully',
        'razorpay_payment_id' => $razorpayPaymentId
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Payment verification failed: ' . $e->getMessage()
    ]);
}
?>
