#!/usr/bin/env python3
"""
Product data seed file - Creates products with all fields populated
"""

import os
import sys
import django
from decimal import Decimal

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_backend.settings')
django.setup()

from products.models import (
    Category, Subcategory, Color, Material, Product, ProductImage, 
    ProductVariant, ProductSpecification, ProductFeature, ProductOffer,
    ProductReview, ProductRecommendation
)
from accounts.models import User

def create_basic_data():
    """Create basic categories, colors, materials"""
    
    # Create colors (matching seed_categories.py)
    colors = [
        {'name': 'Red', 'hex_code': '#FF0000'},
        {'name': 'Blue', 'hex_code': '#0000FF'},
        {'name': 'Black', 'hex_code': '#000000'},
        {'name': 'White', 'hex_code': '#FFFFFF'},
        {'name': 'Brown', 'hex_code': '#8B4513'},
    ]
    
    for color_data in colors:
        Color.objects.get_or_create(
            name=color_data['name'],
            defaults={'hex_code': color_data['hex_code']}
        )
    
    # Create materials
    materials = [
        {'name': 'Solid Wood', 'description': 'High-quality solid wood construction'},
        {'name': 'Engineered Wood', 'description': 'Engineered wood with wood veneer'},
        {'name': 'Metal', 'description': 'Durable metal frame construction'},
        {'name': 'Fabric', 'description': 'Premium fabric upholstery'},
        {'name': 'Leather', 'description': 'Genuine leather upholstery'},
        {'name': 'Glass', 'description': 'Tempered glass construction'},
        {'name': 'Plastic', 'description': 'High-quality plastic materials'},
    ]
    
    for material_data in materials:
        Material.objects.get_or_create(
            name=material_data['name'],
            defaults={'description': material_data['description']}
        )
    
    # Create categories (matching seed_categories.py)
    categories = [
        {
            'name': 'Sofas',
            'description': 'Furniture for sofas',
            'image': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500',
            'subcategories': ['3 Seater', '2 Seater', '1 Seater', 'Sofa Sets']
        },
        {
            'name': 'Recliners',
            'description': 'Furniture for recliners',
            'image': 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500',
            'subcategories': ['1 Seater Recliners', '2 Seater Recliners', '3 Seater Recliners', 'Recliners Sets']
        },
        {
            'name': 'Rocking Chairs',
            'description': 'Furniture for rocking chairs',
            'image': 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=500',
            'subcategories': ['Modern', 'Relax in Motion', 'Classic']
        },
        {
            'name': 'Beds',
            'description': 'Furniture for beds',
            'image': 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500',
            'subcategories': ['Queen Size Beds', 'King Size Beds', 'Single Size Beds', 'Poster Beds', 'Folding Beds']
        },
        {
            'name': 'Centre Tables',
            'description': 'Furniture for centre tables',
            'image': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500',
            'subcategories': ['Coffee Tables', 'Coffee Tables Set']
        },
        {
            'name': 'Sectional Sofas',
            'description': 'Furniture for sectional sofas',
            'image': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500',
            'subcategories': ['LHS Sectionals', 'RHS Sectionals', 'Corner Sofas']
        },
        {
            'name': 'Chaise Loungers',
            'description': 'Furniture for chaise loungers',
            'image': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500',
            'subcategories': ['3 Seater Chaise Loungers', '2 Seater Chaise Loungers']
        },
        {
            'name': 'Chairs',
            'description': 'Furniture for chairs',
            'image': 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=500',
            'subcategories': ['Arm Chairs', 'Accent Chairs']
        },
        {
            'name': 'Sofa Cum Beds',
            'description': 'Furniture for sofa cum beds',
            'image': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500',
            'subcategories': ['Pull Out Type', 'Convertible Type']
        },
        {
            'name': 'Shoe Racks',
            'description': 'Furniture for shoe racks',
            'image': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500',
            'subcategories': ['Shoe Cabinets', 'Shoe Racks']
        },
        {
            'name': 'Settees & Benches',
            'description': 'Furniture for settees & benches',
            'image': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500',
            'subcategories': ['Settees', 'Benches']
        },
        {
            'name': 'Ottomans',
            'description': 'Furniture for ottomans',
            'image': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500',
            'subcategories': ['Ottomans with Storage', 'Decorative Ottomans']
        },
        {
            'name': 'Sofa Chairs',
            'description': 'Furniture for sofa chairs',
            'image': 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=500',
            'subcategories': ['Lounge Chairs', 'Wing Chairs']
        },
        {
            'name': 'Stool & Pouffes',
            'description': 'Furniture for stool & pouffes',
            'image': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500',
            'subcategories': ['Foot Stools', 'Seating Stools', 'Pouffes']
        }
    ]
    
    created_categories = {}
    for cat_data in categories:
        category, created = Category.objects.get_or_create(
            name=cat_data['name'],
            defaults={
                'description': cat_data['description'],
                'image': cat_data['image']
            }
        )
        created_categories[cat_data['name']] = category
        
        # Create subcategories
        for subcat_name in cat_data['subcategories']:
            Subcategory.objects.get_or_create(
                name=subcat_name,
                category=category,
                defaults={'description': f'{subcat_name} {cat_data["name"].lower()}'}
            )
    
    return created_categories

