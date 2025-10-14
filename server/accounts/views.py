from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.core.mail import send_mail, EmailMessage
from django.conf import settings
from django.utils import timezone
from .models import UserProfile, OTPVerification
from .serializers import (
    UserSerializer, UserRegistrationSerializer, LoginSerializer, 
    PasswordChangeSerializer, UserProfileSerializer,
    OTPRequestSerializer, OTPVerifySerializer
)
from .gmail_token_manager import GmailTokenManager
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import base64
import os


def get_gmail_service():
    """
    Get Gmail API service using OAuth2 credentials from environment variables
    Returns None if credentials don't exist or are invalid
    """
    try:
        from googleapiclient.discovery import build
        
        # Get credentials from environment variables using token manager
        creds = GmailTokenManager.get_credentials()
        
        if creds and creds.valid:
            return build('gmail', 'v1', credentials=creds)
        
        return None
    except Exception as e:
        print(f"Error getting Gmail service: {e}")
        return None


def send_whatsapp_otp(mobile_number, otp_code, first_name=''):
    """
    Send OTP via WhatsApp using Twilio or similar service
    Note: This requires Twilio credentials to be configured
    """
    try:
        # TODO: Integrate with Twilio WhatsApp API
        # For now, we'll just log it and return success for demo purposes
        
        # Example Twilio integration (commented out):
        # from twilio.rest import Client
        # account_sid = settings.TWILIO_ACCOUNT_SID
        # auth_token = settings.TWILIO_AUTH_TOKEN
        # client = Client(account_sid, auth_token)
        # 
        # message = client.messages.create(
        #     from_='whatsapp:+14155238886',  # Twilio WhatsApp number
        #     body=f'Hello {first_name}! Your Sixpine verification code is: {otp_code}. This code expires in 10 minutes.',
        #     to=f'whatsapp:{mobile_number}'
        # )
        # return True, f"Sent via WhatsApp (ID: {message.sid})"
        
        # For demo purposes, we'll simulate success
        print(f"📱 WhatsApp OTP to {mobile_number}: {otp_code}")
        print(f"Message: Hello {first_name}! Your Sixpine verification code is: {otp_code}")
        
        return True, "WhatsApp OTP sent (demo mode - check console)"
        
    except Exception as e:
        return False, f"WhatsApp error: {str(e)}"


def send_email_via_gmail_api(service, to_email, subject, html_content, text_content):
    """Send email using Gmail API"""
    try:
        from email.mime.multipart import MIMEMultipart
        from email.mime.text import MIMEText
        
        message = MIMEMultipart('alternative')
        message['To'] = to_email
        message['From'] = settings.EMAIL_HOST_USER
        message['Subject'] = subject
        
        part1 = MIMEText(text_content, 'plain')
        part2 = MIMEText(html_content, 'html')
        message.attach(part1)
        message.attach(part2)
        
        raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')
        
        result = service.users().messages().send(
            userId='me',
            body={'raw': raw_message}
        ).execute()
        
        return True, f"Sent via Gmail API (ID: {result.get('id', 'N/A')})"
    except Exception as e:
        return False, f"Gmail API error: {str(e)}"


def send_otp_email(to_email, otp_code, first_name='', username=''):
    """
    Send OTP email using Gmail OAuth2 API (preferred) with SMTP fallback
    """
    subject = 'Email Verification - E-Commerce Registration'
    
    # Create HTML email for better formatting
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <h2 style="color: #4CAF50;">Welcome to E-Commerce!</h2>
                <p>Hello <strong>{first_name or username}</strong>,</p>
                <p>Thank you for registering with our E-Commerce platform!</p>
                
                <div style="background-color: #fff; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
                    <p style="margin: 0; font-size: 14px; color: #666;">Your verification code is:</p>
                    <h1 style="margin: 10px 0; color: #4CAF50; font-size: 36px; letter-spacing: 5px;">{otp_code}</h1>
                    <p style="margin: 0; font-size: 12px; color: #999;">This code will expire in 10 minutes</p>
                </div>
                
                <p style="font-size: 14px; color: #666;">
                    If you didn't request this code, please ignore this email.
                </p>
                
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p style="font-size: 12px; color: #999;">
                    Best regards,<br>
                    E-Commerce Team
                </p>
            </div>
        </body>
    </html>
    """
    
    text_content = f"""
