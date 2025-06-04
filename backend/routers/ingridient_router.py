from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, Field

from db.base import get_db
from db.entries.Ingredient import Ingredient
from db.entries.User import User
from routers.auth_router import get_current_user

router = APIRouter(
    prefix="/ingredients",
    tags=["ingredients"],
    responses={404: {"description": "Not found"}},
)

# Pydantic Models


class IngredientBase(BaseModel):
    """Base Ingredient schema with shared attributes"""
    name: str = Field(..., min_length=1, max_length=255, example="Fresh basil")
    unit: str = Field(..., min_length=1, max_length=255, example="g")
    category: str = Field(default="other", max_length=63,
                          example="herbs_spices")


class IngredientCreate(IngredientBase):
    """Schema for creating an ingredient"""
    pass


class IngredientResponse(IngredientBase):
    """Schema for returning an ingredient"""
    id: int

    class Config:
        from_attributes = True


class IngredientUpdate(BaseModel):
    """Schema for updating an ingredient"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    unit: Optional[str] = Field(None, min_length=1, max_length=255)
    category: Optional[str] = Field(None, max_length=63)


# Valid ingredient categories
VALID_CATEGORIES = {
    "vegetables", "fruits", "meat_poultry", "seafood", "dairy",
    "grains_cereals", "legumes", "herbs_spices", "oils_fats",
    "condiments", "beverages", "other"
}


def validate_category(category: str) -> str:
    """Validate ingredient category"""
    if category not in VALID_CATEGORIES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid category. Must be one of: {', '.join(VALID_CATEGORIES)}"
        )
    return category


@router.get("/", response_model=List[IngredientResponse])
def get_all_ingredients(
    skip: int = 0,
    limit: int = 1000,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get all ingredients with optional category filtering

    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        category: Filter by category (optional)
        db: Database session

    Returns:
        List of ingredients
    """
    query = db.query(Ingredient)

    if category:
        validate_category(category)
        query = query.filter(Ingredient.category == category)

    ingredients = query.offset(skip).limit(limit).all()
    return ingredients


@router.get("/categories", response_model=List[str])
def get_ingredient_categories():
    """
    Get all valid ingredient categories

    Returns:
        List of valid category names
    """
    return sorted(list(VALID_CATEGORIES))


@router.get("/by-category", response_model=dict)
def get_ingredients_by_category(db: Session = Depends(get_db)):
    """
    Get all ingredients grouped by category

    Args:
        db: Database session

    Returns:
        Dictionary with categories as keys and ingredient lists as values
    """
    ingredients = db.query(Ingredient).all()

    # Group ingredients by category
    categorized = {}
    for category in VALID_CATEGORIES:
        categorized[category] = []

    for ingredient in ingredients:
        category = ingredient.category or "other"
        if category in categorized:
            categorized[category].append({
                "id": ingredient.id,
                "name": ingredient.name,
                "unit": ingredient.unit,
                "category": ingredient.category
            })
        else:
            categorized["other"].append({
                "id": ingredient.id,
                "name": ingredient.name,
                "unit": ingredient.unit,
                "category": ingredient.category
            })

    return categorized


@router.get("/{ingredient_id}", response_model=IngredientResponse)
def get_ingredient(ingredient_id: int, db: Session = Depends(get_db)):
    """
    Get a specific ingredient by ID

    Args:
        ingredient_id: Ingredient ID
        db: Database session

    Returns:
        Ingredient information

    Raises:
        HTTPException: If ingredient not found
    """
    ingredient = db.query(Ingredient).filter(
        Ingredient.id == ingredient_id).first()
    if not ingredient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ingredient not found"
        )
    return ingredient


