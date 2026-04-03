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
        "postgresql+asyncpg://miaplatform:changeme@localhost:5432/miaplatform"
    )
    MONGO_URL: str = "mongodb://miaplatform:changeme@localhost:27017"
    NEO4J_URL: str = "bolt://localhost:7687"
    NEO4J_USER: str = "neo4j"
    NEO4J_PASSWORD: str = "changeme"

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

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()
