from typing import Optional
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import get_password_hash


class UserRepository:
    """Repository encapsulating database operations for Users."""

    def __init__(self, db: Session):
        self.db = db

    def get_by_email(self, email: str) -> Optional[User]:
        """Fetch user by email address."""
        return self.db.query(User).filter(User.email == email.lower()).first()

    def get_by_id(self, user_id: int) -> Optional[User]:
        """Fetch user by primary key ID."""
        return self.db.query(User).filter(User.id == user_id).first()

    def create(self, user_in: UserCreate) -> User:
        """Create and persist a new user record with hashed password."""
        hashed_password = get_password_hash(user_in.password)
        db_user = User(
            full_name=user_in.full_name,
            email=user_in.email.lower(),
            password_hash=hashed_password,
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user
