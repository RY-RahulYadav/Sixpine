"""
Gmail OAuth2 Setup Script
This script sets up Gmail API authentication using OAuth2
Stores tokens in environment variables for security
Works with Google Cloud apps in Testing mode
"""

import os
import sys
from pathlib import Path

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_backend.settings')

import django
django.setup()

from django.conf import settings

try:
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from googleapiclient.discovery import build
except ImportError:
    print("❌ Required packages not installed!")
    print("\nRun: pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client")
    sys.exit(1)

# Import our token manager
from accounts.gmail_token_manager import GmailTokenManager

SCOPES = ['https://www.googleapis.com/auth/gmail.send']


def setup_oauth():
    """Set up OAuth2 authentication for Gmail API"""
    print("\n" + "="*70)
    print("GMAIL OAUTH2 SETUP (Environment Variables)")
    print("="*70)
    
    # Check if token already exists in environment
    existing_token = GmailTokenManager.load_token()
    if existing_token:
        print(f"\n⚠️  OAuth token already exists in environment variables")
        response = input("Do you want to re-authenticate? (y/n): ")
        if response.lower() != 'y':
            print("Setup cancelled.")
            return
        GmailTokenManager.delete_token()
    
    # Verify credentials are set
    if not settings.GOOGLE_OAUTH2_CLIENT_ID or not settings.GOOGLE_OAUTH2_CLIENT_SECRET:
        print("\n❌ OAuth credentials not found in settings!")
        print("Please set GOOGLE_OAUTH2_CLIENT_ID and GOOGLE_OAUTH2_CLIENT_SECRET in .env")
        return
    
    print(f"\n📧 Email Account: {settings.EMAIL_HOST_USER}")
    print(f"🔑 Client ID: {settings.GOOGLE_OAUTH2_CLIENT_ID[:30]}...")
    
    # Create client configuration
    client_config = {
        "installed": {
            "client_id": settings.GOOGLE_OAUTH2_CLIENT_ID,
            "client_secret": settings.GOOGLE_OAUTH2_CLIENT_SECRET,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": ["http://localhost"]
        }
    }
    
    print("\n" + "="*70)
    print("IMPORTANT INSTRUCTIONS")
    print("="*70)
    print("\n⚠️  Your Google Cloud app is in TESTING mode.")
    print("This means ONLY approved test users can authenticate.\n")
    print("Before continuing, make sure you've added test users:")
    print("1. Go to: https://console.cloud.google.com/")
    print("2. Navigate to: APIs & Services > OAuth consent screen")
    print("3. Scroll to 'Test users' section")
    print("4. Click '+ ADD USERS'")
    print(f"5. Add this email: {settings.EMAIL_HOST_USER}")
    print("6. Click 'SAVE'\n")
    
    response = input("Have you added your email as a test user? (y/n): ")
    if response.lower() != 'y':
        print("\n⚠️  Please add your email as a test user first, then run this script again.")
        print("\nQuick link: https://console.cloud.google.com/apis/credentials/consent")
        return
    
    print("\n" + "="*70)
    print("AUTHENTICATION")
    print("="*70)
    print("\n📝 Steps:")
    print("1. A browser window will open")
    print("2. Sign in with your Google account: " + settings.EMAIL_HOST_USER)
    print("3. You'll see a warning: 'Google hasn't verified this app'")
    print("4. Click 'Advanced' or 'Show advanced'")
    print("5. Click 'Go to kriworld (unsafe)' or 'Continue'")
    print("6. Click 'Allow' to grant permissions")
    print("\nPress Enter to start authentication...")
    input()
    
    try:
        # Run OAuth flow
        flow = InstalledAppFlow.from_client_config(client_config, SCOPES)
        
        print("\n🌐 Opening browser for authentication...")
        print("(If browser doesn't open, copy the URL from the console)")
        
        creds = flow.run_local_server(
            port=0,
            success_message='Authentication successful! You can close this window.',
            open_browser=True
        )
        
        # Save credentials to environment variables
        GmailTokenManager.save_token(creds)
        
        print("\n" + "="*70)
        print("✅ SUCCESS!")
        print("="*70)
        print(f"\n✓ OAuth token saved to environment variables")
        print("✓ Token also saved to .env file")
        print("✓ Gmail API is now configured")
        
        # Test the credentials
        print("\n📧 Testing email sending...")
        service = build('gmail', 'v1', credentials=creds)
        
        # Try to get user profile to verify
        profile = service.users().getProfile(userId='me').execute()
        print(f"✓ Connected as: {profile.get('emailAddress')}")
        
        # Send a test email
        from email.mime.text import MIMEText
        import base64
        
        message = MIMEText("This is a test email from your E-Commerce application. OTP setup is working!")
        message['to'] = settings.EMAIL_HOST_USER
        message['subject'] = 'OAuth Setup Successful - Test Email'
        
        raw = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')
        result = service.users().messages().send(
            userId='me',
            body={'raw': raw}
        ).execute()
        
        print(f"✓ Test email sent! (Message ID: {result['id']})")
        print(f"✓ Check your inbox: {settings.EMAIL_HOST_USER}")
        
        print("\n" + "="*70)
        print("NEXT STEPS")
        print("="*70)
        print("\n1. Start your Django server:")
        print("   python manage.py runserver")
        print("\n2. Test OTP registration from your frontend")
        print("\n3. Emails will be sent via Gmail API (OAuth2)")
        print("\n📝 Note: Token is stored in environment variables (.env file)")
        print("📝 Note: The token will auto-refresh when it expires")
        print("📝 Note: Keep your .env file secure and don't commit it to git")
        print("="*70 + "\n")
        
    except Exception as e:
        print(f"\n❌ Authentication failed: {e}")
        print("\nCommon issues:")
        print("- Email not added as test user in Google Console")
        print("- OAuth client credentials incorrect")
        print("- Redirect URI mismatch")
        print("\nTroubleshooting:")
        print("1. Verify test users: https://console.cloud.google.com/apis/credentials/consent")
        print("2. Check OAuth client: https://console.cloud.google.com/apis/credentials")
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    try:
        setup_oauth()
    except KeyboardInterrupt:
        print("\n\nSetup cancelled by user.")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
