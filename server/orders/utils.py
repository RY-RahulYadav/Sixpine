from decimal import Decimal
from admin_api.models import GlobalSettings


def get_platform_fee_percentage(payment_method):
    """Get platform fee percentage based on payment method"""
    if payment_method in ['UPI']:
        fee_percentage = Decimal(str(GlobalSettings.get_setting('platform_fee_upi', '0.00')))
    elif payment_method in ['CARD', 'RAZORPAY']:
        fee_percentage = Decimal(str(GlobalSettings.get_setting('platform_fee_card', '2.36')))
    elif payment_method in ['NET_BANKING']:
        fee_percentage = Decimal(str(GlobalSettings.get_setting('platform_fee_netbanking', '2.36')))
    elif payment_method in ['WALLET']:
        fee_percentage = Decimal(str(GlobalSettings.get_setting('platform_fee_wallet', '2.36')))
    elif payment_method in ['COD']:
        fee_percentage = Decimal(str(GlobalSettings.get_setting('platform_fee_cod', '0.00')))
    else:
        fee_percentage = Decimal('0.00')
    
    return fee_percentage


def calculate_platform_fee(subtotal, payment_method):
    """Calculate platform fee amount based on subtotal and payment method"""
    fee_percentage = get_platform_fee_percentage(payment_method)
    platform_fee = (subtotal * fee_percentage) / Decimal('100.00')
    return platform_fee.quantize(Decimal('0.01'))


def calculate_order_totals(subtotal, payment_method=None):
    """Calculate all order totals including platform fee and tax"""
    from admin_api.models import GlobalSettings
    
    # Get tax rate
    tax_rate = Decimal(str(GlobalSettings.get_setting('tax_rate', '5.00')))
    
    # Calculate tax
    tax_amount = (subtotal * tax_rate) / Decimal('100.00')
    tax_amount = tax_amount.quantize(Decimal('0.01'))
    
    # Calculate platform fee (only for non-COD payments)
    platform_fee = Decimal('0.00')
    if payment_method:
        platform_fee = calculate_platform_fee(subtotal, payment_method)
    
    # Shipping cost is now 0 (removed)
    shipping_cost = Decimal('0.00')
    
    # Calculate total
    total_amount = subtotal + tax_amount + platform_fee + shipping_cost
    total_amount = total_amount.quantize(Decimal('0.01'))
    
    return {
        'subtotal': subtotal,
        'tax_amount': tax_amount,
        'platform_fee': platform_fee,
        'shipping_cost': shipping_cost,
        'total_amount': total_amount
    }

