from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel

from config.database import get_db
from services.wallet_service import WalletService
from services.payment_service import PaymentService
from models.payment import PaymentType

router = APIRouter(prefix="/api/v1", tags=["Payments"])

# Request models
class ConnectWalletRequest(BaseModel):
    user_id: str
    concordium_address: str

class DepositRequest(BaseModel):
    user_id: str
    amount: float
    from_address: Optional[str] = None

class WithdrawRequest(BaseModel):
    user_id: str
    amount: float
    to_address: Optional[str] = None

class WinningsRequest(BaseModel):
    user_id: str
    amount: float
    game_id: str
    session_id: Optional[str] = None

# Wallet endpoints
@router.post("/wallet/connect")
async def connect_wallet(request: ConnectWalletRequest, db: Session = Depends(get_db)):
    """Connect a Concordium wallet to user account"""
    wallet_service = WalletService(db)
    result = await wallet_service.connect_wallet(request.user_id, request.concordium_address)
    
    if result['success']:
        return result
    raise HTTPException(status_code=400, detail=result.get('error'))

@router.get("/wallet/{user_id}")
async def get_wallet(user_id: str, db: Session = Depends(get_db)):
    """Get user's wallet information"""
    wallet_service = WalletService(db)
    result = await wallet_service.get_wallet(user_id)
    
    if result['success']:
        return result
    raise HTTPException(status_code=404, detail=result.get('error'))

@router.get("/wallet/{user_id}/balance")
async def get_balance(user_id: str, db: Session = Depends(get_db)):
    """Get wallet balance"""
    wallet_service = WalletService(db)
    result = await wallet_service.get_balance(user_id)
    
    if result['success']:
        return result
    raise HTTPException(status_code=404, detail=result.get('error'))

@router.post("/wallet/{user_id}/sync")
async def sync_balance(user_id: str, db: Session = Depends(get_db)):
    """Sync wallet balance with blockchain"""
    wallet_service = WalletService(db)
    result = await wallet_service.sync_balance(user_id)
    
    if result['success']:
        return result
    raise HTTPException(status_code=400, detail=result.get('error'))

# Payment endpoints
@router.post("/payment/deposit")
async def deposit(request: DepositRequest, db: Session = Depends(get_db)):
    """Deposit funds from wallet to platform"""
    payment_service = PaymentService(db)
    result = await payment_service.deposit(
        request.user_id,
        request.amount,
        request.from_address
    )
    
    if result['success']:
        return result
    raise HTTPException(status_code=400, detail=result.get('error'))

@router.post("/payment/withdraw")
async def withdraw(request: WithdrawRequest, db: Session = Depends(get_db)):
    """Withdraw funds from platform to wallet"""
    payment_service = PaymentService(db)
    result = await payment_service.withdraw(
        request.user_id,
        request.amount,
        request.to_address
    )
    
    if result['success']:
        return result
    raise HTTPException(status_code=400, detail=result.get('error'))

@router.post("/payment/winnings")
async def process_winnings(request: WinningsRequest, db: Session = Depends(get_db)):
    """Process winnings from gambling provider (called by frontend)"""
    payment_service = PaymentService(db)
    result = await payment_service.process_winnings(
        request.user_id,
        request.amount,
        request.game_id,
        request.session_id
    )
    
    if result['success']:
        return result
    raise HTTPException(status_code=400, detail=result.get('error'))

@router.get("/payment/history/{user_id}")
async def get_payment_history(
    user_id: str,
    payment_type: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get payment history"""
    payment_service = PaymentService(db)
    
    # Convert string to enum if provided
    type_filter = None
    if payment_type:
        try:
            type_filter = PaymentType(payment_type.lower())
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid payment type")
    
    history = payment_service.get_payment_history(user_id, type_filter, limit)
    return {'payments': history, 'count': len(history)}

@router.get("/payment/analytics/{user_id}")
async def get_analytics(
    user_id: str,
    days: int = 30,
    db: Session = Depends(get_db)
):
    """Get payment analytics (profit/loss)"""
    payment_service = PaymentService(db)
    analytics = payment_service.get_analytics(user_id, days)
    return analytics
