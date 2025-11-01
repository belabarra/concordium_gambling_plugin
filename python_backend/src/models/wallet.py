from sqlalchemy import Column, String, Float, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime, timezone

Base = declarative_base()

class Wallet(Base):
    """Simple wallet model for Concordium integration"""
    __tablename__ = 'wallets'

    wallet_id = Column(String, primary_key=True, index=True)
    user_id = Column(String, nullable=False, unique=True, index=True)
    concordium_address = Column(String, nullable=False, unique=True, index=True)
    
    # Balance (cached)
    balance = Column(Float, nullable=False, default=0.0)
    
    # Status
    is_active = Column(Boolean, nullable=False, default=True)
    
    # Timestamps
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    last_synced_at = Column(DateTime, nullable=True)

    def __repr__(self):
        return f"<Wallet(wallet_id='{self.wallet_id}', user_id='{self.user_id}', balance={self.balance})>"

    def to_dict(self):
        return {
            'wallet_id': self.wallet_id,
            'user_id': self.user_id,
            'concordium_address': self.concordium_address,
            'balance': self.balance,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_synced_at': self.last_synced_at.isoformat() if self.last_synced_at else None
        }
