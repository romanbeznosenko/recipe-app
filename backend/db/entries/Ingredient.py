from db.base import Base
from db.entries.TimestampMixin import TimestampMixin
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

class Ingredient(Base, TimestampMixin):
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    unit = Column(String(255), nullable=False)
    category = Column(String(63), nullable=False, default="other") 
    
    recipe_ingredients = relationship("RecipeIngredient", back_populates="ingredient")