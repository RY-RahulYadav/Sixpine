# Payment Preferences API Documentation

## Overview
This API allows users to manage their payment preferences including saved cards (stored in Razorpay), preferred payment methods, addresses, and nicknames.

**IMPORTANT**: Card details are NOT stored in our database. Cards are saved directly in Razorpay using their built-in card save feature during checkout.

## API Endpoints

### 1. Get Payment Preference
**GET** `/api/auth/payment-preferences/`

Returns the user's current payment preference including preferred method, address, and nickname.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "preferred_method": "card",
    "preferred_card_token_id": "token_abc123",
    "preferred_address_id": 5,
    "preferred_address": {
      "id": 5,
      "full_name": "John Doe",
      "city": "Mumbai",
      "state": "Maharashtra",
      ...
    },
    "payment_nickname": "My Default Card",
    "razorpay_customer_id": "cust_xyz789",
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  }
}
```

### 2. Update Payment Preference
**PATCH** `/api/auth/payment-preferences/update/`

Update user's payment preference.

**Request Body:**
```json
{
  "preferred_method": "card",
  "preferred_card_token_id": "token_abc123",
  "preferred_address_id": 5,
  "payment_nickname": "My Default Card"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment preference updated successfully",
  "data": { ... }
}
```

### 3. Get Saved Cards from Razorpay
**GET** `/api/auth/payment-preferences/saved-cards/`

Fetch all saved cards from Razorpay (cards are stored in Razorpay, not in our DB).

**Response:**
```json
{
  "success": true,
  "customer_id": "cust_xyz789",
  "saved_cards": [],
  "count": 0,
  "message": "Cards are saved in Razorpay during checkout. After making a payment with save card option, cards will appear here."
}
```

**Note:** Cards will only appear here after:
1. User makes a payment with "save card" option enabled during Razorpay checkout
2. Razorpay returns a token_id in the payment response
3. Token is stored in PaymentPreference.preferred_card_token_id

### 4. Delete Saved Card
**DELETE** `/api/auth/payment-preferences/saved-cards/{token_id}/delete/`

Delete a saved card from Razorpay.

**Response:**
```json
{
  "success": true,
  "message": "Card removed successfully"
}
```

## Testing

Run the test script:
```bash
cd server
python test_payment_preferences_api.py
```

**IMPORTANT:** Restart Django server after adding these URLs:
```bash
# Stop server (Ctrl+C) and restart
python manage.py runserver
```

## Integration with Checkout

To use preferred payment methods in checkout:
1. Fetch user's payment preference: `GET /api/auth/payment-preferences/`
2. If `preferred_method` is set:
   - Pre-select that payment method in Razorpay options
   - If `preferred_card_token_id` exists, pass it to Razorpay checkout
3. If `preferred_address_id` is set, pre-select that address

## Security

- ✅ Card numbers are NEVER stored in our database
- ✅ Only Razorpay token IDs are stored (references, not actual card data)
- ✅ All card operations go through Razorpay's secure API
- ✅ Users must be authenticated to access these endpoints

