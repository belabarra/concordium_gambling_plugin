from datetime import datetime, timedelta, timezone
from typing import Dict, Optional
from sqlalchemy.orm import Session
from src.models.cooldown import Cooldown

class CooldownService:
    def __init__(self, db: Session):
        self.db = db

    async def set_cooldown(self, user_id: str, duration_minutes: int) -> Dict:
        """Set a cooldown period for a user"""
        end_time = datetime.now(timezone.utc) + timedelta(minutes=duration_minutes)
        
        # Check if cooldown already exists
        existing = self.db.query(Cooldown).filter(Cooldown.user_id == user_id).first()
        
        if existing:
            existing.end_time = end_time
            existing.duration_minutes = duration_minutes
            self.db.commit()
            cooldown = existing
        else:
            cooldown = Cooldown(
                user_id=user_id,
                start_time=datetime.now(timezone.utc),
                end_time=end_time,
                duration_minutes=duration_minutes
            )
            self.db.add(cooldown)
            self.db.commit()
        
        return {
            'success': True,
            'cooldown_until': end_time.isoformat()
        }

    async def is_on_cooldown(self, user_id: str) -> bool:
        """Check if user is currently on cooldown"""
        cooldown = self.db.query(Cooldown).filter(
            Cooldown.user_id == user_id,
            Cooldown.end_time > datetime.now(timezone.utc)
        ).first()
        
        return cooldown is not None

    async def get_cooldown_end_time(self, user_id: str) -> Optional[datetime]:
        """Get the end time of user's cooldown"""
        cooldown = self.db.query(Cooldown).filter(
            Cooldown.user_id == user_id,
            Cooldown.end_time > datetime.now(timezone.utc)
        ).first()
        
        return cooldown.end_time if cooldown else None

    async def remove_cooldown(self, user_id: str) -> Dict:
        """Remove cooldown for a user"""
        result = self.db.query(Cooldown).filter(Cooldown.user_id == user_id).delete()
        self.db.commit()
        
        return {
            'success': result > 0,
            'removed': result
        }