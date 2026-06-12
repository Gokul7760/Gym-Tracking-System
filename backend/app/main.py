from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.router import api_router
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create tables in the database on startup. 
# In a full production system, Alembic is preferred, but automatic creation is robust for initialization.
try:
    logger.info("Initializing database tables...")
    # Import models first to register them on Base.metadata
    from app import models  
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized successfully!")
except Exception as e:
    logger.error(f"Failed to initialize database tables: {str(e)}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Enterprise-grade Gym Management System API",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
)

# Set CORS middleware
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin).strip("/") for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Include API Router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {
        "message": f"Welcome to the {settings.PROJECT_NAME} API!",
        "documentation": f"{settings.API_V1_STR}/docs"
    }
