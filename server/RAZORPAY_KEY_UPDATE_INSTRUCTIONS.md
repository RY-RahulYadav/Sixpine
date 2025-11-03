# Razorpay Key Update Instructions

## Problem: "The id provided does not exist" Error

This error occurs when:
1. Razorpay keys are updated but Django server is not restarted
2. Key ID and Secret are from different Razorpay accounts
3. Mixing test and live keys
4. Invalid or expired keys

## Solution Steps

### Step 1: Verify Your Keys

Run the verification script:
```bash
cd server
python verify_razorpay_keys.py
```

This will check:
- ✓ Keys are set in environment variables
- ✓ Keys are from same account (test or live)
- ✓ Keys are valid and working

### Step 2: Update Keys in Environment

**Option A: Using .env file**
```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx
```

**Option B: Using Environment Variables**
```bash
# Windows PowerShell
$env:RAZORPAY_KEY_ID="rzp_test_xxxxxxxxxxxxx"
$env:RAZORPAY_KEY_SECRET="xxxxxxxxxxxxxxxxxxxx"

# Linux/Mac
export RAZORPAY_KEY_ID="rzp_test_xxxxxxxxxxxxx"
export RAZORPAY_KEY_SECRET="xxxxxxxxxxxxxxxxxxxx"
```

### Step 3: Restart Django Server (CRITICAL!)

**IMPORTANT:** The Razorpay client is initialized when Django starts. If you update keys, you MUST restart the server:

```bash
# Stop the server (Ctrl+C in the terminal where it's running)
# Then restart:
python manage.py runserver
```

### Step 4: Clear Browser Cache

1. Open browser DevTools (F12)
2. Right-click on refresh button
3. Select "Empty Cache and Hard Reload"
4. Or clear cache manually

### Step 5: Test Again

1. Try creating a new order
2. Check if Razorpay checkout opens correctly
3. If still failing, check server logs for errors

## Common Issues

### Issue 1: Keys Mismatch
```
Error: Key ID is test but Secret is live
```
**Solution:** Both keys must be from the same Razorpay account (both test or both live)

### Issue 2: Server Not Restarted
```
Error: "The id provided does not exist"
```
**Solution:** Stop Django server (Ctrl+C) and restart it

### Issue 3: Browser Cache
```
Frontend shows old key
```
**Solution:** Clear browser cache or do hard refresh (Ctrl+Shift+R)

### Issue 4: Invalid Keys
```
Error: Authentication failed
```
**Solution:** 
- Verify keys in Razorpay dashboard
- Make sure keys are not expired
- Check if keys are correct (copy-paste carefully)

## Verification

After updating keys and restarting server, verify:

1. **Backend Check:**
   ```bash
   python verify_razorpay_keys.py
   ```
   Should show: `[SUCCESS] All Razorpay keys are valid and working!`

2. **Frontend Check:**
   - Open browser console (F12)
   - Try checkout
   - Check if `key` in Razorpay options matches your new key ID

3. **Razorpay Dashboard:**
   - Login to Razorpay dashboard
   - Check if test/live mode matches your keys
   - Verify keys are active

## Quick Fix Script

If you're on Windows, create `restart_server.bat`:
```batch
@echo off
echo Stopping Django server...
taskkill /F /IM python.exe /FI "WINDOWTITLE eq *runserver*" 2>nul
timeout /t 2 /nobreak >nul
echo Starting Django server...
cd /d "%~dp0"
python manage.py runserver
```

If you're on Linux/Mac, create `restart_server.sh`:
```bash
#!/bin/bash
pkill -f "manage.py runserver"
sleep 2
python manage.py runserver
```

