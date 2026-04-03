"""Database connections and session management."""

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from motor.motor_asyncio import AsyncIOMotorClient
from neo4j import AsyncGraphDatabase


def get_settings():
    from src.backend.core.config import get_settings as _get_settings

    return _get_settings()


Base = declarative_base()

_engine = None
_async_session_maker = None
_mongo_client = None
_neo4j_driver = None


def get_engine():
    global _engine
    if _engine is None:
        settings = get_settings()
        _engine = create_async_engine(
            settings.POSTGRES_URL,
            echo=settings.DEBUG,
            pool_pre_ping=True,
            pool_size=10,
            max_overflow=20,
        )
    return _engine


def get_session_maker():
    global _async_session_maker
    if _async_session_maker is None:
        _async_session_maker = async_sessionmaker(
            get_engine(),
            class_=AsyncSession,
            expire_on_commit=False,
        )
    return _async_session_maker


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    SessionLocal = get_session_maker()
    async with SessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def get_mongo_db():
    global _mongo_client
    if _mongo_client is None:
        settings = get_settings()
        _mongo_client = AsyncIOMotorClient(settings.MONGO_URL)
    return _mongo_client[settings.POSTGRES_DB]


async def get_neo4j_driver():
    global _neo4j_driver
    if _neo4j_driver is None:
        settings = get_settings()
        _neo4j_driver = AsyncGraphDatabase.driver(
            settings.NEO4J_URL,
            auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD),
        )
    return _neo4j_driver


async def close_db_connections():
    global _mongo_client, _neo4j_driver
    if _mongo_client:
        _mongo_client.close()
    if _neo4j_driver:
        await _neo4j_driver.close()
