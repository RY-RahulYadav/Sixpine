#!/usr/bin/env python3
"""
Test script to check API responses
"""

import requests
import json

def test_product_detail():
    """Test product detail API"""
    url = "http://localhost:8000/api/products/ergonomic-office-chair/"
    
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            print("Product Detail API Response:")
            print(f"Title: {data.get('title')}")
            print(f"Review Count: {data.get('review_count')}")
            print(f"Average Rating: {data.get('average_rating')}")
            print(f"Review Percentages: {data.get('review_percentages')}")
            print(f"Available Colors: {data.get('available_colors')}")
            print(f"Available Sizes: {data.get('available_sizes')}")
            print(f"Available Patterns: {data.get('available_patterns')}")
            print(f"Variants Count: {len(data.get('variants', []))}")
            print(f"Buy With Products: {len(data.get('buy_with_products', []))}")
            print(f"Inspired Products: {len(data.get('inspired_products', []))}")
            print(f"Frequently Viewed: {len(data.get('frequently_viewed_products', []))}")
            print(f"Similar Products: {len(data.get('similar_products', []))}")
            print(f"Recommended Products: {len(data.get('recommended_products', []))}")
        else:
            print(f"Error: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_product_detail()
