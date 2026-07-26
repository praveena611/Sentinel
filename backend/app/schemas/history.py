from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.schemas.ai import PredictionRecordResponse


class IncidentListItemResponse(BaseModel):
    """Schema for incident list item in audit log grid."""
    id: int
    emergency_type: str
    confidence_score: float
    latitude: float
    longitude: float
    status: str
    created_at: datetime
    google_maps_url: str
    risk_score: Optional[float] = 75.0
    severity_level: Optional[str] = "High"
    primary_threat: Optional[str] = "Medical"
    explanation_summary: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class IncidentDetailResponse(BaseModel):
    """Schema for detailed incident audit view."""
    id: int
    user_id: int
    emergency_type: str
    confidence_score: float
    latitude: float
    longitude: float
    status: str
    created_at: datetime
    google_maps_url: str
    risk_score: float
    severity_level: str
    primary_threat: str
    explanation_summary: str
    time_of_day: str
    location_type: str
    weather_condition: str
    user_speed_kmh: float
    context_risk_delta: float
    predictions: List[PredictionRecordResponse]
    notification_status: Optional[str] = "SUCCESS"

    model_config = ConfigDict(from_attributes=True)


class IncidentPaginatedResponse(BaseModel):
    """Schema for paginated list of incidents."""
    total: int
    page: int
    limit: int
    incidents: List[IncidentListItemResponse]
