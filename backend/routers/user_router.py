from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List, Annotated
from pydantic import BaseModel, EmailStr, Field, SecretStr

from db.base import get_db
from db.entries.User import User

router = APIRouter(
    prefix="/users",
    tags=["users"],
    responses={404: {"description": "Not found"}},
)


class UserBase(BaseModel):
    """Base User schema with shared attributes"""
    username: str = Field(..., min_length=3, max_length=50, example="johndoe")
    email: EmailStr = Field(..., example="john@example.com")


class UserCreate(UserBase):
    """Schema for creating a user with password"""
    password: str = Field(
        ...,
        min_length=8,
        example="password123",
        description="User password (min 8 characters)"
    )


class UserResponse(UserBase):
    """Schema for returning a user (without password)"""
    id: int

    class Config:
        from_attributes = True


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate, db: Annotated[Session, Depends(get_db)]):
    """
    Create a new user with securely hashed password (signup)

    Args:
        user: User data with password
        db: Database session

    Returns:
        The created user (without password)

    Raises:
        HTTPException: If username or email already exists
    """
    try:
        existing_username = db.query(User).filter(
            User.username == user.username).first()
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered"
            )

        existing_email = db.query(User).filter(
            User.email == user.email).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        db_user = User(
            username=user.username,
            email=user.email
        )
        db_user.password = user.password

        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error creating user. Username or email may already be in use."
        )


@router.get("/", response_model=List[UserResponse])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Get all users with pagination

    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        db: Database session

    Returns:
        List of users
    """
    users = db.query(User).offset(skip).limit(limit).all()
    return users


@router.get("/{user_id}", response_model=UserResponse)
def read_user(user_id: int, db: Annotated[Session, Depends(get_db)]):
    """
    Get a specific user by ID

    Args:
        user_id: User ID
        db: Database session

    Returns:
        User information

    Raises:
        HTTPException: If user not found
    """
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user
