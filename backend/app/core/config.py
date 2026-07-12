from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    SECRET_KEY: str = "dev-secret-key-change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Port 5433, not 5432 — a native PostgreSQL service on this machine owns 5432.
    # Inside Docker Compose, DATABASE_URL is overridden to use the "postgres" service
    # hostname on its normal internal port; this default is only for running the
    # backend natively against the Dockerized Postgres via its published host port.
    DATABASE_URL: str = "postgresql+asyncpg://ecosphere:ecosphere_secret@localhost:5433/ecosphere"
    REDIS_URL: str = "redis://localhost:6379/0"

    # NVIDIA NIM (OpenAI-compatible) endpoint hosting Llama 3.3 70B for the AI assistant.
    LLM_API_KEY: str = ""
    LLM_BASE_URL: str = "https://integrate.api.nvidia.com/v1"
    LLM_MODEL: str = "meta/llama-3.3-70b-instruct"

    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE_MB: int = 10

    TESTING: bool = False


settings = Settings()
