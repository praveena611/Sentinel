from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship as sqlalchemy_relationship
from datetime import datetime

from app.database.base import Base


class ContextData(Base):
    """SQLAlchemy ORM model for context_data table."""
    __tablename__ = "context_data"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    emergency_event_id = Column(Integer, ForeignKey("emergency_events.id", ondelete="CASCADE"), nullable=False, index=True)
    time_of_day = Column(String(50), nullable=False)  # Day, Night, Late Night
    location_type = Column(String(100), nullable=False)  # High-Risk Zone, Commercial, Residential, Isolated
    weather_condition = Column(String(100), nullable=False, default="Clear")
    user_speed_kmh = Column(Float, default=0.0)
    context_risk_delta = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationship
    emergency_event = sqlalchemy_relationship("EmergencyEvent", backref="context_data")

    def __repr__(self) -> str:
        return f"<ContextData id={self.id} time='{self.time_of_day}' location='{self.location_type}' delta={self.context_risk_delta}>"
