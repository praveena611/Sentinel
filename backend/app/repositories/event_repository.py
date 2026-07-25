from typing import Optional, List
from sqlalchemy.orm import Session

from app.models.event import EmergencyEvent
from app.models.notification import NotificationRecord


class EventRepository:
    """Repository encapsulating database persistence for EmergencyEvents and Notifications."""

    def __init__(self, db: Session):
        self.db = db

    def create_event(
        self,
        user_id: int,
        emergency_type: str,
        confidence_score: float,
        latitude: float,
        longitude: float,
        status: str = "Triggered"
    ) -> EmergencyEvent:
        """Create and persist a new EmergencyEvent record."""
        event = EmergencyEvent(
            user_id=user_id,
            emergency_type=emergency_type,
            confidence_score=confidence_score,
            latitude=latitude,
            longitude=longitude,
            status=status
        )
        self.db.add(event)
        self.db.commit()
        self.db.refresh(event)
        return event

    def create_notification_record(
        self,
        emergency_event_id: int,
        notification_status: str
    ) -> NotificationRecord:
        """Create and persist a Notification record."""
        record = NotificationRecord(
            emergency_event_id=emergency_event_id,
            notification_status=notification_status
        )
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        return record

    def get_event_by_id(self, event_id: int, user_id: int) -> Optional[EmergencyEvent]:
        """Fetch an EmergencyEvent by ID belonging to user."""
        return self.db.query(EmergencyEvent).filter(
            EmergencyEvent.id == event_id,
            EmergencyEvent.user_id == user_id
        ).first()

    def get_user_events(self, user_id: int, limit: int = 50) -> List[EmergencyEvent]:
        """Fetch recent emergency events for a user."""
        return self.db.query(EmergencyEvent).filter(
            EmergencyEvent.user_id == user_id
        ).order_by(EmergencyEvent.created_at.desc()).limit(limit).all()
