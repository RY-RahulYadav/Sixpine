#!/usr/bin/env python
"""
Test script for Gmail OAuth2 integration
"""
import os
import sys
import django

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_backend.settings')
django.setup()

from accounts.gmail_oauth_service import GmailOAuth2Service

def test_gmail_oauth():
    """Test Gmail OAuth2 email sending"""
    print("🧪 Testing Gmail OAuth2 Integration")
    print("=" * 50)
    
    # Test email details
    test_email = "test@example.com"  # Replace with your test email
    test_otp = "123456"
    test_name = "Test User"
    
    print(f"1. Testing OTP Email to: {test_email}")
    
    try:
        gmail_service = GmailOAuth2Service()
        
        # Test OTP email
        success = gmail_service.send_otp_email(test_email, test_otp, test_name)
        
        if success:
            print("   ✅ OTP email sent successfully via Gmail OAuth2!")
        else:
            print("   ❌ Failed to send OTP email")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print("\n2. Testing Password Reset Email")
    
    try:
        test_token = "test-reset-token-12345"
        success = gmail_service.send_password_reset_email(test_email, test_token, test_name)
        
        if success:
            print("   ✅ Password reset email sent successfully via Gmail OAuth2!")
        else:
            print("   ❌ Failed to send password reset email")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 Gmail OAuth2 test completed!")

if __name__ == "__main__":
    test_gmail_oauth()
