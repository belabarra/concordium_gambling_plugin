from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    age = Column(Integer)
    self_excluded = Column(Boolean, default=False)

class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_user(self, name: str, age: int) -> User:
        new_user = User(name=name, age=age)
        self.db.add(new_user)
        self.db.commit()
        self.db.refresh(new_user)
        return new_user

    def get_user(self, user_id: int) -> User:
        return self.db.query(User).filter(User.id == user_id).first()

    def update_user(self, user_id: int, name: str = None, age: int = None) -> User:
        user = self.get_user(user_id)
        if user:
            if name is not None:
                user.name = name
            if age is not None:
                user.age = age
            self.db.commit()
            self.db.refresh(user)
        return user

    def delete_user(self, user_id: int) -> None:
        user = self.get_user(user_id)
        if user:
            self.db.delete(user)
            self.db.commit()

    def set_self_exclusion(self, user_id: int, status: bool) -> User:
        user = self.get_user(user_id)
        if user:
            user.self_excluded = status
            self.db.commit()
            self.db.refresh(user)
        return user