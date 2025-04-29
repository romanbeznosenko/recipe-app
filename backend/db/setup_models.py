from db.entries.User import User
from db.entries.Recipe import Recipe
from db.entries.Step import Step
from db.entries.Ingredient import Ingredient
from db.entries.RecipeIngredient import RecipeIngredient

def init_models():
    """Initialize all models to avoid circular import issues"""
    pass