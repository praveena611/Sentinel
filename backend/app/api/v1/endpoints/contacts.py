from typing import List, Optional
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.api.v1.deps import get_current_user
from app.models.user import User
from app.schemas.contact import ContactCreate, ContactUpdate, ContactResponse
from app.services.contact_service import ContactService

router = APIRouter()


@router.get(
    "/",
    response_model=List[ContactResponse],
    status_code=status.HTTP_200_OK,
    summary="List user's emergency contacts",
    description="Returns list of emergency contacts created by current user. Supports optional search filter by name, phone, or relationship."
)
def list_contacts(
    search: Optional[str] = Query(None, description="Optional search query"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> List[ContactResponse]:
    """Retrieve all contacts for authenticated user."""
    contact_service = ContactService(db)
    return contact_service.list_contacts(current_user.id, search)


@router.post(
    "/",
    response_model=ContactResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create an emergency contact",
    description="Creates a new trusted emergency contact for the current user."
)
def create_contact(
    contact_in: ContactCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> ContactResponse:
    """Create new contact endpoint."""
    contact_service = ContactService(db)
    return contact_service.create_contact(contact_in, current_user.id)


@router.get(
    "/{contact_id}",
    response_model=ContactResponse,
    status_code=status.HTTP_200_OK,
    summary="Get emergency contact by ID",
    description="Retrieves single emergency contact by ID if owned by current user."
)
def get_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> ContactResponse:
    """Retrieve specific contact by ID."""
    contact_service = ContactService(db)
    return contact_service.get_contact(contact_id, current_user.id)


@router.put(
    "/{contact_id}",
    response_model=ContactResponse,
    status_code=status.HTTP_200_OK,
    summary="Update emergency contact",
    description="Updates existing emergency contact details."
)
def update_contact(
    contact_id: int,
    contact_in: ContactUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> ContactResponse:
    """Update contact endpoint."""
    contact_service = ContactService(db)
    return contact_service.update_contact(contact_id, contact_in, current_user.id)


@router.delete(
    "/{contact_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete emergency contact",
    description="Deletes emergency contact by ID."
)
def delete_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete contact endpoint."""
    contact_service = ContactService(db)
    contact_service.delete_contact(contact_id, current_user.id)
    return None
