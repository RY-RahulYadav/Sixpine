#!/usr/bin/env python3
"""
Setup script for OTP services (Gmail OAuth and WhatsApp)
This script helps configure environment variables for both services.
"""

import os
from pathlib import Path

def setup_gmail_oauth():
    """Setup Gmail OAuth2 credentials"""
    print("🔧 Setting up Gmail OAuth2 for email OTP...")
    print("\nTo get Gmail OAuth2 credentials:")
    print("1. Go to Google Cloud Console: https://console.cloud.google.com/")
    print("2. Create a new project or select existing one")
    print("3. Enable Gmail API")
    print("4. Create OAuth2 credentials (Web application)")
    print("5. Add authorized redirect URI: http://localhost:8000/oauth2callback")
    print("6. Download credentials.json")
    print("7. Use OAuth2 playground to get refresh token: https://developers.google.com/oauthplayground/")
    print("   - Select Gmail API v1 scope: https://www.googleapis.com/auth/gmail.send")
    print("   - Exchange authorization code for refresh token")
    
    print("\nEnter your Gmail OAuth2 credentials:")
    client_id = input("Client ID: ").strip()
    client_secret = input("Client Secret: ").strip()
    refresh_token = input("Refresh Token: ").strip()
    
    return {
        'EMAIL_CLIENT_ID': client_id,
        'EMAIL_CLIENT_SECRET': client_secret,
        'EMAIL_REFRESH_TOKEN': refresh_token
    }

def setup_whatsapp():
    """Setup WhatsApp (Twilio) credentials"""
    print("\n🔧 Setting up WhatsApp OTP via Twilio...")
    print("\nTo get Twilio credentials:")
    print("1. Sign up at: https://www.twilio.com/")
    print("2. Get your Account SID and Auth Token from the console")
    print("3. Enable WhatsApp Sandbox: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn")
    print("4. Follow the setup instructions to get your WhatsApp number")
    
    print("\nEnter your Twilio credentials:")
    account_sid = input("Account SID: ").strip()
    auth_token = input("Auth Token: ").strip()
    whatsapp_from = input("WhatsApp From Number (e.g., whatsapp:+14155238886): ").strip()
    
    return {
        'TWILIO_ACCOUNT_SID': account_sid,
        'TWILIO_AUTH_TOKEN': auth_token,
        'TWILIO_WHATSAPP_FROM': whatsapp_from
    }

def update_env_file(env_vars):
    """Update .env file with new variables"""
    env_file = Path('.env')
    
    # Read existing .env file
    existing_vars = {}
    if env_file.exists():
        with open(env_file, 'r') as f:
            for line in f:
                if '=' in line and not line.strip().startswith('#'):
                    key, value = line.strip().split('=', 1)
                    existing_vars[key] = value
    
    # Update with new variables
    existing_vars.update(env_vars)
    
    # Write back to .env file
    with open(env_file, 'w') as f:
        for key, value in existing_vars.items():
            f.write(f"{key}={value}\n")
    
    print(f"\n✅ Updated .env file with {len(env_vars)} variables")

def main():
    """Main setup function"""
    print("🚀 OTP Services Setup")
    print("=" * 50)
    
    # Check if .env file exists
    env_file = Path('.env')
    if not env_file.exists():
        print("Creating .env file...")
        env_file.touch()
    
    # Setup Gmail OAuth
    gmail_vars = setup_gmail_oauth()
    
    # Setup WhatsApp
    whatsapp_vars = setup_whatsapp()
    
    # Combine all variables
    all_vars = {**gmail_vars, **whatsapp_vars}
    
    # Update .env file
    update_env_file(all_vars)
    
    print("\n🎉 Setup complete!")
    print("\nNext steps:")
    print("1. Install dependencies: pip install -r requirements.txt")
    print("2. Run migrations: python manage.py migrate")
    print("3. Test the services:")
    print("   - Email OTP: Use 'email' as otp_method in API calls")
    print("   - WhatsApp OTP: Use 'whatsapp' as otp_method in API calls")
    print("\nNote: For production, make sure to set these as environment variables on your hosting platform.")

if __name__ == "__main__":
    main()
