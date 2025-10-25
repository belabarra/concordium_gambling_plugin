from sqlalchemy import Column, String, Float, DateTime, JSON, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime, timezone
from enum import Enum
from typing import Dict, List

Base = declarative_base()

class RiskLevel(str, Enum):
    """Risk level classification"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class RiskAssessment(Base):
    """Risk assessment model for user behavior analysis"""
    __tablename__ = 'risk_assessments'

    assessment_id = Column(String, primary_key=True, index=True)
    user_id = Column(String, nullable=False, index=True)
    risk_score = Column(Float, nullable=False)  # 0-100
    risk_level = Column(SQLEnum(RiskLevel), nullable=False)
    factors = Column(JSON, nullable=False)  # Contributing factors as dict
    assessed_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    recommendations = Column(JSON, nullable=True)  # List of recommendations
    previous_score = Column(Float, nullable=True)
    trend = Column(String, nullable=True)  # improving, stable, worsening

    def __repr__(self):
        return f"<RiskAssessment(assessment_id='{self.assessment_id}', user_id='{self.user_id}', risk_level='{self.risk_level}', score={self.risk_score})>"

    def to_dict(self):
        return {
            'assessment_id': self.assessment_id,
            'user_id': self.user_id,
            'risk_score': self.risk_score,
            'risk_level': self.risk_level.value if isinstance(self.risk_level, Enum) else self.risk_level,
            'factors': self.factors,
            'assessed_at': self.assessed_at.isoformat() if self.assessed_at else None,
            'recommendations': self.recommendations,
            'previous_score': self.previous_score,
            'trend': self.trend
        }

    @staticmethod
    def calculate_risk_level(score: float) -> RiskLevel:
        """Calculate risk level from score"""
        if score < 25:
            return RiskLevel.LOW
        elif score < 50:
            return RiskLevel.MEDIUM
        elif score < 75:
            return RiskLevel.HIGH
        else:
            return RiskLevel.CRITICAL

    def get_top_risk_factors(self, limit: int = 3) -> List[tuple]:
        """Get top contributing risk factors"""
        if not self.factors:
            return []
        sorted_factors = sorted(self.factors.items(), key=lambda x: x[1], reverse=True)
        return sorted_factors[:limit]
