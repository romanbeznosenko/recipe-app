from db.entries.TimestampMixin import TimestampMixin
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from db.base import Base
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"])

class User(Base, TimestampMixin):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String(255), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)

    recipes = relationship("Recipe", back_populates="user", 
                      cascade="all, delete-orphan",
                      lazy="selectin")

    @property
    def password(self):
        """
        Password getter - raises an exception since we don't store or return plain passwords
        """
        raise AttributeError("Password is not a readable attribute")
    
    @password.setter
    def password(self, password):
        """
        Password setter - hashes the provided password and stores the hash
        """
        self.hashed_password = self._get_password_hash(password)
    
    @staticmethod
    def _get_password_hash(password):
        """
        Hash a password using bcrypt
        """
        return pwd_context.hash(password)
    
    def verify_password(self, plain_password):
        """
        Verify a password against the stored hash
        """
        return pwd_context.verify(plain_password, self.hashed_password)
    
    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', email='{self.email}')>"