"""Database connections and session management."""

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from motor.motor_asyncio import AsyncIOMotorClient
from neo4j import AsyncGraphDatabase
from src.backend.core.config import get_settings

settings = get_settings()

# PostgreSQL (async)
engine = create_async_engine(
    settings.POSTGRES_URL,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

Base = declarative_base()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Get database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


# MongoDB (async)
mongo_client: AsyncIOMotorClient = None


async def get_mongo_db():
    """Get MongoDB database instance."""
    global mongo_client
    if mongo_client is None:
        mongo_client = AsyncIOMotorClient(settings.MONGO_URL)
    return mongo_client[settings.POSTGRES_DB]


# Neo4j (async)
neo4j_driver = None


async def get_neo4j_driver():
    """Get Neo4j driver instance."""
    global neo4j_driver
    if neo4j_driver is None:
        neo4j_driver = AsyncGraphDatabase.driver(
            settings.NEO4J_URL,
            auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD),
        )
    return neo4j_driver


async def close_db_connections():
    """Close all database connections on shutdown."""
    global mongo_client, neo4j_driver
    if mongo_client:
        mongo_client.close()
    if neo4j_driver:
        await neo4j_driver.close()
