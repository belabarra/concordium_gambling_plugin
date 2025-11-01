from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'

    
    # Core fields for authentication
    id = Column(Integer, primary_key=True, autoincrement=True)
    wallet_address = Column(String(100), unique=True, nullable=False, index=True)
    
    # Concordium verification fields
    age_verified = Column(Boolean, default=False)
    verified_at = Column(DateTime, nullable=True)
    country_code = Column(String(2), nullable=True)  # From ZK proof if available
    
    # Gambling controls
    self_excluded = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)

    def __repr__(self):
        return f"<User(wallet='{self.wallet_address}', verified={self.age_verified})>"
    
    def to_dict(self):
        """Convert to dictionary for JSON responses"""
        return {
            'id': self.id,
            'wallet_address': self.wallet_address,
            'age_verified': self.age_verified,
            'verified_at': self.verified_at.isoformat() if self.verified_at else None,
            'country_code': self.country_code,
            'self_excluded': self.self_excluded,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }