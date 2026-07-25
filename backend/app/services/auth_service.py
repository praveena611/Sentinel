from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate, UserLogin, Token, UserResponse
from app.core.security import verify_password, create_access_token


class AuthService:
    """Service handling user registration, authentication, and token management."""

    def __init__(self, db: Session):
        self.user_repo = UserRepository(db)

    def register_user(self, user_in: UserCreate) -> Token:
        """Register a new user and return an access token response."""
        # Check if email is already registered
        existing_user = self.user_repo.get_by_email(user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email address already exists."
            )

        # Create new user
        new_user = self.user_repo.create(user_in)

        # Generate JWT token
        access_token = create_access_token(subject=new_user.id, email=new_user.email)
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(new_user)
        )

    def authenticate_user(self, credentials: UserLogin) -> Token:
        """Authenticate user credentials and return an access token response."""
        user = self.user_repo.get_by_email(credentials.email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password credentials.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not verify_password(credentials.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password credentials.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        access_token = create_access_token(subject=user.id, email=user.email)
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(user)
        )
