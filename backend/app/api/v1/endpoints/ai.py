from fastapi import APIRouter, Depends, status, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.api.v1.deps import get_current_user
from app.models.user import User
from app.schemas.ai import (
    TextPredictionRequest,
    TextPredictionResponse,
    TextDispatchRequest,
    TextDispatchResponse,
)
from app.schemas.voice import (
    VoiceTranscribeResponse,
    VoiceDispatchResponse,
)
from app.schemas.image import (
    ImagePredictionResponse,
    ImageDispatchResponse,
)
from app.services.ai_service import AIService

router = APIRouter()


# --- TEXT ENDPOINTS ---
@router.post(
    "/text/predict",
    response_model=TextPredictionResponse,
    status_code=status.HTTP_200_OK,
    summary="Predict emergency classification from text",
    description="Analyzes input text using DistilBERT NLP classifier and returns predicted emergency category and confidence score."
)
def predict_text(
    payload: TextPredictionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> TextPredictionResponse:
    """Classify text emergency intent."""
    ai_service = AIService(db)
    return ai_service.predict_text(payload)


@router.post(
    "/text/analyze-and-dispatch",
    response_model=TextDispatchResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Analyze text and execute emergency dispatch pipeline",
    description="Classifies text emergency intent, persists event and prediction records in database, and broadcasts real-time push alert to trusted contacts via ntfy.sh."
)
def analyze_and_dispatch_text(
    payload: TextDispatchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> TextDispatchResponse:
    """Full AI text detection & emergency dispatch pipeline."""
    ai_service = AIService(db)
    return ai_service.analyze_and_dispatch_text(payload, current_user)


# --- VOICE ENDPOINTS ---
@router.post(
    "/voice/transcribe",
    response_model=VoiceTranscribeResponse,
    status_code=status.HTTP_200_OK,
    summary="Transcribe voice audio to text using OpenAI Whisper",
    description="Transcribes an uploaded audio recording (.webm, .wav, .mp3, .m4a) to text using OpenAI Whisper."
)
async def transcribe_voice(
    audio_file: UploadFile = File(..., description="Recorded emergency audio file"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> VoiceTranscribeResponse:
    """Voice speech-to-text transcription endpoint."""
    ai_service = AIService(db)
    audio_bytes = await audio_file.read()
    return ai_service.transcribe_voice(audio_bytes, audio_file.filename or "audio.webm")


@router.post(
    "/voice/analyze-and-dispatch",
    response_model=VoiceDispatchResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Transcribe voice, classify intent, and execute emergency dispatch",
    description="Transcribes audio via OpenAI Whisper, classifies emergency intent via DistilBERT, records event and prediction (modality='Voice'), and broadcasts real-time alert via ntfy.sh."
)
async def analyze_and_dispatch_voice(
    audio_file: UploadFile = File(..., description="Recorded emergency audio file"),
    latitude: float = Form(..., ge=-90.0, le=90.0, description="GPS Latitude coordinate"),
    longitude: float = Form(..., ge=-180.0, le=180.0, description="GPS Longitude coordinate"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> VoiceDispatchResponse:
    """Full AI voice emergency pipeline dispatch endpoint."""
    ai_service = AIService(db)
    audio_bytes = await audio_file.read()
    return ai_service.analyze_and_dispatch_voice(
        audio_bytes=audio_bytes,
        filename=audio_file.filename or "audio.webm",
        latitude=latitude,
        longitude=longitude,
        user=current_user
    )


# --- IMAGE ENDPOINTS (YOLOv8) ---
@router.post(
    "/image/predict",
    response_model=ImagePredictionResponse,
    status_code=status.HTTP_200_OK,
    summary="Detect emergency objects in image using YOLOv8",
    description="Analyzes image using YOLOv8 object detector for Fire, Smoke, Vehicle Accident, Weapon, and Person Lying Down without dispatching alert."
)
async def predict_image(
    image_file: UploadFile = File(..., description="Emergency scene image file"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> ImagePredictionResponse:
    """Image YOLOv8 computer vision object detection endpoint."""
    ai_service = AIService(db)
    image_bytes = await image_file.read()
    return ai_service.predict_image(image_bytes, image_file.filename or "image.jpg")


@router.post(
    "/image/analyze-and-dispatch",
    response_model=ImageDispatchResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Detect objects via YOLOv8 and execute emergency dispatch",
    description="Detects emergency objects in image via YOLOv8, classifies category, records event and prediction (modality='Image'), and broadcasts push alert via ntfy.sh."
)
async def analyze_and_dispatch_image(
    image_file: UploadFile = File(..., description="Emergency scene image file"),
    latitude: float = Form(..., ge=-90.0, le=90.0, description="GPS Latitude coordinate"),
    longitude: float = Form(..., ge=-180.0, le=180.0, description="GPS Longitude coordinate"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> ImageDispatchResponse:
    """Full AI image emergency pipeline dispatch endpoint."""
    ai_service = AIService(db)
    image_bytes = await image_file.read()
    return ai_service.analyze_and_dispatch_image(
        image_bytes=image_bytes,
        filename=image_file.filename or "image.jpg",
        latitude=latitude,
        longitude=longitude,
        user=current_user
    )
