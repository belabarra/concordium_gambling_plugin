from sqlalchemy.orm import Session
from src.models.session import Session as GamingSession
from typing import List, Optional
from datetime import datetime

class SessionRepository:
    """Repository for session data access"""
    
    def __init__(self, db: Session):
        self.db = db

    def create_session(self, session: GamingSession) -> GamingSession:
        """Create a new session"""
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        return session

    def get_session(self, session_id: str) -> Optional[GamingSession]:
        """Get session by ID"""
        return self.db.query(GamingSession).filter(GamingSession.session_id == session_id).first()

    def get_active_session(self, user_id: str) -> Optional[GamingSession]:
        """Get user's active session"""
        return self.db.query(GamingSession).filter(
            GamingSession.user_id == user_id,
            GamingSession.status == 'active'
        ).first()

    def get_last_session(self, user_id: str) -> Optional[GamingSession]:
        """Get user's most recent session"""
        return self.db.query(GamingSession).filter(
            GamingSession.user_id == user_id
        ).order_by(GamingSession.start_time.desc()).first()

    def get_user_sessions(self, user_id: str, limit: int = 10) -> List[GamingSession]:
        """Get user's recent sessions"""
        return self.db.query(GamingSession).filter(
            GamingSession.user_id == user_id
        ).order_by(GamingSession.start_time.desc()).limit(limit).all()

    def get_platform_sessions(
        self, 
        platform_id: str, 
        start_date: datetime = None,
        end_date: datetime = None
    ) -> List[GamingSession]:
        """Get all sessions for a platform"""
        query = self.db.query(GamingSession).filter(GamingSession.platform_id == platform_id)
        
        if start_date:
            query = query.filter(GamingSession.start_time >= start_date)
        if end_date:
            query = query.filter(GamingSession.start_time <= end_date)
        
        return query.all()

    def update_session(self, session: GamingSession) -> GamingSession:
        """Update session"""
        self.db.commit()
        self.db.refresh(session)
        return session

    def delete_session(self, session_id: str) -> bool:
        """Delete session"""
        session = self.get_session(session_id)
        if session:
            self.db.delete(session)
            self.db.commit()
            return True
        return False
