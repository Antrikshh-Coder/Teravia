"""Cryptographic security utilities for authentication and JWT issuance."""

import hashlib
import hmac
import secrets
from datetime import datetime, timezone, timedelta
from typing import Optional, Tuple
from jose import jwt, JWTError

from ..config import settings


def hash_password(password: str, salt: Optional[str] = None) -> Tuple[str, str]:
    """
    Hash a password using PBKDF2-HMAC-SHA256 with 100,000 iterations.
    Returns (hex_hash, hex_salt).
    """
    if salt is None:
        salt = secrets.token_hex(16)
    
    salt_bytes = bytes.fromhex(salt)
    derived = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt_bytes,
        100_000,
    )
    return derived.hex(), salt


def verify_password(password: str, stored_hash: str, salt: str) -> bool:
    """Verify password matches PBKDF2 hash using constant-time comparison."""
    try:
        calculated_hash, _ = hash_password(password, salt)
        return hmac.compare_digest(calculated_hash, stored_hash)
    except Exception:
        return False


def create_access_token(
    user_id: str,
    email: str,
    display_name: Optional[str] = None,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Generate signed JWT access token with expiration and user payload."""
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.jwt_access_token_expire_minutes)

    to_encode = {
        "sub": user_id,
        "email": email,
        "name": display_name or email.split("@")[0],
        "user_metadata": {
            "full_name": display_name or email.split("@")[0],
        },
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
        "iss": "teravia-auth",
    }

    secret = settings.supabase_jwt_secret or settings.jwt_secret_key
    encoded_jwt = jwt.encode(to_encode, secret, algorithm=settings.jwt_algorithm)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    """Decode and verify JWT signature and expiration."""
    secret = settings.supabase_jwt_secret or settings.jwt_secret_key
    try:
        payload = jwt.decode(token, secret, algorithms=[settings.jwt_algorithm])
        # Validate expiration
        exp = payload.get("exp")
        if exp and datetime.now(timezone.utc).timestamp() > exp:
            return None
        return payload
    except JWTError:
        return None
