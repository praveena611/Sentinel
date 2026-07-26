from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.ai.text_classifier import text_classifier_engine
from app.ai.voice_transcriber import voice_transcriber_engine
from app.ai.image_detector import image_detector_engine
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
from app.schemas.voice import (
    VoiceTranscribeResponse,
    VoiceDispatchResponse,
)
from app.schemas.image import (
    ImagePredictionResponse,
    ImageDispatchResponse,
    DetectedObject,
)
from app.schemas.sos import SOSEventResponse, NotificationResponse


class AIService:
    """
    Service orchestrating Multimodal AI Emergency Detection and full Emergency Pipeline.
    Supports Text (DistilBERT), Voice (OpenAI Whisper STT), and Image (YOLOv8) modalities.
    """

    def __init__(self, db: Session):
        self.db = db
        self.event_repo = EventRepository(db)
        self.pred_repo = PredictionRepository(db)
        self.notification_service = NtfyNotificationService()

    # --- TEXT MODALITY ---
    def predict_text(self, payload: TextPredictionRequest) -> TextPredictionResponse:
        """Run AI text classification and return prediction result."""
        res = text_classifier_engine.predict(payload.text)
        return TextPredictionResponse(**res)

    def analyze_and_dispatch_text(
        self, payload: TextDispatchRequest, user: User
    ) -> TextDispatchResponse:
        """Execute full Emergency Pipeline for AI Text Detection."""
        prediction_result = text_classifier_engine.predict(payload.text)
        emergency_type = f"{prediction_result['prediction']} Emergency"
        confidence_score = prediction_result["confidence"]

        event = self.event_repo.create_event(
            user_id=user.id,
            emergency_type=emergency_type,
            confidence_score=confidence_score,
            latitude=payload.latitude,
            longitude=payload.longitude,
            status="Emergency Detected",
        )

        pred_record = self.pred_repo.create_prediction(
            emergency_event_id=event.id,
            modality="Text",
            prediction=prediction_result["prediction"],
            confidence=confidence_score,
        )

        dispatch_result = self.notification_service.send_sos_alert(
            user_name=user.full_name,
            emergency_type=emergency_type,
            confidence_score=confidence_score,
            latitude=payload.latitude,
            longitude=payload.longitude,
            status="Emergency Detected",
            created_at=event.created_at,
        )

        notification_status = dispatch_result.get("status", "FAILED")
        notification_record = self.event_repo.create_notification_record(
            emergency_event_id=event.id,
            notification_status=notification_status,
        )

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

    # --- VOICE MODALITY ---
    def transcribe_voice(self, audio_bytes: bytes, filename: str) -> VoiceTranscribeResponse:
        """Transcribe voice audio bytes to text using OpenAI Whisper."""
        res = voice_transcriber_engine.transcribe(audio_bytes, filename)
        return VoiceTranscribeResponse(
            text=res["text"],
            language=res.get("language", "en"),
            duration=res.get("duration", 3.0),
            model="OpenAI Whisper",
        )

    def analyze_and_dispatch_voice(
        self, audio_bytes: bytes, filename: str, latitude: float, longitude: float, user: User
    ) -> VoiceDispatchResponse:
        """Execute full Emergency Pipeline for AI Voice Detection."""
        transcribe_res = voice_transcriber_engine.transcribe(audio_bytes, filename)
        transcribed_text = transcribe_res["text"]

        if not transcribe_res.get("has_speech", True):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No spoken speech detected in audio recording. Please speak clearly into your microphone when recording."
            )

        prediction_result = text_classifier_engine.predict(transcribed_text)
        prediction_result["modality"] = "Voice"
        prediction_result["model"] = "OpenAI Whisper + DistilBERT"

        emergency_type = f"{prediction_result['prediction']} Emergency (Voice)"
        confidence_score = prediction_result["confidence"]

        event = self.event_repo.create_event(
            user_id=user.id,
            emergency_type=emergency_type,
            confidence_score=confidence_score,
            latitude=latitude,
            longitude=longitude,
            status="Emergency Detected",
        )

        pred_record = self.pred_repo.create_prediction(
            emergency_event_id=event.id,
            modality="Voice",
            prediction=prediction_result["prediction"],
            confidence=confidence_score,
        )

        dispatch_result = self.notification_service.send_sos_alert(
            user_name=user.full_name,
            emergency_type=emergency_type,
            confidence_score=confidence_score,
            latitude=latitude,
            longitude=longitude,
            status="Emergency Detected",
            created_at=event.created_at,
        )

        notification_status = dispatch_result.get("status", "FAILED")
        notification_record = self.event_repo.create_notification_record(
            emergency_event_id=event.id,
            notification_status=notification_status,
        )

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
        transcribe_dto = VoiceTranscribeResponse(
            text=transcribed_text,
            language=transcribe_res.get("language", "en"),
            duration=transcribe_res.get("duration", 3.0),
            model="OpenAI Whisper",
        )

        return VoiceDispatchResponse(
            transcription=transcribe_dto,
            prediction=pred_dto,
            event=event_dto,
            prediction_record=pred_record_dto,
        )

    # --- IMAGE MODALITY (YOLOv8) ---
    def predict_image(self, image_bytes: bytes, filename: str) -> ImagePredictionResponse:
        """Run YOLOv8 object detection on image and return predictions."""
        res = image_detector_engine.detect(image_bytes, filename)
        detected_dtos = [DetectedObject(**obj) for obj in res["detected_objects"]]
        return ImagePredictionResponse(
            detected_objects=detected_dtos,
            prediction=res["prediction"],
            confidence=res["confidence"],
            modality="Image",
            model=res["model"],
            has_emergency_objects=res["has_emergency_objects"],
            summary=res["summary"]
        )

    def analyze_and_dispatch_image(
        self, image_bytes: bytes, filename: str, latitude: float, longitude: float, user: User
    ) -> ImageDispatchResponse:
        """
        Execute full Emergency Pipeline for AI Image Detection (YOLOv8):
        1. Run YOLOv8 computer vision object detection (Fire, Smoke, Accident, Weapon, Person Lying Down)
        2. Map detected target into emergency category and confidence score
        3. Create EmergencyEvent DB record
        4. Create Prediction DB record (modality="Image")
        5. Publish Ntfy alert to ntfy.sh
        6. Create Notification DB record
        7. Return complete dispatch result
        """
        # 1. YOLOv8 Vision Detection
        detection_res = image_detector_engine.detect(image_bytes, filename)
        emergency_type = f"{detection_res['prediction']} Emergency (Vision)"
        confidence_score = detection_res["confidence"]

        # 2. Store Emergency Event
        event = self.event_repo.create_event(
            user_id=user.id,
            emergency_type=emergency_type,
            confidence_score=confidence_score,
            latitude=latitude,
            longitude=longitude,
            status="Emergency Detected",
        )

        # 3. Store Prediction Record (modality="Image")
        pred_record = self.pred_repo.create_prediction(
            emergency_event_id=event.id,
            modality="Image",
            prediction=detection_res["prediction"],
            confidence=confidence_score,
        )

        # 4. Broadcast Notification via NtfyNotificationService
        dispatch_result = self.notification_service.send_sos_alert(
            user_name=user.full_name,
            emergency_type=emergency_type,
            confidence_score=confidence_score,
            latitude=latitude,
            longitude=longitude,
            status="Emergency Detected",
            created_at=event.created_at,
        )

        # 5. Store Notification Record
        notification_status = dispatch_result.get("status", "FAILED")
        notification_record = self.event_repo.create_notification_record(
            emergency_event_id=event.id,
            notification_status=notification_status,
        )

        # 6. Build Response
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
        detected_dtos = [DetectedObject(**obj) for obj in detection_res["detected_objects"]]
        image_pred_dto = ImagePredictionResponse(
            detected_objects=detected_dtos,
            prediction=detection_res["prediction"],
            confidence=detection_res["confidence"],
            modality="Image",
            model=detection_res["model"],
            has_emergency_objects=detection_res["has_emergency_objects"],
            summary=detection_res["summary"]
        )

        return ImageDispatchResponse(
            prediction=image_pred_dto,
            event=event_dto,
            prediction_record=pred_record_dto,
        )
