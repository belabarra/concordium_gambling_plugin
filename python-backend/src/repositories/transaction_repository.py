from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session
from datetime import datetime, timezone

Base = declarative_base()

class Transaction(Base):
    __tablename__ = 'transactions'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    amount = Column(Float)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class TransactionRepository:
    def __init__(self, session: Session):
        self.session = session

    def create_transaction(self, user_id: int, amount: float) -> Transaction:
        transaction = Transaction(user_id=user_id, amount=amount)
        self.session.add(transaction)
        self.session.commit()
        self.session.refresh(transaction)
        return transaction

    def get_transactions_by_user(self, user_id: int):
        return self.session.query(Transaction).filter(Transaction.user_id == user_id).all()

    def get_transaction_by_id(self, transaction_id: int) -> Transaction:
        return self.session.query(Transaction).filter(Transaction.id == transaction_id).first()

    def delete_transaction(self, transaction_id: int):
        transaction = self.get_transaction_by_id(transaction_id)
        if transaction:
            self.session.delete(transaction)
            self.session.commit()
            return True
        return False