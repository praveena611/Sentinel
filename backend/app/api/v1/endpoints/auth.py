from fastapi import APIRouter, Depends, status, Request, HTTPException
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
    description="Validates user credentials (accepts both JSON {email, password} and Form Data {username, password} for Swagger UI compatibility)."
)
async def login(
    request: Request,
    db: Session = Depends(get_db)
) -> Token:
    """User authentication login endpoint supporting JSON and Form payloads."""
    auth_service = AuthService(db)
    content_type = request.headers.get("content-type", "")

    email = None
    password = None

    if "application/x-www-form-urlencoded" in content_type or "multipart/form-data" in content_type:
        form_data = await request.form()
        email = form_data.get("username") or form_data.get("email")
        password = form_data.get("password")
    else:
        try:
            body = await request.json()
            email = body.get("email") or body.get("username")
            password = body.get("password")
        except Exception:
            pass

    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Email and password are required credentials."
        )

    try:
        login_credentials = UserLogin(email=str(email), password=str(password))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid email format: {str(e)}"
        )

    return auth_service.authenticate_user(login_credentials)


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
