"""
Test Saved Cards API - Verify cards saved during checkout appear
Run: python test_saved_cards_api.py
"""
import requests
import json

BASE_URL = 'http://localhost:8000/api'

def print_section(title):
    print('\n' + '='*70)
    print(f'  {title}')
    print('='*70)

def test_saved_cards():
    print_section('TESTING SAVED CARDS API')
    
    # Step 1: Login
    print('\n[1] Testing Login...')
    login_data = {
        'username': 'test@example.com',  # CHANGE THIS
        'password': 'testpass123'  # CHANGE THIS
    }
    
    login_response = requests.post(f'{BASE_URL}/auth/login/', json=login_data)
    print(f'Status: {login_response.status_code}')
    
    if login_response.status_code != 200:
        print(f'[ERROR] Login failed: {login_response.text}')
        return
    
    token = login_response.json().get('token')
    headers = {'Authorization': f'Token {token}'}
    print(f'[SUCCESS] Token obtained: {token[:20]}...')
    
    # Step 2: Get Saved Cards
    print_section('[2] GET Saved Cards from Razorpay')
    cards_response = requests.get(f'{BASE_URL}/auth/payment-preferences/saved-cards/', headers=headers)
    print(f'Status: {cards_response.status_code}')
    if cards_response.status_code == 200:
        data = cards_response.json()
        print(json.dumps(data, indent=2))
        print(f'\nFound {data.get("count", 0)} saved cards')
        if data.get('saved_cards'):
            print('\nSaved Cards Details:')
            for idx, card in enumerate(data['saved_cards'], 1):
                print(f'\n  Card {idx}:')
                print(f'    Token ID: {card.get("token_id")}')
                print(f'    Card: {card.get("card", {}).get("network")} ending in {card.get("card", {}).get("last4")}')
                print(f'    Expires: {card.get("card", {}).get("expiry_month")}/{card.get("card", {}).get("expiry_year")}')
    else:
        print(f'Error: {cards_response.text}')
    
    # Step 3: Get Payment Preference
    print_section('[3] GET Payment Preference')
    pref_response = requests.get(f'{BASE_URL}/auth/payment-preferences/', headers=headers)
    print(f'Status: {pref_response.status_code}')
    if pref_response.status_code == 200:
        data = pref_response.json()
        print(json.dumps(data, indent=2))
        if data.get('data', {}).get('razorpay_customer_id'):
            print(f'\nCustomer ID: {data["data"]["razorpay_customer_id"]}')
    
    print_section('TEST COMPLETED')
    print('\nNOTE: Cards will appear here after:')
    print('1. Making a payment during checkout')
    print('2. Selecting "Save Card" option in Razorpay checkout')
    print('3. Completing the payment successfully')

if __name__ == '__main__':
    try:
        test_saved_cards()
    except Exception as e:
        print(f'\n[ERROR] Test failed: {str(e)}')
        import traceback
        traceback.print_exc()

