class Limit:
    def __init__(self, user_id: str, spending_limit: float, current_spending: float = 0.0):
        self.user_id = user_id
        self.spending_limit = spending_limit
        self.current_spending = current_spending

    def add_spending(self, amount: float):
        if amount < 0:
            raise ValueError("Amount must be positive.")
        self.current_spending += amount
        if self.current_spending > self.spending_limit:
            raise ValueError("Spending limit exceeded.")

    def reset_spending(self):
        self.current_spending = 0.0

    def is_limit_exceeded(self) -> bool:
        return self.current_spending > self.spending_limit

    def __repr__(self):
        return f"<Limit(user_id={self.user_id}, spending_limit={self.spending_limit}, current_spending={self.current_spending})>"