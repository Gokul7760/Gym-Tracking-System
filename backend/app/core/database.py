import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

Base = declarative_base()

# Attempt to connect to MySQL first
try:
    logger.info(f"Connecting to MySQL database at {settings.DATABASE_URL.split('@')[-1]}")
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=3600
    )
    # Test connection
    with engine.connect() as conn:
        logger.info("Successfully connected to MySQL database!")
except Exception as e:
    logger.warning(f"Failed to connect to MySQL: {str(e)}")
    if settings.SQLITE_FALLBACK:
        logger.info(f"Falling back to SQLite database at {settings.DATABASE_SQLITE_URL}")
        engine = create_engine(
            settings.DATABASE_SQLITE_URL,
            connect_args={"check_same_thread": False}
        )
    else:
        logger.error("MySQL connection failed, and SQLite fallback is disabled.")
        raise e

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
