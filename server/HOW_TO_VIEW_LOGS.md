# How to View Logs for Debugging

## Where to Check Logs

### 1. **Terminal/Console (Most Common)**
When you run Django development server, logs appear in the terminal/console:

```bash
# Start Django server
cd server
python manage.py runserver
```

**Logs will appear directly in your terminal/console window.**

Look for messages like:
```
User testuser1@example.com - Current razorpay_customer_id: None
Creating Razorpay customer for testuser1@example.com...
✅ Created Razorpay customer cust_xxxxx for user testuser1@example.com
```

### 2. **VS Code/Cursor Terminal**
If you're using VS Code or Cursor:
- Open the **Terminal** panel (View → Terminal or Ctrl+`)
- Look at the terminal where `python manage.py runserver` is running
- All logs will appear there in real-time

### 3. **Command Prompt/PowerShell (Windows)**
If running server in Command Prompt or PowerShell:
- The logs appear in the same window where you started the server
- Scroll up to see previous logs

### 4. **Django Admin Logs (If Configured)**
Some admin logs might be stored in database:
- Check AdminLog model in Django admin panel
- But payment logs are usually in console

## How to View Logs Step by Step

### Step 1: Start Django Server
```bash
cd server
python manage.py runserver
```

### Step 2: Make a Payment Test
1. Login as `testuser1@example.com`
2. Add items to cart
3. Go to checkout
4. Select credit card payment
5. Check "Save this card" checkbox
6. Complete payment

### Step 3: Watch the Terminal
**Look for these log messages in your terminal:**

```
INFO:orders.views:User testuser1@example.com - Current razorpay_customer_id: None
INFO:orders.views:Creating Razorpay customer for testuser1@example.com with data: {'name': 'Test User One', 'email': 'testuser1@example.com', 'contact': '+919876543210'}
INFO:orders.views:✅ Created Razorpay customer cust_xxxxx for user testuser1@example.com
INFO:orders.views:✅ Adding customer_id cust_xxxxx to Razorpay order for user testuser1@example.com
INFO:orders.views:Creating Razorpay order with data: {...}
INFO:orders.views:✅ Created Razorpay order order_xxxxx for user testuser1@example.com
INFO:orders.views:✅ Returning customer_id cust_xxxxx to frontend for user testuser1@example.com

INFO:orders.views:🔍 Payment details for user testuser1@example.com:
INFO:orders.views:   - Payment ID: pay_xxxxx
INFO:orders.views:   - Method: card
INFO:orders.views:   - Token ID: token_xxxxx  (or None if not saved)
INFO:orders.views:   - Payment Customer ID: cust_xxxxx
```

### Step 4: Check for Errors
If card is not saved, you'll see:
```
WARNING:orders.views:⚠️  No token_id in payment response for user testuser1@example.com
WARNING:orders.views:   - Payment method: card
WARNING:orders.views:   - Possible reasons:
WARNING:orders.views:     1. User did not check "Save this card" checkbox in Razorpay checkout
WARNING:orders.views:     2. Tokenization not enabled in Razorpay account
WARNING:orders.views:     3. Customer ID was not passed correctly to Razorpay
WARNING:orders.views:     4. Flash Checkout not enabled
```

## Filtering Logs

### To see only payment-related logs:
Look for these keywords in terminal:
- `razorpay_customer_id`
- `Creating Razorpay customer`
- `Payment details`
- `token_id`
- `Saved card`

### To save logs to a file (optional):
```bash
# Windows PowerShell
python manage.py runserver > server.log 2>&1

# Linux/Mac
python manage.py runserver > server.log 2>&1

# Then view the file
notepad server.log  # Windows
cat server.log      # Linux/Mac
```

## Quick Debug Checklist

When testing card saving, check logs for:

✅ **Customer ID Creation:**
- `Creating Razorpay customer` - Should appear
- `✅ Created Razorpay customer` - Should show customer ID

✅ **Order Creation:**
- `✅ Adding customer_id` - Should show customer ID in order
- `✅ Returning customer_id` - Should return to frontend

✅ **Payment Verification:**
- `🔍 Payment details` - Should show all payment info
- `Token ID: token_xxxxx` - Should NOT be None if card was saved
- `Card was saved with token_id` - Should appear if saved

❌ **If Token ID is None:**
- Check the warning messages for possible reasons
- Verify user checked "Save this card" checkbox
- Check if tokenization is enabled in Razorpay

## Common Log Locations

### Development (Local)
- **Terminal/Console** where `python manage.py runserver` is running

### Production
- Usually in application logs (varies by hosting)
- Render.com: Check Logs tab in dashboard
- Vercel: Check Functions → Logs
- Heroku: `heroku logs --tail`

## Need More Detailed Logs?

If you want to save logs to a file, you can configure logging in `settings.py`, but for now, **the terminal is the easiest place to check logs**.

## Pro Tip
Keep your terminal window open and visible while testing payments. The logs appear in real-time as you make payments!

