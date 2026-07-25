from datetime import datetime
from sqlalchemy.orm import Session

from app.repositories.event_repository import EventRepository
from app.notifications.notification_service import NtfyNotificationService
from app.schemas.sos import SOSTriggerRequest, SOSEventResponse, NotificationResponse
from app.models.user import User


class SOSService:
    """
    Service orchestrating the complete Emergency Pipeline for Manual SOS:
    User Input -> Store Event -> Dispatch Ntfy Alert -> Store Notification Status -> Response
    """

    def __init__(self, db: Session):
        self.db = db
        self.event_repo = EventRepository(db)
        self.notification_service = NtfyNotificationService()

    def trigger_sos(self, payload: SOSTriggerRequest, user: User) -> SOSEventResponse:
        """Process manual SOS emergency trigger."""
        emergency_type = payload.emergency_type or "Manual SOS"
        confidence_score = 1.0  # 100% confidence for manual trigger

        # 1. Store Emergency Event
        event = self.event_repo.create_event(
            user_id=user.id,
            emergency_type=emergency_type,
            confidence_score=confidence_score,
            latitude=payload.latitude,
            longitude=payload.longitude,
            status="Emergency Detected"
        )

        # 2. Publish Notification via NtfyNotificationService
        dispatch_result = self.notification_service.send_sos_alert(
            user_name=user.full_name,
            emergency_type=emergency_type,
            confidence_score=confidence_score,
            latitude=payload.latitude,
            longitude=payload.longitude,
            status="Emergency Detected",
            created_at=event.created_at
        )

        # 3. Store Notification Record in DB
        notification_status = dispatch_result.get("status", "FAILED")
        notification_record = self.event_repo.create_notification_record(
            emergency_event_id=event.id,
            notification_status=notification_status
        )

        # 4. Build Response Payload with Google Maps Link
        google_maps_url = f"https://maps.google.com/?q={event.latitude},{event.longitude}"
        
        notification_dto = NotificationResponse.model_validate(notification_record)

        return SOSEventResponse(
            id=event.id,
            user_id=event.user_id,
            emergency_type=event.emergency_type,
            confidence_score=event.confidence_score,
            latitude=event.latitude,
            longitude=event.longitude,
            status=event.status,
            created_at=event.created_at,
            google_maps_url=google_maps_url,
            notification=notification_dto
        )
