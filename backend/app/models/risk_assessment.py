from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship as sqlalchemy_relationship
from datetime import datetime

from app.database.base import Base


class RiskAssessment(Base):
    """SQLAlchemy ORM model for risk_assessments table."""
    __tablename__ = "risk_assessments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    emergency_event_id = Column(Integer, ForeignKey("emergency_events.id", ondelete="CASCADE"), nullable=False, index=True)
    risk_score = Column(Float, nullable=False)  # 0.0 to 100.0
    severity_level = Column(String(50), nullable=False)  # Low, Medium, High, Critical
    primary_threat = Column(String(100), nullable=False)
    fused_confidence = Column(Float, nullable=False)
    explanation_summary = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationship
    emergency_event = sqlalchemy_relationship("EmergencyEvent", backref="risk_assessments")

    def __repr__(self) -> str:
        return f"<RiskAssessment id={self.id} score={self.risk_score} severity='{self.severity_level}' threat='{self.primary_threat}'>"
