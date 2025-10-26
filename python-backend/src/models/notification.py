from sqlalchemy import Column, String, DateTime, JSON, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from enum import Enum

Base = declarative_base()

class NotificationStatus(str, Enum):
    """Notification delivery status"""
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    FAILED = "failed"
    READ = "read"

class NotificationType(str, Enum):
    """Types of notifications"""
    LIMIT_WARNING = "limit_warning"
    LIMIT_REACHED = "limit_reached"
    COOLDOWN_STARTED = "cooldown_started"
    COOLDOWN_ENDING = "cooldown_ending"
    SESSION_TIME_WARNING = "session_time_warning"
    BREAK_REMINDER = "break_reminder"
    RISK_ALERT = "risk_alert"
    WELLNESS_TIP = "wellness_tip"
    REALITY_CHECK = "reality_check"
    SELF_EXCLUSION_REMINDER = "self_exclusion_reminder"

class Notification(Base):
    """Notification model for user alerts and messages"""
    __tablename__ = 'notifications'

    notification_id = Column(String, primary_key=True, index=True)
    user_id = Column(String, nullable=False, index=True)
    notification_type = Column(SQLEnum(NotificationType), nullable=False)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    sent_at = Column(DateTime, nullable=True)
    read_at = Column(DateTime, nullable=True)
    status = Column(SQLEnum(NotificationStatus), nullable=False, default=NotificationStatus.PENDING)
    extra_data = Column(JSON, nullable=True)
    priority = Column(String, default='normal')  # low, normal, high, critical

    def __repr__(self):
        return f"<Notification(notification_id='{self.notification_id}', user_id='{self.user_id}', type='{self.notification_type}', status='{self.status}')>"

    def to_dict(self):
        return {
            'notification_id': self.notification_id,
            'user_id': self.user_id,
            'notification_type': self.notification_type.value if isinstance(self.notification_type, Enum) else self.notification_type,
            'title': self.title,
            'message': self.message,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'sent_at': self.sent_at.isoformat() if self.sent_at else None,
            'read_at': self.read_at.isoformat() if self.read_at else None,
            'status': self.status.value if isinstance(self.status, Enum) else self.status,
            'extra_data': self.extra_data,
            'priority': self.priority
        }

    def mark_as_sent(self):
        """Mark notification as sent"""
        self.status = NotificationStatus.SENT
        self.sent_at = datetime.utcnow()

    def mark_as_read(self):
        """Mark notification as read"""
        self.status = NotificationStatus.READ
        self.read_at = datetime.utcnow()
