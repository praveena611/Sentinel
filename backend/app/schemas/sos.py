from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class SOSTriggerRequest(BaseModel):
    """Schema for triggering a manual SOS alert."""
    latitude: float = Field(..., ge=-90.0, le=90.0, description="GPS Latitude coordinate")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="GPS Longitude coordinate")
    emergency_type: Optional[str] = Field("Manual SOS", description="Emergency classification type")


class NotificationResponse(BaseModel):
    """Schema for returning notification status details."""
    id: int
    emergency_event_id: int
    notification_status: str
    sent_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SOSEventResponse(BaseModel):
    """Schema for returning emergency event response details."""
    id: int
    user_id: int
    emergency_type: str
    confidence_score: float
    latitude: float
    longitude: float
    status: str
    created_at: datetime
    google_maps_url: str
    notification: Optional[NotificationResponse] = None

    model_config = ConfigDict(from_attributes=True)
