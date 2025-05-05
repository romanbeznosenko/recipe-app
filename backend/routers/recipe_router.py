from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
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


class StepCreate(BaseModel):
    """Schema for creating a recipe step"""
    order_number: int = Field(..., ge=1, example=1)
    action_type: str = Field(..., example="mix")
    temperature: int = Field(0, ge=0, example=180)
    speed: int = Field(0, ge=0, example=2)
    duration: int = Field(0, ge=0, example=10)
    description: str = Field(..., example="Mix the ingredients until smooth")


class IngredientCreate(BaseModel):
    """Schema for creating a recipe ingredient"""
    ingredient_id: int = Field(..., gt=0, example=1)
    quantity: float = Field(..., gt=0, example=200.0)
    # Will be set after steps are created
    step_id: Optional[int] = Field(None, example=None)

    class Config:
        schema_extra = {
            "example": {
                "ingredient_id": 1,
                "quantity": 200.0,
                "step_id": None
            }
        }


class CompleteRecipeCreate(BaseModel):
    """Schema for creating a complete recipe with steps and ingredients"""
    recipe: RecipeCreate
    steps: List[StepCreate]
    ingredients: List[IngredientCreate]

    class Config:
        schema_extra = {
            "example": {
                "recipe": {
                    "title": "Spaghetti Carbonara",
                    "description": "A classic Italian pasta dish",
                    "is_public": True,
                    "preparation_time": 15,
                    "cooking_time": 20,
                    "servings": 4
                },
                "steps": [
                    {
                        "order_number": 1,
                        "action_type": "prep",
                        "temperature": 0,
                        "speed": 0,
                        "duration": 5,
                        "description": "Prepare ingredients"
                    }
                ],
                "ingredients": [
                    {
                        "ingredient_id": 1,
                        "quantity": 200.0,
                        "step_id": None
                    }
                ]
            }
        }


class RecipeUpdate(RecipeBase):
    """Schema for updating a recipe"""
    pass


class CompleteRecipeUpdate(BaseModel):
    """Schema for updating a complete recipe with steps and ingredients"""
    recipe: RecipeUpdate
    steps: List[StepCreate]
    ingredients: List[IngredientCreate]


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


@router.post("/", response_model=RecipeResponse, status_code=status.HTTP_201_CREATED)
async def create_recipe(
    recipe_data: RecipeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new recipe

    Args:
        recipe_data: Recipe data
        current_user: Currently authenticated user
        db: Database session

    Returns:
        Created recipe
    """
    # Create recipe object
    db_recipe = Recipe(
        **recipe_data.dict(),
        user_id=current_user.id
    )

    # Add and commit to get recipe ID
    db.add(db_recipe)
    db.commit()
    db.refresh(db_recipe)

    return db_recipe


# Replace the create_complete_recipe function in recipe_router.py

@router.post("/complete", response_model=RecipeResponse, status_code=status.HTTP_201_CREATED)
async def create_complete_recipe(
    recipe_data: CompleteRecipeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a complete recipe with steps and ingredients

    Args:
        recipe_data: Complete recipe data with steps and ingredients
        current_user: Currently authenticated user
        db: Database session

    Returns:
        Created recipe
    """
    try:
        # Log incoming data for debugging
        print(f"Received recipe_data: {recipe_data}")

        # 1. Create recipe
        db_recipe = Recipe(
            **recipe_data.recipe.dict(),
            user_id=current_user.id
        )

        db.add(db_recipe)
        db.flush()  # Get recipe ID without committing transaction

        # 2. Create steps
        db_steps = []
        for step_data in recipe_data.steps:
            step_dict = step_data.dict()
            # Ensure all fields are the correct type
            step_dict["order_number"] = int(step_dict["order_number"])
            step_dict["temperature"] = int(step_dict["temperature"])
            step_dict["speed"] = int(step_dict["speed"])
            step_dict["duration"] = int(step_dict["duration"])

            db_step = Step(
                **step_dict,
                recipe_id=db_recipe.id
            )
            db.add(db_step)
            db_steps.append(db_step)

        db.flush()  # Get step IDs

        # 3. Create ingredients with step references
        for i, ingredient_data in enumerate(recipe_data.ingredients):
            ing_dict = ingredient_data.dict()

            # Ensure all fields are the correct type
            ing_dict["ingredient_id"] = int(ing_dict["ingredient_id"])
            ing_dict["quantity"] = float(ing_dict["quantity"])

            # If step_id is None, try to match it with a step
            if ing_dict["step_id"] is None and i < len(db_steps):
                step_id = db_steps[i].id
            else:
                step_id = ing_dict["step_id"]

            db_ingredient = RecipeIngredient(
                recipe_id=db_recipe.id,
                ingredient_id=ing_dict["ingredient_id"],
                quantity=ing_dict["quantity"],
                step_id=step_id
            )
            db.add(db_ingredient)

        # Commit all changes
        db.commit()
        db.refresh(db_recipe)

        return db_recipe

    except Exception as e:
        db.rollback()
        print(f"Error creating recipe: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error creating recipe: {str(e)}"
        )


@router.get("/ingredients/list", response_model=List[dict])
async def get_available_ingredients(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """
    Get all available ingredients for recipe creation

    Args:
        db: Database session
        skip: Number of records to skip
        limit: Maximum number of records to return

    Returns:
        List of ingredients
    """
    ingredients = db.query(Ingredient).offset(skip).limit(limit).all()

    return [
        {
            "id": ingredient.id,
            "name": ingredient.name,
            "unit": ingredient.unit
        }
        for ingredient in ingredients
    ]


def check_recipe_ownership(recipe_id: int, user_id: int, db: Session):
    """
    Check if the user owns the recipe

    Args:
        recipe_id: Recipe ID
        user_id: User ID
        db: Database session

    Returns:
        Recipe object if user owns it

    Raises:
        HTTPException: If recipe not found or user does not own it
    """
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()

    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipe not found"
        )

    if recipe.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to modify this recipe"
        )

    return recipe


