from datetime import datetime
from typing import List, Optional, Dict
from sqlalchemy.orm import Session
from src.models.user import User
from src.repositories.user_repository import UserRepository
from src.services.blockchain_integration_service import BlockchainIntegrationService
from src.services.audit_service import AuditService

class UserService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repository = UserRepository(db)
        self.blockchain_service = BlockchainIntegrationService()

    async def register_user(self, user_data: dict) -> Dict:
        """Register a new user with Concordium identity verification"""
        # Verify identity with Concordium if concordium_id provided
        if 'concordium_id' in user_data:
            verification = await self.blockchain_service.verify_user_identity(
                user_data['concordium_id']
            )
            if not verification.get('verified'):
                return {
                    'success': False,
                    'error': 'Identity verification failed'
                }
        
        # Create user
        user = User(**user_data)
        created_user = self.user_repository.create_user(user)
        
        # Log action
        audit_service = AuditService(self.db)
        await audit_service.log_action(
            action_type='user_registration',
            user_id=str(created_user.id),
            details=user_data,
            result='success'
        )
        
        return {
            'success': True,
            'user': created_user.to_dict() if hasattr(created_user, 'to_dict') else created_user
        }

    async def get_user(self, user_id: str) -> Dict:
        """Get user by ID"""
        user = self.user_repository.get_user(user_id)
        if not user:
            return {'success': False, 'error': 'User not found'}
        return {
            'success': True,
            'user': user.to_dict() if hasattr(user, 'to_dict') else user
        }

    async def update_user(self, user_id: str, user_data: dict) -> Dict:
        """Update user information"""
        user = self.user_repository.get_user(user_id)
        if not user:
            return {'success': False, 'error': 'User not found'}
        
        for key, value in user_data.items():
            if hasattr(user, key):
                setattr(user, key, value)
        
        updated_user = self.user_repository.update_user(user)
        
        # Log action
        audit_service = AuditService(self.db)
        await audit_service.log_action(
            action_type='user_update',
            user_id=user_id,
            details=user_data,
            result='success'
        )
        
        return {
            'success': True,
            'user': updated_user.to_dict() if hasattr(updated_user, 'to_dict') else updated_user
        }

    async def get_all_users(self) -> Dict:
        """Get all users"""
        users = self.user_repository.get_all_users()
        return {
            'success': True,
            'users': [u.to_dict() if hasattr(u, 'to_dict') else u for u in users],
            'count': len(users)
        }

    async def delete_user(self, user_id: str) -> Dict:
        """Delete user"""
        success = self.user_repository.delete_user(user_id)
        
        if success:
            # Log action
            audit_service = AuditService(self.db)
            await audit_service.log_action(
                action_type='user_deletion',
                user_id=user_id,
                details={},
                result='success'
            )
        
        return {'success': success}