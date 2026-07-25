from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship as sqlalchemy_relationship

from app.database.base import Base


class NotificationRecord(Base):
    """SQLAlchemy ORM model for Notifications table."""
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    emergency_event_id = Column(Integer, ForeignKey("emergency_events.id", ondelete="CASCADE"), nullable=False, index=True)
    notification_status = Column(String(50), nullable=False)  # SUCCESS, FAILED
    sent_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationship
    emergency_event = sqlalchemy_relationship("EmergencyEvent", backref="notifications")

    def __repr__(self) -> str:
        return f"<NotificationRecord id={self.id} event_id={self.emergency_event_id} status='{self.notification_status}'>"
