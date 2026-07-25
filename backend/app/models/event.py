from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship as sqlalchemy_relationship

from app.database.base import Base


class EmergencyEvent(Base):
    """SQLAlchemy ORM model for EmergencyEvents table."""
    __tablename__ = "emergency_events"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    emergency_type = Column(String(100), nullable=False, default="Manual SOS")
    confidence_score = Column(Float, nullable=False, default=1.0)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    status = Column(String(50), nullable=False, default="Triggered")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = sqlalchemy_relationship("User", backref="emergency_events")

    def __repr__(self) -> str:
        return f"<EmergencyEvent id={self.id} type='{self.emergency_type}' status='{self.status}'>"
