class Transaction:
    def __init__(self, transaction_id, user_id, amount, timestamp):
        self.transaction_id = transaction_id
        self.user_id = user_id
        self.amount = amount
        self.timestamp = timestamp

    def __repr__(self):
        return f"<Transaction(transaction_id={self.transaction_id}, user_id={self.user_id}, amount={self.amount}, timestamp={self.timestamp})>"