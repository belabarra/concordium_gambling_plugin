from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session
from src.models.user import User
from typing import Optional, List



Base = declarative_base()


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_user(self, user: User) -> User:
        """Create a new user (expects User object)"""

        
        self.db.add(user)  #add to database
        self.db.commit() #save
        self.db.refresh(user) #get updated data from database
        return user

    
    def get_user_by_wallet(self, wallet_address: str) -> Optional[User]:
        """Get user by wallet address"""
        return self.db.query(User).filter(
        User.wallet_address == wallet_address
        ).first()

    
    def update_user(self, user: User) -> User:
        """Update user (expects User object that's already been modified)"""
        self.db.commit()
        self.db.refresh(user)
        return user

    
    def delete_user(self, user_id: int) -> bool:
        """Delete user by ID"""
        user = self.get_user(user_id)
        if user:
            self.db.delete(user)
            self.db.commit()
            return True
        return False

    def set_self_exclusion(self, user_id: int, status: bool) -> User:
        """Set self-exclusion status"""

        user = self.get_user(user_id)
        if user:
            user.self_excluded = status
            self.db.commit()
            self.db.refresh(user)
        return user
    
    def update_last_login(self, user_id: int) -> Optional[User]:
        """Update last login timestamp"""
        user = self.get_user(user_id)
        if user:
            user.last_login = datetime.utcnow()
            self.db.commit()
            self.db.refresh(user)
        return user
    
    def get_all_users(self) -> List[User]:
        """Get all users"""
        return self.db.query(User).all()
