from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token
from app.services.auth_service import AuthService
from app.api.v1.deps import get_current_user
from app.models.user import User

router = APIRouter()


@router.post(
    "/register",
    response_model=Token,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
    description="Registers a new user, hashes their password, persists their account, and returns a JWT access token."
)
def register(
    user_in: UserCreate,
    db: Session = Depends(get_db)
) -> Token:
    """User registration endpoint."""
    auth_service = AuthService(db)
    return auth_service.register_user(user_in)


@router.post(
    "/login",
    response_model=Token,
    status_code=status.HTTP_200_OK,
    summary="Authenticate user and obtain JWT token",
    description="Validates user credentials (email & password) and returns a signed JWT access token."
)
def login(
    credentials: UserLogin,
    db: Session = Depends(get_db)
) -> Token:
    """User authentication login endpoint."""
    auth_service = AuthService(db)
    return auth_service.authenticate_user(credentials)


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current user profile",
    description="Returns the profile details of the currently authenticated user."
)
def get_me(
    current_user: User = Depends(get_current_user)
) -> UserResponse:
    """Protected endpoint retrieving active user details."""
    return UserResponse.model_validate(current_user)
