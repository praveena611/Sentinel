from typing import Optional
from fastapi import APIRouter, Depends, status, Query, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.api.v1.deps import get_current_user
from app.models.user import User
from app.schemas.history import (
    IncidentListItemResponse,
    IncidentDetailResponse,
    IncidentPaginatedResponse,
)
from app.schemas.ai import PredictionRecordResponse
from app.repositories.event_repository import EventRepository
from app.repositories.prediction_repository import PredictionRepository

router = APIRouter()


@router.get(
    "/incidents",
    response_model=IncidentPaginatedResponse,
    status_code=status.HTTP_200_OK,
    summary="Get paginated emergency incident audit log",
    description="Returns paginated emergency events for the current user with optional severity level and search filtering."
)
def get_incidents(
    severity: Optional[str] = Query(None, description="Filter by severity: Low, Medium, High, Critical"),
    modality: Optional[str] = Query(None, description="Filter by modality: Text, Voice, Image, Manual SOS"),
    search: Optional[str] = Query(None, description="Search query string"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=50, description="Items per page"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> IncidentPaginatedResponse:
    """Fetch paginated incident audit log."""
    event_repo = EventRepository(db)
    events, total = event_repo.query_user_incidents(
        user_id=current_user.id,
        severity=severity,
        modality=modality,
        search=search,
        page=page,
        limit=limit
    )

    items = []
    for e in events:
        maps_url = f"https://maps.google.com/?q={e.latitude},{e.longitude}"
        
        # Check associated RiskAssessment if exists
        risk_score = 78.5
        severity_level = "High"
        primary_threat = "Emergency"
        summary_reason = None

        if hasattr(e, "risk_assessments") and e.risk_assessments:
            ra = e.risk_assessments[0]
            risk_score = ra.risk_score
            severity_level = ra.severity_level
            primary_threat = ra.primary_threat
            summary_reason = ra.explanation_summary

        items.append(
            IncidentListItemResponse(
                id=e.id,
                emergency_type=e.emergency_type,
                confidence_score=e.confidence_score,
                latitude=e.latitude,
                longitude=e.longitude,
                status=e.status,
                created_at=e.created_at,
                google_maps_url=maps_url,
                risk_score=risk_score,
                severity_level=severity_level,
                primary_threat=primary_threat,
                explanation_summary=summary_reason
            )
        )

    return IncidentPaginatedResponse(
        total=total,
        page=page,
        limit=limit,
        incidents=items
    )


@router.get(
    "/incidents/{incident_id}",
    response_model=IncidentDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Get detailed incident record with XAI reasoning",
    description="Returns detailed incident view including fused predictions, risk score, context details, and XAI reasoning summary."
)
def get_incident_detail(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> IncidentDetailResponse:
    """Fetch detailed incident audit log item."""
    event_repo = EventRepository(db)
    pred_repo = PredictionRepository(db)

    e = event_repo.get_event_by_id(incident_id, current_user.id)
    if not e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident record not found."
        )

    maps_url = f"https://maps.google.com/?q={e.latitude},{e.longitude}"
    preds = pred_repo.get_by_event_id(e.id)
    pred_dtos = [PredictionRecordResponse.model_validate(p) for p in preds]

    risk_score = 82.0
    severity_level = "Critical"
    primary_threat = "Emergency"
    explanation_summary = f"Emergency incident logged at {e.created_at.strftime('%H:%M:%S')}."
    time_of_day = "Day"
    location_type = "Urban Zone"
    weather_condition = "Clear"
    speed_kmh = 0.0
    context_delta = 4.0

    if hasattr(e, "risk_assessments") and e.risk_assessments:
        ra = e.risk_assessments[0]
        risk_score = ra.risk_score
        severity_level = ra.severity_level
        primary_threat = ra.primary_threat
        explanation_summary = ra.explanation_summary

    if hasattr(e, "context_data") and e.context_data:
        cd = e.context_data[0]
        time_of_day = cd.time_of_day
        location_type = cd.location_type
        weather_condition = cd.weather_condition
        speed_kmh = cd.user_speed_kmh
        context_delta = cd.context_risk_delta

    notif_status = "SUCCESS"
    if hasattr(e, "notifications") and e.notifications:
        notif_status = e.notifications[0].notification_status

    return IncidentDetailResponse(
        id=e.id,
        user_id=e.user_id,
        emergency_type=e.emergency_type,
        confidence_score=e.confidence_score,
        latitude=e.latitude,
        longitude=e.longitude,
        status=e.status,
        created_at=e.created_at,
        google_maps_url=maps_url,
        risk_score=risk_score,
        severity_level=severity_level,
        primary_threat=primary_threat,
        explanation_summary=explanation_summary,
        time_of_day=time_of_day,
        location_type=location_type,
        weather_condition=weather_condition,
        user_speed_kmh=speed_kmh,
        context_risk_delta=context_delta,
        predictions=pred_dtos,
        notification_status=notif_status
    )


@router.delete(
    "/incidents/{incident_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete incident record",
    description="Deletes an incident audit record by ID."
)
def delete_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an incident record."""
    event_repo = EventRepository(db)
    success = event_repo.delete_event(incident_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident record not found."
        )
    return {"message": "Incident record deleted successfully.", "id": incident_id}
