"""
Gmail OAuth2 Token Manager
Manages OAuth2 tokens using environment variables instead of pickle files
"""

import os
import json
import base64
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from django.conf import settings


class GmailTokenManager:
    """Manages Gmail OAuth2 tokens using environment variables"""
    
    SCOPES = ['https://www.googleapis.com/auth/gmail.send']
    
    @staticmethod
    def _encode_token(token_data):
        """Encode token data for storage in environment variable"""
        json_str = json.dumps(token_data)
        return base64.b64encode(json_str.encode()).decode()
    
    @staticmethod
    def _decode_token(encoded_token):
        """Decode token data from environment variable"""
        try:
            json_str = base64.b64decode(encoded_token.encode()).decode()
            return json.loads(json_str)
        except Exception:
            return None
    
    @staticmethod
    def save_token(credentials):
        """Save credentials to environment variable"""
        token_data = {
            'token': credentials.token,
            'refresh_token': credentials.refresh_token,
            'id_token': credentials.id_token,
            'token_uri': credentials.token_uri,
            'client_id': credentials.client_id,
            'client_secret': credentials.client_secret,
            'scopes': credentials.scopes
        }
        
        encoded_token = GmailTokenManager._encode_token(token_data)
        
        # Save to environment variable
        os.environ['GMAIL_OAUTH_TOKEN'] = encoded_token
        
        # Also save to .env file if it exists or create one
        env_file = os.path.join(settings.BASE_DIR, '.env')
        env_lines = []
        
        if os.path.exists(env_file):
            with open(env_file, 'r') as f:
                env_lines = f.readlines()
        
        # Update or add the token line
        token_line = f'GMAIL_OAUTH_TOKEN={encoded_token}\n'
        token_found = False
        
        for i, line in enumerate(env_lines):
            if line.startswith('GMAIL_OAUTH_TOKEN='):
                env_lines[i] = token_line
                token_found = True
                break
        
        if not token_found:
            env_lines.append(token_line)
        
        # Write back to .env file
        with open(env_file, 'w') as f:
            f.writelines(env_lines)
        
        return True
    
    @staticmethod
    def load_token():
        """Load credentials from environment variable"""
        encoded_token = os.environ.get('GMAIL_OAUTH_TOKEN')
        
        if not encoded_token:
            # Try to load from .env file
            env_file = os.path.join(settings.BASE_DIR, '.env')
            if os.path.exists(env_file):
                with open(env_file, 'r') as f:
                    for line in f:
                        if line.startswith('GMAIL_OAUTH_TOKEN='):
                            encoded_token = line.split('=', 1)[1].strip()
                            os.environ['GMAIL_OAUTH_TOKEN'] = encoded_token
                            break
        
        if not encoded_token:
            return None
        
        token_data = GmailTokenManager._decode_token(encoded_token)
        if not token_data:
            return None
        
        try:
            credentials = Credentials(
                token=token_data.get('token'),
                refresh_token=token_data.get('refresh_token'),
                id_token=token_data.get('id_token'),
                token_uri=token_data.get('token_uri'),
                client_id=token_data.get('client_id'),
                client_secret=token_data.get('client_secret'),
                scopes=token_data.get('scopes')
            )
            return credentials
        except Exception:
            return None
    
    @staticmethod
    def refresh_token(credentials):
        """Refresh the token and save it"""
        try:
            credentials.refresh(Request())
            GmailTokenManager.save_token(credentials)
            return credentials
        except Exception:
            return None
    
    @staticmethod
    def delete_token():
        """Delete the stored token"""
        # Remove from environment
        if 'GMAIL_OAUTH_TOKEN' in os.environ:
            del os.environ['GMAIL_OAUTH_TOKEN']
        
        # Remove from .env file
        env_file = os.path.join(settings.BASE_DIR, '.env')
        if os.path.exists(env_file):
            with open(env_file, 'r') as f:
                lines = f.readlines()
            
            with open(env_file, 'w') as f:
                for line in lines:
                    if not line.startswith('GMAIL_OAUTH_TOKEN='):
                        f.write(line)
        
        return True
    
    @staticmethod
    def get_credentials():
        """Get valid credentials, refreshing if necessary"""
        credentials = GmailTokenManager.load_token()
        
        if not credentials:
            return None
        
        # Check if credentials are valid
        if not credentials.valid:
            if credentials.expired and credentials.refresh_token:
                try:
                    credentials = GmailTokenManager.refresh_token(credentials)
                except Exception:
                    credentials = None
            else:
                credentials = None
        
        return credentials
    
    @staticmethod
    def create_new_token():
        """Create a new token using OAuth flow with offline access"""
        client_config = {
            "installed": {
                "client_id": settings.GOOGLE_OAUTH2_CLIENT_ID,
                "client_secret": settings.GOOGLE_OAUTH2_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": ["http://localhost"]
            }
        }
        
        flow = InstalledAppFlow.from_client_config(client_config, GmailTokenManager.SCOPES)
        
        credentials = flow.run_local_server(
            port=0,
            success_message='Authentication successful! You can close this window.',
            open_browser=True,
            access_type='offline',
            prompt='consent'  # Force consent screen to get refresh token
        )
        
        GmailTokenManager.save_token(credentials)
        return credentials