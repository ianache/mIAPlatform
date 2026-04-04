"""Application configuration."""

import os
from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Orchestra"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Database
    POSTGRES_URL: str = (
        "postgresql+asyncpg://miaplatform:changeme@192.168.100.254:5432/miaplatform"
    )
    POSTGRES_SCHEMA: str = "mia"
    MONGO_URL: str = "mongodb://miaplatform:changeme@localhost:27017"
    NEO4J_URL: str = "bolt://localhost:7687"
    NEO4J_USER: str = "neo4j"
    NEO4J_PASSWORD: str = "changeme"

    # Redis
    REDIS_URL: str = "redis://192.168.100.254:6379"
    REDIS_PASSWORD: str = "eYVX7EwVmmxKPCDmwMtyKVge8oLd2t81"
    REDIS_TTL: int = 60       # seconds — default for lists/single items
    REDIS_TTL_LONG: int = 300  # seconds — for slow-changing data (registry models)

    # Vault
    VAULT_URL: str = "http://localhost:8200"
    VAULT_TOKEN: str = "changeme"

    # Keycloak (public client — PKCE, no client secret required)
    KEYCLOAK_URL: str = "https://oauth2.qa.comsatel.com.pe"
    KEYCLOAK_REALM: str = "Apps"
    KEYCLOAK_CLIENT_ID: str = "miaplatform"

    @property
    def KEYCLOAK_JWKS_URL(self) -> str:
        return f"{self.KEYCLOAK_URL}/realms/{self.KEYCLOAK_REALM}/protocol/openid-connect/certs"

    # JWT
    JWT_SECRET_KEY: str = "changeme-dev-secret-key-replace-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Skills Configuration
    SKILLS_PATH: str = "./skills"
    UPLOADS_PATH: str = "./uploads"
    GOOGLE_API_KEY: str = ""
    GOOGLE_MODEL: str = "gemini-3.0-flash"
    # Temporary: override model used for artifact name/summary generation
    ARTIFACT_LLM_MODEL: str = "groq/openai/gpt-oss-120b"
    GROQ_API_KEY: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()
