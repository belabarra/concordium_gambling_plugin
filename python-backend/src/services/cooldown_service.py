from datetime import datetime, timedelta

class CooldownService:
    def __init__(self):
        self.cooldowns = {}

    def set_cooldown(self, user_id, duration_minutes):
        end_time = datetime.now() + timedelta(minutes=duration_minutes)
        self.cooldowns[user_id] = end_time

    def is_on_cooldown(self, user_id):
        if user_id in self.cooldowns:
            if datetime.now() < self.cooldowns[user_id]:
                return True
            else:
                del self.cooldowns[user_id]  # Remove expired cooldown
        return False

    def get_cooldown_end_time(self, user_id):
        return self.cooldowns.get(user_id)