@router.put("/{recipe_id}", response_model=RecipeResponse)
async def update_recipe(
    recipe_id: int,
    recipe_data: RecipeUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a recipe

    Args:
        recipe_id: Recipe ID
        recipe_data: Updated recipe data
        current_user: Currently authenticated user
        db: Database session

    Returns:
        Updated recipe
    """
    # Check ownership
    db_recipe = check_recipe_ownership(recipe_id, current_user.id, db)

    # Update recipe fields
    for key, value in recipe_data.dict().items():
        setattr(db_recipe, key, value)

    db.commit()
    db.refresh(db_recipe)

    return db_recipe


@router.put("/{recipe_id}/complete", response_model=RecipeResponse)
async def update_complete_recipe(
    recipe_id: int,
    recipe_data: CompleteRecipeUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a complete recipe with steps and ingredients
    
    Args:
        recipe_id: Recipe ID
        recipe_data: Updated recipe data with steps and ingredients
        current_user: Currently authenticated user
        db: Database session
        
    Returns:
        Updated recipe
    """
    try:
        # Check ownership
        db_recipe = check_recipe_ownership(recipe_id, current_user.id, db)
        
        # 1. Update recipe fields
        for key, value in recipe_data.recipe.dict().items():
            setattr(db_recipe, key, value)
        
        # 2. Delete existing recipe ingredients first (to resolve the foreign key constraint)
        db.query(RecipeIngredient).filter(RecipeIngredient.recipe_id == recipe_id).delete()
        
        # 3. Now it's safe to delete steps
        db.query(Step).filter(Step.recipe_id == recipe_id).delete()
        
        # Flush to ensure all deletions are processed
        db.flush()
        
        # 4. Create new steps first and save their ids
        db_steps = []
        step_id_map = {}  # Map to keep track of step order_number to new id
        
        for step_data in recipe_data.steps:
            step_dict = step_data.dict()
            # Ensure all fields are the correct type
            order_number = int(step_dict["order_number"])
            step_dict["order_number"] = order_number
            step_dict["temperature"] = int(step_dict["temperature"])
            step_dict["speed"] = int(step_dict["speed"])
            step_dict["duration"] = int(step_dict["duration"])
            
            # Create new step
            db_step = Step(
                **step_dict,
                recipe_id=recipe_id
            )
            db.add(db_step)
            db_steps.append(db_step)
        
        # Flush to get the new step IDs
        db.flush()
        
        # Create a map of order_number to new step ID
        for step in db_steps:
            step_id_map[step.order_number] = step.id
        
        # 5. Create new ingredients with new step references
        for i, ingredient_data in enumerate(recipe_data.ingredients):
            ing_dict = ingredient_data.dict()
            
            # Ensure all fields are the correct type
            ing_dict["ingredient_id"] = int(ing_dict["ingredient_id"])
            ing_dict["quantity"] = float(ing_dict["quantity"])
            
            # Determine which step this ingredient should be linked to
            step_id = None
            
            # If a specific step is provided and exists in our new steps, use that
            if i < len(db_steps):
                # Use the step at the same index
                step_id = db_steps[i].id
            
            # Create the ingredient with the proper step reference
            db_ingredient = RecipeIngredient(
                recipe_id=recipe_id,
                ingredient_id=ing_dict["ingredient_id"],
                quantity=ing_dict["quantity"],
                step_id=step_id
            )
            db.add(db_ingredient)
        
        # Commit all changes
        db.commit()
        db.refresh(db_recipe)
        
        return db_recipe
    
    except Exception as e:
        db.rollback()
        print(f"Error updating recipe: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error updating recipe: {str(e)}"
        )

@router.get("/{recipe_id}/edit", response_model=CompleteRecipeUpdate)
async def get_recipe_for_edit(
    recipe_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a recipe with its steps and ingredients for editing

    Args:
        recipe_id: Recipe ID
        current_user: Currently authenticated user
        db: Database session

    Returns:
        Complete recipe data for editing
    """
    # Check ownership
    db_recipe = check_recipe_ownership(recipe_id, current_user.id, db)

    # Get steps
    steps = db.query(Step).filter(Step.recipe_id ==
                                  recipe_id).order_by(Step.order_number).all()

    # Get ingredients
    recipe_ingredients = db.query(RecipeIngredient).filter(
        RecipeIngredient.recipe_id == recipe_id
    ).all()

    # Format for response
    ingredients = []
    for ri in recipe_ingredients:
        ingredients.append({
            "ingredient_id": ri.ingredient_id,
            "quantity": ri.quantity,
            "step_id": ri.step_id
        })

    return {
        "recipe": db_recipe,
        "steps": steps,
        "ingredients": ingredients
    }
