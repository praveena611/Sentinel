from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

from app.schemas.sos import SOSEventResponse


class ModalityEvidenceInput(BaseModel):
    """Schema for individual evidence inputs from text, voice, image, or SOS."""
    text_prompt: Optional[str] = None
    has_voice_audio: bool = False
    has_image_vision: bool = False
    is_manual_sos: bool = False


class ContextIntelligenceDTO(BaseModel):
    """Schema for context metadata and risk delta."""
    time_of_day: str  # Day, Night, Late Night
    location_type: str  # High-Risk Zone, Commercial, Residential, Isolated
    weather_condition: str = "Clear"
    user_speed_kmh: float = 0.0
    context_risk_delta: float = 0.0


class FusedEvidenceDTO(BaseModel):
    """Schema for fused multimodal threat decision output."""
    primary_threat: str  # Medical, Crime, Fire, Accident, Disaster
    fused_confidence: float
    active_modalities: List[str]
    modality_breakdown: Dict[str, Any]


class XAIExplanationDTO(BaseModel):
    """Schema for Explainable AI (XAI) transparent reasoning."""
    severity_level: str  # Low, Medium, High, Critical
    risk_score: float  # 0.0 to 100.0
    summary_reason: str
    feature_attributions: List[str]


class MultimodalAnalysisRequest(BaseModel):
    """Schema for submitting multimodal evidence for intelligence assessment."""
    text: Optional[str] = Field(None, description="Optional emergency text input")
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    is_manual_sos: bool = Field(False)
    speed_kmh: Optional[float] = Field(0.0)


class MultimodalAnalysisResponse(BaseModel):
    """Full intelligence analysis response DTO."""
    risk_score: float  # 0.0 to 100.0
    severity_level: str  # Low, Medium, High, Critical
    primary_threat: str
    fused_confidence: float
    explanation: XAIExplanationDTO
    fusion_details: FusedEvidenceDTO
    context_details: ContextIntelligenceDTO
    event: SOSEventResponse