def create_product_1():
    """Premium 3-Seater Sofa - Complete Product Data"""
    category = Category.objects.get(name='Sofas')
    subcategory = Subcategory.objects.get(name='3 Seater', category=category)
    material = Material.objects.get(name='Fabric')
    
    product, created = Product.objects.get_or_create(
        title='Premium 3-Seater Fabric Sofa',
        defaults={
            'slug': 'premium-3-seater-fabric-sofa',
            'short_description': 'Luxurious 3-seater sofa with premium fabric upholstery and modern design',
            'long_description': 'Experience ultimate comfort with our Premium 3-Seater Fabric Sofa. Crafted with attention to detail, this sofa features high-quality fabric upholstery that is both durable and comfortable. The modern design complements any living room decor while providing ample seating space for your family and guests. Perfect for entertaining or relaxing with your loved ones.',
            'category': category,
            'subcategory': subcategory,
            'price': Decimal('29999.00'),
            'old_price': Decimal('39999.00'),
            'main_image': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
            'average_rating': Decimal('4.5'),
            'review_count': 25,
            'brand': 'Sixpine',
            'material': material,
            'dimensions': '84" x 36" x 32" (L x W x H)',
            'weight': '85 kg',
            'warranty': '2 years',
            'assembly_required': True,
            'meta_title': 'Premium 3-Seater Fabric Sofa - Sixpine',
            'meta_description': 'Buy Premium 3-Seater Fabric Sofa online. Luxurious design, premium fabric upholstery, 2-year warranty. Free delivery.',
            'is_featured': True,
            'is_active': True
        }
    )
    
    if created:
        # Add product images
        images = [
            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
            'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800',
            'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
            'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800',
            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800'
        ]
        
        for i, img_url in enumerate(images):
            ProductImage.objects.create(
                product=product,
                image=img_url,
                alt_text=f'Premium 3-Seater Sofa - View {i+1}',
                sort_order=i
            )
        
        # Add specifications
        specifications = [
            {'name': 'Brand', 'value': 'Sixpine'},
            {'name': 'Seating Capacity', 'value': '3 People'},
            {'name': 'Frame Material', 'value': 'Solid Wood'},
            {'name': 'Upholstery', 'value': 'Premium Fabric'},
            {'name': 'Cushion Type', 'value': 'High Density Foam'},
            {'name': 'Assembly', 'value': 'Required'},
            {'name': 'Warranty', 'value': '2 Years'},
            {'name': 'Weight Capacity', 'value': '300 kg'},
            {'name': 'Color Options', 'value': 'Red, Blue, Brown, Grey'},
            {'name': 'Style', 'value': 'Modern Contemporary'}
        ]
        
        for spec in specifications:
            ProductSpecification.objects.create(
                product=product,
                name=spec['name'],
                value=spec['value'],
                sort_order=len(ProductSpecification.objects.filter(product=product))
            )
        
        # Add features
        features = [
            'Premium fabric upholstery for durability and comfort',
            'Solid wood frame construction for long-lasting use',
            'High-density foam cushions for superior comfort',
            'Modern design that complements any decor',
            'Easy to clean and maintain',
            '2-year warranty on manufacturing defects',
            'Free delivery and installation',
            '30-day return policy',
            'Scratch-resistant fabric',
            'Fire-retardant materials'
        ]
        
        for i, feature in enumerate(features):
            ProductFeature.objects.create(
                product=product,
                feature=feature,
                sort_order=i
            )
        
        # Add variants (exactly 3 each)
        colors = ['Red', 'Blue', 'Brown']
        sizes = ['Standard', 'Large', 'XL']
        patterns = ['Modern', 'Classic', 'Contemporary']
        
        # Create exactly 3 variants (one for each color)
        for i, color_name in enumerate(colors):
            color = Color.objects.get(name=color_name)
            ProductVariant.objects.create(
                product=product,
                color=color,
                size=sizes[i % len(sizes)],
                pattern=patterns[i % len(patterns)],
                stock_quantity=10,
                is_in_stock=True,
                image=f'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&color={color_name.lower()}'
            )
        
        # Add offers
        ProductOffer.objects.create(
            product=product,
            title='Early Bird Special',
            description='Get 20% off on your first purchase',
            discount_percentage=20,
            is_active=True
        )
        
        ProductOffer.objects.create(
            product=product,
            title='Free Delivery',
            description='Free delivery on orders above ₹25,000',
            is_active=True
        )
    
    return product

