"""Authentication and user profile management router."""

import re
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from ..auth.dependencies import get_current_user, get_optional_user
from ..auth.security import hash_password, verify_password, create_access_token
from ..database import fetch_one, execute
from ..models.auth import (
    UserProfile,
    ProfileUpdate,
    AuthStatusResponse,
    UserRegisterRequest,
    UserLoginRequest,
    AuthTokenResponse,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

EMAIL_REGEX = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


@router.post("/register", response_model=AuthTokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: UserRegisterRequest):
    """
    Register a new user account with secure PBKDF2 password hashing.
    Issues a verified JWT access token on success.
    """
    clean_email = payload.email.strip().lower()
    if not EMAIL_REGEX.match(clean_email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a valid email address.",
        )

    if len(payload.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long.",
        )

    # Check for existing account
    existing = await fetch_one("SELECT id FROM user_accounts WHERE email = ?;", (clean_email,))
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists.",
        )

    user_id = f"user-{uuid.uuid4().hex[:12]}"
    pwd_hash, salt = hash_password(payload.password)
    now_iso = datetime.now(timezone.utc).isoformat()
    disp_name = payload.display_name.strip() if payload.display_name else clean_email.split("@")[0]

    # Save to user_accounts
    await execute(
        """
        INSERT INTO user_accounts (id, email, password_hash, salt, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?);
        """,
        (user_id, clean_email, pwd_hash, salt, now_iso, now_iso),
    )

    # Save to user_profiles
    await execute(
        """
        INSERT INTO user_profiles (id, email, display_name, avatar_url, role, bio, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        """,
        (user_id, clean_email, disp_name, "", "user", "", now_iso, now_iso),
    )

    token = create_access_token(user_id=user_id, email=clean_email, display_name=disp_name)
    user_profile = UserProfile(
        id=user_id,
        email=clean_email,
        display_name=disp_name,
        avatar_url="",
        role="user",
        bio="",
        created_at=now_iso,
    )

    return AuthTokenResponse(
        access_token=token,
        token_type="bearer",
        user=user_profile,
    )


@router.post("/login", response_model=AuthTokenResponse)
async def login(payload: UserLoginRequest):
    """
    Authenticate user credentials against stored PBKDF2 hash.
    Returns JWT access token and user profile.
    """
    clean_email = payload.email.strip().lower()
    account = await fetch_one("SELECT * FROM user_accounts WHERE email = ?;", (clean_email,))
    if not account:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    is_valid = verify_password(payload.password, account["password_hash"], account["salt"])
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = account["id"]
    profile_row = await fetch_one("SELECT * FROM user_profiles WHERE id = ?;", (user_id,))
    if not profile_row:
        now_iso = datetime.now(timezone.utc).isoformat()
        disp_name = clean_email.split("@")[0]
        await execute(
            """
            INSERT INTO user_profiles (id, email, display_name, avatar_url, role, bio, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);
            """,
            (user_id, clean_email, disp_name, "", "user", "", now_iso, now_iso),
        )
        profile_row = await fetch_one("SELECT * FROM user_profiles WHERE id = ?;", (user_id,))

    disp_name = profile_row["display_name"] if profile_row else clean_email.split("@")[0]
    token = create_access_token(user_id=user_id, email=clean_email, display_name=disp_name)

    user_profile = UserProfile(
        id=user_id,
        email=profile_row["email"] if profile_row else clean_email,
        display_name=disp_name,
        avatar_url=profile_row["avatar_url"] if profile_row else "",
        role=profile_row["role"] if profile_row else "user",
        bio=profile_row.get("bio", "") if profile_row else "",
        created_at=profile_row.get("created_at") if profile_row else None,
    )

    return AuthTokenResponse(
        access_token=token,
        token_type="bearer",
        user=user_profile,
    )


@router.post("/logout")
async def logout():
    """Sign out endpoint."""
    return {"status": "success", "message": "Successfully logged out of session."}


@router.get("/me", response_model=AuthStatusResponse)
async def get_current_auth_status(user: UserProfile = Depends(get_optional_user)):
    """Check session authentication status and return user profile if logged in."""
    if not user:
        return AuthStatusResponse(is_authenticated=False, user=None)

    row = await fetch_one("SELECT * FROM user_profiles WHERE id = ?;", (user.id,))
    if not row:
        now_iso = datetime.now(timezone.utc).isoformat()
        await execute(
            """
            INSERT INTO user_profiles (id, email, display_name, avatar_url, role, bio, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT (id) DO NOTHING;
            """,
            (user.id, user.email, user.display_name, user.avatar_url, user.role, "", now_iso, now_iso),
        )
        row = await fetch_one("SELECT * FROM user_profiles WHERE id = ?;", (user.id,))

    profile = UserProfile(
        id=user.id,
        email=row["email"] if row else user.email,
        display_name=row["display_name"] if row else user.display_name,
        avatar_url=row["avatar_url"] if row else user.avatar_url,
        role=row["role"] if row else user.role,
        bio=row.get("bio", "") if row else "",
        created_at=row.get("created_at") if row else None,
    )

    return AuthStatusResponse(is_authenticated=True, user=profile)


@router.put("/profile", response_model=UserProfile)
async def update_user_profile(
    payload: ProfileUpdate,
    user: UserProfile = Depends(get_current_user),
):
    """Update profile details for the authenticated user."""
    now_iso = datetime.now(timezone.utc).isoformat()

    existing = await fetch_one("SELECT * FROM user_profiles WHERE id = ?;", (user.id,))
    if not existing:
        await execute(
            """
            INSERT INTO user_profiles (id, email, display_name, avatar_url, role, bio, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);
            """,
            (user.id, user.email, payload.display_name or user.display_name, payload.avatar_url or user.avatar_url, "user", payload.bio or "", now_iso, now_iso),
        )
    else:
        new_name = payload.display_name if payload.display_name is not None else existing["display_name"]
        new_avatar = payload.avatar_url if payload.avatar_url is not None else existing["avatar_url"]
        new_bio = payload.bio if payload.bio is not None else existing["bio"]

        await execute(
            """
            UPDATE user_profiles
            SET display_name = ?, avatar_url = ?, bio = ?, updated_at = ?
            WHERE id = ?;
            """,
            (new_name, new_avatar, new_bio, now_iso, user.id),
        )

    updated = await fetch_one("SELECT * FROM user_profiles WHERE id = ?;", (user.id,))
    return UserProfile(
        id=user.id,
        email=updated["email"],
        display_name=updated["display_name"],
        avatar_url=updated["avatar_url"],
        role=updated["role"],
        bio=updated["bio"],
        created_at=updated["created_at"],
    )
