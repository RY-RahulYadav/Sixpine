# Gmail OAuth2 Setup Guide

This guide explains how to set up Gmail OAuth2 for sending OTP emails in the Sixpine e-commerce application.

## Prerequisites

1. A Google account
2. Access to Google Cloud Console
3. Python packages already installed (google-auth, google-auth-oauthlib, google-api-python-client)

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Gmail API:
   - Go to "APIs & Services" > "Library"
   - Search for "Gmail API"
   - Click on it and press "Enable"

## Step 2: Create OAuth2 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Choose "Web application" as the application type
4. Add authorized redirect URIs:
   - `http://localhost:8000/oauth2callback` (for development)
   - `https://yourdomain.com/oauth2callback` (for production)
5. Download the credentials JSON file

## Step 3: Generate Refresh Token

1. Create a file called `generate_refresh_token.py`:

```python
import os
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from google.oauth2.credentials import Credentials

SCOPES = ['https://www.googleapis.com/auth/gmail.send']

def generate_refresh_token():
    flow = InstalledAppFlow.from_client_secrets_file(
        'path/to/your/credentials.json', SCOPES)
    creds = flow.run_local_server(port=0)
    
    print("Refresh Token:", creds.refresh_token)
    print("Client ID:", creds.client_id)
    print("Client Secret:", creds.client_secret)

if __name__ == '__main__':
    generate_refresh_token()
```

2. Run the script and copy the generated tokens

## Step 4: Configure Environment Variables

Add these to your `.env` file or environment:

```bash
# Google OAuth2 Configuration for Gmail API
EMAIL_CLIENT_ID=your-client-id-here
EMAIL_CLIENT_SECRET=your-client-secret-here
EMAIL_REFRESH_TOKEN=your-refresh-token-here

# Email Configuration
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

## Step 5: Test the Integration

Run the test script:

```bash
python test_gmail_oauth.py
```

## Features

### OTP Email
- Beautiful HTML email template
- Responsive design
- Security warnings
- Professional branding

### Password Reset Email
- Secure reset links
- Time-limited tokens (1 hour)
- Professional styling
- Clear instructions

## Troubleshooting

### Common Issues

1. **"Invalid credentials" error**
   - Check that your client ID and secret are correct
   - Ensure the refresh token is valid and not expired

2. **"Access denied" error**
   - Verify that Gmail API is enabled in your Google Cloud project
   - Check that the OAuth consent screen is configured

3. **"Token expired" error**
   - The refresh token might be expired
   - Generate a new refresh token using the script above

### Fallback Mechanism

The system includes a fallback to SMTP if Gmail OAuth2 fails:
- Uses Django's built-in email backend
- Requires app-specific password for Gmail
- Less secure but more reliable

## Security Notes

1. Never commit credentials to version control
2. Use environment variables for all sensitive data
3. Regularly rotate refresh tokens
4. Monitor API usage in Google Cloud Console
5. Implement rate limiting for OTP requests

## Production Considerations

1. Use a dedicated Gmail account for sending emails
2. Set up proper monitoring and logging
3. Implement email templates management
4. Consider using a professional email service (SendGrid, Mailgun) for high volume
5. Set up proper error handling and retry mechanisms
