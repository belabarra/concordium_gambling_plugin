import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    """Application settings"""
    
    # Database
    DATABASE_URL: str = "sqlite:///./responsible_gambling.db"
    
    # API Configuration
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "Responsible Gambling Tool and Services"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Backend service for responsible gambling using Concordium blockchain"
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    API_KEY: str = "your_api_key_here"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Concordium Node.js Service
    CONCORDIUM_SERVICE_URL: str = "http://localhost:3000"
    CONCORDIUM_SERVICE_API_KEY: str = "your_concordium_api_key"
    
    # Responsible Gambling Settings
    COOLDOWN_PERIOD: int = 24  # hours
    MAX_SESSION_DURATION: int = 120  # minutes
    REALITY_CHECK_INTERVAL: int = 30  # minutes
    MANDATORY_BREAK_DURATION: int = 15  # minutes
    MAX_SPENDING_LIMIT: float = 1000.0  # default max spending limit
    SELF_EXCLUSION_DURATION: int = 30  # days
    
    # Risk Assessment Thresholds
    RISK_LOW_THRESHOLD: float = 25.0
    RISK_MEDIUM_THRESHOLD: float = 50.0
    RISK_HIGH_THRESHOLD: float = 75.0
    
    # Supported Currencies
    SUPPORTED_CURRENCIES: List[str] = ["CCD", "EUR_PLT", "USD_PLT"]
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8080", "http://localhost:5173", "http://localhost:5174"]
    
    # Notification Settings
    NOTIFICATION_EMAIL_ENABLED: bool = False
    NOTIFICATION_SMS_ENABLED: bool = False
    NOTIFICATION_PUSH_ENABLED: bool = False
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()