# OTP Selection Implementation Guide

## Overview
This implementation adds a new step to the registration process where users can choose to receive their OTP verification code via **Email** or **WhatsApp** before creating their account.

## Changes Made

### Frontend Changes

#### 1. RegisterPage Component (`client/src/pages/RegisterPage.tsx`)

**New States:**
- `step`: Now supports three steps - `'register'` | `'selectOTP'` | `'verify'`
- `otpMethod`: Tracks selected OTP method - `'email'` | `'whatsapp'` | `null`

**Modified Functions:**
- `handleRequestOTP`: Now validates the form and moves to OTP selection step instead of directly sending OTP
- `handleSendOTP`: New function that sends OTP via selected method (email/WhatsApp)
- `handleResendOTP`: Updated to support both email and WhatsApp resend
- `handleBackToOTPSelection`: New function to go back from OTP verification to method selection

**New UI Step - OTP Selection:**
```tsx
<div className="sixpine-otp-selection">
  <h3>Choose verification method</h3>
  <p>Select how you'd like to receive your OTP</p>
  
  <div className="otp-method-options">
    {/* Email Option */}
    <button onClick={() => handleSendOTP('email')}>
      <div className="otp-method-icon">📧</div>
      <div className="otp-method-content">
        <h4>Email</h4>
        <p>{formData.email}</p>
      </div>
    </button>
    
    {/* WhatsApp Option */}
    <button onClick={() => handleSendOTP('whatsapp')}>
      <div className="otp-method-icon">💬</div>
      <div className="otp-method-content">
        <h4>WhatsApp</h4>
        <p>{formData.mobile || 'No mobile number provided'}</p>
      </div>
    </button>
  </div>
</div>
```

#### 2. Auth Styles (`client/src/styles/auth.css`)

**New CSS Classes:**
- `.sixpine-otp-selection`: Container for OTP method selection
- `.otp-method-options`: Flex container for method buttons
- `.otp-method-btn`: Styled button for each OTP method
- `.otp-method-icon`: Icon container (emoji)
- `.otp-method-content`: Text content for each option

**Key Styles:**
```css
.otp-method-btn {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.otp-method-btn:hover:not(:disabled) {
  border-color: #333;
  background: #f8f9fa;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
```

#### 3. API Service (`client/src/services/api.ts`)

**Updated Type Definitions:**
```typescript
requestOTP: (userData: {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
  mobile?: string;
  otp_method?: 'email' | 'whatsapp';
}) => API.post('/auth/register/request-otp/', userData)

resendOTP: (data: { 
  email: string; 
  otp_method?: 'email' | 'whatsapp' 
}) => API.post('/auth/register/resend-otp/', data)
```

### Backend Changes

#### 1. Models (`server/accounts/models.py`)

**OTPVerification Model - New Fields:**
```python
class OTPVerification(models.Model):
    OTP_METHOD_CHOICES = [
        ('email', 'Email'),
        ('whatsapp', 'WhatsApp'),
    ]
    
    # Existing fields...
    mobile = models.CharField(max_length=15, blank=True)
    otp_method = models.CharField(
        max_length=10, 
        choices=OTP_METHOD_CHOICES, 
        default='email'
    )
```

#### 2. Serializers (`server/accounts/serializers.py`)

**OTPRequestSerializer - Updated:**
```python
class OTPRequestSerializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.EmailField()
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    mobile = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    otp_method = serializers.ChoiceField(
        choices=['email', 'whatsapp'], 
        default='email'
    )
    
    def validate(self, attrs):
        # ... existing validations ...
        
        # Validate mobile if WhatsApp is selected
        if attrs.get('otp_method') == 'whatsapp' and not attrs.get('mobile'):
            raise serializers.ValidationError({
                "mobile": "Mobile number is required for WhatsApp OTP"
            })
        
        return attrs
```

#### 3. Views (`server/accounts/views.py`)

**New Function - WhatsApp OTP:**
```python
def send_whatsapp_otp(mobile_number, otp_code, first_name=''):
    """
    Send OTP via WhatsApp using Twilio or similar service
    Currently in demo mode - logs to console
    """
    # TODO: Integrate with Twilio WhatsApp API
    print(f"📱 WhatsApp OTP to {mobile_number}: {otp_code}")
    print(f"Message: Hello {first_name}! Your Sixpine verification code is: {otp_code}")
    
    return True, "WhatsApp OTP sent (demo mode - check console)"
```

