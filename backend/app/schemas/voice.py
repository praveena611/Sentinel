from pydantic import BaseModel, ConfigDict
from app.schemas.ai import TextPredictionResponse, PredictionRecordResponse
from app.schemas.sos import SOSEventResponse


class VoiceTranscribeResponse(BaseModel):
    """Schema for returning speech-to-text transcription result."""
    text: str
    language: str = "en"
    duration: float
    model: str = "OpenAI Whisper"


class VoiceDispatchResponse(BaseModel):
    """Schema for voice analysis and emergency pipeline dispatch result."""
    transcription: VoiceTranscribeResponse
    prediction: TextPredictionResponse
    event: SOSEventResponse
    prediction_record: PredictionRecordResponse
