from typing import Optional, List
from sqlalchemy.orm import Session

from app.models.risk_assessment import RiskAssessment
from app.models.context_data import ContextData


class IntelligenceRepository:
    """Repository handling database persistence for risk_assessments and context_data."""

    def __init__(self, db: Session):
        self.db = db

    def create_risk_assessment(
        self,
        emergency_event_id: int,
        risk_score: float,
        severity_level: str,
        primary_threat: str,
        fused_confidence: float,
        explanation_summary: str
    ) -> RiskAssessment:
        """Create and persist a RiskAssessment record."""
        assessment = RiskAssessment(
            emergency_event_id=emergency_event_id,
            risk_score=risk_score,
            severity_level=severity_level,
            primary_threat=primary_threat,
            fused_confidence=fused_confidence,
            explanation_summary=explanation_summary
        )
        self.db.add(assessment)
        self.db.commit()
        self.db.refresh(assessment)
        return assessment

    def create_context_data(
        self,
        emergency_event_id: int,
        time_of_day: str,
        location_type: str,
        weather_condition: str,
        user_speed_kmh: float,
        context_risk_delta: float
    ) -> ContextData:
        """Create and persist a ContextData record."""
        context_rec = ContextData(
            emergency_event_id=emergency_event_id,
            time_of_day=time_of_day,
            location_type=location_type,
            weather_condition=weather_condition,
            user_speed_kmh=user_speed_kmh,
            context_risk_delta=context_risk_delta
        )
        self.db.add(context_rec)
        self.db.commit()
        self.db.refresh(context_rec)
        return context_rec
