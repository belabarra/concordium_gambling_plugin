from datetime import datetime, timedelta
from models.limit import Limit
from repositories.user_repository import UserRepository

class LimitEnforcementService:
    def __init__(self):
        self.user_repository = UserRepository()

    def enforce_limit(self, user_id: str, transaction_amount: float) -> bool:
        user = self.user_repository.get_user_by_id(user_id)
        if not user:
            raise ValueError("User not found")

        limit = self.user_repository.get_limit_for_user(user_id)
        if not limit:
            raise ValueError("Limit not set for user")

        current_spending = self.user_repository.get_current_spending(user_id)
        new_spending = current_spending + transaction_amount

        if new_spending > limit.spending_limit:
            return False  # Limit exceeded

        self.user_repository.update_current_spending(user_id, new_spending)
        return True  # Limit not exceeded

    def set_limit(self, user_id: str, spending_limit: float):
        limit = Limit(user_id=user_id, spending_limit=spending_limit)
        self.user_repository.save_limit(limit)

    def get_limit(self, user_id: str) -> float:
        limit = self.user_repository.get_limit_for_user(user_id)
        return limit.spending_limit if limit else 0.0

    def reset_limit(self, user_id: str):
        self.user_repository.reset_current_spending(user_id)