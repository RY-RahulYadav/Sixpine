"""
Gmail OAuth2 Email Backend for Django
Sends emails using Gmail API with OAuth2 credentials stored in environment variables
"""

import base64
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from django.core.mail.backends.base import BaseEmailBackend
from django.conf import settings
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from .gmail_token_manager import GmailTokenManager
import os


class GmailOAuth2Backend(BaseEmailBackend):
    """
    Email backend that uses Gmail API with OAuth2 authentication
    """
    
    SCOPES = ['https://www.googleapis.com/auth/gmail.send']
    
    def __init__(self, fail_silently=False, **kwargs):
        super().__init__(fail_silently=fail_silently, **kwargs)
        self.service = None
        self.credentials = None
        
    def get_credentials(self):
        """Get or refresh OAuth2 credentials from environment variables"""
        # Try to get credentials from environment variables
        creds = GmailTokenManager.get_credentials()
        
        # If no valid credentials, create new ones
        if not creds:
            try:
                creds = GmailTokenManager.create_new_token()
            except Exception as e:
                print(f"Error creating new token: {e}")
                return None
        
        return creds
    
    def open(self):
        """Open connection to Gmail API"""
        if self.service:
            return False
        
        try:
            self.credentials = self.get_credentials()
            self.service = build('gmail', 'v1', credentials=self.credentials)
            return True
        except Exception as e:
            if not self.fail_silently:
                raise
            return False
    
    def close(self):
        """Close connection"""
        self.service = None
    
    def send_messages(self, email_messages):
        """Send email messages"""
        if not email_messages:
            return 0
        
        if not self.service:
            self.open()
        
        if not self.service:
            if not self.fail_silently:
                raise Exception("Failed to connect to Gmail API")
            return 0
        
        num_sent = 0
        for message in email_messages:
            try:
                if self._send(message):
                    num_sent += 1
            except Exception as e:
                if not self.fail_silently:
                    raise
        
        return num_sent
    
    def _send(self, email_message):
        """Send a single email message"""
        try:
            # Create MIME message
            message = MIMEMultipart('alternative')
            message['From'] = email_message.from_email
            message['To'] = ', '.join(email_message.to)
            message['Subject'] = email_message.subject
            
            if email_message.cc:
                message['Cc'] = ', '.join(email_message.cc)
            
            if email_message.bcc:
                message['Bcc'] = ', '.join(email_message.bcc)
            
            # Add message body
            body = MIMEText(email_message.body, 'plain')
            message.attach(body)
            
            # Encode message
            raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')
            
            # Send message
            send_message = {'raw': raw_message}
            result = self.service.users().messages().send(
                userId='me',
                body=send_message
            ).execute()
            
            return True
            
        except HttpError as error:
            if not self.fail_silently:
                raise Exception(f'Gmail API error: {error}')
            return False
        except Exception as e:
            if not self.fail_silently:
                raise Exception(f'Error sending email: {e}')
            return False
