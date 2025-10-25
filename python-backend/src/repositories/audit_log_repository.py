from sqlalchemy.orm import Session
from models.audit_log import AuditLog
from typing import List, Optional, Dict
from datetime import datetime

class AuditLogRepository:
    """Repository for audit log data access"""
    
    def __init__(self, db: Session):
        self.db = db

    def create_log(self, log: AuditLog) -> AuditLog:
        """Create a new audit log entry"""
        self.db.add(log)
        self.db.commit()
        self.db.refresh(log)
        return log

    def get_log(self, log_id: str) -> Optional[AuditLog]:
        """Get audit log by ID"""
        return self.db.query(AuditLog).filter(AuditLog.log_id == log_id).first()

    def get_logs_by_user(
        self, 
        user_id: str,
        start_date: datetime = None,
        end_date: datetime = None,
        action_types: List[str] = None
    ) -> List[AuditLog]:
        """Get all logs for a user"""
        query = self.db.query(AuditLog).filter(AuditLog.user_id == user_id)
        
        if start_date:
            query = query.filter(AuditLog.timestamp >= start_date)
        if end_date:
            query = query.filter(AuditLog.timestamp <= end_date)
        if action_types:
            query = query.filter(AuditLog.action_type.in_(action_types))
        
        return query.order_by(AuditLog.timestamp.desc()).all()

    def get_logs_by_operator(
        self, 
        operator_id: str,
        start_date: datetime = None,
        end_date: datetime = None
    ) -> List[AuditLog]:
        """Get all logs for an operator"""
        query = self.db.query(AuditLog).filter(AuditLog.operator_id == operator_id)
        
        if start_date:
            query = query.filter(AuditLog.timestamp >= start_date)
        if end_date:
            query = query.filter(AuditLog.timestamp <= end_date)
        
        return query.order_by(AuditLog.timestamp.desc()).all()

    def get_logs_by_action_type(
        self, 
        action_type: str,
        start_date: datetime = None,
        end_date: datetime = None
    ) -> List[AuditLog]:
        """Get all logs of a specific action type"""
        query = self.db.query(AuditLog).filter(AuditLog.action_type == action_type)
        
        if start_date:
            query = query.filter(AuditLog.timestamp >= start_date)
        if end_date:
            query = query.filter(AuditLog.timestamp <= end_date)
        
        return query.order_by(AuditLog.timestamp.desc()).all()

    def get_logs_with_blockchain_tx(
        self,
        user_id: str = None,
        operator_id: str = None
    ) -> List[AuditLog]:
        """Get logs that have blockchain transaction hashes"""
        query = self.db.query(AuditLog).filter(AuditLog.concordium_tx_hash.isnot(None))
        
        if user_id:
            query = query.filter(AuditLog.user_id == user_id)
        if operator_id:
            query = query.filter(AuditLog.operator_id == operator_id)
        
        return query.order_by(AuditLog.timestamp.desc()).all()

    def search_logs(self, filters: Dict, limit: int = 100) -> List[AuditLog]:
        """Search logs with dynamic filters"""
        query = self.db.query(AuditLog)
        
        if 'user_id' in filters:
            query = query.filter(AuditLog.user_id == filters['user_id'])
        if 'operator_id' in filters:
            query = query.filter(AuditLog.operator_id == filters['operator_id'])
        if 'action_type' in filters:
            query = query.filter(AuditLog.action_type == filters['action_type'])
        if 'result' in filters:
            query = query.filter(AuditLog.result == filters['result'])
        if 'start_date' in filters:
            query = query.filter(AuditLog.timestamp >= filters['start_date'])
        if 'end_date' in filters:
            query = query.filter(AuditLog.timestamp <= filters['end_date'])
        if 'ip_address' in filters:
            query = query.filter(AuditLog.ip_address == filters['ip_address'])
        
        return query.order_by(AuditLog.timestamp.desc()).limit(limit).all()

    def delete_old_logs(self, before_date: datetime) -> int:
        """Delete logs older than specified date"""
        count = self.db.query(AuditLog).filter(
            AuditLog.timestamp < before_date
        ).delete()
        self.db.commit()
        return count
