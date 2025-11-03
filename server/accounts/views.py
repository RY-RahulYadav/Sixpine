from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
import random
import string
from .models import User, OTPVerification, PasswordResetToken, ContactQuery, BulkOrder
from .serializers import (
    UserLoginSerializer, UserRegistrationSerializer, UserSerializer,
    OTPRequestSerializer, OTPVerificationSerializer, OTPResendSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    ChangePasswordSerializer, ContactQuerySerializer, ContactQueryCreateSerializer,
    BulkOrderSerializer, BulkOrderCreateSerializer
)
from .gmail_oauth_service import GmailOAuth2Service
from .whatsapp_service import WhatsAppService


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """User login endpoint"""
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        login(request, user)
        
        # Generate or get existing token
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'success': True,
            'message': 'Login successful',
            'user': UserSerializer(user).data,
            'token': token.key
        }, status=status.HTTP_200_OK)
    
    return Response({
        'success': False,
        'error': 'Invalid credentials'
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """User logout endpoint"""
    try:
        # Delete the token
        Token.objects.filter(user=request.user).delete()
        logout(request)
        return Response({
            'success': True,
            'message': 'Logout successful'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'success': False,
            'error': 'Logout failed'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def request_otp_view(request):
    """Request OTP for registration"""
    serializer = OTPRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({
            'success': False,
            'error': 'Invalid data',
            'details': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    data = serializer.validated_data
    email = data['email']
    otp_method = data['otp_method']
    
    # Check if user already exists
    if User.objects.filter(email=email).exists():
        return Response({
            'success': False,
            'error': 'User with this email already exists'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Generate 6-digit OTP
    otp_code = ''.join(random.choices(string.digits, k=6))
    
    # Set expiration time (10 minutes)
    expires_at = timezone.now() + timezone.timedelta(minutes=10)
    
    # Create OTP record
    otp_obj = OTPVerification.objects.create(
        email=email,
        mobile=data.get('mobile'),
        otp_code=otp_code,
        otp_method=otp_method,
        expires_at=expires_at,
        user_data={
            'username': data['username'],
            'first_name': data['first_name'],
            'last_name': data.get('last_name', ''),
            'password': data['password'],
            'mobile': data.get('mobile', '')
        }
    )
    
    # Send OTP
    try:
        if otp_method == 'email':
            # Send email OTP using Gmail OAuth service
            gmail_service = GmailOAuth2Service()
            gmail_service.send_otp_email(email, otp_code)
        elif otp_method == 'whatsapp':
            # Send WhatsApp OTP using WhatsApp service
            whatsapp_service = WhatsAppService()
            whatsapp_service.send_otp_message(data['mobile'], otp_code)
        
        return Response({
            'success': True,
            'message': f'OTP sent to your {otp_method}',
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': f'Failed to send OTP: {str(e)}',
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp_view(request):
    """Verify OTP and complete registration"""
    serializer = OTPVerificationSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({
            'success': False,
            'error': 'Invalid data',
            'details': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    data = serializer.validated_data
    email = data['email']
    otp = data['otp']
    
    try:
        # Find the most recent OTP for this email
        otp_obj = OTPVerification.objects.filter(
            email=email,
            otp_code=otp,
            is_used=False
        ).order_by('-created_at').first()
        
        if not otp_obj:
            return Response({
                'success': False,
                'error': 'Invalid OTP'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if otp_obj.is_expired():
            return Response({
                'success': False,
                'error': 'OTP has expired'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Mark OTP as used
        otp_obj.is_used = True
        otp_obj.is_verified = True
        otp_obj.save()
        
        # Create user from stored data
        user_data = otp_obj.user_data
        user = User.objects.create_user(
            username=user_data['username'],
            email=email,
            first_name=user_data['first_name'],
            last_name=user_data.get('last_name', ''),
            mobile=user_data.get('mobile', ''),
            password=user_data['password'],
            is_verified=True
        )
        
        # Associate OTP with user
        otp_obj.user = user
        otp_obj.save()
        
        # Generate token
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'success': True,
            'message': 'Registration successful',
            'user': UserSerializer(user).data,
            'token': token.key
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': f'Registration failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def resend_otp_view(request):
    """Resend OTP for registration"""
    serializer = OTPResendSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({
            'success': False,
            'error': 'Invalid data',
            'details': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    data = serializer.validated_data
    email = data['email']
    otp_method = data['otp_method']
    
    try:
        # Find the most recent OTP for this email
        otp_obj = OTPVerification.objects.filter(
            email=email,
            otp_method=otp_method,
            is_used=False
        ).order_by('-created_at').first()
        
        if not otp_obj:
            return Response({
                'success': False,
                'error': 'No pending OTP found for this email'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate new OTP
        otp_code = ''.join(random.choices(string.digits, k=6))
        otp_obj.otp_code = otp_code
        otp_obj.expires_at = timezone.now() + timezone.timedelta(minutes=10)
        otp_obj.save()
        
        # Send OTP
        if otp_method == 'email':
            # Send email OTP using Gmail OAuth service
            gmail_service = GmailOAuth2Service()
            gmail_service.send_otp_email(email, otp_code)
        elif otp_method == 'whatsapp':
            # Send WhatsApp OTP using WhatsApp service
            whatsapp_service = WhatsAppService()
            whatsapp_service.send_otp_message(otp_obj.mobile, otp_code)
        
        return Response({
            'success': True,
            'message': f'OTP resent to your {otp_method}',
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': f'Failed to resend OTP: {str(e)}',
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request_view(request):
    """Request password reset"""
    serializer = PasswordResetRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({
            'success': False,
            'error': 'Invalid data',
            'details': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    email = serializer.validated_data['email']
    
    try:
        user = User.objects.get(email=email)
        
        # Generate reset token
        token = PasswordResetToken.generate_token()
        expires_at = timezone.now() + timezone.timedelta(hours=1)
        
        # Create or update reset token
        reset_token, created = PasswordResetToken.objects.update_or_create(
            user=user,
            defaults={
                'token': token,
                'expires_at': expires_at,
                'is_used': False
            }
        )
        
        # Send reset email using Gmail OAuth service
        reset_url = f"{settings.FRONTEND_URL}/forgot-password?token={token}"
        gmail_service = GmailOAuth2Service()
        subject = 'Sixpine - Password Reset'
        message = f"""Dear User,

Click the link below to reset your password:

{reset_url}

This link will expire in 1 hour.

If you did not request this password reset, please ignore this email.

Best regards,
Sixpine Team"""
        gmail_service.send_email(email, subject, message)
        
        return Response({
            'success': True,
            'message': 'Password reset link sent to your email',
            'debug_token': token  # Only for development
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        return Response({
            'success': False,
            'error': 'No user found with this email address'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'success': False,
            'error': f'Failed to send reset email: {str(e)}',
            'debug_token': token  # Still return token for development
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm_view(request):
    """Confirm password reset"""
    serializer = PasswordResetConfirmSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({
            'success': False,
            'error': 'Invalid data',
            'details': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    data = serializer.validated_data
    token = data['token']
    new_password = data['new_password']
    
    try:
        reset_token = PasswordResetToken.objects.get(token=token, is_used=False)
        
        if reset_token.is_expired():
            return Response({
                'success': False,
                'error': 'Reset token has expired'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update user password
        user = reset_token.user
        user.set_password(new_password)
        user.save()
        
        # Mark token as used
        reset_token.is_used = True
        reset_token.save()
        
        return Response({
            'success': True,
            'message': 'Password reset successful'
        }, status=status.HTTP_200_OK)
        
    except PasswordResetToken.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Invalid or expired reset token'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'success': False,
            'error': f'Password reset failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    """Get user profile"""
    return Response({
        'success': True,
        'user': UserSerializer(request.user).data
    }, status=status.HTTP_200_OK)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile_view(request):
    """Update user profile"""
    serializer = UserSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({
            'success': True,
            'message': 'Profile updated successfully',
            'user': serializer.data
        }, status=status.HTTP_200_OK)
    
    return Response({
        'success': False,
        'error': 'Invalid data',
        'details': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    """Change user password"""
    serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
    if not serializer.is_valid():
        return Response({
            'success': False,
            'error': 'Invalid data',
            'details': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    data = serializer.validated_data
    new_password = data['new_password']
    
    try:
        # Update password
        request.user.set_password(new_password)
        request.user.save()
        
        return Response({
            'success': True,
            'message': 'Password changed successfully'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': f'Password change failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def contact_form_submit(request):
    """Submit contact form from home page"""
    try:
        serializer = ContactQueryCreateSerializer(data=request.data)
        if serializer.is_valid():
            contact_query = serializer.save()
            return Response({
                'success': True,
                'message': 'Thank you for contacting us! Our team will reach out to you soon.',
                'data': ContactQuerySerializer(contact_query).data
            }, status=status.HTTP_201_CREATED)
        return Response({
            'success': False,
            'error': 'Invalid data provided',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'success': False,
            'error': f'Failed to submit contact form: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def bulk_order_submit(request):
    """Submit bulk order inquiry"""
    try:
        serializer = BulkOrderCreateSerializer(data=request.data)
        if serializer.is_valid():
            bulk_order = serializer.save()
            return Response({
                'success': True,
                'message': 'Thank you for your inquiry! Our sales team will contact you shortly.',
                'data': BulkOrderSerializer(bulk_order).data
            }, status=status.HTTP_201_CREATED)
        return Response({
            'success': False,
            'error': 'Invalid data provided',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'success': False,
            'error': f'Failed to submit bulk order: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)