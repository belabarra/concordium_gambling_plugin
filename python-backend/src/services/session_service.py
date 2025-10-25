from datetime import datetime, timedelta, timezone
from typing import Optional, Dict
import uuid
from sqlalchemy.orm import Session
from models.session import Session as GamingSession
from repositories.session_repository import SessionRepository
from services.notification_service import NotificationService
from models.notification import NotificationType

class SessionService:
    """Manages gambling sessions with time tracking and mandatory breaks"""
    
    def __init__(self, db: Session):
        self.db = db
        self.session_repository = SessionRepository(db)
        self.notification_service = NotificationService(db)
        self.max_session_duration = 120  # minutes
        self.reality_check_interval = 30  # minutes
        self.mandatory_break_duration = 15  # minutes

    async def start_session(self, user_id: str, platform_id: str, currency: str = 'CCD') -> Dict:
        """Start a new gambling session"""
        # Check if user has active session
        active_session = self.session_repository.get_active_session(user_id)
        if active_session:
            return {
                'success': False,
                'message': 'User already has an active session',
                'session_id': active_session.session_id
            }
        
        # Check if user is in mandatory break period
        last_session = self.session_repository.get_last_session(user_id)
        if last_session and last_session.end_time:
            time_since_last = datetime.now(timezone.utc) - last_session.end_time
            if time_since_last.total_seconds() / 60 < self.mandatory_break_duration:
                remaining = self.mandatory_break_duration - (time_since_last.total_seconds() / 60)
                return {
                    'success': False,
                    'message': f'Mandatory break period. Please wait {remaining:.0f} more minutes',
                    'remaining_minutes': remaining
                }
                
        # Create new session
        session_id = str(uuid.uuid4())
        new_session = GamingSession(
            session_id=session_id,
            user_id=user_id,
            platform_id=platform_id,
            start_time=datetime.now(timezone.utc),
            status='active'
        )
        
        created_session = self.session_repository.create_session(new_session)
        created_session = self.session_repository.create_session(new_session)
        
        return {
            'success': True,
            'session': created_session.to_dict(),
            'message': 'Session started successfully'
        }

    async def end_session(self, session_id: str) -> Dict:
        """End a gambling session"""
        session = self.session_repository.get_session(session_id)
        if not session:
            return {'success': False, 'message': 'Session not found'}
        
        if session.status == 'ended':
            return {'success': False, 'message': 'Session already ended'}
        
        session.end_time = datetime.now(timezone.utc)
        session.status = 'ended'
        
        updated_session = self.session_repository.update_session(session)
        
        return {
            'success': True,
            'session': updated_session.to_dict(),
            'message': 'Session ended successfully'
        }

    async def check_session_duration(self, session_id: str) -> Dict:
        """Check if user has exceeded session time limits"""
        session = self.session_repository.get_session(session_id)
        if not session:
            return {'success': False, 'message': 'Session not found'}
        
        duration = session.duration_minutes()
        
        # Check if session exceeds maximum duration
        if duration >= self.max_session_duration:
            # Force end session
            await self.end_session(session_id)
            await self.notification_service.send_user_notification(
                session.user_id,
                NotificationType.SESSION_TIME_WARNING,
                {
                    'message': f'Your session has been ended after {self.max_session_duration} minutes for your wellbeing',
                    'duration': duration
                }
            )
            return {
                'success': False,
                'exceeded': True,
                'message': 'Maximum session duration exceeded',
                'duration_minutes': duration
            }
        
        # Check if reality check is needed
        if duration % self.reality_check_interval < 1:  # Every interval
            await self.notification_service.send_user_notification(
                session.user_id,
                NotificationType.REALITY_CHECK,
                {
                    'message': f'Reality check: You have been playing for {duration:.0f} minutes',
                    'session_id': session_id,
                    'duration': duration,
                    'total_wagered': session.total_wagered,
                    'net_result': session.net_result()
                }
            )
        
        return {
            'success': True,
            'exceeded': False,
            'duration_minutes': duration,
            'remaining_minutes': self.max_session_duration - duration
        }

    async def enforce_break(self, user_id: str, duration_minutes: int = None) -> Dict:
        """Enforce mandatory break between sessions"""
        if duration_minutes is None:
            duration_minutes = self.mandatory_break_duration
        
        # End any active session
        active_session = self.session_repository.get_active_session(user_id)
        if active_session:
            await self.end_session(active_session.session_id)
        
        # Send notification
        await self.notification_service.send_user_notification(
            user_id,
            NotificationType.BREAK_REMINDER,
            {
                'message': f'Taking a {duration_minutes} minute break for responsible gaming',
                'duration': duration_minutes
            }
        )
        
        return {
            'success': True,
            'message': f'Break enforced for {duration_minutes} minutes',
            'duration_minutes': duration_minutes
        }

    async def update_session_stats(self, session_id: str, wagered: float = 0, won: float = 0) -> Dict:
        """Update session statistics"""
        session = self.session_repository.get_session(session_id)
        if not session:
            return {'success': False, 'message': 'Session not found'}
        
        session.total_wagered += wagered
        session.total_won += won
        session.total_lost = session.total_wagered - session.total_won
        
        updated_session = self.session_repository.update_session(session)
        
        return {
            'success': True,
            'session': updated_session.to_dict()
        }

    async def get_session_summary(self, session_id: str) -> Dict:
        """Get current session stats summary"""
        session = self.session_repository.get_session(session_id)
        if not session:
            return {'success': False, 'message': 'Session not found'}
        
        return {
            'success': True,
            'summary': {
                'session_id': session.session_id,
                'duration_minutes': session.duration_minutes(),
                'total_wagered': session.total_wagered,
                'total_won': session.total_won,
                'net_result': session.net_result(),
                'reality_checks_shown': session.reality_checks_shown,
                'status': session.status
            }
        }

    async def get_user_sessions(self, user_id: str, limit: int = 10) -> Dict:
        """Get user's recent sessions"""
        sessions = self.session_repository.get_user_sessions(user_id, limit)
        
        return {
            'success': True,
            'sessions': [s.to_dict() for s in sessions],
            'count': len(sessions)
        }
