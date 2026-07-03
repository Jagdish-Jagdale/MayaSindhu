# Razorpay Backend Integration

This folder contains PHP backend endpoints for Razorpay payment integration.

## Setup Instructions

### 1. Install Dependencies

Make sure you have PHP and Composer installed on your server.

Run the following command in the backend directory:

```bash
composer install
```

This will install the Razorpay PHP SDK.

### 2. Configure API Keys

**Option 1: Using Environment Variables (Recommended)**

Set the following environment variables on your server:

```bash
export RAZORPAY_KEY_ID=your_razorpay_key_id
export RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Or add them to your server's environment configuration (e.g., in Apache's `.htaccess`, Nginx config, or system environment).

**Option 2: Using .env File**

Copy `.env.example` to `.env` and add your keys:

```bash
cp .env.example .env
```

Then edit `.env`:
```
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
```

Add this to the top of your PHP files (before including config.php):
```php
if (file_exists(__DIR__ . '/.env')) {
    $lines = file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($name, $value) = explode('=', $line, 2);
        $_ENV[trim($name)] = trim($value);
        putenv(trim($name) . '=' . trim($value));
    }
}
```

**Option 3: Direct Configuration (Not Recommended for Production)**

Edit `config.php` directly and replace the placeholder values with your actual Razorpay API keys:

```php
define('RAZORPAY_KEY_ID', 'your_razorpay_key_id');
define('RAZORPAY_KEY_SECRET', 'your_razorpay_key_secret');
```

You can get these keys from the [Razorpay Dashboard](https://dashboard.razorpay.com/).

### 3. Deploy to Server

Upload the entire `backend` folder to your PHP server (e.g., Apache, Nginx).

Make sure your server has:
- PHP 7.4 or higher
- Composer installed
- SSL enabled (for HTTPS)

### 4. API Endpoints

#### Create Order
- **URL**: `/backend/create_order.php`
- **Method**: POST
- **Request Body**:
  ```json
  {
    "amount": 50000,  // Amount in paise (₹500 = 50000 paise)
    "currency": "INR",
    "receipt": "order_123456"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "order_id": "order_XXXXXXXXXXXXX",
    "currency": "INR",
    "amount": 50000
  }
  ```

#### Verify Payment
- **URL**: `/backend/verify_payment.php`
- **Method**: POST
- **Request Body**:
  ```json
  {
    "razorpay_order_id": "order_XXXXXXXXXXXXX",
    "razorpay_payment_id": "pay_XXXXXXXXXXXXX",
    "razorpay_signature": "XXXXXXXXXXXXX"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Payment verified successfully",
    "razorpay_payment_id": "pay_XXXXXXXXXXXXX"
  }
  ```

### 5. Frontend Integration

Update your frontend code to call these backend endpoints instead of using the Razorpay SDK directly.

Example:
```javascript
// Create order
const response = await fetch('/backend/create_order.php', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ amount: total * 100 })
});
const { order_id } = await response.json();

// Use order_id with Razorpay checkout
const options = {
  key: 'your_razorpay_key_id',
  order_id: order_id,
  // ... other options
};

// Verify payment after success
const verifyResponse = await fetch('/backend/verify_payment.php', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    razorpay_order_id: order_id,
    razorpay_payment_id: payment_id,
    razorpay_signature: signature
  })
});
```

## Security Notes

- Never commit your API keys to version control
- Use environment variables for sensitive data in production
- Enable HTTPS on your server
- Implement proper authentication for your API endpoints
- Validate and sanitize all input data

## Troubleshooting

### Composer not found
Install Composer from [https://getcomposer.org/](https://getcomposer.org/)

### CORS errors
The config.php file already includes CORS headers. If you still face issues, check your server configuration.

### Payment verification fails
Ensure the signature is generated correctly on the frontend and matches what Razorpay sends.
