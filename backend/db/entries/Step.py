from db.base import Base
from db.entries.TimestampMixin import TimestampMixin
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

class Step(Base, TimestampMixin):
    __tablename__ = "steps"

    id = Column(Integer, primary_key=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=False)
    order_number = Column(Integer, nullable=False)
    action_type = Column(String(63), nullable=False)
    temperature = Column(Integer, nullable=False)
    speed = Column(Integer, nullable=False)
    duration = Column(Integer, nullable=False)
    description = Column(String(512), nullable=True)

    recipe = relationship("Recipe", back_populates="steps")
    recipe_ingredients = relationship("RecipeIngredient", back_populates="step")