def create_product_2():
    """King Size Bed - Complete Product Data"""
    category = Category.objects.get(name='Beds')
    subcategory = Subcategory.objects.get(name='King Size Beds', category=category)
    material = Material.objects.get(name='Solid Wood')
    
    product, created = Product.objects.get_or_create(
        title='King Size Solid Wood Bed',
        defaults={
            'slug': 'king-size-solid-wood-bed',
            'short_description': 'Elegant king size bed made from premium solid wood with modern design',
            'long_description': 'Transform your bedroom with our King Size Solid Wood Bed. Crafted from premium solid wood, this bed combines traditional craftsmanship with modern design. The sturdy construction ensures years of reliable use while the elegant finish adds sophistication to your bedroom decor. Perfect for couples who value both comfort and style.',
            'category': category,
            'subcategory': subcategory,
            'price': Decimal('45999.00'),
            'old_price': Decimal('59999.00'),
            'main_image': 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800',
            'average_rating': Decimal('4.7'),
            'review_count': 18,
            'brand': 'Sixpine',
            'material': material,
            'dimensions': '78" x 60" x 18" (L x W x H)',
            'weight': '120 kg',
            'warranty': '3 years',
            'assembly_required': True,
            'meta_title': 'King Size Solid Wood Bed - Sixpine',
            'meta_description': 'Buy King Size Solid Wood Bed online. Premium solid wood, elegant design, 3-year warranty. Free delivery.',
            'is_featured': True,
            'is_active': True
        }
    )
    
    if created:
        # Add product images
        images = [
            'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800',
            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
            'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
            'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800'
        ]
        
        for i, img_url in enumerate(images):
            ProductImage.objects.create(
                product=product,
                image=img_url,
                alt_text=f'King Size Wood Bed - View {i+1}',
                sort_order=i
            )
        
        # Add specifications
        specifications = [
            {'name': 'Brand', 'value': 'Sixpine'},
            {'name': 'Bed Size', 'value': 'King Size (78" x 60")'},
            {'name': 'Material', 'value': 'Solid Wood'},
            {'name': 'Finish', 'value': 'Matte Walnut'},
            {'name': 'Headboard', 'value': 'Included'},
            {'name': 'Assembly', 'value': 'Required'},
            {'name': 'Warranty', 'value': '3 Years'},
            {'name': 'Weight Capacity', 'value': '500 kg'},
            {'name': 'Wood Type', 'value': 'Sheesham Wood'},
            {'name': 'Style', 'value': 'Contemporary'}
        ]
        
        for spec in specifications:
            ProductSpecification.objects.create(
                product=product,
                name=spec['name'],
                value=spec['value'],
                sort_order=len(ProductSpecification.objects.filter(product=product))
            )
        
        # Add features
        features = [
            'Premium solid wood construction for durability',
            'Elegant matte walnut finish',
            'Sturdy headboard included',
            'Easy assembly with included tools',
            'Scratch-resistant surface',
            '3-year warranty on manufacturing defects',
            'Free delivery and installation',
            'Compatible with all standard mattresses',
            'Anti-termite treatment',
            'Eco-friendly materials'
        ]
        
        for i, feature in enumerate(features):
            ProductFeature.objects.create(
                product=product,
                feature=feature,
                sort_order=i
            )
        
        # Add variants (exactly 3 each)
        colors = ['Brown', 'Black', 'White']
        sizes = ['King', 'Queen', 'Single']
        patterns = ['Classic', 'Modern', 'Traditional']
        
        # Create exactly 3 variants (one for each color)
        for i, color_name in enumerate(colors):
            color = Color.objects.get(name=color_name)
            ProductVariant.objects.create(
                product=product,
                color=color,
                size=sizes[i % len(sizes)],
                pattern=patterns[i % len(patterns)],
                stock_quantity=8,
                is_in_stock=True
            )
        
        # Add offers
        ProductOffer.objects.create(
            product=product,
            title='Mattress Combo',
            description='Get 15% off when you buy with mattress',
            discount_percentage=15,
            is_active=True
        )
    
    return product

