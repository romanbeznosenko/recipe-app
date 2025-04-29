from db.base import Base
from db.entries.TimestampMixin import TimestampMixin
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship

class Recipe(Base, TimestampMixin):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True)
    title = Column(String(255), nullable=False)
    description = Column(String(512), nullable=True)
    is_public = Column(Boolean, default=True)
    preparation_time = Column(Integer, nullable=False)
    cooking_time = Column(Integer, nullable=False)
    servings = Column(Integer, nullable=False)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    user = relationship("User", back_populates="recipes")
    steps = relationship("Step", back_populates="recipe", cascade="all, delete-orphan")
    recipe_ingredients = relationship("RecipeIngredient", back_populates="recipe", cascade="all, delete-orphan")
