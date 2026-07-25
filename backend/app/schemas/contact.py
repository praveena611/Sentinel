from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class ContactBase(BaseModel):
    """Base properties for emergency contact."""
    contact_name: str = Field(..., min_length=2, max_length=255, description="Full name of contact")
    phone_number: str = Field(..., min_length=5, max_length=50, description="Phone number with country code")
    relationship: str = Field(..., min_length=2, max_length=100, description="Relationship to user e.g. Spouse, Parent, Friend")


class ContactCreate(ContactBase):
    """Schema for creating a new emergency contact."""
    pass


class ContactUpdate(BaseModel):
    """Schema for updating an existing emergency contact."""
    contact_name: Optional[str] = Field(None, min_length=2, max_length=255)
    phone_number: Optional[str] = Field(None, min_length=5, max_length=50)
    relationship: Optional[str] = Field(None, min_length=2, max_length=100)


class ContactResponse(ContactBase):
    """Schema for returning emergency contact data."""
    id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
