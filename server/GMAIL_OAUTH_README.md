# Gmail OAuth2 Security Update

## Overview
The Gmail OAuth2 system has been updated to store tokens securely in environment variables instead of pickle files. This improves security by:

- 🔒 Keeping sensitive tokens out of the filesystem
- 🚫 Preventing accidental token exposure in backups
- 🔄 Enabling automatic token refresh
- ⚡ Improving deployment security

## Security Improvements

### Before (Pickle Files)
```
server/
├── gmail_token.pickle    # ❌ Sensitive token on disk
├── token.pickle         # ❌ Could be accidentally committed
```

### After (Environment Variables)
```
Environment Variables:
GMAIL_OAUTH_TOKEN=<base64-encoded-token>  # ✅ Secure storage
```

## Setup Instructions

### 1. Initial OAuth Setup
Run the setup script to authenticate and store tokens securely:

```bash
cd server
python setup_oauth_gmail.py
```

This will:
- Open your browser for Google OAuth authentication
- Store the token in environment variables
- Save the token to `.env` file (which is git-ignored)
- Test the email functionality

### 2. Environment Configuration

Your `.env` file will contain:
```env
# Gmail OAuth Token (auto-managed - DO NOT EDIT MANUALLY)
GMAIL_OAUTH_TOKEN=eyJ0b2tlbiI6ICJ5YTI5LmEw...base64-encoded-json...
```

### 3. Verify Setup
Test your configuration:

```bash
python test_gmail_oauth.py
```

## Updated Components

### Token Management (`accounts/gmail_token_manager.py`)
- **`GmailTokenManager.save_token()`** - Saves tokens to environment variables
- **`GmailTokenManager.load_token()`** - Loads tokens from environment
- **`GmailTokenManager.refresh_token()`** - Automatically refreshes expired tokens
- **`GmailTokenManager.get_credentials()`** - Gets valid credentials with auto-refresh

### Email Backend (`accounts/gmail_oauth_backend.py`)
- Updated to use `GmailTokenManager`
- Automatic token refresh on expiration
- Secure token storage

### Views (`accounts/views.py`)
- Updated `get_gmail_service()` function
- Improved error handling
- Better debugging information

### Settings (`settings.py`)
- Default email backend set to `GmailOAuth2Backend`
- Added `GMAIL_OAUTH_TOKEN` configuration

## Security Features

### 1. Base64 Encoding
Tokens are base64 encoded for secure storage:
```python
token_data = {"token": "...", "refresh_token": "..."}
encoded = base64.b64encode(json.dumps(token_data).encode()).decode()
```

### 2. Automatic Refresh
Tokens are automatically refreshed when expired:
```python
if credentials.expired and credentials.refresh_token:
    credentials = GmailTokenManager.refresh_token(credentials)
```

### 3. Environment Variable Priority
1. Check runtime environment variables
2. Fallback to `.env` file
3. Auto-sync between both

### 4. Git Security
- `.env` file is git-ignored
- No pickle files committed
- Token format is not human-readable

## API Integration

### Sending OTP Emails
The email system now uses the secure token automatically:

```python
from accounts.views import send_otp_email

success, message = send_otp_email(
    to_email="user@example.com",
    otp_code="123456",
    first_name="John"
)
```

### Django Email Backend
Standard Django email functions work automatically:

```python
from django.core.mail import send_mail

send_mail(
    subject="Test Email",
    message="Hello World",
    from_email=settings.EMAIL_HOST_USER,
    recipient_list=["user@example.com"]
)
```

## Error Handling

### Token Refresh Failures
If token refresh fails, the system will:
1. Log the error
2. Return `None` credentials
3. Fallback to SMTP if configured
4. Provide clear error messages

### Debug Information
In development mode (`DEBUG=True`), detailed error information is provided:
```json
{
    "error": "Failed to send verification email",
    "detail": "Gmail API authentication failed",
    "setup_command": "python setup_oauth_gmail.py",
    "debug_info": "Token refresh failed: invalid_grant"
}
```

## Deployment

### Production Setup
1. Set environment variables on your server:
   ```bash
   export GMAIL_OAUTH_TOKEN="<base64-encoded-token>"
   export GOOGLE_OAUTH2_CLIENT_ID="<client-id>"
   export GOOGLE_OAUTH2_CLIENT_SECRET="<client-secret>"
   ```

2. Or use your deployment platform's secret management:
   - Heroku: Config Vars
   - AWS: Parameter Store
   - Docker: Environment variables

### Development Setup
1. Copy `.env.example` to `.env`
2. Update your OAuth credentials
3. Run `python setup_oauth_gmail.py`
4. Test with `python test_gmail_oauth.py`

## Troubleshooting

### "No token found" Error
```bash
python setup_oauth_gmail.py
```

### "Token expired" Error
The system should auto-refresh, but if it fails:
```bash
python setup_oauth_gmail.py  # Re-authenticate
```

### "Gmail API error" Messages
1. Check your Google Cloud Console settings
2. Verify test users are added
3. Ensure OAuth client is properly configured

### Environment Variable Issues
Check if the token is properly set:
```python
import os
print("Token exists:", bool(os.environ.get('GMAIL_OAUTH_TOKEN')))
```

## Migration from Pickle Files

If you have existing pickle files, they will be automatically ignored. The new system will create fresh tokens in environment variables. Old pickle files can be safely deleted:

```bash
rm gmail_token.pickle token.pickle  # Safe to remove
```

## Best Practices

1. **Never commit `.env` files** - They contain sensitive tokens
2. **Use the setup script** - Don't manually edit tokens
3. **Test regularly** - Run `test_gmail_oauth.py` after deployment
4. **Monitor logs** - Check for token refresh activities
5. **Backup cautiously** - Exclude `.env` from backups if they contain tokens

## Support

If you encounter issues:
1. Run the test script: `python test_gmail_oauth.py`
2. Check Django logs for detailed error messages
3. Verify Google Cloud Console configuration
4. Re-run OAuth setup if needed

The system is designed to be secure, automatic, and developer-friendly while maintaining the same email functionality as before.