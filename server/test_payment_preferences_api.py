"""
Test Payment Preferences APIs
Run: python test_payment_preferences_api.py
"""
import requests
import json

BASE_URL = 'http://localhost:8000/api'

def print_section(title):
    print('\n' + '='*70)
    print(f'  {title}')
    print('='*70)

def test_payment_preferences():
    print_section('TESTING PAYMENT PREFERENCES APIs')
    
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
    
    # Step 2: Get Payment Preference
    print_section('[2] GET Payment Preference')
    pref_response = requests.get(f'{BASE_URL}/auth/payment-preferences/', headers=headers)
    print(f'Status: {pref_response.status_code}')
    if pref_response.status_code == 200:
        print(json.dumps(pref_response.json(), indent=2))
    else:
        print(f'Error: {pref_response.text}')
    
    # Step 3: Get Saved Cards from Razorpay
    print_section('[3] GET Saved Cards from Razorpay')
    cards_response = requests.get(f'{BASE_URL}/auth/payment-preferences/saved-cards/', headers=headers)
    print(f'Status: {cards_response.status_code}')
    if cards_response.status_code == 200:
        print(json.dumps(cards_response.json(), indent=2))
    else:
        print(f'Error: {cards_response.text}')
    
    # Step 4: Get Addresses for preference
    print_section('[4] GET Addresses')
    addr_response = requests.get(f'{BASE_URL}/addresses/', headers=headers)
    print(f'Status: {addr_response.status_code}')
    addresses = []
    if addr_response.status_code == 200:
        addr_data = addr_response.json()
        addresses = addr_data if isinstance(addr_data, list) else addr_data.get('results', [])
        print(f'Found {len(addresses)} addresses')
        if addresses:
            print(f'First address ID: {addresses[0].get("id")}')
    
    # Step 5: Update Payment Preference
    print_section('[5] UPDATE Payment Preference')
    update_data = {
        'preferred_method': 'card',
        'payment_nickname': 'My Default Card'
    }
    if addresses:
        update_data['preferred_address_id'] = addresses[0].get('id')
    
    update_response = requests.patch(
        f'{BASE_URL}/auth/payment-preferences/update/',
        headers=headers,
        json=update_data
    )
    print(f'Status: {update_response.status_code}')
    if update_response.status_code == 200:
        print(json.dumps(update_response.json(), indent=2))
    else:
        print(f'Error: {update_response.text}')
    
    # Step 6: Get Updated Preference
    print_section('[6] GET Updated Payment Preference')
    pref_response2 = requests.get(f'{BASE_URL}/auth/payment-preferences/', headers=headers)
    print(f'Status: {pref_response2.status_code}')
    if pref_response2.status_code == 200:
        print(json.dumps(pref_response2.json(), indent=2))
    else:
        print(f'Error: {pref_response2.text}')
    
    print_section('ALL TESTS COMPLETED')

if __name__ == '__main__':
    try:
        test_payment_preferences()
    except Exception as e:
        print(f'\n[ERROR] Test failed: {str(e)}')
        import traceback
        traceback.print_exc()

