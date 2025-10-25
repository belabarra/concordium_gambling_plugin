from fastapi import APIRouter, Depends, HTTPException, status, Header
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime

# Import database dependency
from config.database import get_db

# Import services
from services.user_service import UserService
from services.transaction_service import TransactionService
from services.limit_enforcement_service import LimitEnforcementService
from services.self_exclusion_service import SelfExclusionService
from services.session_service import SessionService
from services.notification_service import NotificationService
from services.behavior_analytics_service import BehaviorAnalyticsService
from services.audit_service import AuditService
from services.blockchain_integration_service import BlockchainIntegrationService

# Create router
api_router = APIRouter(prefix="/api/v1", tags=["api"])

# Dependency for API key authentication
async def verify_api_key(x_api_key: Optional[str] = Header(None)):
    from config.settings import settings
    if x_api_key and x_api_key != settings.API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API Key"
        )
    return x_api_key

# ============================================================================
# USER ENDPOINTS
# ============================================================================

@api_router.post("/users/register", status_code=status.HTTP_201_CREATED)
async def register_user(user_data: dict, db: Session = Depends(get_db)):
    """Register a new user with Concordium identity verification"""
    user_service = UserService(db)
    result = await user_service.register_user(user_data)
    return result

@api_router.get("/users/{user_id}")
async def get_user(user_id: str, db: Session = Depends(get_db)):
    """Get user details"""
    user_service = UserService(db)
    result = await user_service.get_user(user_id)
    if not result['success']:
        raise HTTPException(status_code=404, detail="User not found")
    return result

@api_router.put("/users/{user_id}")
async def update_user(user_id: str, user_data: dict, db: Session = Depends(get_db)):
    """Update user information"""
    user_service = UserService(db)
    result = await user_service.update_user(user_id, user_data)
    return result

# ============================================================================
# SESSION ENDPOINTS
# ============================================================================

@api_router.post("/sessions/start")
async def start_session(
    user_id: str,
    platform_id: str,
    currency: str = "CCD",
    db: Session = Depends(get_db)
):
    """Start a new gambling session"""
    session_service = SessionService(db)
    result = await session_service.start_session(user_id, platform_id, currency)
    return result

@api_router.post("/sessions/{session_id}/end")
async def end_session(session_id: str, db: Session = Depends(get_db)):
    """End a gambling session"""
    session_service = SessionService(db)
    result = await session_service.end_session(session_id)
    return result

@api_router.get("/sessions/{session_id}")
async def get_session_summary(session_id: str, db: Session = Depends(get_db)):
    """Get session summary"""
    session_service = SessionService(db)
    result = await session_service.get_session_summary(session_id)
    return result

@api_router.put("/sessions/{session_id}/stats")
async def update_session_stats(
    session_id: str,
    wagered: float = 0,
    won: float = 0,
    db: Session = Depends(get_db)
):
    """Update session statistics"""
    session_service = SessionService(db)
    result = await session_service.update_session_stats(session_id, wagered, won)
    return result

@api_router.get("/sessions/{session_id}/check")
async def check_session_duration(session_id: str, db: Session = Depends(get_db)):
    """Check if session has exceeded limits"""
    session_service = SessionService(db)
    result = await session_service.check_session_duration(session_id)
    return result

