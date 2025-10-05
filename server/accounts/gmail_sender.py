"""
Gmail API Email Sender
Simple utility to send emails using Gmail API with OAuth2 stored in environment variables
"""

import base64
from email.mime.text import MIMEText
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from .gmail_token_manager import GmailTokenManager
import os


class GmailSender:
    """Send emails using Gmail API with tokens stored in environment variables"""
    
    SCOPES = ['https://www.googleapis.com/auth/gmail.send']
    
    def __init__(self, client_id=None, client_secret=None):
        self.client_id = client_id
        self.client_secret = client_secret
        self.service = None
        
    def authenticate(self):
        """Authenticate with Gmail API using environment variables"""
        # Get credentials from environment variables
        creds = GmailTokenManager.get_credentials()
        
        # If no valid credentials, create new ones
        if not creds:
            try:
                creds = GmailTokenManager.create_new_token()
            except Exception as e:
                raise Exception(f"Failed to authenticate: {e}")
        
        self.service = build('gmail', 'v1', credentials=creds)
        return True
    
    def send_email(self, to, subject, body, from_email=None):
        """Send an email"""
        if not self.service:
            self.authenticate()
        
        message = MIMEText(body)
        message['to'] = to
        message['subject'] = subject
        if from_email:
            message['from'] = from_email
        
        raw = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')
        
        try:
            result = self.service.users().messages().send(
                userId='me',
                body={'raw': raw}
            ).execute()
            return result
        except Exception as error:
            raise Exception(f'Failed to send email: {error}')