@router.post("/", response_model=IngredientResponse, status_code=status.HTTP_201_CREATED)
def create_ingredient(
    ingredient_data: IngredientCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new ingredient (requires authentication)

    Args:
        ingredient_data: Ingredient data
        current_user: Currently authenticated user
        db: Database session

    Returns:
        Created ingredient

    Raises:
        HTTPException: If ingredient with same name already exists or invalid category
    """
    # Validate category
    validate_category(ingredient_data.category)

    # Check if ingredient with same name already exists
    existing_ingredient = db.query(Ingredient).filter(
        Ingredient.name.ilike(ingredient_data.name.strip())
    ).first()

    if existing_ingredient:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ingredient '{ingredient_data.name}' already exists"
        )

    # Create new ingredient
    db_ingredient = Ingredient(
        name=ingredient_data.name.strip(),
        unit=ingredient_data.unit.strip(),
        category=ingredient_data.category
    )

    db.add(db_ingredient)
    db.commit()
    db.refresh(db_ingredient)

    return db_ingredient


@router.put("/{ingredient_id}", response_model=IngredientResponse)
def update_ingredient(
    ingredient_id: int,
    ingredient_data: IngredientUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update an existing ingredient (requires authentication)

    Args:
        ingredient_id: Ingredient ID
        ingredient_data: Updated ingredient data
        current_user: Currently authenticated user
        db: Database session

    Returns:
        Updated ingredient

    Raises:
        HTTPException: If ingredient not found or invalid category
    """
    # Get existing ingredient
    ingredient = db.query(Ingredient).filter(
        Ingredient.id == ingredient_id).first()
    if not ingredient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ingredient not found"
        )

    # Update fields if provided
    update_data = ingredient_data.dict(exclude_unset=True)

    if 'category' in update_data:
        validate_category(update_data['category'])

    if 'name' in update_data:
        # Check if new name conflicts with existing ingredient
        existing = db.query(Ingredient).filter(
            Ingredient.name.ilike(update_data['name'].strip()),
            Ingredient.id != ingredient_id
        ).first()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ingredient '{update_data['name']}' already exists"
            )

        update_data['name'] = update_data['name'].strip()

    if 'unit' in update_data:
        update_data['unit'] = update_data['unit'].strip()

    # Apply updates
    for field, value in update_data.items():
        setattr(ingredient, field, value)

    db.commit()
    db.refresh(ingredient)

    return ingredient


@router.delete("/{ingredient_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ingredient(
    ingredient_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete an ingredient (requires authentication)

    Note: This will fail if the ingredient is used in any recipes

    Args:
        ingredient_id: Ingredient ID
        current_user: Currently authenticated user
        db: Database session

    Raises:
        HTTPException: If ingredient not found or is used in recipes
    """
    ingredient = db.query(Ingredient).filter(
        Ingredient.id == ingredient_id).first()
    if not ingredient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ingredient not found"
        )

    # Check if ingredient is used in any recipes
    if ingredient.recipe_ingredients:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete ingredient that is used in recipes"
        )

    db.delete(ingredient)
    db.commit()


@router.get("/search/{search_term}", response_model=List[IngredientResponse])
def search_ingredients(
    search_term: str,
    category: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """
    Search ingredients by name

    Args:
        search_term: Term to search for in ingredient names
        category: Filter by category (optional)
        limit: Maximum number of results
        db: Database session

    Returns:
        List of matching ingredients
    """
    query = db.query(Ingredient).filter(
        Ingredient.name.ilike(f"%{search_term}%")
    )

    if category:
        validate_category(category)
        query = query.filter(Ingredient.category == category)

    ingredients = query.limit(limit).all()
    return ingredients

# Add this updated endpoint to your recipe_router.py


@router.get("/ingredients/list", response_model=List[dict])
async def get_available_ingredients(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 1000,
    category: str = None
):
    """
    Get all available ingredients for recipe creation with category support

    Args:
        db: Database session
        skip: Number of records to skip
        limit: Maximum number of records to return
        category: Filter by specific category (optional)

    Returns:
        List of ingredients with id, name, unit, and category
    """
    query = db.query(Ingredient)

    # Apply category filter if provided
    if category and category != "all":
        query = query.filter(Ingredient.category == category)

    ingredients = query.offset(skip).limit(limit).all()

    return [
        {
            "id": ingredient.id,
            "name": ingredient.name,
            "unit": ingredient.unit,
            # Fallback to 'other' if category is None
            "category": getattr(ingredient, 'category', 'other')
        }
        for ingredient in ingredients
    ]
