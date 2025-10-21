#!/usr/bin/env python
"""
Test script for authentication APIs
"""
import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_authentication_flow():
    """Test the complete authentication flow"""
    print("🧪 Testing Authentication Flow")
    print("=" * 50)
    
    # Test data
    test_user = {
        "username": "testuser",
        "email": "test@example.com",
        "first_name": "Test",
        "last_name": "User",
        "mobile": "+1234567890",
        "password": "testpass123",
        "password_confirm": "testpass123",
        "otp_method": "email"
    }
    
    # Step 1: Request OTP for registration
    print("1. Testing OTP Request...")
    try:
        response = requests.post(f"{BASE_URL}/auth/register/request-otp/", json=test_user)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
        
        if response.status_code == 200:
            print("   ✅ OTP request successful")
            # Check if Gmail OAuth2 is working
            if 'debug_otp' in response.json():
                print("   📧 Email sent via Gmail OAuth2 API")
            else:
                print("   📧 Email sent via SMTP fallback")
        else:
            print("   ❌ OTP request failed")
            return
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return
    
    # Step 2: Verify OTP (using a mock OTP for testing)
    print("\n2. Testing OTP Verification...")
    try:
        otp_data = {
            "email": test_user["email"],
            "otp": "123456"  # Mock OTP for testing
        }
        response = requests.post(f"{BASE_URL}/auth/register/verify-otp/", json=otp_data)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
        
        if response.status_code == 201:
            print("   ✅ OTP verification successful")
            token = response.json().get("token")
        else:
            print("   ❌ OTP verification failed")
            return
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return
    
    # Step 3: Test login
    print("\n3. Testing Login...")
    try:
        login_data = {
            "username": test_user["email"],  # Login with email
            "password": test_user["password"]
        }
        response = requests.post(f"{BASE_URL}/auth/login/", json=login_data)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
        
        if response.status_code == 200:
            print("   ✅ Login successful")
            token = response.json().get("token")
        else:
            print("   ❌ Login failed")
            return
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return
    
    # Step 4: Test profile access
    print("\n4. Testing Profile Access...")
    try:
        headers = {"Authorization": f"Token {token}"}
        response = requests.get(f"{BASE_URL}/auth/profile/", headers=headers)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
        
        if response.status_code == 200:
            print("   ✅ Profile access successful")
        else:
            print("   ❌ Profile access failed")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Step 5: Test password reset request
    print("\n5. Testing Password Reset Request...")
    try:
        reset_data = {"email": test_user["email"]}
        response = requests.post(f"{BASE_URL}/auth/password-reset/request/", json=reset_data)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
        
        if response.status_code == 200:
            print("   ✅ Password reset request successful")
        else:
            print("   ❌ Password reset request failed")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 Authentication flow test completed!")

if __name__ == "__main__":
    test_authentication_flow()