def create_product_3():
    """Office Chair - Complete Product Data"""
    category = Category.objects.get(name='Chairs')
    subcategory = Subcategory.objects.get(name='Arm Chairs', category=category)
    material = Material.objects.get(name='Fabric')
    
    product, created = Product.objects.get_or_create(
        title='Ergonomic Office Chair',
        defaults={
            'slug': 'ergonomic-office-chair',
            'short_description': 'Comfortable ergonomic office chair with lumbar support and adjustable height',
            'long_description': 'Boost your productivity with our Ergonomic Office Chair. Designed for long hours of work, this chair features adjustable lumbar support, height adjustment, and breathable fabric upholstery. The ergonomic design helps maintain proper posture and reduces back strain, making it perfect for home office or corporate environments.',
            'category': category,
            'subcategory': subcategory,
            'price': Decimal('12999.00'),
            'old_price': Decimal('15999.00'),
            'main_image': 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800',
            'average_rating': Decimal('4.3'),
            'review_count': 32,
            'brand': 'Sixpine',
            'material': material,
            'dimensions': '26" x 26" x 40-44" (L x W x H)',
            'weight': '15 kg',
            'warranty': '1 year',
            'assembly_required': True,
            'meta_title': 'Ergonomic Office Chair - Sixpine',
            'meta_description': 'Buy Ergonomic Office Chair online. Adjustable height, lumbar support, 1-year warranty. Free delivery.',
            'is_featured': False,
            'is_active': True
        }
    )
    
    if created:
        # Add product images
        images = [
            'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800',
            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
            'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'
        ]
        
        for i, img_url in enumerate(images):
            ProductImage.objects.create(
                product=product,
                image=img_url,
                alt_text=f'Office Chair - View {i+1}',
                sort_order=i
            )
        
        # Add specifications
        specifications = [
            {'name': 'Brand', 'value': 'Sixpine'},
            {'name': 'Type', 'value': 'Ergonomic Office Chair'},
            {'name': 'Material', 'value': 'Fabric Upholstery'},
            {'name': 'Adjustable Height', 'value': 'Yes'},
            {'name': 'Lumbar Support', 'value': 'Adjustable'},
            {'name': 'Armrests', 'value': 'Adjustable'},
            {'name': 'Warranty', 'value': '1 Year'},
            {'name': 'Weight Capacity', 'value': '120 kg'},
            {'name': 'Casters', 'value': '5 Smooth Rolling'},
            {'name': 'Backrest', 'value': 'Mesh Back'}
        ]
        
        for spec in specifications:
            ProductSpecification.objects.create(
                product=product,
                name=spec['name'],
                value=spec['value'],
                sort_order=len(ProductSpecification.objects.filter(product=product))
            )
        
        # Add features
        features = [
            'Adjustable height for perfect fit',
            'Lumbar support for back comfort',
            'Adjustable armrests',
            'Breathable fabric upholstery',
            '360-degree swivel base',
            'Smooth-rolling casters',
            'Easy assembly with included tools',
            '1-year warranty on parts',
            'Ergonomic design',
            'Durable construction'
        ]
        
        for i, feature in enumerate(features):
            ProductFeature.objects.create(
                product=product,
                feature=feature,
                sort_order=i
            )
        
        # Add variants (exactly 3 each)
        colors = ['Black', 'White', 'Blue']
        sizes = ['Standard', 'Large', 'XL']
        patterns = ['Ergonomic', 'Executive', 'Gaming']
        
        # Create exactly 3 variants (one for each color)
        for i, color_name in enumerate(colors):
            color = Color.objects.get(name=color_name)
            ProductVariant.objects.create(
                product=product,
                color=color,
                size=sizes[i % len(sizes)],
                pattern=patterns[i % len(patterns)],
                stock_quantity=15,
                is_in_stock=True
            )
        
        # Add offers
        ProductOffer.objects.create(
            product=product,
            title='Bulk Discount',
            description='Get 10% off on orders of 5 or more chairs',
            discount_percentage=10,
            is_active=True
        )
    
    return product

