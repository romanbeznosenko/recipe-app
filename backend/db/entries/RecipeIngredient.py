from db.base import Base
from db.entries.TimestampMixin import TimestampMixin
from sqlalchemy import Column, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship

class RecipeIngredient(Base, TimestampMixin):
    __tablename__ = "recipe_ingredients"

    id = Column(Integer, primary_key=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=False)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id"), nullable=False)
    quantity = Column(Float, nullable=False)
    step_id = Column(Integer, ForeignKey("steps.id"), nullable=True)

    recipe = relationship("Recipe", back_populates="recipe_ingredients")
    ingredient = relationship("Ingredient", back_populates="recipe_ingredients")
    step = relationship("Step", back_populates="recipe_ingredients")