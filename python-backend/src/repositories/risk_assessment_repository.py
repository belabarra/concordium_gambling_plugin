from sqlalchemy.orm import Session
from src.models.risk_assessment import RiskAssessment, RiskLevel
from typing import List, Optional
from datetime import datetime, timedelta, timezone

class RiskAssessmentRepository:
    """Repository for risk assessment data access"""
    
    def __init__(self, db: Session):
        self.db = db

    def create_assessment(self, assessment: RiskAssessment) -> RiskAssessment:
        """Create a new risk assessment"""
        self.db.add(assessment)
        self.db.commit()
        self.db.refresh(assessment)
        return assessment

    def get_assessment(self, assessment_id: str) -> Optional[RiskAssessment]:
        """Get assessment by ID"""
        return self.db.query(RiskAssessment).filter(
            RiskAssessment.assessment_id == assessment_id
        ).first()

    def get_latest_assessment(self, user_id: str) -> Optional[RiskAssessment]:
        """Get user's most recent assessment"""
        return self.db.query(RiskAssessment).filter(
            RiskAssessment.user_id == user_id
        ).order_by(RiskAssessment.assessed_at.desc()).first()

    def get_user_assessments(
        self, 
        user_id: str, 
        limit: int = 10
    ) -> List[RiskAssessment]:
        """Get user's assessment history"""
        return self.db.query(RiskAssessment).filter(
            RiskAssessment.user_id == user_id
        ).order_by(RiskAssessment.assessed_at.desc()).limit(limit).all()

    def get_high_risk_users(
        self,
        min_risk_level: RiskLevel = RiskLevel.HIGH,
        since: datetime = None
    ) -> List[RiskAssessment]:
        """Get assessments of high-risk users"""
        query = self.db.query(RiskAssessment).filter(
            RiskAssessment.risk_level.in_([RiskLevel.HIGH, RiskLevel.CRITICAL])
        )
        
        if since:
            query = query.filter(RiskAssessment.assessed_at >= since)
        
        return query.order_by(RiskAssessment.risk_score.desc()).all()

    def update_assessment(self, assessment: RiskAssessment) -> RiskAssessment:
        """Update assessment"""
        self.db.commit()
        self.db.refresh(assessment)
        return assessment

    def delete_assessment(self, assessment_id: str) -> bool:
        """Delete assessment"""
        assessment = self.get_assessment(assessment_id)
        if assessment:
            self.db.delete(assessment)
            self.db.commit()
            return True
        return False

    def get_assessment_trends(self, user_id: str, days: int = 90) -> List[RiskAssessment]:
        """Get assessment trends over time"""
        start_date = datetime.now(timezone.utc) - timedelta(days=days)
        return self.db.query(RiskAssessment).filter(
            RiskAssessment.user_id == user_id,
            RiskAssessment.assessed_at >= start_date
        ).order_by(RiskAssessment.assessed_at.asc()).all()