def create_product_4():
    """Dining Table - Complete Product Data"""
    category = Category.objects.get(name='Centre Tables')
    subcategory = Subcategory.objects.get(name='Coffee Tables', category=category)
    material = Material.objects.get(name='Engineered Wood')
    
    product, created = Product.objects.get_or_create(
        title='6-Seater Dining Table',
        defaults={
            'slug': '6-seater-dining-table',
            'short_description': 'Elegant 6-seater dining table perfect for family gatherings',
            'long_description': 'Gather your family around our beautiful 6-Seater Dining Table. Crafted from high-quality engineered wood with a stunning finish, this table provides ample space for family meals and entertaining guests. The timeless design complements any dining room decor and creates a warm, inviting atmosphere for memorable meals.',
            'category': category,
            'subcategory': subcategory,
            'price': Decimal('18999.00'),
            'old_price': Decimal('22999.00'),
            'main_image': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
            'average_rating': Decimal('4.4'),
            'review_count': 22,
            'brand': 'Sixpine',
            'material': material,
            'dimensions': '60" x 36" x 30" (L x W x H)',
            'weight': '45 kg',
            'warranty': '2 years',
            'assembly_required': True,
            'meta_title': '6-Seater Dining Table - Sixpine',
            'meta_description': 'Buy 6-Seater Dining Table online. Engineered wood, elegant design, 2-year warranty. Free delivery.',
            'is_featured': False,
            'is_active': True
        }
    )
    
    if created:
        # Add product images
        images = [
            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
            'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800',
            'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'
        ]
        
        for i, img_url in enumerate(images):
            ProductImage.objects.create(
                product=product,
                image=img_url,
                alt_text=f'Dining Table - View {i+1}',
                sort_order=i
            )
        
        # Add specifications
        specifications = [
            {'name': 'Brand', 'value': 'Sixpine'},
            {'name': 'Seating Capacity', 'value': '6 People'},
            {'name': 'Material', 'value': 'Engineered Wood'},
            {'name': 'Finish', 'value': 'Matte Oak'},
            {'name': 'Shape', 'value': 'Rectangular'},
            {'name': 'Assembly', 'value': 'Required'},
            {'name': 'Warranty', 'value': '2 Years'},
            {'name': 'Weight Capacity', 'value': '200 kg'},
            {'name': 'Table Top Thickness', 'value': '1.5 inches'},
            {'name': 'Leg Material', 'value': 'Solid Wood'}
        ]
        
        for spec in specifications:
            ProductSpecification.objects.create(
                product=product,
                name=spec['name'],
                value=spec['value'],
                sort_order=len(ProductSpecification.objects.filter(product=product))
            )
        
        # Add features
        features = [
            'Seats up to 6 people comfortably',
            'High-quality engineered wood construction',
            'Elegant matte oak finish',
            'Sturdy and stable design',
            'Easy to clean and maintain',
            'Scratch-resistant surface',
            '2-year warranty on manufacturing defects',
            'Free delivery and installation',
            'Water-resistant finish',
            'Anti-warping design'
        ]
        
        for i, feature in enumerate(features):
            ProductFeature.objects.create(
                product=product,
                feature=feature,
                sort_order=i
            )
        
        # Add variants (exactly 3 each)
        colors = ['Brown', 'Black', 'White']
        sizes = ['6-Seater', '4-Seater', '2-Seater']
        patterns = ['Classic', 'Modern', 'Rustic']
        
        # Create exactly 3 variants (one for each color)
        for i, color_name in enumerate(colors):
            color = Color.objects.get(name=color_name)
            ProductVariant.objects.create(
                product=product,
                color=color,
                size=sizes[i % len(sizes)],
                pattern=patterns[i % len(patterns)],
                stock_quantity=12,
                is_in_stock=True
            )
        
        # Add offers
        ProductOffer.objects.create(
            product=product,
            title='Dining Set Combo',
            description='Get 15% off when you buy with 6 chairs',
            discount_percentage=15,
            is_active=True
        )
    
    return product

