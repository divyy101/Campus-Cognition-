"""
Campus Cognition V2 - Configuration Module
Centralized configuration management for Flask and MongoDB.
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    """Base configuration"""
    
    # Flask
    SECRET_KEY = os.getenv('SECRET_KEY', 'campus-cognition-secret-key-2026-dev')
    DEBUG = os.getenv('FLASK_ENV') == 'development'
    
    # Session
    SESSION_TYPE = 'null' if os.environ.get('VERCEL') else 'filesystem'
    PERMANENT_SESSION_LIFETIME = 86400  # 24 hours
    
    # Upload
    UPLOAD_FOLDER = '/tmp' if os.environ.get('VERCEL') else 'static/uploads'
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50MB
    ALLOWED_EXTENSIONS = {'pdf', 'docx', 'txt', 'md', 'pptx'}
    
    # MongoDB Configuration
    MONGODB_URI = os.getenv('MONGODB_URI', '')
    MONGODB_DB_NAME = os.getenv('MONGODB_DB_NAME', 'campus_cognition')
    
    # Gemini & OpenAI API Configuration
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
    GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini-1.5-flash')
    
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')
    OPENAI_MODEL = os.getenv('OPENAI_MODEL', 'gpt-4o-mini')
    
    # AI Providers Fallback Engine selection
    AI_PRIMARY_PROVIDER = os.getenv('AI_PRIMARY_PROVIDER', 'gemini')
    AI_FALLBACK_PROVIDER = os.getenv('AI_FALLBACK_PROVIDER', 'openai')
    
    # Server
    HOST = '0.0.0.0'
    PORT = int(os.getenv('PORT', 5000))
    
    @staticmethod
    def init_app(app):
        """Initialize app with config"""
        pass

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False

class TestingConfig(Config):
    """Testing configuration"""
    DEBUG = True
    TESTING = True
    WTF_CSRF_ENABLED = False

# Config selector
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

def get_config(env=None):
    """Get configuration object"""
    if env is None:
        env = os.getenv('FLASK_ENV', 'development')
    return config.get(env, config['default'])
