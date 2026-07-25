from typing import List
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.api.v1.deps import get_current_user
from app.models.user import User
from app.schemas.location import LocationPinResponse
from app.repositories.event_repository import EventRepository

router = APIRouter()


@router.get(
    "/recent",
    response_model=List[LocationPinResponse],
    status_code=status.HTTP_200_OK,
    summary="Get user's recent emergency location pins",
    description="Returns list of recent emergency events with GPS coordinates for rendering map pins."
)
def get_recent_locations(
    limit: int = Query(20, ge=1, le=100, description="Max number of location pins to return"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> List[LocationPinResponse]:
    """Retrieve recent emergency locations for authenticated user."""
    event_repo = EventRepository(db)
    events = event_repo.get_user_events(user_id=current_user.id, limit=limit)

    results = []
    for e in events:
        maps_url = f"https://maps.google.com/?q={e.latitude},{e.longitude}"
        results.append(
            LocationPinResponse(
                id=e.id,
                emergency_type=e.emergency_type,
                confidence_score=e.confidence_score,
                latitude=e.latitude,
                longitude=e.longitude,
                status=e.status,
                created_at=e.created_at,
                google_maps_url=maps_url
            )
        )

    return results
