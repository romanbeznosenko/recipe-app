from db.entries.TimestampMixin import TimestampMixin
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from db.base import Base

class User(Base, TimestampMixin):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String(255), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)

    recipes = relationship("Recipe", back_populates="user",
                           cascade="all, delete-orphan")