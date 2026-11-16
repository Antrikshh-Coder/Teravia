"""User profile and authentication models."""

from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserProfile(BaseModel):
    """Authenticated user profile."""
    id: str
    email: Optional[str] = None
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    role: str = "user"
    bio: Optional[str] = None
    created_at: Optional[str] = None


class ProfileUpdate(BaseModel):
    """Payload to update own profile details."""
    display_name: Optional[str] = Field(default=None, max_length=100)
    avatar_url: Optional[str] = Field(default=None, max_length=1000)
    bio: Optional[str] = Field(default=None, max_length=500)


class AuthStatusResponse(BaseModel):
    """Current session verification status."""
    is_authenticated: bool
    user: Optional[UserProfile] = None


class UserRegisterRequest(BaseModel):
    """Payload to register a new user account."""
    email: str = Field(..., description="User's valid email address")
    password: str = Field(..., min_length=6, description="Password with minimum 6 characters")
    display_name: Optional[str] = Field(default=None, max_length=100, description="Optional full display name")


class UserLoginRequest(BaseModel):
    """Payload to sign in to an existing account."""
    email: str = Field(..., description="Registered email address")
    password: str = Field(..., description="Account password")


class AuthTokenResponse(BaseModel):
    """Authentication success payload returning JWT token and user profile."""
    access_token: str
    token_type: str = "bearer"
    user: UserProfile
