from sqlalchemy import Column, String, Float, DateTime, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime, timezone
from enum import Enum

Base = declarative_base()

class PaymentType(str, Enum):
    """Payment type enumeration"""
    DEPOSIT = "deposit"
    WITHDRAWAL = "withdrawal"
    WINNINGS = "winnings"

class PaymentStatus(str, Enum):
    """Payment status enumeration"""
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"

class Payment(Base):
    """Simple payment model for deposits, withdrawals, and winnings"""
    __tablename__ = 'payments'

    payment_id = Column(String, primary_key=True, index=True)
    user_id = Column(String, nullable=False, index=True)
    payment_type = Column(SQLEnum(PaymentType), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    currency = Column(String, nullable=False, default="CCD")
    status = Column(SQLEnum(PaymentStatus), nullable=False, default=PaymentStatus.PENDING, index=True)
    
    # Blockchain details
    tx_hash = Column(String, nullable=True, index=True)
    from_address = Column(String, nullable=True)
    to_address = Column(String, nullable=True)
    
    # Game details (for winnings)
    game_id = Column(String, nullable=True)
    session_id = Column(String, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)
    
    error_message = Column(String, nullable=True)

    def __repr__(self):
        return f"<Payment(payment_id='{self.payment_id}', type='{self.payment_type}', amount={self.amount})>"

    def to_dict(self):
        return {
            'payment_id': self.payment_id,
            'user_id': self.user_id,
            'payment_type': self.payment_type.value if isinstance(self.payment_type, Enum) else self.payment_type,
            'amount': self.amount,
            'currency': self.currency,
            'status': self.status.value if isinstance(self.status, Enum) else self.status,
            'tx_hash': self.tx_hash,
            'from_address': self.from_address,
            'to_address': self.to_address,
            'game_id': self.game_id,
            'session_id': self.session_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'error_message': self.error_message
        }
