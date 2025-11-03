# Razorpay Tokenization Setup Guide

## Important: Tokenization Feature Must Be Enabled

**Saved cards will NOT work unless tokenization is enabled in your Razorpay account!**

## Steps to Enable Tokenization

### 1. Contact Razorpay Support

1. **Login to Razorpay Dashboard:**
   - Go to https://dashboard.razorpay.com/
   - Login with your account

2. **Request Tokenization Activation:**
   - Go to **Settings** → **Features**
   - Look for **Tokenization** or **Saved Cards** feature
   - If not visible, contact Razorpay support:
     - Email: support@razorpay.com
     - Or use the support chat in dashboard
     - Request: "Please enable tokenization/saved cards feature for my account"

3. **Wait for Activation:**
   - Razorpay typically takes **5-7 working days** to enable tokenization
   - They need to enable it for different card networks (Visa, Mastercard, RuPay, etc.)

### 2. Verify Tokenization is Enabled

After activation, verify in Razorpay dashboard:
- Go to **Settings** → **Features**
- Check if **Tokenization** or **Saved Cards** is enabled
- You should see options to manage saved cards

### 3. Test Saved Cards

Once enabled:
1. Make a test payment
2. Check "Save Card" option in Razorpay checkout
3. Complete payment
4. Check if card appears in Manage Payment page

## Common Issues

### Issue: Cards Saved but Not Appearing

**Possible Causes:**
1. **Tokenization not enabled** - Most common issue
2. **Customer ID mismatch** - Payment created with different customer_id
3. **Token not in payment response** - Card wasn't actually saved
4. **API endpoint differences** - Razorpay API might have changed

### Debug Steps

1. **Check Server Logs:**
   ```bash
   # Look for these log messages:
   - "Payment details - method: ..., token_id: ..."
   - "Card was saved with token_id: ..."
   - "Fetching tokens from: /customers/.../tokens"
   - "Found X tokens from customer API"
   ```

2. **Run Debug Script:**
   ```bash
   python test_saved_cards_debug.py
   ```

3. **Check Payment Response:**
   - When payment completes, check server logs
   - Look for `token_id` in payment response
   - If `token_id` is `None`, card was not saved

4. **Verify in Razorpay Dashboard:**
   - Go to **Payments** → Find your payment
   - Check if payment shows `token_id`
   - Go to **Customers** → Find your customer
   - Check if tokens are listed

## Testing

### Test Script
```bash
cd server
python test_saved_cards_debug.py
```

### Manual Test
1. Make a payment with "Save Card" checked
2. Check server logs for token_id
3. Visit `/manage-payment` page
4. Check if card appears

## If Tokenization is Enabled but Still Not Working

1. **Check Customer ID:**
   - Ensure same `customer_id` is used in order creation and payment
   - Check if payment has `customer_id` field

2. **Check Token ID in Payment:**
   - Payment response should have `token_id` field
   - If missing, card wasn't saved (user didn't check box or feature not enabled)

3. **Check Razorpay API:**
   - Token fetching endpoint: `/customers/{customer_id}/tokens`
   - Verify endpoint is accessible with your API keys

4. **Contact Razorpay Support:**
   - Provide them with:
     - Payment ID
     - Customer ID
     - Token ID (if available)
   - Ask them to verify tokenization is working

## Next Steps

1. **Enable tokenization** (if not done)
2. **Wait 5-7 days** for activation
3. **Test with real payment**
4. **Check server logs** for debugging info
5. **Run debug script** to verify

## Important Notes

- Tokenization is **NOT enabled by default**
- You **MUST request activation** from Razorpay
- It takes **5-7 working days** to activate
- Different card networks may activate at different times
- Saved cards will **NOT work** until tokenization is enabled

