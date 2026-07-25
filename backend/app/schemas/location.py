from datetime import datetime
from pydantic import BaseModel, ConfigDict


class LocationPinResponse(BaseModel):
    """Schema for returning emergency location map markers."""
    id: int
    emergency_type: str
    confidence_score: float
    latitude: float
    longitude: float
    status: str
    created_at: datetime
    google_maps_url: str

    model_config = ConfigDict(from_attributes=True)
