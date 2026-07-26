from typing import Optional
from fastapi import APIRouter, Depends, status, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.api.v1.deps import get_current_user
from app.models.user import User
from app.schemas.intelligence import (
    MultimodalAnalysisResponse,
)
from app.services.emergency_orchestrator import EmergencyOrchestrator

router = APIRouter()


@router.post(
    "/analyze",
    response_model=MultimodalAnalysisResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Analyze multimodal evidence and execute intelligence emergency pipeline",
    description="Fuses text, voice, image, and SOS inputs, applies ambient context intelligence, calculates 0-100 risk score and severity level, generates XAI reasoning, and broadcasts push alert."
)
async def analyze_multimodal_emergency(
    text: Optional[str] = Form(None, description="Optional text description"),
    audio_file: Optional[UploadFile] = File(None, description="Optional recorded voice file"),
    image_file: Optional[UploadFile] = File(None, description="Optional scene image file"),
    is_manual_sos: bool = Form(False, description="Is manual SOS button triggered"),
    latitude: float = Form(..., ge=-90.0, le=90.0, description="GPS Latitude"),
    longitude: float = Form(..., ge=-180.0, le=180.0, description="GPS Longitude"),
    speed_kmh: float = Form(0.0, description="User velocity in km/h"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> MultimodalAnalysisResponse:
    """Master Multimodal Intelligence API Endpoint."""
    orchestrator = EmergencyOrchestrator(db)

    audio_bytes = await audio_file.read() if audio_file else None
    image_bytes = await image_file.read() if image_file else None

    return orchestrator.process_multimodal_emergency(
        user=current_user,
        latitude=latitude,
        longitude=longitude,
        text_prompt=text,
        audio_bytes=audio_bytes,
        image_bytes=image_bytes,
        is_manual_sos=is_manual_sos,
        speed_kmh=speed_kmh
    )
