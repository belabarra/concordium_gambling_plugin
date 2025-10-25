from datetime import datetime, timedelta, timezone
from typing import List, Optional, Dict
from sqlalchemy.orm import Session
from models.self_exclusion import SelfExclusion

class SelfExclusionService:
    def __init__(self, db: Session):
        self.db = db

    async def add_self_exclusion(self, user_id: str, duration_days: int, reason: str = None) -> Dict:
        """Add self-exclusion period for a user"""
        start_date = datetime.now(timezone.utc)
        end_date = start_date + timedelta(days=duration_days)
        
        # Check if user already has active exclusion
        existing = self.db.query(SelfExclusion).filter(
            SelfExclusion.user_id == user_id,
            SelfExclusion.end_date > datetime.now(timezone.utc)
        ).first()
        
        if existing:
            return {
                'success': False,
                'error': 'User already has an active self-exclusion',
                'existing_end_date': existing.end_date.isoformat()
            }
        
        exclusion = SelfExclusion(
            user_id=user_id,
            start_date=start_date,
            end_date=end_date,
            reason=reason
        )
        self.db.add(exclusion)
        self.db.commit()
        
        return {
            'success': True,
            'exclusion': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat(),
                'duration_days': duration_days
            }
        }

    async def is_user_excluded(self, user_id: str) -> bool:
        """Check if user is currently self-excluded"""
        current_date = datetime.now(timezone.utc)
        exclusion = self.db.query(SelfExclusion).filter(
            SelfExclusion.user_id == user_id,
            SelfExclusion.start_date <= current_date,
            SelfExclusion.end_date > current_date
        ).first()
        
        return exclusion is not None

    async def remove_self_exclusion(self, user_id: str) -> Dict:
        """Remove self-exclusion for a user (admin override)"""
        result = self.db.query(SelfExclusion).filter(
            SelfExclusion.user_id == user_id,
            SelfExclusion.end_date > datetime.now(timezone.utc)
        ).delete()
        self.db.commit()
        
        return {
            'success': result > 0,
            'removed': result
        }

    async def get_exclusion_details(self, user_id: str) -> Optional[Dict]:
        """Get details of user's self-exclusion"""
        exclusion = self.db.query(SelfExclusion).filter(
            SelfExclusion.user_id == user_id,
            SelfExclusion.end_date > datetime.now(timezone.utc)
        ).first()
        
        if not exclusion:
            return None
        
        return {
            'user_id': exclusion.user_id,
            'start_date': exclusion.start_date.isoformat(),
            'end_date': exclusion.end_date.isoformat(),
            'reason': exclusion.reason,
            'days_remaining': (exclusion.end_date - datetime.now(timezone.utc)).days
        }

    async def get_all_exclusions(self, active_only: bool = True) -> List[Dict]:
        """Get all self-exclusions"""
        query = self.db.query(SelfExclusion)
        
        if active_only:
            query = query.filter(SelfExclusion.end_date > datetime.now(timezone.utc))
        
        exclusions = query.all()
        
        return [
            {
                'user_id': e.user_id,
                'start_date': e.start_date.isoformat(),
                'end_date': e.end_date.isoformat(),
                'reason': e.reason
            }
            for e in exclusions
        ]