from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.api.v1.deps import get_current_user
from app.models.user import User
from app.schemas.sos import SOSTriggerRequest, SOSEventResponse
from app.services.sos_service import SOSService

router = APIRouter()


@router.get(
    "/",
    status_code=status.HTTP_200_OK,
    summary="SOS module overview",
    description="Returns informational overview for the manual SOS endpoint."
)
def sos_info():
    """Informational GET endpoint for /api/v1/sos."""
    return {
        "service": "SentinelAI Manual SOS Module",
        "action": "Use POST /api/v1/sos/trigger to dispatch emergency alerts",
        "docs": "/docs"
    }


@router.post(
    "/trigger",
    response_model=SOSEventResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Trigger manual SOS emergency alert",
    description="Captures live user location, persists emergency event in database, and publishes real-time push alert to trusted contacts via ntfy.sh."
)
def trigger_sos(
    payload: SOSTriggerRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> SOSEventResponse:
    """Manual SOS trigger endpoint."""
    sos_service = SOSService(db)
    return sos_service.trigger_sos(payload, current_user)
