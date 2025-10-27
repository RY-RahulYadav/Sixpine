#!/usr/bin/env python3
"""
Test script to check reviews API
"""

import requests
import json

def test_reviews():
    """Test product reviews API"""
    url = "http://localhost:8000/api/products/ergonomic-office-chair/reviews/"
    
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            print("Product Reviews API Response:")
            print(f"Total Reviews: {data.get('count', 0)}")
            reviews = data.get('results', [])
            for i, review in enumerate(reviews, 1):
                print(f"\nReview {i}:")
                print(f"  User: {review.get('user_name')}")
                print(f"  Rating: {review.get('rating')} stars")
                print(f"  Title: {review.get('title')}")
                print(f"  Comment: {review.get('comment')}")
                print(f"  Verified: {review.get('is_verified_purchase')}")
        else:
            print(f"Error: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_reviews()
