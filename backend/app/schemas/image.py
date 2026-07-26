from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.ai import TextPredictionResponse, PredictionRecordResponse
from app.schemas.sos import SOSEventResponse


class DetectedObject(BaseModel):
    """Schema for individual YOLOv8 detected object."""
    label: str
    category: str
    confidence: float
    box: List[int]  # [x, y, w, h]


class ImagePredictionResponse(BaseModel):
    """Schema for returning YOLOv8 image detection result."""
    detected_objects: List[DetectedObject]
    prediction: str  # Medical, Crime, Fire, Accident, Disaster
    confidence: float
    modality: str = "Image"
    model: str = "YOLOv8x-Emergency"
    has_emergency_objects: bool = True
    summary: str


class ImageDispatchResponse(BaseModel):
    """Schema for image computer vision analysis and emergency pipeline dispatch result."""
    prediction: ImagePredictionResponse
    event: SOSEventResponse
    prediction_record: PredictionRecordResponse
