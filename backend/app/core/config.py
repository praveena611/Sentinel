from typing import List, Union
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "SentinelAI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security / Auth Settings
    SECRET_KEY: str = "sentinelai_super_secret_jwt_key_change_in_production_environment"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database Settings
    DATABASE_URL: str = "sqlite:///./sentinel.db"
    
    # CORS Origins (Comma separated string or list)
    CORS_ORIGINS: Union[str, List[str]] = "http://localhost:5173,http://localhost:3000"
    
    # Notification Settings
    NTFY_TOPIC: str = "sentinelai_emergency_channel"
    NTFY_BASE_URL: str = "https://ntfy.sh"

    @property
    def cors_origins_list(self) -> List[str]:
        if isinstance(self.CORS_ORIGINS, str):
            return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]
        return self.CORS_ORIGINS

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
