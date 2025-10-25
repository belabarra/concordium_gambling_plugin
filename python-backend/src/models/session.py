from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime, timezone
from typing import Optional

Base = declarative_base()

class Session(Base):
    """Gambling session model for tracking user gaming sessions"""
    __tablename__ = 'sessions'

    session_id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey('users.id'), nullable=False, index=True)
    platform_id = Column(String, nullable=False, index=True)
    start_time = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    end_time = Column(DateTime, nullable=True)
    total_wagered = Column(Float, default=0.0)
    total_won = Column(Float, default=0.0)
    total_lost = Column(Float, default=0.0)
    reality_checks_shown = Column(Integer, default=0)
    currency = Column(String, default='CCD')
    status = Column(String, default='active')  # active, paused, ended

    def __repr__(self):
        return f"<Session(session_id='{self.session_id}', user_id='{self.user_id}', platform_id='{self.platform_id}', status='{self.status}')>"

    def to_dict(self):
        return {
            'session_id': self.session_id,
            'user_id': self.user_id,
            'platform_id': self.platform_id,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'total_wagered': self.total_wagered,
            'total_won': self.total_won,
            'total_lost': self.total_lost,
            'reality_checks_shown': self.reality_checks_shown,
            'currency': self.currency,
            'status': self.status
        }

    def duration_minutes(self) -> Optional[float]:
        """Calculate session duration in minutes"""
        if self.end_time:
            delta = self.end_time - self.start_time
        else:
            delta = datetime.now(timezone.utc) - self.start_time
        return delta.total_seconds() / 60

    def net_result(self) -> float:
        """Calculate net win/loss"""
        return self.total_won - self.total_wagered