def create_product_5():
    """Wardrobe - Complete Product Data"""
    category = Category.objects.get(name='Shoe Racks')
    subcategory = Subcategory.objects.get(name='Shoe Cabinets', category=category)
    material = Material.objects.get(name='Engineered Wood')
    
    product, created = Product.objects.get_or_create(
        title='4-Door Wardrobe with Mirror',
        defaults={
            'slug': '4-door-wardrobe-with-mirror',
            'short_description': 'Spacious 4-door wardrobe with full-length mirror and multiple compartments',
            'long_description': 'Organize your wardrobe with our spacious 4-Door Wardrobe. Featuring multiple compartments, hanging space, and a full-length mirror, this wardrobe provides ample storage for all your clothing and accessories. The modern design adds elegance to any bedroom while maximizing storage space and keeping your belongings organized.',
            'category': category,
            'subcategory': subcategory,
            'price': Decimal('34999.00'),
            'old_price': Decimal('42999.00'),
            'main_image': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
            'average_rating': Decimal('4.6'),
            'review_count': 28,
            'brand': 'Sixpine',
            'material': material,
            'dimensions': '72" x 24" x 84" (L x W x H)',
            'weight': '80 kg',
            'warranty': '3 years',
            'assembly_required': True,
            'meta_title': '4-Door Wardrobe with Mirror - Sixpine',
            'meta_description': 'Buy 4-Door Wardrobe with Mirror online. Spacious storage, full-length mirror, 3-year warranty. Free delivery.',
            'is_featured': True,
            'is_active': True
        }
    )
    
    if created:
        # Add product images
        images = [
            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
            'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800',
            'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
            'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800'
        ]
        
        for i, img_url in enumerate(images):
            ProductImage.objects.create(
                product=product,
                image=img_url,
                alt_text=f'Wardrobe - View {i+1}',
                sort_order=i
            )
        
        # Add specifications
        specifications = [
            {'name': 'Brand', 'value': 'Sixpine'},
            {'name': 'Doors', 'value': '4 Doors'},
            {'name': 'Material', 'value': 'Engineered Wood'},
            {'name': 'Mirror', 'value': 'Full Length'},
            {'name': 'Compartments', 'value': 'Multiple'},
            {'name': 'Assembly', 'value': 'Required'},
            {'name': 'Warranty', 'value': '3 Years'},
            {'name': 'Weight Capacity', 'value': '150 kg'},
            {'name': 'Hanging Space', 'value': '2 Sections'},
            {'name': 'Shelf Space', 'value': '4 Shelves'}
        ]
        
        for spec in specifications:
            ProductSpecification.objects.create(
                product=product,
                name=spec['name'],
                value=spec['value'],
                sort_order=len(ProductSpecification.objects.filter(product=product))
            )
        
        # Add features
        features = [
            '4-door design for easy access',
            'Full-length mirror on one door',
            'Multiple compartments for organization',
            'Hanging space for clothes',
            'Shelf space for folded items',
            'Smooth-gliding doors',
            '3-year warranty on manufacturing defects',
            'Free delivery and installation',
            'Anti-termite treatment',
            'Easy to assemble'
        ]
        
        for i, feature in enumerate(features):
            ProductFeature.objects.create(
                product=product,
                feature=feature,
                sort_order=i
            )
        
        # Add variants (exactly 3 each)
        colors = ['White', 'Brown', 'Black']
        sizes = ['4-Door', '3-Door', '2-Door']
        patterns = ['Modern', 'Classic', 'Contemporary']
        
        # Create exactly 3 variants (one for each color)
        for i, color_name in enumerate(colors):
            color = Color.objects.get(name=color_name)
            ProductVariant.objects.create(
                product=product,
                color=color,
                size=sizes[i % len(sizes)],
                pattern=patterns[i % len(patterns)],
                stock_quantity=6,
                is_in_stock=True
            )
        
        # Add offers
        ProductOffer.objects.create(
            product=product,
            title='Bedroom Set Combo',
            description="Get 20% off when you buy with bed and side tables",
            discount_percentage=20,
            is_active=True
        )
    
    return product