@api_router.get("/users/{user_id}/sessions")
async def get_user_sessions(
    user_id: str,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Get user's session history"""
    session_service = SessionService(db)
    result = await session_service.get_user_sessions(user_id, limit)
    return result

# ============================================================================
# TRANSACTION ENDPOINTS
# ============================================================================

@api_router.post("/transactions", status_code=status.HTTP_201_CREATED)
async def record_transaction(transaction_data: dict, db: Session = Depends(get_db)):
    """Record a new transaction"""
    transaction_service = TransactionService(db)
    result = await transaction_service.record_transaction(transaction_data)
    return result

@api_router.get("/transactions/{transaction_id}")
async def get_transaction(transaction_id: str, db: Session = Depends(get_db)):
    """Get transaction details"""
    transaction_service = TransactionService(db)
    result = await transaction_service.get_transaction(transaction_id)
    return result

@api_router.get("/users/{user_id}/transactions")
async def get_user_transactions(
    user_id: str,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get user's transaction history"""
    transaction_service = TransactionService(db)
    result = await transaction_service.get_user_transactions(user_id, limit)
    return result

# ============================================================================
# LIMIT ENFORCEMENT ENDPOINTS
# ============================================================================

@api_router.post("/limits/set")
async def set_user_limit(limit_data: dict, db: Session = Depends(get_db)):
    """Set spending limit for user"""
    limit_service = LimitEnforcementService(db)
    result = await limit_service.set_limit(limit_data)
    return result

@api_router.get("/limits/{user_id}")
async def get_user_limits(user_id: str, db: Session = Depends(get_db)):
    """Get user's current limits"""
    limit_service = LimitEnforcementService(db)
    result = await limit_service.get_user_limits(user_id)
    return result

@api_router.post("/limits/check")
async def check_limit(user_id: str, amount: float, db: Session = Depends(get_db)):
    """Check if transaction would exceed limit"""
    limit_service = LimitEnforcementService(db)
    result = await limit_service.check_limit(user_id, amount)
    return result

# ============================================================================
# SELF-EXCLUSION ENDPOINTS
# ============================================================================

@api_router.post("/self-exclusion", status_code=status.HTTP_201_CREATED)
async def add_self_exclusion(exclusion_data: dict, db: Session = Depends(get_db)):
    """Add user to self-exclusion registry"""
    exclusion_service = SelfExclusionService(db)
    result = await exclusion_service.add_self_exclusion(exclusion_data)
    return result

@api_router.get("/self-exclusion/{user_id}")
async def get_self_exclusion(user_id: str, db: Session = Depends(get_db)):
    """Check if user is self-excluded"""
    exclusion_service = SelfExclusionService(db)
    result = await exclusion_service.get_self_exclusion(user_id)
    return result

@api_router.delete("/self-exclusion/{user_id}")
async def remove_self_exclusion(user_id: str, db: Session = Depends(get_db)):
    """Remove user from self-exclusion (after period expires)"""
    exclusion_service = SelfExclusionService(db)
    result = await exclusion_service.remove_self_exclusion(user_id)
    return result

# ============================================================================
# BEHAVIOR ANALYTICS ENDPOINTS
# ============================================================================

@api_router.get("/analytics/risk-score/{user_id}")
async def calculate_risk_score(user_id: str, db: Session = Depends(get_db)):
    """Calculate user's risk score"""
    analytics_service = BehaviorAnalyticsService(db)
    result = await analytics_service.calculate_risk_score(user_id)
    return result

@api_router.get("/analytics/spending-pattern/{user_id}")
async def analyze_spending_pattern(
    user_id: str,
    days: int = 30,
    db: Session = Depends(get_db)
):
    """Analyze user's spending patterns"""
    analytics_service = BehaviorAnalyticsService(db)
    result = await analytics_service.analyze_spending_pattern(user_id, days)
    return result

@api_router.get("/analytics/time-patterns/{user_id}")
async def detect_time_anomalies(user_id: str, db: Session = Depends(get_db)):
    """Detect unhealthy time patterns"""
    analytics_service = BehaviorAnalyticsService(db)
    result = await analytics_service.detect_time_anomalies(user_id)
    return result

@api_router.get("/analytics/wellness-report/{user_id}")
async def generate_wellness_report(user_id: str, db: Session = Depends(get_db)):
    """Generate personalized wellness report"""
    analytics_service = BehaviorAnalyticsService(db)
    result = await analytics_service.generate_wellness_report(user_id)
    return result

# ============================================================================
# NOTIFICATION ENDPOINTS
# ============================================================================

@api_router.get("/notifications/{user_id}")
async def get_user_notifications(
    user_id: str,
    unread_only: bool = False,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get user's notifications"""
    notification_service = NotificationService(db)
    result = await notification_service.get_user_notifications(user_id, unread_only, limit)
    return result

@api_router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, db: Session = Depends(get_db)):
    """Mark notification as read"""
    notification_service = NotificationService(db)
    result = await notification_service.mark_notification_read(notification_id)
    return result

@api_router.get("/notifications/{user_id}/unread-count")
async def get_unread_count(user_id: str, db: Session = Depends(get_db)):
    """Get count of unread notifications"""
    notification_service = NotificationService(db)
    result = await notification_service.get_unread_count(user_id)
    return result

# ============================================================================
# AUDIT ENDPOINTS
# ============================================================================

@api_router.post("/audit/log")
async def log_action(log_data: dict, db: Session = Depends(get_db)):
    """Create audit log entry"""
    audit_service = AuditService(db)
    result = await audit_service.log_action(**log_data)
    return result

@api_router.get("/audit/user/{user_id}")
async def get_user_audit_history(user_id: str, db: Session = Depends(get_db)):
    """Get user's audit history"""
    audit_service = AuditService(db)
    result = await audit_service.get_user_action_history(user_id)
    return result

@api_router.get("/audit/report/{operator_id}")
async def generate_regulatory_report(
    operator_id: str,
    period: str = "month",
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_api_key)
):
    """Generate regulatory compliance report"""
    audit_service = AuditService(db)
    result = await audit_service.generate_regulatory_report(operator_id, period)
    return result

# ============================================================================
# CONCORDIUM INTEGRATION ENDPOINTS
# ============================================================================

@api_router.get("/concordium/health")
async def check_concordium_service():
    """Check Concordium Node.js service availability"""
    blockchain_service = BlockchainIntegrationService()
    result = await blockchain_service.check_service_health()
    return result

@api_router.post("/concordium/verify-identity")
async def verify_concordium_identity(
    concordium_id: str,
    attributes: dict = None,
    db: Session = Depends(get_db)
):
    """Verify user identity with Concordium blockchain"""
    blockchain_service = BlockchainIntegrationService()
    result = await blockchain_service.verify_user_identity(concordium_id, attributes)
    
    # Log the verification attempt
    audit_service = AuditService(db)
    await audit_service.log_action(
        action_type="identity_verification",
        details={
            "concordium_id": concordium_id,
            "verified": result.get('verified', False),
            "mock": result.get('mock', False)
        },
        result="success" if result.get('success') else "failure"
    )
    
    return result

@api_router.get("/concordium/balance/{concordium_id}")
async def get_concordium_balance(
    concordium_id: str,
    currency: str = "CCD"
):
    """Get user's balance from Concordium"""
    blockchain_service = BlockchainIntegrationService()
    result = await blockchain_service.get_user_balance(concordium_id, currency)
    return result

@api_router.post("/concordium/log-transaction")
async def log_transaction_on_chain(
    transaction_data: dict,
    db: Session = Depends(get_db)
):
    """Log transaction to Concordium blockchain"""
    blockchain_service = BlockchainIntegrationService()
    result = await blockchain_service.log_transaction_on_chain(transaction_data)
    
    # Log the attempt
    audit_service = AuditService(db)
    await audit_service.log_action(
        action_type="blockchain_transaction_log",
        details=transaction_data,
        result="success" if result.get('success') else "failure",
        concordium_tx_hash=result.get('transaction_hash')
    )
    
    return result

# ============================================================================
# HEALTH CHECK
# ============================================================================

@api_router.get("/health")
async def health_check():
    """Comprehensive health check endpoint"""
    blockchain_service = BlockchainIntegrationService()
    concordium_health = await blockchain_service.check_service_health()
    
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "Responsible Gambling Tool and Services",
        "python_backend": {
            "status": "running",
            "version": "1.0.0"
        },
        "concordium_service": {
            "url": concordium_health.get('data', {}).get('url') if concordium_health.get('available') else None,
            "available": concordium_health.get('available', False),
            "status": "connected" if concordium_health.get('available') else "disconnected"
        },
        "database": {
            "status": "connected"  # Can add actual DB check here
        }
    }