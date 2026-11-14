from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+asyncpg://aegis:aegis@localhost:5432/aegis"
    redis_url: str = "redis://localhost:6379"
    service_jwt_secret: str = "replace-with-64-char-service-jwt-secret"
    anthropic_api_key: str = ""
    voyage_api_key: str = ""
    openai_api_key: str = ""
    tavily_api_key: str = ""


settings = Settings()
