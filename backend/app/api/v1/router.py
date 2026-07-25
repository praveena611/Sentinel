from fastapi import APIRouter
from app.core.config import settings
from app.api.v1.endpoints import auth, contacts

api_router = APIRouter()


@api_router.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint to verify backend service readiness."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION
    }


# Include endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(contacts.router, prefix="/contacts", tags=["Emergency Contacts"])
