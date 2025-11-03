# Fix Razorpay Authentication Error

## Error: "Authentication failed"

This error means your Razorpay Key ID and Secret don't match or are invalid.

## Common Causes & Solutions

### ✅ Solution 1: Verify Keys in Razorpay Dashboard

1. **Login to Razorpay Dashboard:**
   - Go to https://dashboard.razorpay.com/
   - Login with your account

2. **Get Correct Keys:**
   - Click on **Settings** → **API Keys**
   - Make sure you're in **Test Mode** (for development) or **Live Mode** (for production)
   - Click **Generate Test Key** or use existing keys

3. **Copy Keys Correctly:**
   - **Key ID**: Should start with `rzp_test_` (test) or `rzp_live_` (live)
   - **Key Secret**: Should be a long string (32+ characters) WITHOUT `rzp_` prefix
   - **IMPORTANT**: Copy the FULL secret key - it's long!

### ✅ Solution 2: Check Key Format

**Correct Format:**
```
RAZORPAY_KEY_ID=rzp_test_AbCdEfGhIjKlMnOpQrSt
RAZORPAY_KEY_SECRET=6sRXgdpVz2ZbX9Y8W7V6U5T4S3R2Q1P0O9N8M7L6K5J4I
```

**Common Mistakes:**
- ❌ Keys swapped (ID in Secret field, Secret in ID field)
- ❌ Extra spaces or quotes: `"rzp_test_..."` or ` rzp_test_... `
- ❌ Truncated secret key (not copying full length)
- ❌ Mixing test and live keys (test ID with live Secret)

### ✅ Solution 3: Update Environment Variables

**Option A: .env file**
```env
# Remove any quotes or spaces
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Option B: Windows PowerShell**
```powershell
# Remove quotes and spaces
$env:RAZORPAY_KEY_ID="rzp_test_xxxxxxxxxxxxx"
$env:RAZORPAY_KEY_SECRET="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

**Option C: Windows Command Prompt**
```cmd
set RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
set RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### ✅ Solution 4: Verify Keys Match

**Run verification script:**
```bash
cd server
python verify_razorpay_keys.py
```

This will:
- Check if keys are set
- Verify key format
- Test authentication with Razorpay
- Show detailed error messages

### ✅ Solution 5: Restart Server

After updating keys:
1. **Stop Django server** (Ctrl+C)
2. **Restart server:**
   ```bash
   python manage.py runserver
   ```

### ✅ Solution 6: Check for Hidden Characters

Sometimes keys contain hidden characters. Try:

1. **Copy keys again** from Razorpay dashboard
2. **Paste in a text editor** (Notepad, VS Code)
3. **Remove any spaces** before/after
4. **Copy again** and paste to .env

## Step-by-Step Fix

1. **Get fresh keys from Razorpay:**
   - Dashboard → Settings → API Keys
   - Generate new test keys if needed

2. **Update .env file:**
   ```env
   RAZORPAY_KEY_ID=rzp_test_YourActualKeyID
   RAZORPAY_KEY_SECRET=YourActualSecretKey
   ```
   - No quotes, no spaces
   - Full secret key (32+ chars)

3. **Verify keys:**
   ```bash
   python verify_razorpay_keys.py
   ```

4. **Restart server:**
   ```bash
   # Stop (Ctrl+C)
   python manage.py runserver
   ```

5. **Test checkout:**
   - Try creating a new order
   - Check if Razorpay opens correctly

## Still Not Working?

### Check These:

1. **Are keys from same account?**
   - Both test keys OR both live keys
   - Not mixed

2. **Are keys active?**
   - Check Razorpay dashboard
   - Keys not revoked or expired

3. **Check server logs:**
   - Look for detailed error messages
   - Check if keys are being read correctly

4. **Try generating new keys:**
   - Delete old keys in Razorpay dashboard
   - Generate new test keys
   - Update .env and restart server

## Quick Test

After fixing, run:
```bash
python verify_razorpay_keys.py
```

Should show:
```
[SUCCESS] All Razorpay keys are valid and working!
```

If it shows authentication error, keys are still incorrect - double-check in Razorpay dashboard.

