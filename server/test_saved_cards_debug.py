"""
Debug script to test saved cards fetching
Run: python test_saved_cards_debug.py
"""
import requests
import json
import sys

BASE_URL = 'http://localhost:8000/api'

def print_section(title):
    print('\n' + '='*70)
    print(f'  {title}')
    print('='*70)

def test_saved_cards_debug():
    print_section('DEBUGGING SAVED CARDS')
    
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
    print(f'[SUCCESS] Token obtained')
    
    # Step 2: Get Payment Preference
    print_section('[2] GET Payment Preference')
    pref_response = requests.get(f'{BASE_URL}/auth/payment-preferences/', headers=headers)
    print(f'Status: {pref_response.status_code}')
    if pref_response.status_code == 200:
        data = pref_response.json()
        print(json.dumps(data, indent=2))
        customer_id = data.get('data', {}).get('razorpay_customer_id')
        token_id = data.get('data', {}).get('preferred_card_token_id')
        print(f'\nCustomer ID: {customer_id}')
        print(f'Preferred Token ID: {token_id}')
    
    # Step 3: Get Saved Cards
    print_section('[3] GET Saved Cards from Razorpay')
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
            print('\n[WARNING] No saved cards found!')
            print('\nPossible reasons:')
            print('1. Card was not saved during checkout (user did not check "Save Card")')
            print('2. Tokenization feature not enabled in Razorpay dashboard')
            print('3. Customer ID mismatch between payment and customer')
            print('4. Token not properly linked to customer')
    
    # Step 4: Check server logs
    print_section('[4] Check Server Logs')
    print('Please check Django server logs for:')
    print('- "Fetching tokens from: ..." messages')
    print('- "Found X tokens from customer API"')
    print('- "Payment details - method: ..., token_id: ..."')
    print('- Any error messages related to token fetching')
    
    print_section('DEBUG COMPLETED')

if __name__ == '__main__':
    try:
        test_saved_cards_debug()
    except Exception as e:
        print(f'\n[ERROR] Test failed: {str(e)}')
        import traceback
        traceback.print_exc()

