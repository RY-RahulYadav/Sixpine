from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.UserRegistrationView.as_view(), name='user-register'),
    path('register/request-otp/', views.request_otp, name='request-otp'),
    path('register/verify-otp/', views.verify_otp, name='verify-otp'),
    path('register/resend-otp/', views.resend_otp, name='resend-otp'),
    path('login/', views.login_view, name='user-login'),
    path('logout/', views.logout_view, name='user-logout'),
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('profile/details/', views.UserProfileDetailView.as_view(), name='user-profile-details'),
    path('change-password/', views.change_password, name='change-password'),
]