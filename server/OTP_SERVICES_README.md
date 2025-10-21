# OTP Services Implementation

This document explains how to use the Gmail OAuth and WhatsApp OTP services implemented in the ecommerce backend.

## Overview

The system now supports two methods for sending OTP (One-Time Password) verification:

1. **Email OTP** - Using Gmail OAuth2 API for secure email delivery
2. **WhatsApp OTP** - Using Twilio WhatsApp API for instant messaging

## Setup Instructions

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Run the setup script to configure both services:

```bash
python setup_otp_services.py
```

Or manually add these variables to your `.env` file:

#### Gmail OAuth2 Configuration
```env
EMAIL_CLIENT_ID=your_gmail_client_id
EMAIL_CLIENT_SECRET=your_gmail_client_secret
EMAIL_REFRESH_TOKEN=your_gmail_refresh_token
```

#### WhatsApp (Twilio) Configuration
```env
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

### 3. Test the Services

Run the test script to verify everything is working:

```bash
python test_otp_services.py
```

## API Usage

### Request OTP

**Endpoint:** `POST /api/accounts/request-otp/`

**Request Body:**
```json
{
    "email": "user@example.com",
    "otp_method": "email",  // or "whatsapp"
    "mobile": "+1234567890",  // required for WhatsApp
    "username": "johndoe",
    "first_name": "John",
    "last_name": "Doe",
    "password": "securepassword"
}
```

**Response:**
```json
{
    "success": true,
    "message": "OTP sent to your email",
    "debug_otp": "123456"  // Only in development
}
```

### Verify OTP

**Endpoint:** `POST /api/accounts/verify-otp/`

**Request Body:**
```json
{
    "email": "user@example.com",
    "otp": "123456"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Registration successful",
    "user": {
        "id": 1,
        "email": "user@example.com",
        "username": "johndoe",
        "first_name": "John",
        "last_name": "Doe",
        "is_verified": true
    },
    "token": "your_auth_token"
}
```

### Resend OTP

**Endpoint:** `POST /api/accounts/resend-otp/`

**Request Body:**
```json
{
    "email": "user@example.com",
    "otp_method": "email"  // or "whatsapp"
}
```

## Service Details

### Gmail OAuth Service (`gmail_oauth_service.py`)

- Uses Gmail API with OAuth2 authentication
- Sends professional-looking HTML emails
- Handles token refresh automatically
- Secure and reliable email delivery

**Methods:**
- `send_email(to_email, subject, body)` - Send custom email
- `send_otp_email(to_email, otp_code)` - Send OTP verification email

### WhatsApp Service (`whatsapp_service.py`)

- Uses Twilio WhatsApp Business API
- Sends formatted messages with emojis
- Handles international phone number formatting
- Real-time message delivery

**Methods:**
- `send_otp_message(mobile_number, otp_code)` - Send OTP via WhatsApp
- `send_generic_message(mobile_number, message_text)` - Send custom message

## Configuration Requirements

### Gmail OAuth2 Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Gmail API
4. Create OAuth2 credentials (Web application)
5. Add authorized redirect URI: `http://localhost:8000/oauth2callback`
6. Use [OAuth2 Playground](https://developers.google.com/oauthplayground/) to get refresh token
   - Select scope: `https://www.googleapis.com/auth/gmail.send`
   - Exchange authorization code for refresh token

### WhatsApp (Twilio) Setup

1. Sign up at [Twilio](https://www.twilio.com/)
2. Get Account SID and Auth Token from console
3. Enable WhatsApp Sandbox: [Twilio Console](https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn)
4. Follow setup instructions to get WhatsApp number
5. Test with sandbox number first

## Security Features

- OTP codes expire in 10 minutes
- One-time use only (marked as used after verification)
- Secure token-based authentication
- Rate limiting on OTP requests
- Input validation and sanitization

## Error Handling

The services include comprehensive error handling:

- Invalid credentials detection
- Network timeout handling
- API rate limit management
- Graceful fallback for service failures
- Detailed error logging

## Production Considerations

1. **Environment Variables**: Set all credentials as environment variables on your hosting platform
2. **Rate Limiting**: Implement rate limiting for OTP requests
3. **Monitoring**: Set up monitoring for service health
4. **Backup**: Have fallback email service for critical communications
5. **Logging**: Enable detailed logging for debugging

## Troubleshooting

### Common Issues

1. **Gmail OAuth Errors**
   - Check if Gmail API is enabled
   - Verify refresh token is valid
   - Ensure credentials are correctly formatted

2. **WhatsApp Errors**
   - Verify Twilio credentials
   - Check WhatsApp Sandbox setup
   - Ensure phone number format is correct (+country_code)

3. **OTP Not Received**
   - Check spam folder for emails
   - Verify phone number format for WhatsApp
   - Check service logs for errors

### Debug Mode

In development, OTP codes are returned in the API response for testing purposes. Remove `debug_otp` from production responses.

## Support

For issues or questions:
1. Check the test script output
2. Review service logs
3. Verify configuration
4. Test with known working credentials