**Updated request_otp View:**
- Now accepts `otp_method` parameter
- Routes to appropriate sending function based on method
- Stores mobile number in OTP record
- Returns method-specific success messages

**Updated resend_otp View:**
- Supports otp_method parameter
- Can switch between email and WhatsApp on resend
- Maintains user's selected method

#### 4. Database Migration

Created migration file: `0003_otpverification_mobile_otpverification_otp_method.py`

```bash
python manage.py makemigrations accounts
python manage.py migrate accounts
```

## User Flow

### Step 1: Registration Form
- User fills in: Name, Email, Mobile (optional), Password
- Username is auto-generated from email
- Click "Create account" button

### Step 2: OTP Method Selection (NEW)
- User sees two options:
  1. **Email** - Shows user's email address
  2. **WhatsApp** - Shows user's mobile (disabled if not provided)
- User selects preferred method
- OTP is sent immediately upon selection

### Step 3: OTP Verification
- User enters 6-digit OTP code
- Can resend OTP or change method
- Upon successful verification, account is created

## Features

### WhatsApp Integration
- ✅ UI for WhatsApp selection
- ✅ Backend support for WhatsApp method
- ⚠️ Currently in DEMO mode (logs to console)
- 📝 Ready for Twilio integration

### Email Integration
- ✅ Gmail OAuth support
- ✅ SMTP fallback
- ✅ HTML formatted emails

### User Experience
- Clean, modern UI with icons
- Disabled state for WhatsApp if no mobile
- Warning message when mobile is missing
- Smooth transitions between steps
- Back navigation support

## Testing

### Test Email OTP:
1. Fill registration form with email
2. Click "Create account"
3. Select "Email" option
4. Check email for OTP code
5. Enter code and verify

### Test WhatsApp OTP (Demo Mode):
1. Fill registration form with email AND mobile
2. Click "Create account"
3. Select "WhatsApp" option
4. Check server console for OTP code
5. Enter code and verify

## Future Enhancements

### 1. Twilio Integration
Add to `server/ecommerce_backend/settings.py`:
```python
TWILIO_ACCOUNT_SID = 'your_account_sid'
TWILIO_AUTH_TOKEN = 'your_auth_token'
TWILIO_WHATSAPP_NUMBER = 'whatsapp:+14155238886'
```

Uncomment and configure in `send_whatsapp_otp()`:
```python
from twilio.rest import Client

account_sid = settings.TWILIO_ACCOUNT_SID
auth_token = settings.TWILIO_AUTH_TOKEN
client = Client(account_sid, auth_token)

message = client.messages.create(
    from_=settings.TWILIO_WHATSAPP_NUMBER,
    body=f'Hello {first_name}! Your Sixpine verification code is: {otp_code}',
    to=f'whatsapp:{mobile_number}'
)
```

### 2. SMS Fallback
Add SMS option alongside WhatsApp

### 3. Phone Validation
Add real-time phone number validation with country code support

### 4. Remember Preference
Store user's preferred OTP method for future use

## Validation

### Frontend Validation:
- ✅ Password match validation
- ✅ Mobile required for WhatsApp
- ✅ Email format validation
- ✅ OTP length (6 digits)

### Backend Validation:
- ✅ Username uniqueness
- ✅ Email uniqueness
- ✅ Mobile required for WhatsApp method
- ✅ Password strength (min 8 chars)
- ✅ OTP expiry (10 minutes)
- ✅ Max attempts (5 tries)

## Error Handling

### Frontend:
- Network errors
- Invalid OTP
- Expired OTP
- Missing mobile for WhatsApp

### Backend:
- Email service failures
- WhatsApp service failures
- Database errors
- Validation errors

## Security

- ✅ Password hashing before storage
- ✅ OTP expiration (10 minutes)
- ✅ Maximum attempt limits (5)
- ✅ Unique OTP per session
- ✅ Secure token generation
- ✅ Rate limiting ready

## Notes

1. **WhatsApp is currently in DEMO mode** - OTP is printed to server console
2. To enable production WhatsApp, set up Twilio credentials
3. Mobile field is optional but required for WhatsApp OTP
4. Username is auto-generated from email address
5. OTP verification step shows selected method

## Screenshots Flow

1. **Registration Form** → Enter details
2. **OTP Selection** → Choose Email or WhatsApp ✨ NEW
3. **OTP Verification** → Enter code received
4. **Success** → Account created, redirected to home

---

**Implementation Status: ✅ Complete**
**WhatsApp Production Status: ⚠️ Demo Mode (Twilio setup required)**
**Email Status: ✅ Production Ready**
