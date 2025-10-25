from sqlalchemy.orm import Session
from typing import Dict
import uuid
from datetime import datetime, timezone

from models.wallet import Wallet
from services.blockchain_integration_service import BlockchainIntegrationService

class WalletService:
    """Service for wallet operations"""
    
    def __init__(self, db: Session):
        self.db = db
        self.blockchain_service = BlockchainIntegrationService()
    
    async def connect_wallet(self, user_id: str, concordium_address: str) -> Dict:
        """Connect a Concordium wallet to user account"""
        
        # Check if wallet exists
        existing = self.db.query(Wallet).filter(Wallet.user_id == user_id).first()
        if existing:
            return {
                'success': False,
                'error': 'Wallet already connected',
                'wallet': existing.to_dict()
            }
        
        # Verify address with blockchain
        verification = await self.blockchain_service.verify_user_identity(concordium_address)
        if not verification.get('verified'):
            return {
                'success': False,
                'error': 'Failed to verify Concordium address'
            }
        
        # Create wallet
        wallet = Wallet(
            wallet_id=str(uuid.uuid4()),
            user_id=user_id,
            concordium_address=concordium_address
        )
        
        self.db.add(wallet)
        self.db.commit()
        self.db.refresh(wallet)
        
        # Get initial balance
        await self.sync_balance(user_id)
        
        return {
            'success': True,
            'wallet': wallet.to_dict()
        }
    
    async def get_wallet(self, user_id: str) -> Dict:
        """Get user's wallet"""
        wallet = self.db.query(Wallet).filter(Wallet.user_id == user_id).first()
        if not wallet:
            return {'success': False, 'error': 'Wallet not found'}
        
        return {
            'success': True,
            'wallet': wallet.to_dict()
        }
    
    async def get_balance(self, user_id: str) -> Dict:
        """Get wallet balance"""
        wallet = self.db.query(Wallet).filter(Wallet.user_id == user_id).first()
        if not wallet:
            return {'success': False, 'error': 'Wallet not found'}
        
        return {
            'success': True,
            'balance': wallet.balance,
            'address': wallet.concordium_address
        }
    
    async def sync_balance(self, user_id: str) -> Dict:
        """Sync balance with blockchain"""
        wallet = self.db.query(Wallet).filter(Wallet.user_id == user_id).first()
        if not wallet:
            return {'success': False, 'error': 'Wallet not found'}
        
        try:
            # Get balance from blockchain via Node.js service
            balance_result = await self.blockchain_service.get_wallet_balance(wallet.concordium_address)
            
            if balance_result.get('success'):
                wallet.balance = balance_result.get('balance', 0)
                wallet.last_synced_at = datetime.now(timezone.utc)
                self.db.commit()
                
                return {
                    'success': True,
                    'balance': wallet.balance
                }
            else:
                return {
                    'success': False,
                    'error': 'Failed to sync balance'
                }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def update_balance(self, user_id: str, amount: float) -> bool:
        """Update wallet balance (local cache)"""
        wallet = self.db.query(Wallet).filter(Wallet.user_id == user_id).first()
        if wallet:
            wallet.balance += amount
            self.db.commit()
            return True
        return False
