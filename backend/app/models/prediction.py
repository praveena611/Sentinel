from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship as sqlalchemy_relationship

from app.database.base import Base


class Prediction(Base):
    """SQLAlchemy ORM model for Predictions table."""
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    emergency_event_id = Column(Integer, ForeignKey("emergency_events.id", ondelete="CASCADE"), nullable=False, index=True)
    modality = Column(String(50), nullable=False)  # Text, Voice, Image
    prediction = Column(String(100), nullable=False)  # Medical, Crime, Fire, Accident, Disaster
    confidence = Column(Float, nullable=False)

    # Relationship
    emergency_event = sqlalchemy_relationship("EmergencyEvent", backref="predictions")

    def __repr__(self) -> str:
        return f"<Prediction id={self.id} event_id={self.emergency_event_id} modality='{self.modality}' pred='{self.prediction}' conf={self.confidence}>"
