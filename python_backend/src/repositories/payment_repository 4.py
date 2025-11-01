from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta, timezone
from src.models.payment import Payment, PaymentType, PaymentStatus

class PaymentRepository:
    """Repository for payment data access"""
    
    def __init__(self, db: Session):
        self.db = db

    def create(self, payment: Payment) -> Payment:
        """Create a new payment"""
        self.db.add(payment)
        self.db.commit()
        self.db.refresh(payment)
        return payment
    
    def get_by_id(self, payment_id: str) -> Optional[Payment]:
        """Get payment by ID"""
        return self.db.query(Payment).filter(Payment.payment_id == payment_id).first()
    
    def get_user_payments(
        self, 
        user_id: str,
        payment_type: Optional[PaymentType] = None,
        limit: int = 100
    ) -> List[Payment]:
        """Get user's payment history"""
        query = self.db.query(Payment).filter(Payment.user_id == user_id)
        
        if payment_type:
            query = query.filter(Payment.payment_type == payment_type)
        
        return query.order_by(Payment.created_at.desc()).limit(limit).all()
    
    def update_status(
        self, 
        payment_id: str, 
        status: PaymentStatus,
        tx_hash: Optional[str] = None,
        error_message: Optional[str] = None
    ) -> Optional[Payment]:
        """Update payment status"""
        payment = self.get_by_id(payment_id)
        if payment:
            payment.status = status
            if tx_hash:
                payment.tx_hash = tx_hash
            if error_message:
                payment.error_message = error_message
            if status == PaymentStatus.COMPLETED:
                payment.completed_at = datetime.now(timezone.utc)
            self.db.commit()
            self.db.refresh(payment)
        return payment
    
    def get_totals(self, user_id: str, days: Optional[int] = None) -> dict:
        """Get payment totals for a user"""
        query = self.db.query(Payment).filter(
            Payment.user_id == user_id,
            Payment.status == PaymentStatus.COMPLETED
        )
        
        if days:
            since = datetime.now(timezone.utc) - timedelta(days=days)
            query = query.filter(Payment.created_at >= since)
        
        payments = query.all()
        
        deposits = sum(p.amount for p in payments if p.payment_type == PaymentType.DEPOSIT)
        withdrawals = sum(p.amount for p in payments if p.payment_type == PaymentType.WITHDRAWAL)
        winnings = sum(p.amount for p in payments if p.payment_type == PaymentType.WINNINGS)
        
        return {
            'deposits': deposits,
            'withdrawals': withdrawals,
            'winnings': winnings,
            'net': deposits - withdrawals + winnings
        }
