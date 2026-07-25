from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from app.database.base import Base


class User(Base):
    """SQLAlchemy model for Users table."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self) -> str:
        return f"<User id={self.id} email='{self.email}'>"
