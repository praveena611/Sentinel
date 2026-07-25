from fastapi import APIRouter, Depends, status
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
from app.services.ai_service import AIService

router = APIRouter()


@router.post(
    "/text/predict",
    response_model=TextPredictionResponse,
    status_code=status.HTTP_200_OK,
    summary="Predict emergency classification from text",
    description="Analyzes input text using DistilBERT NLP classifier and returns predicted emergency category (Medical, Crime, Fire, Accident, Disaster) and confidence score."
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
