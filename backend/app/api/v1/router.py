from fastapi import APIRouter
from app.core.config import settings
from app.api.v1.endpoints import auth, contacts, sos, location, ai

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
api_router.include_router(sos.router, prefix="/sos", tags=["Manual SOS"])
api_router.include_router(location.router, prefix="/location", tags=["Location Tracking"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI Emergency Detection"])
