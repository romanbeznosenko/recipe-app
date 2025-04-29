"""
Database base module for SQLAlchemy declarative base and engine configuration
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Database connection settings
MYSQL_USER: str = os.getenv("MYSQL_USER", "username")
MYSQL_PASSWORD: str = os.getenv("MYSQL_PASSWORD", "password")
MYSQL_HOST: str = os.getenv("MYSQL_HOST", "localhost")
MYSQL_PORT: str = os.getenv("MYSQL_PORT", "3306")  # Ensure it's a string
MYSQL_DATABASE: str = os.getenv("MYSQL_DATABASE", "recipe_app")

# Create connection string
DATABASE_URL = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}"

# Create engine with explicit charset and error handling
engine = create_engine(
    DATABASE_URL, 
    echo=False,  # Set to True for debugging
    pool_pre_ping=True,  # Check connection validity before using
    connect_args={"charset": "utf8mb4"}
)

# Create sessionmaker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create declarative base
Base = declarative_base()

# Define get_db dependency for FastAPI
def get_db():
    """
    Get database session for FastAPI dependency injection.
    
    Yields:
        SQLAlchemy session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()