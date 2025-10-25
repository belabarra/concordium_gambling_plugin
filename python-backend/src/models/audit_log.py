from sqlalchemy import Column, String, DateTime, JSON, Text
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class AuditLog(Base):
    """Audit log model for compliance and tracking"""
    __tablename__ = 'audit_logs'

    log_id = Column(String, primary_key=True, index=True)
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    action_type = Column(String, nullable=False, index=True)  # login, transaction, limit_set, exclusion, etc.
    user_id = Column(String, nullable=True, index=True)
    operator_id = Column(String, nullable=True, index=True)
    platform_id = Column(String, nullable=True)
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    details = Column(JSON, nullable=False)  # Detailed action data
    result = Column(String, nullable=True)  # success, failure, blocked
    reason = Column(Text, nullable=True)  # Reason for action/block
    concordium_tx_hash = Column(String, nullable=True)  # Blockchain transaction hash

    def __repr__(self):
        return f"<AuditLog(log_id='{self.log_id}', action_type='{self.action_type}', user_id='{self.user_id}', timestamp='{self.timestamp}')>"

    def to_dict(self):
        return {
            'log_id': self.log_id,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'action_type': self.action_type,
            'user_id': self.user_id,
            'operator_id': self.operator_id,
            'platform_id': self.platform_id,
            'ip_address': self.ip_address,
            'user_agent': self.user_agent,
            'details': self.details,
            'result': self.result,
            'reason': self.reason,
            'concordium_tx_hash': self.concordium_tx_hash
        }
