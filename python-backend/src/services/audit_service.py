from datetime import datetime, timezone
from typing import Dict, List
from sqlalchemy.orm import Session
from repositories.audit_log_repository import AuditLogRepository
from models.audit_log import AuditLog
import uuid

class AuditService:
    """Maintains audit trails for regulatory compliance"""
    
    def __init__(self, db: Session):
        self.db = db
        self.audit_repository = AuditLogRepository(db)

    async def log_action(
        self,
        action_type: str,
        user_id: str = None,
        operator_id: str = None,
        details: dict = None,
        platform_id: str = None,
        ip_address: str = None,
        user_agent: str = None,
        result: str = 'success',
        reason: str = None,
        concordium_tx_hash: str = None
    ) -> Dict:
        """Log all actions for audit trail"""
        log_id = str(uuid.uuid4())
        
        audit_log = AuditLog(
            log_id=log_id,
            timestamp=datetime.now(timezone.utc),
            action_type=action_type,
            user_id=user_id,
            operator_id=operator_id,
            platform_id=platform_id,
            ip_address=ip_address,
            user_agent=user_agent,
            details=details or {},
            result=result,
            reason=reason,
            concordium_tx_hash=concordium_tx_hash
        )
        
        created = self.audit_repository.create_log(audit_log)
        
        return {
            'success': True,
            'log_id': created.log_id
        }

    async def generate_regulatory_report(
        self, 
        operator_id: str, 
        period: str,
        start_date: datetime = None,
        end_date: datetime = None
    ) -> Dict:
        """Generate reports for regulatory authorities"""
        if not start_date or not end_date:
            # Default to last month
            end_date = datetime.now(timezone.utc)
            if period == 'month':
                start_date = end_date.replace(day=1)
            elif period == 'quarter':
                start_date = end_date.replace(month=((end_date.month - 1) // 3) * 3 + 1, day=1)
            elif period == 'year':
                start_date = end_date.replace(month=1, day=1)
        
        logs = self.audit_repository.get_logs_by_operator(
            operator_id,
            start_date,
            end_date
        )
        
        # Aggregate statistics
        total_actions = len(logs)
        action_breakdown = {}
        failed_actions = []
        
        for log in logs:
            action_breakdown[log.action_type] = action_breakdown.get(log.action_type, 0) + 1
            if log.result == 'failure' or log.result == 'blocked':
                failed_actions.append(log.to_dict())
        
        report = {
            'period': period,
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat(),
            'operator_id': operator_id,
            'total_actions': total_actions,
            'action_breakdown': action_breakdown,
            'failed_actions_count': len(failed_actions),
            'failed_actions': failed_actions[:100],
            'generated_at': datetime.now(timezone.utc).isoformat()
        }
        
        return {
            'success': True,
            'report': report
        }

    async def get_user_action_history(
        self, 
        user_id: str, 
        date_range: tuple = None,
        action_types: List[str] = None
    ) -> Dict:
        """Get complete action history for a user"""
        start_date, end_date = date_range if date_range else (None, None)
        
        logs = self.audit_repository.get_logs_by_user(
            user_id,
            start_date,
            end_date,
            action_types
        )
        
        return {
            'success': True,
            'user_id': user_id,
            'history': [log.to_dict() for log in logs],
            'count': len(logs)
        }

    async def verify_gdpr_compliance(self, user_id: str) -> Dict:
        """Verify GDPR compliance for user data"""
        # Get all logs for user
        logs = self.audit_repository.get_logs_by_user(user_id)
        
        # Check for data access logs
        access_logs = [l for l in logs if l.action_type in ['data_access', 'data_export']]
        
        # Check for consent logs
        consent_logs = [l for l in logs if l.action_type in ['consent_given', 'consent_withdrawn']]
        
        # Check for deletion requests
        deletion_logs = [l for l in logs if l.action_type == 'data_deletion_request']
        
        compliance_status = {
            'user_id': user_id,
            'has_consent_record': len(consent_logs) > 0,
            'latest_consent': consent_logs[-1].to_dict() if consent_logs else None,
            'access_requests': len(access_logs),
            'deletion_requests': len(deletion_logs),
            'compliant': len(consent_logs) > 0,
            'checked_at': datetime.now(timezone.utc).isoformat()
        }
        
        return {
            'success': True,
            'compliance': compliance_status
        }

    async def search_logs(
        self,
        filters: Dict,
        limit: int = 100
    ) -> Dict:
        """Search audit logs with filters"""
        logs = self.audit_repository.search_logs(filters, limit)
        
        return {
            'success': True,
            'logs': [log.to_dict() for log in logs],
            'count': len(logs)
        }

    async def get_blockchain_transactions(
        self,
        user_id: str = None,
        operator_id: str = None
    ) -> Dict:
        """Get all actions linked to blockchain transactions"""
        logs = self.audit_repository.get_logs_with_blockchain_tx(user_id, operator_id)
        
        return {
            'success': True,
            'transactions': [log.to_dict() for log in logs],
            'count': len(logs)
        }
