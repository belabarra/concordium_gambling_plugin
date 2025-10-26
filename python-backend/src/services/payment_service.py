from sqlalchemy.orm import Session
from typing import Dict, List, Optional
import uuid
from datetime import datetime, timezone

from src.models.payment import Payment, PaymentType, PaymentStatus
from src.repositories.payment_repository import PaymentRepository
from src.services.wallet_service import WalletService
from src.services.blockchain_integration_service import BlockchainIntegrationService
from src.services.smart_contract_service import SmartContractService

class PaymentService:
    """Service for payment operations"""
    
    def __init__(self, db: Session):
        self.db = db
        self.payment_repo = PaymentRepository(db)
        self.wallet_service = WalletService(db)
        self.blockchain_service = BlockchainIntegrationService()
        self.contract_service = SmartContractService()
    
    async def deposit(
        self, 
        user_id: str,
        amount: float,
        from_address: str = None
    ) -> Dict:
        """Process deposit from wallet to platform"""
        
        # Get user wallet
        wallet_result = await self.wallet_service.get_wallet(user_id)
        if not wallet_result['success']:
            return wallet_result
        
        wallet = wallet_result['wallet']
        source_address = from_address or wallet['concordium_address']
        
        # Create payment record
        payment = Payment(
            payment_id=str(uuid.uuid4()),
            user_id=user_id,
            payment_type=PaymentType.DEPOSIT,
            amount=amount,
            currency="CCD",
            status=PaymentStatus.PENDING,
            from_address=source_address,
            to_address="platform"
        )
        
        payment = self.payment_repo.create(payment)
        
        try:
            # Process via blockchain
            tx_result = await self.blockchain_service.transfer_funds(
                from_address=source_address,
                to_address="platform",
                amount=amount
            )
            
            if tx_result.get('success'):
                # Update payment
                self.payment_repo.update_status(
                    payment.payment_id,
                    PaymentStatus.COMPLETED,
                    tx_hash=tx_result.get('tx_hash')
                )
                
                # Update wallet balance
                self.wallet_service.update_balance(user_id, amount)
                
                return {
                    'success': True,
                    'payment': payment.to_dict(),
                    'tx_hash': tx_result.get('tx_hash')
                }
            else:
                self.payment_repo.update_status(
                    payment.payment_id,
                    PaymentStatus.FAILED,
                    error_message=tx_result.get('error')
                )
                return {
                    'success': False,
                    'error': tx_result.get('error')
                }
        except Exception as e:
            self.payment_repo.update_status(
                payment.payment_id,
                PaymentStatus.FAILED,
                error_message=str(e)
            )
            return {
                'success': False,
                'error': str(e)
            }
    
    async def withdraw(
        self,
        user_id: str,
        amount: float,
        to_address: str = None
    ) -> Dict:
        """Process withdrawal from platform to wallet"""
        
        # Get user wallet
        wallet_result = await self.wallet_service.get_wallet(user_id)
        if not wallet_result['success']:
            return wallet_result
        
        wallet = wallet_result['wallet']
        
        # Check balance
        if wallet['balance'] < amount:
            return {
                'success': False,
                'error': f'Insufficient balance. Available: {wallet["balance"]}'
            }
        
        dest_address = to_address or wallet['concordium_address']
        
        # Create payment record
        payment = Payment(
            payment_id=str(uuid.uuid4()),
            user_id=user_id,
            payment_type=PaymentType.WITHDRAWAL,
            amount=amount,
            currency="CCD",
            status=PaymentStatus.PENDING,
            from_address="platform",
            to_address=dest_address
        )
        
        payment = self.payment_repo.create(payment)
        
        try:
            # Process via blockchain
            tx_result = await self.blockchain_service.transfer_funds(
                from_address="platform",
                to_address=dest_address,
                amount=amount
            )
            
            if tx_result.get('success'):
                # Update payment
                self.payment_repo.update_status(
                    payment.payment_id,
                    PaymentStatus.COMPLETED,
                    tx_hash=tx_result.get('tx_hash')
                )
                
                # Update wallet balance
                self.wallet_service.update_balance(user_id, -amount)
                
                return {
                    'success': True,
                    'payment': payment.to_dict(),
                    'tx_hash': tx_result.get('tx_hash')
                }
            else:
                self.payment_repo.update_status(
                    payment.payment_id,
                    PaymentStatus.FAILED,
                    error_message=tx_result.get('error')
                )
                return {
                    'success': False,
                    'error': tx_result.get('error')
                }
        except Exception as e:
            self.payment_repo.update_status(
                payment.payment_id,
                PaymentStatus.FAILED,
                error_message=str(e)
            )
            return {
                'success': False,
                'error': str(e)
            }
    
    async def process_winnings(
        self,
        user_id: str,
        amount: float,
        game_id: str,
        session_id: str = None
    ) -> Dict:
        """Process winnings from gambling provider (called by frontend)"""
        
        # Get user wallet
        wallet_result = await self.wallet_service.get_wallet(user_id)
        if not wallet_result['success']:
            return wallet_result
        
        wallet = wallet_result['wallet']
        
        # Create winnings payment
        payment = Payment(
            payment_id=str(uuid.uuid4()),
            user_id=user_id,
            payment_type=PaymentType.WINNINGS,
            amount=amount,
            currency="CCD",
            status=PaymentStatus.PENDING,
            to_address=wallet['concordium_address'],
            game_id=game_id,
            session_id=session_id
        )
        
        payment = self.payment_repo.create(payment)
        
        try:
            # Use smart contract to automatically transfer winnings
            tx_result = await self.contract_service.payout_winnings(
                winner_address=wallet['concordium_address'],
                amount=amount,
                game_id=game_id
            )
            
            if tx_result.get('success'):
                # Update payment
                self.payment_repo.update_status(
                    payment.payment_id,
                    PaymentStatus.COMPLETED,
                    tx_hash=tx_result.get('tx_hash')
                )
                
                # Update wallet balance
                self.wallet_service.update_balance(user_id, amount)
                
                return {
                    'success': True,
                    'payment': payment.to_dict(),
                    'tx_hash': tx_result.get('tx_hash'),
                    'new_balance': wallet['balance'] + amount
                }
            else:
                self.payment_repo.update_status(
                    payment.payment_id,
                    PaymentStatus.FAILED,
                    error_message=tx_result.get('error')
                )
                return {
                    'success': False,
                    'error': tx_result.get('error')
                }
        except Exception as e:
            self.payment_repo.update_status(
                payment.payment_id,
                PaymentStatus.FAILED,
                error_message=str(e)
            )
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_payment_history(
        self,
        user_id: str,
        payment_type: Optional[PaymentType] = None,
        limit: int = 100
    ) -> List[Dict]:
        """Get payment history"""
        payments = self.payment_repo.get_user_payments(user_id, payment_type, limit)
        return [p.to_dict() for p in payments]
    
    def get_analytics(self, user_id: str, days: int = 30) -> Dict:
        """Get payment analytics (profit/loss analysis)"""
        totals = self.payment_repo.get_totals(user_id, days)
        
        profit_loss = totals['winnings'] - totals['deposits']
        
        return {
            'period_days': days,
            'total_deposits': totals['deposits'],
            'total_withdrawals': totals['withdrawals'],
            'total_winnings': totals['winnings'],
            'net_position': totals['net'],
            'profit_loss': profit_loss,
            'status': 'profit' if profit_loss > 0 else 'loss' if profit_loss < 0 else 'breakeven'
        }
