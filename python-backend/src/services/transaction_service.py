from datetime import datetime
from typing import List, Optional
from models.transaction import Transaction
from repositories.transaction_repository import TransactionRepository

class TransactionService:
    def __init__(self):
        self.transaction_repository = TransactionRepository()

    def record_transaction(self, user_id: str, amount: float) -> Transaction:
        transaction = Transaction(
            transaction_id=self.generate_transaction_id(),
            user_id=user_id,
            amount=amount,
            timestamp=datetime.utcnow()
        )
        self.transaction_repository.save(transaction)
        return transaction

    def get_user_transactions(self, user_id: str) -> List[Transaction]:
        return self.transaction_repository.find_by_user_id(user_id)

    def generate_transaction_id(self) -> str:
        return f"txn_{int(datetime.utcnow().timestamp())}"  # Simple transaction ID generation based on timestamp

    def check_spending_limit(self, user_id: str, limit: float) -> bool:
        transactions = self.get_user_transactions(user_id)
        total_spent = sum(transaction.amount for transaction in transactions)
        return total_spent + limit <= limit  # Check if adding the new transaction exceeds the limit