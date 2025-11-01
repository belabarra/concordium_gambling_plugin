from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session

Base = declarative_base()

class SelfExclusion(Base):
    __tablename__ = 'self_exclusions'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, nullable=False)
    is_excluded = Column(Boolean, default=False)

class SelfExclusionRepository:
    def __init__(self, session: Session):
        self.session = session

    def add_self_exclusion(self, user_id: int):
        exclusion = SelfExclusion(user_id=user_id, is_excluded=True)
        self.session.add(exclusion)
        self.session.commit()

    def remove_self_exclusion(self, user_id: int):
        exclusion = self.session.query(SelfExclusion).filter_by(user_id=user_id).first()
        if exclusion:
            exclusion.is_excluded = False
            self.session.commit()

    def is_user_excluded(self, user_id: int) -> bool:
        exclusion = self.session.query(SelfExclusion).filter_by(user_id=user_id).first()
        return exclusion.is_excluded if exclusion else False

    def get_exclusion_status(self, user_id: int):
        exclusion = self.session.query(SelfExclusion).filter_by(user_id=user_id).first()
        return exclusion if exclusion else None