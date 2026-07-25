from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship as sqlalchemy_relationship

from app.database.base import Base


class EmergencyContact(Base):
    """SQLAlchemy ORM model for EmergencyContacts table."""
    __tablename__ = "emergency_contacts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    contact_name = Column(String(255), nullable=False)
    phone_number = Column(String(50), nullable=False)
    relationship = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationship to user
    user = sqlalchemy_relationship("User", backref="emergency_contacts")

    def __repr__(self) -> str:
        return f"<EmergencyContact id={self.id} user_id={self.user_id} name='{self.contact_name}'>"
