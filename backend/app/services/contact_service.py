from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.contact_repository import ContactRepository
from app.schemas.contact import ContactCreate, ContactUpdate, ContactResponse
from app.models.contact import EmergencyContact


class ContactService:
    """Service handling business rules and authorization for emergency contacts."""

    def __init__(self, db: Session):
        self.contact_repo = ContactRepository(db)

    def list_contacts(self, user_id: int, search: Optional[str] = None) -> List[ContactResponse]:
        """List all emergency contacts belonging to user with optional search."""
        contacts = self.contact_repo.get_by_user_id(user_id, search)
        return [ContactResponse.model_validate(c) for c in contacts]

    def get_contact(self, contact_id: int, user_id: int) -> ContactResponse:
        """Get contact details by ID with ownership check."""
        contact = self.contact_repo.get_by_id(contact_id, user_id)
        if not contact:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Emergency contact not found or access unauthorized."
            )
        return ContactResponse.model_validate(contact)

    def create_contact(self, contact_in: ContactCreate, user_id: int) -> ContactResponse:
        """Create new emergency contact for user."""
        contact = self.contact_repo.create(contact_in, user_id)
        return ContactResponse.model_validate(contact)

    def update_contact(self, contact_id: int, contact_in: ContactUpdate, user_id: int) -> ContactResponse:
        """Update existing emergency contact with ownership verification."""
        contact = self.contact_repo.get_by_id(contact_id, user_id)
        if not contact:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Emergency contact not found or access unauthorized."
            )
        updated_contact = self.contact_repo.update(contact, contact_in)
        return ContactResponse.model_validate(updated_contact)

    def delete_contact(self, contact_id: int, user_id: int) -> None:
        """Delete emergency contact with ownership verification."""
        contact = self.contact_repo.get_by_id(contact_id, user_id)
        if not contact:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Emergency contact not found or access unauthorized."
            )
        self.contact_repo.delete(contact)
