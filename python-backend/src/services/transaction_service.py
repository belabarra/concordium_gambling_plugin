from datetime import datetime, timezone
from typing import List, Optional, Dict
import uuid
from sqlalchemy.orm import Session
from src.models.transaction import Transaction
from src.repositories.transaction_repository import TransactionRepository
from src.services.blockchain_integration_service import BlockchainIntegrationService
from src.services.limit_enforcement_service import LimitEnforcementService
from src.services.audit_service import AuditService

class TransactionService:
    def __init__(self, db: Session):
        self.db = db
        self.transaction_repository = TransactionRepository(db)
        self.blockchain_service = BlockchainIntegrationService()

    async def record_transaction(self, transaction_data: dict) -> Dict:
        """Record a new transaction"""
        user_id = transaction_data.get('user_id')
        amount = transaction_data.get('amount')
        
        # Check spending limits
        limit_service = LimitEnforcementService(self.db)
        limit_check = await limit_service.check_limit(user_id, amount)
        
        if not limit_check.get('allowed', False):
            return {
                'success': False,
                'error': 'Spending limit exceeded',
                'details': limit_check
            }
        
        # Create transaction
        transaction = Transaction(
            transaction_id=self.generate_transaction_id(),
            user_id=user_id,
            amount=amount,
            timestamp=datetime.now(timezone.utc),
            **{k: v for k, v in transaction_data.items() if k not in ['user_id', 'amount']}
        )
        
        # Save to database
        saved_transaction = self.transaction_repository.save(transaction)
        
        # Log to blockchain
        blockchain_result = await self.blockchain_service.log_transaction_on_chain({
            'transaction_id': transaction.transaction_id,
            'user_id': user_id,
            'amount': amount,
            'timestamp': transaction.timestamp.isoformat()
        })
        
        # Log audit trail
        audit_service = AuditService(self.db)
        await audit_service.log_action(
            action_type='transaction_recorded',
            user_id=user_id,
            details=transaction_data,
            result='success',
            concordium_tx_hash=blockchain_result.get('transaction_hash')
        )
        
        return {
            'success': True,
            'transaction': saved_transaction.to_dict() if hasattr(saved_transaction, 'to_dict') else saved_transaction,
            'blockchain': blockchain_result
        }

    async def get_transaction(self, transaction_id: str) -> Dict:
        """Get transaction by ID"""
        transaction = self.transaction_repository.get_transaction(transaction_id)
        if not transaction:
            return {'success': False, 'error': 'Transaction not found'}
        return {
            'success': True,
            'transaction': transaction.to_dict() if hasattr(transaction, 'to_dict') else transaction
        }

    async def get_user_transactions(self, user_id: str, limit: int = 50) -> Dict:
        """Get user's transaction history"""
        transactions = self.transaction_repository.find_by_user_id(user_id, limit)
        return {
            'success': True,
            'transactions': [t.to_dict() if hasattr(t, 'to_dict') else t for t in transactions],
            'count': len(transactions)
        }

    def generate_transaction_id(self) -> str:
        """Generate unique transaction ID"""
        return str(uuid.uuid4())

    async def check_spending_limit(self, user_id: str, amount: float) -> Dict:
        """Check if transaction would exceed spending limit"""
        limit_service = LimitEnforcementService(self.db)
        return await limit_service.check_limit(user_id, amount)