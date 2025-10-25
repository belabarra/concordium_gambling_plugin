from sqlalchemy import Column, String, Boolean, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Operator(Base):
    """Gambling platform operator model"""
    __tablename__ = 'operators'

    operator_id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    platform_url = Column(String, nullable=True)
    api_key = Column(String, nullable=False, unique=True)
    is_active = Column(Boolean, default=True)
    registered_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    last_active = Column(DateTime, nullable=True)
    supported_currencies = Column(JSON, default=['CCD'])  # List of supported PLT currencies
    compliance_level = Column(String, default='standard')  # standard, enhanced, premium
    country = Column(String, nullable=True)
    license_number = Column(String, nullable=True)
    contact_email = Column(String, nullable=True)
    settings = Column(JSON, nullable=True)  # Operator-specific settings

    def __repr__(self):
        return f"<Operator(operator_id='{self.operator_id}', name='{self.name}', is_active={self.is_active})>"

    def to_dict(self):
        return {
            'operator_id': self.operator_id,
            'name': self.name,
            'platform_url': self.platform_url,
            'is_active': self.is_active,
            'registered_at': self.registered_at.isoformat() if self.registered_at else None,
            'last_active': self.last_active.isoformat() if self.last_active else None,
            'supported_currencies': self.supported_currencies,
            'compliance_level': self.compliance_level,
            'country': self.country,
            'license_number': self.license_number,
            'contact_email': self.contact_email
        }
