#!/usr/bin/env python
"""
Test script for Browsing History APIs
Run this script to test all browsing history endpoints
"""
import requests
import json
import sys

BASE_URL = "http://localhost:8000/api"

def print_section(title):
    """Print a formatted section header"""
    print("\n" + "=" * 70)
    print(f"  {title}")
    print("=" * 70)

def test_browsing_history_apis():
    """Test all browsing history API endpoints"""
    
    print_section("Testing Browsing History APIs")
    
    # First, we need to login to get a token
    print("\n1. Logging in to get authentication token...")
    login_data = {
        "username": "admin",  # Change this to your test user
        "password": "admin123"  # Change this to your test password
    }
    
    try:
        login_response = requests.post(f"{BASE_URL}/auth/login/", json=login_data)
        if login_response.status_code != 200:
            print(f"   [FAIL] Login failed: {login_response.status_code}")
            print(f"   Response: {login_response.text}")
            print("\n   [WARN] Please create a user first or use existing credentials")
            print("   You can create a user via the registration endpoint")
            return None
        
        token = login_response.json().get("token")
        if not token:
            print("   [FAIL] No token received")
            return None
        
        print(f"   [OK] Login successful")
        print(f"   Token: {token[:20]}...")
        headers = {"Authorization": f"Token {token}", "Content-Type": "application/json"}
    except Exception as e:
        print(f"   ❌ Login error: {e}")
        return None
    
    # Get a product ID for testing (get first product)
    print("\n2. Getting a product ID for testing...")
    try:
        products_response = requests.get(f"{BASE_URL}/products/?page_size=1")
        if products_response.status_code == 200:
            products = products_response.json().get("results", [])
            if products:
                test_product_id = products[0]["id"]
                print(f"   [OK] Found product ID: {test_product_id}")
                print(f"   Product: {products[0]['title']}")
            else:
                print("   [WARN] No products found. Please add products first.")
                return None
        else:
            print(f"   [WARN] Could not fetch products: {products_response.status_code}")
            test_product_id = 1  # Fallback
    except Exception as e:
        print(f"   [WARN] Error fetching products: {e}")
        test_product_id = 1  # Fallback
    
    # Test 1: Track browsing history
    print_section("Test 1: Track Browsing History")
    try:
        track_data = {"product_id": test_product_id}
        response = requests.post(
            f"{BASE_URL}/browsing-history/track/",
            json=track_data,
            headers=headers
        )
        print(f"   Request: POST {BASE_URL}/browsing-history/track/")
        print(f"   Body: {json.dumps(track_data, indent=2)}")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code in [200, 201]:
            print("   [OK] Track browsing history successful")
        else:
            print("   [FAIL] Track browsing history failed")
    except Exception as e:
        print(f"   [ERROR] Error: {e}")
    
    # Test 2: Get browsing history
    print_section("Test 2: Get Browsing History")
    try:
        response = requests.get(
            f"{BASE_URL}/browsing-history/?limit=10",
            headers=headers
        )
        print(f"   Request: GET {BASE_URL}/browsing-history/?limit=10")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Count: {data.get('count', 0)} items")
            print(f"   Response: {json.dumps(data, indent=2)}")
            print("   [OK] Get browsing history successful")
        else:
            print(f"   Response: {response.text}")
            print("   [FAIL] Get browsing history failed")
    except Exception as e:
        print(f"   [ERROR] Error: {e}")
    
    # Test 3: Get browsed categories
    print_section("Test 3: Get Browsed Categories")
    try:
        response = requests.get(
            f"{BASE_URL}/browsing-history/categories/",
            headers=headers
        )
        print(f"   Request: GET {BASE_URL}/browsing-history/categories/")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Count: {data.get('count', 0)} categories")
            print(f"   Response: {json.dumps(data, indent=2)}")
            print("   [OK] Get browsed categories successful")
        else:
            print(f"   Response: {response.text}")
            print("   [FAIL] Get browsed categories failed")
    except Exception as e:
        print(f"   [ERROR] Error: {e}")
    
    # Test 4: Clear specific product from history
    print_section("Test 4: Clear Specific Product from History")
    try:
        response = requests.delete(
            f"{BASE_URL}/browsing-history/clear/?product_id={test_product_id}",
            headers=headers
        )
        print(f"   Request: DELETE {BASE_URL}/browsing-history/clear/?product_id={test_product_id}")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {json.dumps(response.json(), indent=2)}")
        if response.status_code == 200:
            print("   [OK] Clear specific product successful")
        else:
            print("   [FAIL] Clear specific product failed")
    except Exception as e:
        print(f"   [ERROR] Error: {e}")
    
    # Test 5: Track again to verify it works
    print_section("Test 5: Track Again (Verify Update)")
    try:
        track_data = {"product_id": test_product_id}
        response = requests.post(
            f"{BASE_URL}/browsing-history/track/",
            json=track_data,
            headers=headers
        )
        print(f"   Request: POST {BASE_URL}/browsing-history/track/")
        print(f"   Status: {response.status_code}")
        if response.status_code in [200, 201]:
            data = response.json()
            view_count = data.get('data', {}).get('view_count', 0)
            print(f"   View Count: {view_count}")
            print(f"   Response: {json.dumps(data, indent=2)}")
            print("   [OK] Track update successful")
        else:
            print(f"   Response: {response.text}")
            print("   [FAIL] Track update failed")
    except Exception as e:
        print(f"   [ERROR] Error: {e}")
    
    print_section("All Tests Completed")
    print("\n[NOTE] Make sure the Django server is running on http://localhost:8000")
    print("[NOTE] Run: python manage.py runserver")

if __name__ == "__main__":
    test_browsing_history_apis()

