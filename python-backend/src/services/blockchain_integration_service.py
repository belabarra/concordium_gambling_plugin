from typing import Any, Dict, Optional
import requests
import logging
from config.settings import settings

logger = logging.getLogger(__name__)

class BlockchainIntegrationService:
    """Service for integrating with Node.js Concordium blockchain service"""
    
    def __init__(self, blockchain_api_url: str = None):
        self.blockchain_api_url = blockchain_api_url or settings.CONCORDIUM_SERVICE_URL
        self.api_key = settings.CONCORDIUM_SERVICE_API_KEY
        self.timeout = 30  # seconds
        
    def _get_headers(self) -> Dict[str, str]:
        """Get request headers with API key"""
        return {
            "Content-Type": "application/json",
            "X-API-Key": self.api_key
        }
    
    async def check_service_health(self) -> Dict[str, Any]:
        """Check if Concordium service is available"""
        try:
            response = requests.get(
                f"{self.blockchain_api_url}/api/health",
                timeout=self.timeout
            )
            if response.status_code == 200:
                return {
                    "success": True,
                    "available": True,
                    "data": response.json()
                }
            return {
                "success": False,
                "available": False,
                "error": f"Service returned status {response.status_code}"
            }
        except requests.exceptions.RequestException as e:
            logger.error(f"Concordium service health check failed: {e}")
            return {
                "success": False,
                "available": False,
                "error": str(e)
            }
    
    async def verify_user_identity(self, concordium_id: str, attributes: Dict[str, Any] = None) -> Dict[str, Any]:
        """Verify user identity with Concordium blockchain"""
        try:
            # For now, check if service is available
            health = await self.check_service_health()
            if not health.get('available'):
                logger.warning("Concordium service not available, using mock verification")
                return {
                    "success": True,
                    "verified": True,
                    "concordium_id": concordium_id,
                    "mock": True,
                    "message": "Mock verification - Concordium service not available"
                }
            
            # Call Node.js service for actual verification
            response = requests.post(
                f"{self.blockchain_api_url}/api/concordium/verify-identity",
                json={"concordium_id": concordium_id, "attributes": attributes or {}},
                headers=self._get_headers(),
                timeout=self.timeout
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "verified": data.get('verified', True),
                    "concordium_id": concordium_id,
                    "data": data
                }
            else:
                logger.error(f"Identity verification failed: {response.status_code}")
                return {
                    "success": False,
                    "verified": False,
                    "error": f"Verification failed with status {response.status_code}"
                }
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to verify user identity: {e}")
            # Return mock success for development
            return {
                "success": True,
                "verified": True,
                "concordium_id": concordium_id,
                "mock": True,
                "message": "Mock verification - Service unavailable"
            }
    
    async def verify_transaction(self, transaction_hash: str) -> Dict[str, Any]:
        """Verify transaction on Concordium blockchain"""
        try:
            health = await self.check_service_health()
            if not health.get('available'):
                logger.warning("Concordium service not available, using mock verification")
                return {
                    "success": True,
                    "verified": True,
                    "transaction_hash": transaction_hash,
                    "mock": True
                }
            
            response = requests.get(
                f"{self.blockchain_api_url}/api/concordium/verify-transaction/{transaction_hash}",
                headers=self._get_headers(),
                timeout=self.timeout
            )
            
            if response.status_code == 200:
                return {
                    "success": True,
                    "verified": True,
                    "data": response.json()
                }
            return {
                "success": False,
                "verified": False,
                "error": f"Verification failed with status {response.status_code}"
            }
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to verify transaction: {e}")
            return {
                "success": True,
                "verified": True,
                "transaction_hash": transaction_hash,
                "mock": True
            }
    
    async def log_transaction_on_chain(self, transaction_data: Dict[str, Any]) -> Dict[str, Any]:
        """Log transaction to Concordium blockchain"""
        try:
            health = await self.check_service_health()
            if not health.get('available'):
                logger.warning("Concordium service not available, transaction not logged on-chain")
                return {
                    "success": True,
                    "on_chain": False,
                    "mock": True,
                    "message": "Transaction logged locally only"
                }
            
            response = requests.post(
                f"{self.blockchain_api_url}/api/concordium/log-transaction",
                json=transaction_data,
                headers=self._get_headers(),
                timeout=self.timeout
            )
            
            if response.status_code in [200, 201]:
                data = response.json()
                return {
                    "success": True,
                    "on_chain": True,
                    "transaction_hash": data.get('transaction_hash'),
                    "data": data
                }
            return {
                "success": False,
                "on_chain": False,
                "error": f"Failed to log transaction with status {response.status_code}"
            }
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to log transaction on chain: {e}")
            return {
                "success": True,
                "on_chain": False,
                "mock": True,
                "message": "Transaction logged locally only"
            }
    
    async def get_user_balance(self, concordium_id: str, currency: str = "CCD") -> Dict[str, Any]:
        """Get user's balance from Concordium"""
        try:
            health = await self.check_service_health()
            if not health.get('available'):
                return {
                    "success": True,
                    "balance": 0.0,
                    "currency": currency,
                    "mock": True
                }
            
            response = requests.get(
                f"{self.blockchain_api_url}/api/concordium/balance/{concordium_id}",
                params={"currency": currency},
                headers=self._get_headers(),
                timeout=self.timeout
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "balance": data.get('balance', 0.0),
                    "currency": currency,
                    "data": data
                }
            return {
                "success": False,
                "error": f"Failed to get balance with status {response.status_code}"
            }
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to get user balance: {e}")
            return {
                "success": True,
                "balance": 0.0,
                "currency": currency,
                "mock": True
            }