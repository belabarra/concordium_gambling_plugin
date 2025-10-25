from datetime import datetime
from typing import List, Optional
from models.user import User
from repositories.user_repository import UserRepository

class UserService:
    def __init__(self):
        self.user_repository = UserRepository()

    def register_user(self, user_data: dict) -> User:
        user = User(**user_data)
        return self.user_repository.create_user(user)

    def get_user(self, user_id: str) -> Optional[User]:
        return self.user_repository.get_user_by_id(user_id)

    def update_user(self, user_id: str, user_data: dict) -> Optional[User]:
        user = self.get_user(user_id)
        if user:
            for key, value in user_data.items():
                setattr(user, key, value)
            return self.user_repository.update_user(user)
        return None

    def get_all_users(self) -> List[User]:
        return self.user_repository.get_all_users()

    def delete_user(self, user_id: str) -> bool:
        return self.user_repository.delete_user(user_id)