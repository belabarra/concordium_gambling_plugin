from datetime import datetime, timedelta, timezone
from typing import Dict, Optional
from sqlalchemy.orm import Session
from src.models.limit import Limit
from src.models.transaction import Transaction

class LimitEnforcementService:
    def __init__(self, db: Session):
        self.db = db

    async def check_limit(self, user_id: str, transaction_amount: float) -> Dict:
        """Check if transaction would exceed user's spending limit"""
        limit = self.db.query(Limit).filter(Limit.user_id == user_id).first()
        
        if not limit:
            return {
                'allowed': True,
                'reason': 'No limit set for user'
            }
        
        # Calculate current spending in the limit period
        period_start = datetime.now(timezone.utc) - timedelta(days=limit.period_days or 1)
        current_spending = self.db.query(Transaction).filter(
            Transaction.user_id == user_id,
            Transaction.timestamp >= period_start
        ).with_entities(
            Transaction.amount
        ).all()
        
        total_spent = sum(t[0] for t in current_spending)
        new_total = total_spent + transaction_amount
        
        if new_total > limit.amount:
            return {
                'allowed': False,
                'reason': 'Spending limit exceeded',
                'limit': limit.amount,
                'current_spending': total_spent,
                'requested_amount': transaction_amount,
                'would_be_total': new_total
            }
        
        return {
            'allowed': True,
            'limit': limit.amount,
            'current_spending': total_spent,
            'remaining': limit.amount - new_total
        }

    async def set_limit(self, user_id: str, amount: float, limit_type: str = 'daily', period_days: int = 1) -> Dict:
        """Set spending limit for a user"""
        existing = self.db.query(Limit).filter(
            Limit.user_id == user_id,
            Limit.limit_type == limit_type
        ).first()
        
        if existing:
            existing.amount = amount
            existing.period_days = period_days
            self.db.commit()
            limit = existing
        else:
            limit = Limit(
                user_id=user_id,
                amount=amount,
                limit_type=limit_type,
                period_days=period_days
            )
            self.db.add(limit)
            self.db.commit()
        
        return {
            'success': True,
            'limit': {
                'amount': limit.amount,
                'type': limit.limit_type,
                'period_days': limit.period_days
            }
        }

    async def get_limit(self, user_id: str, limit_type: str = 'daily') -> Optional[Dict]:
        """Get user's spending limit"""
        limit = self.db.query(Limit).filter(
            Limit.user_id == user_id,
            Limit.limit_type == limit_type
        ).first()
        
        if not limit:
            return None
        
        return {
            'amount': limit.amount,
            'type': limit.limit_type,
            'period_days': limit.period_days
        }

    async def remove_limit(self, user_id: str, limit_type: str = 'daily') -> Dict:
        """Remove spending limit for a user"""
        result = self.db.query(Limit).filter(
            Limit.user_id == user_id,
            Limit.limit_type == limit_type
        ).delete()
        self.db.commit()
        
        return {
            'success': result > 0,
            'removed': result
        }