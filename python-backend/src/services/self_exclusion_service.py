from datetime import datetime, timedelta
from typing import List, Optional

class SelfExclusion:
    def __init__(self, user_id: str, start_date: datetime, end_date: datetime):
        self.user_id = user_id
        self.start_date = start_date
        self.end_date = end_date

class SelfExclusionService:
    def __init__(self):
        self.self_exclusion_registry: List[SelfExclusion] = []

    def add_self_exclusion(self, user_id: str, duration_days: int) -> SelfExclusion:
        start_date = datetime.now()
        end_date = start_date + timedelta(days=duration_days)
        exclusion = SelfExclusion(user_id, start_date, end_date)
        self.self_exclusion_registry.append(exclusion)
        return exclusion

    def is_user_excluded(self, user_id: str) -> bool:
        current_date = datetime.now()
        for exclusion in self.self_exclusion_registry:
            if exclusion.user_id == user_id and exclusion.start_date <= current_date <= exclusion.end_date:
                return True
        return False

    def remove_self_exclusion(self, user_id: str) -> Optional[SelfExclusion]:
        for exclusion in self.self_exclusion_registry:
            if exclusion.user_id == user_id:
                self.self_exclusion_registry.remove(exclusion)
                return exclusion
        return None

    def get_exclusion_details(self, user_id: str) -> Optional[SelfExclusion]:
        for exclusion in self.self_exclusion_registry:
            if exclusion.user_id == user_id:
                return exclusion
        return None