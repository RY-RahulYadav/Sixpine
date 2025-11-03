#!/usr/bin/env python
"""Test script to verify URL patterns are loaded"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_backend.settings')
django.setup()

from django.urls import get_resolver
from django.urls.resolvers import URLResolver

def print_all_urls(patterns, prefix='', namespace=''):
    """Recursively print all URL patterns"""
    for pattern in patterns:
        if isinstance(pattern, URLResolver):
            new_prefix = prefix + str(pattern.pattern)
            new_namespace = namespace + (':' + pattern.namespace if pattern.namespace else '')
            print_all_urls(pattern.url_patterns, new_prefix, new_namespace)
        else:
            full_path = prefix + str(pattern.pattern)
            name = namespace + ':' + pattern.name if namespace and pattern.name else pattern.name
            print(f"{full_path:<50} {name}")

if __name__ == '__main__':
    resolver = get_resolver()
    print("=" * 80)
    print("All URL Patterns:")
    print("=" * 80)
    print_all_urls(resolver.url_patterns)
    
    print("\n" + "=" * 80)
    print("Checking for browsing-history URLs:")
    print("=" * 80)
    
    browsing_found = False
    for pattern in resolver.url_patterns:
        if hasattr(pattern, 'url_patterns'):
            for sub_pattern in pattern.url_patterns:
                if isinstance(sub_pattern, URLResolver):
                    for url_pattern in sub_pattern.url_patterns:
                        if 'browsing-history' in str(url_pattern.pattern):
                            print(f"[FOUND] {str(sub_pattern.pattern) + str(url_pattern.pattern)} - {url_pattern.name}")
                            browsing_found = True
                elif 'browsing-history' in str(sub_pattern.pattern):
                    print(f"[FOUND] {str(pattern.pattern) + str(sub_pattern.pattern)} - {sub_pattern.name}")
                    browsing_found = True
    
    if not browsing_found:
        print("[ERROR] No browsing-history URLs found!")
        print("\nChecking products URLs...")
        for pattern in resolver.url_patterns:
            if 'api' in str(pattern.pattern) and hasattr(pattern, 'url_patterns'):
                print(f"\nPattern: {pattern.pattern}")
                for sub in pattern.url_patterns:
                    if hasattr(sub, 'url_patterns'):
                        print(f"  Sub-pattern: {sub.pattern} (namespace: {getattr(sub, 'namespace', 'None')})")
                        if 'products' in str(sub.pattern) or getattr(sub, 'namespace', '') == 'products':
                            print(f"    Products URLs found: {len(sub.url_patterns)}")
                            for url in sub.url_patterns:
                                if 'browsing' in str(url.pattern):
                                    print(f"      [FOUND] {url.pattern}")
