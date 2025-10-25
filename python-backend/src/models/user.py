from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.ext.declarative import declarative_base

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