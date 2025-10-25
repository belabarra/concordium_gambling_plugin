from typing import Any, Dict
import requests

class BlockchainIntegrationService:
    def __init__(self, blockchain_api_url: str):
        self.blockchain_api_url = blockchain_api_url

    def verify_user_identity(self, user_id: str) -> Dict[str, Any]:
        response = requests.get(f"{self.blockchain_api_url}/verify_user/{user_id}")
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception("Failed to verify user identity")

    def verify_transaction(self, transaction_id: str) -> Dict[str, Any]:
        response = requests.get(f"{self.blockchain_api_url}/verify_transaction/{transaction_id}")
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception("Failed to verify transaction")

    def log_transaction(self, transaction_data: Dict[str, Any]) -> Dict[str, Any]:
        response = requests.post(f"{self.blockchain_api_url}/log_transaction", json=transaction_data)
        if response.status_code == 201:
            return response.json()
        else:
            raise Exception("Failed to log transaction")