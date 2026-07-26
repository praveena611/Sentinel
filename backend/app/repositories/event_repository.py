from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.event import EmergencyEvent
from app.models.notification import NotificationRecord
from app.models.risk_assessment import RiskAssessment
from app.models.context_data import ContextData
from app.models.prediction import Prediction


class EventRepository:
    """Repository handling database operations for EmergencyEvent and incident audit log."""

    def __init__(self, db: Session):
        self.db = db

    def create_event(
        self,
        user_id: int,
        emergency_type: str,
        confidence_score: float,
        latitude: float,
        longitude: float,
        status: str = "Emergency Detected"
    ) -> EmergencyEvent:
        """Create and persist a new EmergencyEvent."""
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

    def get_event_by_id(self, event_id: int, user_id: int) -> Optional[EmergencyEvent]:
        """Fetch emergency event by ID belonging to user."""
        return self.db.query(EmergencyEvent).filter(
            EmergencyEvent.id == event_id,
            EmergencyEvent.user_id == user_id
        ).first()

    def get_user_events(self, user_id: int, limit: int = 20) -> List[EmergencyEvent]:
        """Fetch recent emergency events for a user ordered by timestamp descending."""
        return self.db.query(EmergencyEvent).filter(
            EmergencyEvent.user_id == user_id
        ).order_by(desc(EmergencyEvent.created_at)).limit(limit).all()

    def query_user_incidents(
        self,
        user_id: int,
        severity: Optional[str] = None,
        modality: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        limit: int = 10
    ) -> Tuple[List[EmergencyEvent], int]:
        """
        Query paginated emergency events for audit log with optional severity and search filtering.
        """
        query = self.db.query(EmergencyEvent).filter(EmergencyEvent.user_id == user_id)

        if search:
            query = query.filter(EmergencyEvent.emergency_type.ilike(f"%{search}%"))

        total = query.count()
        offset = (page - 1) * limit
        events = query.order_by(desc(EmergencyEvent.created_at)).offset(offset).limit(limit).all()

        return events, total

    def delete_event(self, event_id: int, user_id: int) -> bool:
        """Delete an emergency event and all associated child records cleanly."""
        event = self.get_event_by_id(event_id, user_id)
        if not event:
            return False

        # Cascade delete child records manually to satisfy SQLite FK constraints
        self.db.query(NotificationRecord).filter(NotificationRecord.emergency_event_id == event_id).delete()
        self.db.query(Prediction).filter(Prediction.emergency_event_id == event_id).delete()
        self.db.query(RiskAssessment).filter(RiskAssessment.emergency_event_id == event_id).delete()
        self.db.query(ContextData).filter(ContextData.emergency_event_id == event_id).delete()

        self.db.delete(event)
        self.db.commit()
        return True

    def create_notification_record(
        self,
        emergency_event_id: int,
        notification_status: str
    ) -> NotificationRecord:
        """Create and persist a NotificationRecord."""
        record = NotificationRecord(
            emergency_event_id=emergency_event_id,
            notification_status=notification_status
        )
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        return record
