from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.ai.text_classifier import text_classifier_engine
from app.repositories.event_repository import EventRepository
from app.repositories.prediction_repository import PredictionRepository
from app.notifications.notification_service import NtfyNotificationService
from app.models.user import User
from app.schemas.ai import (
    TextPredictionRequest,
    TextPredictionResponse,
    TextDispatchRequest,
    TextDispatchResponse,
    PredictionRecordResponse,
)
from app.schemas.sos import SOSEventResponse, NotificationResponse


class AIService:
    """
    Service orchestrating AI Emergency Detection and full Emergency Pipeline.
    User Input (Text) -> AI Processing -> Emergency Classification -> Confidence Score -> Acquire Location -> Store Event -> Store Prediction -> Ntfy Alert -> Store Notification -> Update Dashboard
    """

    def __init__(self, db: Session):
        self.db = db
        self.event_repo = EventRepository(db)
        self.pred_repo = PredictionRepository(db)
        self.notification_service = NtfyNotificationService()

    def predict_text(self, payload: TextPredictionRequest) -> TextPredictionResponse:
        """Run AI text classification and return prediction result."""
        res = text_classifier_engine.predict(payload.text)
        return TextPredictionResponse(**res)

    def analyze_and_dispatch_text(
        self, payload: TextDispatchRequest, user: User
    ) -> TextDispatchResponse:
        """
        Execute full Emergency Pipeline for AI Text Detection:
        1. Classify text emergency type and confidence score
        2. Create EmergencyEvent in DB
        3. Create Prediction record in DB
        4. Broadcast push notification via NtfyNotificationService
        5. Create Notification record in DB
        6. Return complete dispatch result
        """
        # 1. AI Text Classification
        prediction_result = text_classifier_engine.predict(payload.text)
        emergency_type = f"{prediction_result['prediction']} Emergency"
        confidence_score = prediction_result["confidence"]

        # 2. Store Emergency Event
        event = self.event_repo.create_event(
            user_id=user.id,
            emergency_type=emergency_type,
            confidence_score=confidence_score,
            latitude=payload.latitude,
            longitude=payload.longitude,
            status="Emergency Detected",
        )

        # 3. Store Prediction Record in DB
        pred_record = self.pred_repo.create_prediction(
            emergency_event_id=event.id,
            modality="Text",
            prediction=prediction_result["prediction"],
            confidence=confidence_score,
        )

        # 4. Broadcast Notification via NtfyNotificationService
        dispatch_result = self.notification_service.send_sos_alert(
            user_name=user.full_name,
            emergency_type=emergency_type,
            confidence_score=confidence_score,
            latitude=payload.latitude,
            longitude=payload.longitude,
            status="Emergency Detected",
            created_at=event.created_at,
        )

        # 5. Store Notification Record in DB
        notification_status = dispatch_result.get("status", "FAILED")
        notification_record = self.event_repo.create_notification_record(
            emergency_event_id=event.id,
            notification_status=notification_status,
        )

        # 6. Format Response Payload
        google_maps_url = f"https://maps.google.com/?q={event.latitude},{event.longitude}"
        notification_dto = NotificationResponse.model_validate(notification_record)

        event_dto = SOSEventResponse(
            id=event.id,
            user_id=event.user_id,
            emergency_type=event.emergency_type,
            confidence_score=event.confidence_score,
            latitude=event.latitude,
            longitude=event.longitude,
            status=event.status,
            created_at=event.created_at,
            google_maps_url=google_maps_url,
            notification=notification_dto,
        )

        pred_record_dto = PredictionRecordResponse.model_validate(pred_record)
        pred_dto = TextPredictionResponse(**prediction_result)

        return TextDispatchResponse(
            prediction=pred_dto,
            event=event_dto,
            prediction_record=pred_record_dto,
        )
