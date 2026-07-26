from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.ai.text_classifier import text_classifier_engine
from app.ai.voice_transcriber import voice_transcriber_engine
from app.ai.image_detector import image_detector_engine
from app.services.fusion_engine import fusion_engine
from app.services.context_engine import context_engine
from app.services.risk_engine import risk_engine
from app.services.xai_engine import xai_engine
from app.repositories.event_repository import EventRepository
from app.repositories.prediction_repository import PredictionRepository
from app.repositories.intelligence_repository import IntelligenceRepository
from app.notifications.notification_service import NtfyNotificationService
from app.models.user import User
from app.schemas.intelligence import (
    MultimodalAnalysisRequest,
    MultimodalAnalysisResponse,
    ContextIntelligenceDTO,
    FusedEvidenceDTO,
    XAIExplanationDTO,
)
from app.schemas.sos import SOSEventResponse, NotificationResponse


class EmergencyOrchestrator:
    """
    Master Emergency Orchestrator for SentinelAI.
    Coordinates Multimodal Ingestion -> Decision Fusion -> Context -> Risk Scoring -> XAI -> Persistence -> Ntfy Push Dispatch.
    """

    def __init__(self, db: Session):
        self.db = db
        self.event_repo = EventRepository(db)
        self.pred_repo = PredictionRepository(db)
        self.intel_repo = IntelligenceRepository(db)
        self.notification_service = NtfyNotificationService()

    def process_multimodal_emergency(
        self,
        user: User,
        latitude: float,
        longitude: float,
        text_prompt: Optional[str] = None,
        audio_bytes: Optional[bytes] = None,
        image_bytes: Optional[bytes] = None,
        is_manual_sos: bool = False,
        speed_kmh: float = 0.0
    ) -> MultimodalAnalysisResponse:
        """
        Execute full Master Emergency Intelligence Pipeline:
        1. Modality Inferences (DistilBERT / Whisper / YOLOv8 / Manual SOS)
        2. Multimodal Decision Fusion
        3. Ambient Context Intelligence
        4. 0-100 Risk Assessment & Severity Mapping
        5. Explainable AI (XAI) Reason Generation
        6. DB Persistence Across All Tables
        7. Real-Time Push Dispatch via Ntfy
        """
        evidence_items = []

        # 1. Ingest Manual SOS Evidence
        if is_manual_sos:
            evidence_items.append({
                "modality": "Manual SOS",
                "prediction": "Medical",
                "confidence": 1.0
            })

        # 2. Ingest Text Evidence (DistilBERT)
        if text_prompt and text_prompt.strip():
            text_res = text_classifier_engine.predict(text_prompt)
            evidence_items.append({
                "modality": "Text",
                "prediction": text_res["prediction"],
                "confidence": text_res["confidence"]
            })

        # 3. Ingest Voice Evidence (Whisper STT + DistilBERT)
        if audio_bytes and len(audio_bytes) > 500:
            voice_stt = voice_transcriber_engine.transcribe(audio_bytes)
            if voice_stt.get("has_speech", True):
                voice_res = text_classifier_engine.predict(voice_stt["text"])
                evidence_items.append({
                    "modality": "Voice",
                    "prediction": voice_res["prediction"],
                    "confidence": voice_res["confidence"]
                })

        # 4. Ingest Image Evidence (YOLOv8)
        if image_bytes and len(image_bytes) > 200:
            image_res = image_detector_engine.detect(image_bytes)
            if image_res.get("has_emergency_objects", True):
                evidence_items.append({
                    "modality": "Image",
                    "prediction": image_res["prediction"],
                    "confidence": image_res["confidence"]
                })

        # Fallback if no specific modality triggered
        if not evidence_items:
            evidence_items.append({
                "modality": "Manual SOS",
                "prediction": "Medical",
                "confidence": 0.85
            })

        # 5. Multimodal Decision Fusion
        fused = fusion_engine.fuse_evidence(evidence_items)
        primary_threat = fused["primary_threat"]
        fused_confidence = fused["fused_confidence"]

        # 6. Context Intelligence Evaluation
        context_res = context_engine.evaluate_context(
            latitude=latitude,
            longitude=longitude,
            speed_kmh=speed_kmh
        )

        # 7. Risk Assessment Engine (0-100 Score & Severity)
        risk_res = risk_engine.calculate_risk(
            fused_confidence=fused_confidence,
            context_risk_delta=context_res["context_risk_delta"],
            is_manual_sos=is_manual_sos
        )
        risk_score = risk_res["risk_score"]
        severity_level = risk_res["severity_level"]

        # 8. Explainable AI (XAI) Summary Generation
        xai_res = xai_engine.generate_explanation(
            risk_score=risk_score,
            severity_level=severity_level,
            primary_threat=primary_threat,
            fused_confidence=fused_confidence,
            active_modalities=fused["active_modalities"],
            context_details=context_res
        )

        # 9. DB Persistence Across All Tables
        emergency_type = f"{primary_threat} Emergency [{severity_level.upper()} RISK: {risk_score:.0f}/100]"

        event = self.event_repo.create_event(
            user_id=user.id,
            emergency_type=emergency_type,
            confidence_score=fused_confidence,
            latitude=latitude,
            longitude=longitude,
            status="Emergency Detected",
        )

        # Store Predictions
        for item in evidence_items:
            self.pred_repo.create_prediction(
                emergency_event_id=event.id,
                modality=item["modality"],
                prediction=item["prediction"],
                confidence=item["confidence"]
            )

        # Store RiskAssessment
        self.intel_repo.create_risk_assessment(
            emergency_event_id=event.id,
            risk_score=risk_score,
            severity_level=severity_level,
            primary_threat=primary_threat,
            fused_confidence=fused_confidence,
            explanation_summary=xai_res["summary_reason"]
        )

        # Store ContextData
        self.intel_repo.create_context_data(
            emergency_event_id=event.id,
            time_of_day=context_res["time_of_day"],
            location_type=context_res["location_type"],
            weather_condition=context_res["weather_condition"],
            user_speed_kmh=context_res["user_speed_kmh"],
            context_risk_delta=context_res["context_risk_delta"]
        )

        # 10. Broadcast Push Alert via NtfyNotificationService
        dispatch_result = self.notification_service.send_sos_alert(
            user_name=user.full_name,
            emergency_type=emergency_type,
            confidence_score=fused_confidence,
            latitude=latitude,
            longitude=longitude,
            status="Emergency Detected",
            created_at=event.created_at
        )

        notification_status = dispatch_result.get("status", "FAILED")
        notification_record = self.event_repo.create_notification_record(
            emergency_event_id=event.id,
            notification_status=notification_status
        )

        # 11. Format Response DTO
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
            notification=notification_dto
        )

        fused_dto = FusedEvidenceDTO(**fused)
        context_dto = ContextIntelligenceDTO(**context_res)
        xai_dto = XAIExplanationDTO(**xai_res)

        return MultimodalAnalysisResponse(
            risk_score=risk_score,
            severity_level=severity_level,
            primary_threat=primary_threat,
            fused_confidence=fused_confidence,
            explanation=xai_dto,
            fusion_details=fused_dto,
            context_details=context_dto,
            event=event_dto
        )
