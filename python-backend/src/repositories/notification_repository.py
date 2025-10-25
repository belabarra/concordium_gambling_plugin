from sqlalchemy.orm import Session
from models.notification import Notification, NotificationStatus
from typing import List, Optional
from datetime import datetime

class NotificationRepository:
    """Repository for notification data access"""
    
    def __init__(self, db: Session):
        self.db = db

    def create_notification(self, notification: Notification) -> Notification:
        """Create a new notification"""
        self.db.add(notification)
        self.db.commit()
        self.db.refresh(notification)
        return notification

    def get_notification(self, notification_id: str) -> Optional[Notification]:
        """Get notification by ID"""
        return self.db.query(Notification).filter(
            Notification.notification_id == notification_id
        ).first()

    def get_user_notifications(
        self, 
        user_id: str, 
        unread_only: bool = False,
        limit: int = 50
    ) -> List[Notification]:
        """Get user's notifications"""
        query = self.db.query(Notification).filter(Notification.user_id == user_id)
        
        if unread_only:
            query = query.filter(
                Notification.status.in_([NotificationStatus.PENDING, NotificationStatus.SENT, NotificationStatus.DELIVERED])
            )
        
        return query.order_by(Notification.created_at.desc()).limit(limit).all()

    def get_unread_count(self, user_id: str) -> int:
        """Get count of unread notifications"""
        return self.db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.status.in_([NotificationStatus.PENDING, NotificationStatus.SENT, NotificationStatus.DELIVERED])
        ).count()

    def update_notification(self, notification: Notification) -> Notification:
        """Update notification"""
        self.db.commit()
        self.db.refresh(notification)
        return notification

    def delete_notification(self, notification_id: str) -> bool:
        """Delete notification"""
        notification = self.get_notification(notification_id)
        if notification:
            self.db.delete(notification)
            self.db.commit()
            return True
        return False

    def mark_all_as_read(self, user_id: str) -> int:
        """Mark all user notifications as read"""
        count = self.db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.status != NotificationStatus.READ
        ).update({
            'status': NotificationStatus.READ,
            'read_at': datetime.utcnow()
        })
        self.db.commit()
        return count
