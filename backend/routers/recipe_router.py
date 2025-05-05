from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel, Field

from db.base import get_db
from db.entries.Recipe import Recipe
from db.entries.User import User
from db.entries.Step import Step
from db.entries.RecipeIngredient import RecipeIngredient
from db.entries.Ingredient import Ingredient
from routers.auth_router import get_current_user

router = APIRouter(
    prefix="/recipes",
    tags=["recipes"],
    responses={404: {"description": "Not found"}},
)

# ========== Pydantic Models ==========

class RecipeBase(BaseModel):
    """Base Recipe schema with shared attributes"""
    title: str = Field(..., min_length=1, example="Spaghetti Carbonara")
    description: str = Field(..., example="A classic Italian pasta dish")
    is_public: bool = Field(True, example=True)
    preparation_time: int = Field(..., ge=0, example=15)
    cooking_time: int = Field(..., ge=0, example=20)
    servings: int = Field(..., gt=0, example=4)


class RecipeCreate(RecipeBase):
    """Schema for creating a recipe"""
    pass


class RecipeResponse(RecipeBase):
    """Schema for returning a recipe"""
    id: int
    user_id: int

    class Config:
        from_attributes = True


class IngredientResponse(BaseModel):
    """Schema for returning recipe ingredients"""
    id: int
    name: str
    quantity: float
    unit: str
    
    class Config:
        from_attributes = True


class StepResponse(BaseModel):
    """Schema for returning recipe steps"""
    id: int
    order_number: int
    action_type: str
    temperature: int
    speed: int
    duration: int
    description: str
    
    class Config:
        from_attributes = True


# ========== Helper Functions ==========

def get_recipe_or_404(recipe_id: int, db: Session):
    """
    Get a recipe by ID or raise a 404 exception
    
    Args:
        recipe_id: Recipe ID
        db: Database session
        
    Returns:
        Recipe object
        
    Raises:
        HTTPException: If recipe not found
    """
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if recipe is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Recipe not found"
        )
    return recipe


def get_user_or_404(user_id: int, db: Session):
    """
    Get a user by ID or raise a 404 exception
    
    Args:
        user_id: User ID
        db: Database session
        
    Returns:
        User object
        
    Raises:
        HTTPException: If user not found
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


# ========== Recipe Routes ==========

@router.get("/", response_model=List[RecipeResponse])
def get_recipes(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    """
    Get all public recipes with pagination

    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        db: Database session

    Returns:
        List of recipes
    """
    recipes = db.query(Recipe).filter(
        Recipe.is_public == True
    ).offset(skip).limit(limit).all()
    
    return recipes


@router.get("/{recipe_id}", response_model=RecipeResponse)
def get_recipe(recipe_id: int, db: Session = Depends(get_db)):
    """
    Get a specific recipe by ID

    Args:
        recipe_id: Recipe ID
        db: Database session

    Returns:
        Recipe information

    Raises:
        HTTPException: If recipe not found
    """
    return get_recipe_or_404(recipe_id, db)


@router.get("/user/{user_id}", response_model=List[RecipeResponse])
async def get_user_recipes(
    user_id: int,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """
    Get all recipes created by a specific user

    Args:
        user_id: User ID
        db: Database session
        skip: Number of records to skip
        limit: Maximum number of records to return

    Returns:
        List of user's recipes

    Raises:
        HTTPException: If user not found
    """
    # Check if user exists
    get_user_or_404(user_id, db)
    
    # Get user's recipes
    recipes = db.query(Recipe).filter(
        Recipe.user_id == user_id
    ).offset(skip).limit(limit).all()
    
    return recipes


@router.get("/current/", response_model=List[RecipeResponse])
async def get_current_user_recipes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """
    Get all recipes created by the currently authenticated user

    Args:
        current_user: Currently authenticated user
        db: Database session
        skip: Number of records to skip
        limit: Maximum number of records to return

    Returns:
        List of user's recipes
    """
    recipes = db.query(Recipe).filter(
        Recipe.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    
    return recipes


@router.get("/{recipe_id}/ingredients", response_model=List[IngredientResponse])
def get_recipe_ingredients(recipe_id: int, db: Session = Depends(get_db)):
    """
    Get all ingredients for a specific recipe
    
    Args:
        recipe_id: Recipe ID
        db: Database session
        
    Returns:
        List of ingredients with quantities and units
    
    Raises:
        HTTPException: If recipe not found
    """
    # Check if recipe exists
    get_recipe_or_404(recipe_id, db)
    
    # Join RecipeIngredient with Ingredient to get ingredient details
    recipe_ingredients = db.query(
        RecipeIngredient.quantity,
        Ingredient.id,
        Ingredient.name,
        Ingredient.unit
    ).join(
        Ingredient, RecipeIngredient.ingredient_id == Ingredient.id
    ).filter(
        RecipeIngredient.recipe_id == recipe_id
    ).all()
    
    # Format the response
    result = []
    for ri in recipe_ingredients:
        result.append({
            "id": ri.id,
            "name": ri.name,
            "quantity": ri.quantity,
            "unit": ri.unit
        })
    
    return result


@router.get("/{recipe_id}/steps", response_model=List[StepResponse])
def get_recipe_steps(recipe_id: int, db: Session = Depends(get_db)):
    """
    Get all steps for a specific recipe
    
    Args:
        recipe_id: Recipe ID
        db: Database session
        
    Returns:
        List of recipe steps in order
    
    Raises:
        HTTPException: If recipe not found
    """
    # Check if recipe exists
    get_recipe_or_404(recipe_id, db)
    
    # Get steps in order
    steps = db.query(Step).filter(
        Step.recipe_id == recipe_id
    ).order_by(
        Step.order_number
    ).all()
    
    return steps