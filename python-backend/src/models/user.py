from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    self_excluded = Column(Boolean, default=False)

    def __repr__(self):
        return f"<User(id={self.id}, name='{self.name}', age={self.age}, self_excluded={self.self_excluded})>"