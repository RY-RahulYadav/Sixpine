from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    # Authentication endpoints
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    
    # Registration with OTP
    path('register/request-otp/', views.request_otp_view, name='request_otp'),
    path('register/verify-otp/', views.verify_otp_view, name='verify_otp'),
    path('register/resend-otp/', views.resend_otp_view, name='resend_otp'),
    
    # Password reset
    path('password-reset/request/', views.password_reset_request_view, name='password_reset_request'),
    path('password-reset/confirm/', views.password_reset_confirm_view, name='password_reset_confirm'),
    
    # Profile management
    path('profile/', views.profile_view, name='profile'),
    path('profile/update/', views.update_profile_view, name='update_profile'),
    path('change-password/', views.change_password_view, name='change_password'),
    
    # Contact form
    path('contact/submit/', views.contact_form_submit, name='contact_submit'),
    
    # Bulk orders
    path('bulk-order/submit/', views.bulk_order_submit, name='bulk_order_submit'),
]
