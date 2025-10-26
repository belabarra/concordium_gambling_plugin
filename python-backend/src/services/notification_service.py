from datetime import datetime, timedelta
from typing import Dict, List
import uuid
from sqlalchemy.orm import Session
from src.models.notification import Notification, NotificationType, NotificationStatus
from src.repositories.notification_repository import NotificationRepository

class NotificationService:
    """Sends notifications to users and operators"""
    
    def __init__(self, db: Session):
        self.db = db
        self.notification_repository = NotificationRepository(db)

    async def send_user_notification(
        self, 
        user_id: str, 
        notification_type: NotificationType, 
        data: dict,
        priority: str = 'normal'
    ) -> Dict:
        """Send notification to user"""
        notification_id = str(uuid.uuid4())
        
        # Generate title and message based on type
        title, message = self._generate_notification_content(notification_type, data)
        
        notification = Notification(
            notification_id=notification_id,
            user_id=user_id,
            notification_type=notification_type,
            title=title,
            message=message,
            created_at=datetime.utcnow(),
            status=NotificationStatus.PENDING,
            metadata=data,
            priority=priority
        )
        
        created = self.notification_repository.create_notification(notification)
        
        # TODO: Implement actual notification delivery (email, push, SMS)
        # For now, mark as sent
        created.mark_as_sent()
        self.notification_repository.update_notification(created)
        
        return {
            'success': True,
            'notification': created.to_dict()
        }

    async def send_operator_alert(
        self, 
        operator_id: str, 
        user_id: str, 
        alert_type: str,
        data: dict
    ) -> Dict:
        """Alert operator about high-risk user behavior"""
        # This would send alerts to the operator's dashboard/email
        # For now, we'll create a notification record
        
        notification_id = str(uuid.uuid4())
        
        notification = Notification(
            notification_id=notification_id,
            user_id=f"operator_{operator_id}",
            notification_type=NotificationType.RISK_ALERT,
            title=f"Risk Alert: {alert_type}",
            message=f"User {user_id} requires attention: {alert_type}",
            created_at=datetime.utcnow(),
            status=NotificationStatus.PENDING,
            metadata={'operator_id': operator_id, 'user_id': user_id, 'alert_type': alert_type, **data},
            priority='high'
        )
        
        created = self.notification_repository.create_notification(notification)
        created.mark_as_sent()
        self.notification_repository.update_notification(created)
        
        return {
            'success': True,
            'notification': created.to_dict()
        }

    async def schedule_reminder(
        self, 
        user_id: str, 
        reminder_type: str, 
        when: datetime,
        data: dict = None
    ) -> Dict:
        """Schedule future reminders"""
        notification_id = str(uuid.uuid4())
        
        notification = Notification(
            notification_id=notification_id,
            user_id=user_id,
            notification_type=NotificationType.WELLNESS_TIP,
            title=f"Reminder: {reminder_type}",
            message=data.get('message', 'You have a scheduled reminder'),
            created_at=datetime.utcnow(),
            status=NotificationStatus.PENDING,
            metadata={'scheduled_for': when.isoformat(), 'reminder_type': reminder_type, **(data or {})},
            priority='normal'
        )
        
        created = self.notification_repository.create_notification(notification)
        
        return {
            'success': True,
            'notification': created.to_dict(),
            'scheduled_for': when.isoformat()
        }

    async def get_user_notifications(
        self, 
        user_id: str, 
        unread_only: bool = False,
        limit: int = 50
    ) -> Dict:
        """Get user's notifications"""
        notifications = self.notification_repository.get_user_notifications(
            user_id, 
            unread_only, 
            limit
        )
        
        return {
            'success': True,
            'notifications': [n.to_dict() for n in notifications],
            'count': len(notifications)
        }

    async def mark_notification_read(self, notification_id: str) -> Dict:
        """Mark notification as read"""
        notification = self.notification_repository.get_notification(notification_id)
        if not notification:
            return {'success': False, 'message': 'Notification not found'}
        
        notification.mark_as_read()
        updated = self.notification_repository.update_notification(notification)
        
        return {
            'success': True,
            'notification': updated.to_dict()
        }

    async def get_unread_count(self, user_id: str) -> Dict:
        """Get count of unread notifications"""
        count = self.notification_repository.get_unread_count(user_id)
        
        return {
            'success': True,
            'unread_count': count
        }

    def _generate_notification_content(self, notification_type: NotificationType, data: dict) -> tuple:
        """Generate notification title and message"""
        templates = {
            NotificationType.LIMIT_WARNING: (
                "Spending Limit Warning",
                f"You've reached {data.get('percentage', 80)}% of your spending limit"
            ),
            NotificationType.LIMIT_REACHED: (
                "Spending Limit Reached",
                "You have reached your spending limit for this period"
            ),
            NotificationType.COOLDOWN_STARTED: (
                "Cooldown Period Started",
                f"A {data.get('duration', 24)}-hour cooldown period has begun"
            ),
            NotificationType.COOLDOWN_ENDING: (
                "Cooldown Period Ending Soon",
                f"Your cooldown period will end in {data.get('remaining', 1)} hour(s)"
            ),
            NotificationType.SESSION_TIME_WARNING: (
                "Session Time Warning",
                data.get('message', 'You have been playing for an extended period')
            ),
            NotificationType.BREAK_REMINDER: (
                "Take a Break",
                data.get('message', 'Taking regular breaks promotes responsible gaming')
            ),
            NotificationType.RISK_ALERT: (
                "Wellness Check",
                "We've noticed some concerning patterns in your gaming behavior"
            ),
            NotificationType.WELLNESS_TIP: (
                "Wellness Tip",
                data.get('message', 'Remember to play responsibly')
            ),
            NotificationType.REALITY_CHECK: (
                "Reality Check",
                data.get('message', 'Here are your current session statistics')
            ),
            NotificationType.SELF_EXCLUSION_REMINDER: (
                "Self-Exclusion Reminder",
                data.get('message', 'Your self-exclusion period is active')
            )
        }
        
        return templates.get(notification_type, ("Notification", data.get('message', 'You have a new notification')))
