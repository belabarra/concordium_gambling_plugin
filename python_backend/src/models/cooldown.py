class Cooldown:
    def __init__(self, user_id, cooldown_start, cooldown_end):
        self.user_id = user_id
        self.cooldown_start = cooldown_start
        self.cooldown_end = cooldown_end

    def is_on_cooldown(self, current_time):
        return self.cooldown_start <= current_time <= self.cooldown_end

    def extend_cooldown(self, additional_time):
        self.cooldown_end += additional_time

    def reset_cooldown(self):
        self.cooldown_start = None
        self.cooldown_end = None