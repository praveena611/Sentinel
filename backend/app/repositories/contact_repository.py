from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.contact import EmergencyContact
from app.schemas.contact import ContactCreate, ContactUpdate


class ContactRepository:
    """Repository encapsulating database operations for EmergencyContacts."""

    def __init__(self, db: Session):
        self.db = db

    def get_by_user_id(self, user_id: int, search: Optional[str] = None) -> List[EmergencyContact]:
        """Fetch all emergency contacts for a given user, with optional search filtering."""
        query = self.db.query(EmergencyContact).filter(EmergencyContact.user_id == user_id)
        if search and search.strip():
            pattern = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    EmergencyContact.contact_name.ilike(pattern),
                    EmergencyContact.phone_number.ilike(pattern),
                    EmergencyContact.relationship.ilike(pattern)
                )
            )
        return query.order_by(EmergencyContact.contact_name.asc()).all()

    def get_by_id(self, contact_id: int, user_id: int) -> Optional[EmergencyContact]:
        """Fetch an emergency contact by ID belonging to a specific user."""
        return self.db.query(EmergencyContact).filter(
            EmergencyContact.id == contact_id,
            EmergencyContact.user_id == user_id
        ).first()

    def create(self, contact_in: ContactCreate, user_id: int) -> EmergencyContact:
        """Create and persist a new emergency contact."""
        db_contact = EmergencyContact(
            user_id=user_id,
            contact_name=contact_in.contact_name,
            phone_number=contact_in.phone_number,
            relationship=contact_in.relationship
        )
        self.db.add(db_contact)
        self.db.commit()
        self.db.refresh(db_contact)
        return db_contact

    def update(self, db_contact: EmergencyContact, contact_in: ContactUpdate) -> EmergencyContact:
        """Update an existing emergency contact."""
        update_data = contact_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_contact, field, value)
        self.db.commit()
        self.db.refresh(db_contact)
        return db_contact

    def delete(self, db_contact: EmergencyContact) -> None:
        """Delete an emergency contact."""
        self.db.delete(db_contact)
        self.db.commit()
