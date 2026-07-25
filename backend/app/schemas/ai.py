from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict

from app.schemas.sos import SOSEventResponse


class TextPredictionRequest(BaseModel):
    """Schema for requesting AI text classification prediction."""
    text: str = Field(..., min_length=2, max_length=1000, description="Emergency text input e.g. I am being followed")


class TextPredictionResponse(BaseModel):
    """Schema for AI text classification prediction result."""
    text: str
    prediction: str  # Medical, Crime, Fire, Accident, Disaster
    confidence: float  # 0.0 to 1.0
    modality: str = "Text"
    model: str = "DistilBERT"
    is_emergency: bool = True


class TextDispatchRequest(BaseModel):
    """Schema for analyzing text emergency and executing full dispatch pipeline."""
    text: str = Field(..., min_length=2, max_length=1000, description="Emergency text description")
    latitude: float = Field(..., ge=-90.0, le=90.0, description="GPS Latitude coordinate")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="GPS Longitude coordinate")


class PredictionRecordResponse(BaseModel):
    """Schema for database Prediction record."""
    id: int
    emergency_event_id: int
    modality: str
    prediction: str
    confidence: float

    model_config = ConfigDict(from_attributes=True)


class TextDispatchResponse(BaseModel):
    """Schema for AI text analysis and dispatch result."""
    prediction: TextPredictionResponse
    event: SOSEventResponse
    prediction_record: PredictionRecordResponse