Hello {first_name or username},

Thank you for registering with our E-Commerce platform!

Your verification code is: {otp_code}

This code will expire in 10 minutes.

If you didn't request this code, please ignore this email.

Best regards,
E-Commerce Team
    """
    
    # Method 1: Try Gmail API (OAuth2) - Preferred
    gmail_service = get_gmail_service()
    if gmail_service:
        success, message = send_email_via_gmail_api(
            gmail_service, to_email, subject, html_content, text_content
        )
        if success:
            print(f"✓ {message}")
            return True, message
        else:
            print(f"Gmail API failed: {message}")
    else:
        print("Gmail API not available (no token), trying SMTP...")
    
    # Method 2: Fallback to SMTP with App Password
    if settings.EMAIL_HOST_PASSWORD:
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = settings.EMAIL_HOST_USER
            msg['To'] = to_email
            
            part1 = MIMEText(text_content, 'plain')
            part2 = MIMEText(html_content, 'html')
            msg.attach(part1)
            msg.attach(part2)
            
            with smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT, timeout=10) as server:
                server.starttls()
                server.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
                server.send_message(msg)
            
            return True, "Sent via SMTP"
        except Exception as smtp_error:
            return False, f"SMTP Error: {str(smtp_error)}"
    
    # Method 3: Last resort - Django's email backend
    try:
        email = EmailMessage(
            subject=subject,
            body=html_content,
            from_email=settings.EMAIL_HOST_USER,
            to=[to_email],
        )
        email.content_subtype = 'html'
        email.send(fail_silently=False)
        return True, "Sent via Django backend"
    except Exception as e:
        return False, f"All email methods failed. Last error: {str(e)}"


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def request_otp(request):
    """Send OTP to email or WhatsApp for registration verification"""
    serializer = OTPRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    email = serializer.validated_data['email']
    username = serializer.validated_data['username']
    first_name = serializer.validated_data.get('first_name', '')
    last_name = serializer.validated_data.get('last_name', '')
    mobile = serializer.validated_data.get('mobile', '')
    password = serializer.validated_data['password']
    otp_method = serializer.validated_data.get('otp_method', 'email')
    
    # Delete any existing OTP for this email
    OTPVerification.objects.filter(email=email).delete()
    
    # Generate new OTP
    otp_code = OTPVerification.generate_otp()
    
    # Hash the password before storing
    from django.contrib.auth.hashers import make_password
    password_hash = make_password(password)
    
    # Create OTP record
    otp_record = OTPVerification.objects.create(
        email=email,
        username=username,
        first_name=first_name,
        last_name=last_name,
        mobile=mobile,
        password_hash=password_hash,
        otp=otp_code,
        otp_method=otp_method
    )
    
    # Send OTP based on selected method
    if otp_method == 'whatsapp':
        success, message = send_whatsapp_otp(mobile, otp_code, first_name)
    else:
        success, message = send_otp_email(email, otp_code, first_name, username)
    
    if not success:
        # Delete the OTP record if sending fails
        otp_record.delete()
        
        # Provide helpful error message based on the failure reason
        if otp_method == 'email':
            if "EMAIL_HOST_PASSWORD" in message or "SMTP" in message:
                error_detail = "Gmail OAuth is not configured and SMTP fallback requires App Password. Please run: python setup_oauth_gmail.py"
            elif "Gmail API" in message:
                error_detail = "Gmail API authentication failed. Please run: python setup_oauth_gmail.py to re-authenticate"
            else:
                error_detail = f"Email service error: {message}"
        else:
            error_detail = f"WhatsApp service error: {message}. Note: WhatsApp OTP requires Twilio integration."
        
        return Response({
            'error': f'Failed to send verification {otp_method.upper()}',
            'detail': error_detail,
            'debug_info': message if settings.DEBUG else None
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    destination = mobile if otp_method == 'whatsapp' else email
    print(f"✓ OTP sent via {otp_method} to {destination}: {otp_code} ({message})")
    
    return Response({
        'message': f'OTP sent successfully via {otp_method}',
        'destination': destination,
        'method': otp_method,
        'expires_in_minutes': 10,
        'debug_message': message,
        'otp': otp_code if settings.DEBUG else None  # Only send OTP in debug mode for development
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def verify_otp(request):
    """Verify OTP and create user account"""
    serializer = OTPVerifySerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    email = serializer.validated_data['email']
    otp = serializer.validated_data['otp']
    
    try:
        otp_record = OTPVerification.objects.get(email=email)
    except OTPVerification.DoesNotExist:
        return Response({
            'error': 'No OTP found for this email. Please request a new OTP.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if OTP is valid
    if not otp_record.is_valid():
        return Response({
            'error': 'OTP has expired or maximum attempts exceeded. Please request a new OTP.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Increment attempts
    otp_record.attempts += 1
    otp_record.save()
    
    # Verify OTP
    if otp_record.otp != otp:
        remaining_attempts = 5 - otp_record.attempts
        if remaining_attempts > 0:
            return Response({
                'error': f'Invalid OTP. {remaining_attempts} attempts remaining.'
            }, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({
                'error': 'Maximum attempts exceeded. Please request a new OTP.'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    # OTP is correct, create user
    try:
        user = User.objects.create(
            username=otp_record.username,
            email=otp_record.email,
            first_name=otp_record.first_name,
            last_name=otp_record.last_name,
        )
        user.password = otp_record.password_hash
        user.save()
        
        # Mark OTP as verified
        otp_record.is_verified = True
        otp_record.save()
        
        # Create auth token
        token, created = Token.objects.get_or_create(user=user)
        
        # Delete OTP record after successful registration
        otp_record.delete()
        
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key,
            'message': 'Registration successful! Email verified.'
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'error': f'Failed to create user: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def resend_otp(request):
    """Resend OTP to email or WhatsApp"""
    email = request.data.get('email')
    otp_method = request.data.get('otp_method')
    
    if not email:
        return Response({
            'error': 'Email is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        otp_record = OTPVerification.objects.get(email=email, is_verified=False)
    except OTPVerification.DoesNotExist:
        return Response({
            'error': 'No pending registration found for this email'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Use provided method or fallback to stored method
    if otp_method:
        otp_record.otp_method = otp_method
    
    # Generate new OTP
    otp_code = OTPVerification.generate_otp()
    otp_record.otp = otp_code
    otp_record.created_at = timezone.now()
    otp_record.expires_at = timezone.now() + timezone.timedelta(minutes=10)
    otp_record.attempts = 0
    otp_record.save()
    
    # Send OTP based on method
    if otp_record.otp_method == 'whatsapp':
        success, message = send_whatsapp_otp(
            otp_record.mobile, 
            otp_code, 
            otp_record.first_name
        )
    else:
        success, message = send_otp_email(
            email, 
            otp_code, 
            otp_record.first_name, 
            otp_record.username
        )
    
    if not success:
        error_detail = f"{otp_record.otp_method.title()} service error. Please try again."
        return Response({
            'error': f'Failed to resend verification {otp_record.otp_method.upper()}',
            'detail': error_detail,
            'debug_info': message if settings.DEBUG else None
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    destination = otp_record.mobile if otp_record.otp_method == 'whatsapp' else email
    print(f"✓ OTP resent via {otp_record.otp_method} to {destination}: {otp_code} ({message})")
    
    return Response({
        'message': f'OTP resent successfully via {otp_record.otp_method}',
        'destination': destination,
        'method': otp_record.otp_method,
        'expires_in_minutes': 10,
        'debug_message': message,
        'otp': otp_code if settings.DEBUG else None  # Only send OTP in debug mode for development
    }, status=status.HTTP_200_OK)


class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key,
            'message': 'Registration successful'
        }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        
        user = authenticate(username=username, password=password)
        if user:
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'user': UserSerializer(user).data,
                'token': token.key,
                'message': 'Login successful'
            })
        else:
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    try:
        # Delete the token
        request.user.auth_token.delete()
        return Response({'message': 'Logout successful'})
    except:
        return Response({'error': 'Error logging out'}, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class UserProfileDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password(request):
    serializer = PasswordChangeSerializer(data=request.data)
    if serializer.is_valid():
        user = request.user
        old_password = serializer.validated_data['old_password']
        new_password = serializer.validated_data['new_password']
        
        if not user.check_password(old_password):
            return Response({
                'error': 'Old password is incorrect'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user.set_password(new_password)
        user.save()
        
        # Update token
        user.auth_token.delete()
        token = Token.objects.create(user=user)
        
        return Response({
            'message': 'Password changed successfully',
            'token': token.key
        })
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
