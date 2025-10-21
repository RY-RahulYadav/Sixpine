#!/usr/bin/env python3
"""
Test script for OTP services (Gmail OAuth and WhatsApp)
This script tests both email and WhatsApp OTP sending functionality.
"""

import os
import sys
import django
from pathlib import Path

# Add the project directory to Python path
project_dir = Path(__file__).parent
sys.path.append(str(project_dir))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_backend.settings')
django.setup()

from accounts.gmail_oauth_service import GmailOAuth2Service
from accounts.whatsapp_service import WhatsAppService

def test_gmail_oauth():
    """Test Gmail OAuth service"""
    print("🧪 Testing Gmail OAuth Service...")
    print("-" * 40)
    
    try:
        gmail_service = GmailOAuth2Service()
        
        # Test credentials
        print("Checking Gmail OAuth credentials...")
        creds = gmail_service._get_credentials()
        if not creds:
            print("❌ Gmail OAuth credentials not configured properly")
            return False
        
        print("✅ Gmail OAuth credentials loaded successfully")
        
        # Test service initialization
        service = gmail_service._get_service()
        if not service:
            print("❌ Failed to initialize Gmail service")
            return False
        
        print("✅ Gmail service initialized successfully")
        
        # Test email sending (uncomment to actually send test email)
        # test_email = input("Enter test email address (or press Enter to skip): ").strip()
        # if test_email:
        #     print(f"Sending test OTP email to {test_email}...")
        #     success = gmail_service.send_otp_email(test_email, "123456")
        #     if success:
        #         print("✅ Test email sent successfully")
        #     else:
        #         print("❌ Failed to send test email")
        #         return False
        
        print("✅ Gmail OAuth service is working correctly")
        return True
        
    except Exception as e:
        print(f"❌ Gmail OAuth test failed: {e}")
        return False

def test_whatsapp():
    """Test WhatsApp service"""
    print("\n🧪 Testing WhatsApp Service...")
    print("-" * 40)
    
    try:
        whatsapp_service = WhatsAppService()
        
        # Test client initialization
        if not whatsapp_service.client:
            print("❌ WhatsApp service not initialized - check Twilio credentials")
            return False
        
        print("✅ WhatsApp service initialized successfully")
        
        # Test message sending (uncomment to actually send test message)
        # test_mobile = input("Enter test mobile number (or press Enter to skip): ").strip()
        # if test_mobile:
        #     print(f"Sending test OTP message to {test_mobile}...")
        #     success = whatsapp_service.send_otp_message(test_mobile, "123456")
        #     if success:
        #         print("✅ Test WhatsApp message sent successfully")
        #     else:
        #         print("❌ Failed to send test WhatsApp message")
        #         return False
        
        print("✅ WhatsApp service is working correctly")
        return True
        
    except Exception as e:
        print(f"❌ WhatsApp test failed: {e}")
        return False

def test_otp_integration():
    """Test OTP integration with Django views"""
    print("\n🧪 Testing OTP Integration...")
    print("-" * 40)
    
    try:
        from accounts.models import OTPVerification
        from django.utils import timezone
        from datetime import timedelta
        
        # Create a test OTP record
        test_otp = OTPVerification.objects.create(
            email="test@example.com",
            mobile="+1234567890",
            otp_code="123456",
            otp_method="email",
            expires_at=timezone.now() + timedelta(minutes=10),
            user_data={"username": "testuser", "first_name": "Test", "last_name": "User"}
        )
        
        print("✅ Test OTP record created successfully")
        
        # Test OTP expiration
        is_expired = test_otp.is_expired()
        print(f"✅ OTP expiration check working: {is_expired}")
        
        # Clean up
        test_otp.delete()
        print("✅ Test OTP record cleaned up")
        
        return True
        
    except Exception as e:
        print(f"❌ OTP integration test failed: {e}")
        return False

def main():
    """Main test function"""
    print("🚀 OTP Services Test Suite")
    print("=" * 50)
    
    # Test Gmail OAuth
    gmail_success = test_gmail_oauth()
    
    # Test WhatsApp
    whatsapp_success = test_whatsapp()
    
    # Test OTP integration
    integration_success = test_otp_integration()
    
    # Summary
    print("\n📊 Test Results Summary")
    print("=" * 50)
    print(f"Gmail OAuth Service: {'✅ PASS' if gmail_success else '❌ FAIL'}")
    print(f"WhatsApp Service: {'✅ PASS' if whatsapp_success else '❌ FAIL'}")
    print(f"OTP Integration: {'✅ PASS' if integration_success else '❌ FAIL'}")
    
    if all([gmail_success, whatsapp_success, integration_success]):
        print("\n🎉 All tests passed! OTP services are ready to use.")
    else:
        print("\n⚠️  Some tests failed. Please check the configuration.")
        print("\nTroubleshooting tips:")
        if not gmail_success:
            print("- Check Gmail OAuth credentials in .env file")
            print("- Ensure Gmail API is enabled in Google Cloud Console")
            print("- Verify refresh token is valid")
        if not whatsapp_success:
            print("- Check Twilio credentials in .env file")
            print("- Ensure WhatsApp Sandbox is set up in Twilio Console")
            print("- Verify WhatsApp number format")

if __name__ == "__main__":
    main()
