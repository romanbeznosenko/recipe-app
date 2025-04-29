from pydantic import BaseModel
from schemes.UserPublic import UserPublic


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserPublic
