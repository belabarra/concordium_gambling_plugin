class SelfExclusion:
    def __init__(self, user_id: str, exclusion_status: bool):
        self.user_id = user_id
        self.exclusion_status = exclusion_status

    def __repr__(self):
        return f"<SelfExclusion(user_id={self.user_id}, exclusion_status={self.exclusion_status})>"

    def toggle_exclusion(self):
        self.exclusion_status = not self.exclusion_status

    def is_excluded(self) -> bool:
        return self.exclusion_status