def create_test_user():
    """Create a test user for reviews"""
    user, created = User.objects.get_or_create(
        username='testuser',
        defaults={
            'email': 'test@example.com',
            'first_name': 'Test',
            'last_name': 'User',
            'is_active': True
        }
    )
    if created:
        user.set_password('testpass123')
        user.save()
    return user

def create_reviews_and_recommendations(products, user):
    """Create reviews and recommendations for products"""
    
    # Sample reviews for each product
    review_data = [
        {
            'product': products[0],  # Sofa
            'reviews': [
                {'rating': 5, 'title': 'Excellent Quality', 'comment': 'Amazing sofa! Very comfortable and looks great in our living room. Delivery was fast and assembly was easy.', 'user_name': 'Rahul Sharma'},
                {'rating': 4, 'title': 'Good Value', 'comment': 'Good quality for the price. The fabric is soft and the frame is sturdy. Would recommend.', 'user_name': 'Priya Patel'},
                {'rating': 5, 'title': 'Perfect Fit', 'comment': 'Fits perfectly in our space. The color matches our decor beautifully. Very satisfied with the purchase.', 'user_name': 'Amit Kumar'},
                {'rating': 4, 'title': 'Great Product', 'comment': 'Love the design and comfort. Assembly was straightforward. Highly recommended!', 'user_name': 'Neha Singh'},
                {'rating': 5, 'title': 'Outstanding', 'comment': 'Best sofa purchase ever! Quality is top-notch and customer service was excellent.', 'user_name': 'Rajesh Verma'}
            ]
        },
        {
            'product': products[1],  # Bed
            'reviews': [
                {'rating': 5, 'title': 'Solid Construction', 'comment': 'Very sturdy bed frame. The wood quality is excellent and the finish is beautiful. Assembly took some time but worth it.', 'user_name': 'Suresh Reddy'},
                {'rating': 4, 'title': 'Great Bed', 'comment': 'Good value for money. The bed is comfortable and looks great. Delivery was on time.', 'user_name': 'Anita Gupta'},
                {'rating': 5, 'title': 'Love It', 'comment': 'Perfect bed for our bedroom. The design is modern and the quality is top-notch. Highly recommended!', 'user_name': 'Vikram Joshi'},
                {'rating': 4, 'title': 'Excellent', 'comment': 'Beautiful bed with great craftsmanship. Easy to assemble and very sturdy.', 'user_name': 'Meera Iyer'},
                {'rating': 5, 'title': 'Perfect', 'comment': 'Exactly what we wanted. Great quality and fast delivery. Will buy again!', 'user_name': 'Arjun Nair'}
            ]
        },
        {
            'product': products[2],  # Office Chair
            'reviews': [
                {'rating': 4, 'title': 'Comfortable', 'comment': 'Great chair for long work hours. The lumbar support is adjustable and very helpful. Good value for money.', 'user_name': 'Deepak Sharma'},
                {'rating': 5, 'title': 'Excellent Chair', 'comment': 'Best office chair I have used. Very comfortable and the build quality is excellent. Worth every penny.', 'user_name': 'Sunita Patel'},
                {'rating': 4, 'title': 'Good Product', 'comment': 'Solid chair with good ergonomics. Assembly was straightforward. Would buy again.', 'user_name': 'Ravi Kumar'},
                {'rating': 5, 'title': 'Amazing', 'comment': 'Perfect for home office. Very comfortable and adjustable. Great value!', 'user_name': 'Kavita Singh'},
                {'rating': 4, 'title': 'Great Value', 'comment': 'Good chair for the price. Comfortable and well-built. Recommended!', 'user_name': 'Manoj Verma'}
            ]
        },
        {
            'product': products[3],  # Dining Table
            'reviews': [
                {'rating': 5, 'title': 'Beautiful Table', 'comment': 'Love this dining table! It looks elegant and seats 6 people comfortably. The finish is perfect.', 'user_name': 'Rohit Agarwal'},
                {'rating': 4, 'title': 'Good Quality', 'comment': 'Well-made table with good finish. Assembly was easy and the table is very stable. Happy with the purchase.', 'user_name': 'Shilpa Reddy'},
                {'rating': 5, 'title': 'Perfect Size', 'comment': 'Perfect size for our dining room. The quality is excellent and it looks great. Highly recommended!', 'user_name': 'Nitin Joshi'},
                {'rating': 4, 'title': 'Great Table', 'comment': 'Good quality table. Easy to clean and maintain. Family loves it!', 'user_name': 'Pooja Iyer'},
                {'rating': 5, 'title': 'Excellent', 'comment': 'Beautiful table with great craftsmanship. Perfect for family dinners!', 'user_name': 'Sandeep Nair'}
            ]
        },
        {
            'product': products[4],  # Wardrobe
            'reviews': [
                {'rating': 5, 'title': 'Spacious Wardrobe', 'comment': 'Excellent wardrobe with lots of storage space. The mirror is a great addition. Very happy with the purchase.', 'user_name': 'Anil Kumar'},
                {'rating': 4, 'title': 'Good Storage', 'comment': 'Good wardrobe for the price. Plenty of space for clothes and accessories. Assembly was straightforward.', 'user_name': 'Rekha Sharma'},
                {'rating': 5, 'title': 'Love It', 'comment': 'Perfect wardrobe for our bedroom. The quality is excellent and it looks beautiful. Worth the money!', 'user_name': 'Vijay Patel'},
                {'rating': 4, 'title': 'Great Value', 'comment': 'Good wardrobe with ample storage. Easy to assemble and looks great!', 'user_name': 'Geeta Reddy'},
                {'rating': 5, 'title': 'Perfect', 'comment': 'Exactly what we needed. Great quality and plenty of space. Highly recommended!', 'user_name': 'Suresh Joshi'}
            ]
        }
    ]
    
    # Create reviews
    for product_data in review_data:
        product = product_data['product']
        for i, review_info in enumerate(product_data['reviews']):
            # Create unique user for each review to avoid conflicts
            review_user, _ = User.objects.get_or_create(
                username=f'testuser_{product.id}_{i}',
                defaults={
                    'email': f'test{product.id}_{i}@example.com',
                    'first_name': review_info['user_name'].split()[0],
                    'last_name': review_info['user_name'].split()[-1] if len(review_info['user_name'].split()) > 1 else '',
                    'is_active': True
                }
            )
            ProductReview.objects.get_or_create(
                product=product,
                user=review_user,
                title=review_info['title'],
                defaults={
                    'rating': review_info['rating'],
                    'comment': review_info['comment'],
                    'is_verified_purchase': True,
                    'is_approved': True
                }
            )
    
    # Create recommendations
    recommendation_types = [
        ('buy_with', 'Buy with it'),
        ('inspired_by', 'Inspired by browsing history'),
        ('frequently_viewed', 'Frequently viewed'),
        ('similar', 'Similar products'),
        ('recommended', 'Recommended for you')
    ]
    
    for i, product in enumerate(products):
        for rec_type, rec_name in recommendation_types:
            # Get other products as recommendations
            other_products = [p for j, p in enumerate(products) if j != i]
            
            for j, rec_product in enumerate(other_products[:3]):  # Limit to 3 recommendations per type
                ProductRecommendation.objects.get_or_create(
                    product=product,
                    recommended_product=rec_product,
                    recommendation_type=rec_type,
                    defaults={
                        'sort_order': j,
                        'is_active': True
                    }
                )

def main():
    """Main function to create product data"""
    print("Creating product data with all fields...")
    
    # Create basic data
    create_basic_data()
    
    # Create test user
    user = create_test_user()
    
    # Create products
    products = []
    products.append(create_product_1())
    products.append(create_product_2())
    products.append(create_product_3())
    products.append(create_product_4())
    products.append(create_product_5())
    
    # Create reviews and recommendations
    create_reviews_and_recommendations(products, user)
    
    print("\nProduct data creation completed!")
    print(f"Created {len(products)} products with complete data:")
    
    for i, product in enumerate(products, 1):
        print(f"\n{i}. {product.title}")
        print(f"   Price: ₹{product.price}")
        print(f"   Category: {product.category.name}")
        print(f"   Images: {product.images.count()}")
        print(f"   Variants: {product.variants.count()}")
        print(f"   Specifications: {product.specifications.count()}")
        print(f"   Features: {product.features.count()}")
        print(f"   Offers: {product.offers.count()}")
        print(f"   Reviews: {product.reviews.count()}")
        print(f"   Recommendations: {product.recommendations.count()}")

if __name__ == '__main__':
    main()
