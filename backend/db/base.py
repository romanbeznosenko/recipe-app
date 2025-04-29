from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

MYSQL_USER: str = os.getenv("MYSQL_USER", "username")
MYSQL_PASSWORD: str = os.getenv("MYSQL_PASSWORD", "password")
MYSQL_HOST: str = os.getenv("MYSQL_HOST", "localhost")
MYSQL_PORT: str = os.getenv("MYSQL_PORT", 3306)
MYSQL_DATABASE: str = os.getenv("MYSQL_DATABASE", "recipe_app")

engine = create_engine(
    f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}")

Base = declarative_base()

SessionLocal = sessionmaker(bind=engine)