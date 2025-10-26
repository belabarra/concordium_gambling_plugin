from sqlalchemy.orm import Session
from src.models.operator import Operator
from typing import List, Optional
from datetime import datetime, timezone

class OperatorRepository:
    """Repository for operator data access"""
    
    def __init__(self, db: Session):
        self.db = db

    def create_operator(self, operator: Operator) -> Operator:
        """Create a new operator"""
        self.db.add(operator)
        self.db.commit()
        self.db.refresh(operator)
        return operator

    def get_operator(self, operator_id: str) -> Optional[Operator]:
        """Get operator by ID"""
        return self.db.query(Operator).filter(Operator.operator_id == operator_id).first()

    def get_operator_by_api_key(self, api_key: str) -> Optional[Operator]:
        """Get operator by API key"""
        return self.db.query(Operator).filter(Operator.api_key == api_key).first()

    def get_all_operators(self, active_only: bool = False) -> List[Operator]:
        """Get all operators"""
        query = self.db.query(Operator)
        
        if active_only:
            query = query.filter(Operator.is_active == True)
        
        return query.all()

    def update_operator(self, operator: Operator) -> Operator:
        """Update operator"""
        self.db.commit()
        self.db.refresh(operator)
        return operator

    def update_last_active(self, operator_id: str) -> bool:
        """Update operator's last active timestamp"""
        operator = self.get_operator(operator_id)
        if operator:
            operator.last_active = datetime.now(timezone.utc)
            self.db.commit()
            return True
        return False

    def deactivate_operator(self, operator_id: str) -> bool:
        """Deactivate an operator"""
        operator = self.get_operator(operator_id)
        if operator:
            operator.is_active = False
            self.db.commit()
            return True
        return False

    def delete_operator(self, operator_id: str) -> bool:
        """Delete operator"""
        operator = self.get_operator(operator_id)
        if operator:
            self.db.delete(operator)
            self.db.commit()
            return True
        return False
