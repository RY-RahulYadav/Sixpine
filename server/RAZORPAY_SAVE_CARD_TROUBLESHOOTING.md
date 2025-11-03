# Razorpay Save Card Troubleshooting

## Issue: "Save this card" checkbox not appearing

### Common Causes:

1. **Flash Checkout Not Enabled**
   - Razorpay's Flash Checkout feature must be enabled
   - Contact Razorpay support to enable it
   - This is required for card saving functionality

2. **Wrong `save` Parameter Format**
   - ✅ Correct: `save: 1` (number)
   - ❌ Wrong: `save: true` (boolean)
   - Razorpay expects `save: 1` as a number

3. **Customer ID Not Valid**
   - Customer ID must exist in Razorpay
   - Must start with `cust_`
   - Must be from the same Razorpay account (test/live)

4. **Tokenization Not Enabled**
   - Tokenization feature must be enabled in Razorpay dashboard
   - Contact Razorpay support if not enabled
   - Takes 5-7 working days to activate

### Current Implementation:

```javascript
// ✅ Correct format
const options = {
  customer_id: "cust_ABC123",
  save: 1,  // Number 1, not boolean true
  // ... other options
};
```

### Verification Steps:

1. **Check if customer_id is valid:**
   ```bash
   # Check server logs when creating order
   # Should see: "Customer ID: cust_..."
   ```

2. **Verify in Razorpay Dashboard:**
   - Login to Razorpay dashboard
   - Go to Customers
   - Check if customer exists

3. **Test with minimal options:**
   ```javascript
   var options = {
     key: "rzp_test_xxxxx",
     amount: 10000,
     currency: "INR",
     order_id: "order_xxxxx",
     customer_id: "cust_xxxxx",
     save: 1,  // Must be number
     handler: function(response) {
       console.log(response);
     }
   };
   ```

### If Checkbox Still Doesn't Appear:

1. **Contact Razorpay Support:**
   - Request Flash Checkout activation
   - Request Tokenization activation
   - Provide your Razorpay account details

2. **Check Browser Console:**
   - Look for Razorpay errors
   - Check if customer_id is being passed correctly

3. **Verify Razorpay Script:**
   - Ensure Razorpay checkout script is loaded
   - Check script version (should be latest)

### Notes:

- The checkbox appears automatically when `save: 1` and valid `customer_id` are set
- User must check the checkbox for card to be saved
- Even if checkbox appears, card won't save unless user checks it
- Token is created only after successful payment with checkbox checked

