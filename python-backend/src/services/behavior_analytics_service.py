from datetime import datetime, timedelta, timezone
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from src.repositories.transaction_repository import TransactionRepository
from src.repositories.session_repository import SessionRepository
from src.repositories.risk_assessment_repository import RiskAssessmentRepository
from src.models.risk_assessment import RiskAssessment, RiskLevel
import uuid

class BehaviorAnalyticsService:
    """Analyzes user gambling behavior for risk indicators"""
    
    def __init__(self, db: Session):
        self.db = db
        self.transaction_repository = TransactionRepository(db)
        self.session_repository = SessionRepository(db)
        self.risk_repository = RiskAssessmentRepository(db)

    async def analyze_user_behavior(self, user_id: str, days: int = 30) -> Dict:
        """Analyze user gambling behavior patterns"""
        # Get user's transactions and sessions
        start_date = datetime.now(timezone.utc) - timedelta(days=days)
        transactions = self.transaction_repository.find_by_user_id_and_date_range(
            user_id, start_date, datetime.now(timezone.utc)
        )
        
        if not transactions:
            return {
                'success': True,
                'pattern': 'insufficient_data',
                'message': 'Not enough transaction data to analyze'
            }
        
        # Calculate metrics
        total_spent = sum(t.amount for t in transactions)
        avg_transaction = total_spent / len(transactions)
        
        # Detect escalation (spending increasing over time)
        mid_point = len(transactions) // 2
        first_half_avg = sum(t.amount for t in transactions[:mid_point]) / mid_point if mid_point > 0 else 0
        second_half_avg = sum(t.amount for t in transactions[mid_point:]) / (len(transactions) - mid_point) if (len(transactions) - mid_point) > 0 else 0
        
        escalation_rate = ((second_half_avg - first_half_avg) / first_half_avg * 100) if first_half_avg > 0 else 0
        
        # Detect chasing losses (increasing bets after losses)
        chasing_incidents = 0
        for i in range(1, len(transactions)):
            if transactions[i].amount > transactions[i-1].amount * 1.5:
                chasing_incidents += 1
        
        pattern_type = 'normal'
        risk_indicators = []
        
        if escalation_rate > 50:
            pattern_type = 'escalating'
            risk_indicators.append('Significant spending escalation detected')
        
        if chasing_incidents > len(transactions) * 0.3:
            pattern_type = 'chasing_losses'
            risk_indicators.append('Potential loss-chasing behavior detected')
        
        return {
            'success': True,
            'patterns': pattern_type,
            'risk_indicators': risk_indicators,
            'generated_at': datetime.now(timezone.utc).isoformat(),
            'user_id': user_id
        }

    async def calculate_risk_score(self, user_id: str) -> Dict:
        """Calculate risk score based on multiple factors"""
        factors = {}
        total_score = 0
        
        # Factor 1: Spending pattern (0-30 points)
        spending_analysis = await self.analyze_spending_pattern(user_id, days=30)
        if spending_analysis['pattern'] == 'escalating':
            factors['spending_escalation'] = 25
        elif spending_analysis['pattern'] == 'chasing_losses':
            factors['loss_chasing'] = 30
        else:
            factors['spending_pattern'] = 5
        
        # Factor 2: Time spent gambling (0-25 points)
        time_analysis = await self.detect_time_anomalies(user_id)
        if time_analysis.get('excessive_time'):
            factors['excessive_time'] = 20
        if time_analysis.get('late_night_pattern'):
            factors['late_night_gambling'] = 15
        
        # Factor 3: Session frequency (0-20 points)
        sessions = self.session_repository.get_user_sessions(user_id, limit=100)
        recent_sessions = [s for s in sessions if (datetime.now(timezone.utc) - s.start_time).days <= 7]
        if len(recent_sessions) > 20:
            factors['high_frequency'] = 20
        elif len(recent_sessions) > 10:
            factors['moderate_frequency'] = 10
        
        # Factor 4: Limit violations (0-25 points)
        # This would check against user's set limits
        # For now, placeholder
        factors['limit_compliance'] = 5
        
        # Calculate total score
        total_score = sum(factors.values())
        risk_level = RiskAssessment.calculate_risk_level(total_score)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(factors, risk_level)
        
        # Save assessment
        assessment_id = str(uuid.uuid4())
        assessment = RiskAssessment(
            assessment_id=assessment_id,
            user_id=user_id,
            risk_score=total_score,
            risk_level=risk_level,
            factors=factors,
            assessed_at=datetime.now(timezone.utc),
            recommendations=recommendations
        )
        
        self.risk_repository.create_assessment(assessment)
        
        return {
            'success': True,
            'risk_score': total_score,
            'risk_level': risk_level.value,
            'factors': factors,
            'recommendations': recommendations
        }

    async def detect_patterns(self, user_id: str) -> Dict:
        """Detect problematic gambling patterns"""
        week_ago = datetime.now(timezone.utc) - timedelta(days=7)
        sessions = self.session_repository.get_user_sessions_since(user_id, week_ago)

    async def generate_wellness_report(self, user_id: str) -> Dict:
        """Generate personalized wellness report for user"""
        # Get risk assessment
        risk_result = await self.calculate_risk_score(user_id)
        
        # Get spending analysis
        spending_result = await self.analyze_spending_pattern(user_id, days=30)
        
        # Get time analysis
        time_result = await self.detect_time_anomalies(user_id)
        
        # Generate summary
        summary = {
            'generated_at': datetime.now(timezone.utc).isoformat(),
            'risk_assessment': {
                'score': risk_result['risk_score'],
                'level': risk_result['risk_level'],
                'factors': risk_result['factors']
            },
            'spending_patterns': spending_result,
            'time_patterns': time_result,
            'recommendations': risk_result['recommendations']
        }
        
        return {
            'success': True,
            'report': summary
        }

    def _generate_recommendations(self, factors: Dict, risk_level: RiskLevel) -> List[str]:
        """Generate personalized recommendations based on risk factors"""
        recommendations = []
        
        if 'spending_escalation' in factors or 'loss_chasing' in factors:
            recommendations.append("Consider setting stricter spending limits")
            recommendations.append("Take regular breaks between gaming sessions")
        
        if 'excessive_time' in factors:
            recommendations.append("Reduce total gaming time per week")
            recommendations.append("Set session time limits")
        
        if 'late_night_gambling' in factors:
            recommendations.append("Avoid gambling during late night hours")
            recommendations.append("Establish a regular gaming schedule")
        
        if 'high_frequency' in factors:
            recommendations.append("Consider implementing cooldown periods between sessions")
        
        if risk_level == RiskLevel.HIGH or risk_level == RiskLevel.CRITICAL:
            recommendations.append("Consider speaking with a gambling addiction counselor")
            recommendations.append("Explore self-exclusion options")
        
        if not recommendations:
            recommendations.append("Continue maintaining healthy gambling habits")
            recommendations.append("Regular self-monitoring is encouraged")
        
        return recommendations
