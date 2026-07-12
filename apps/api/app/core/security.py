import uuid
from dataclasses import dataclass

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.models import Profile
from app.db.session import get_db

bearer = HTTPBearer(auto_error=False)

_jwks_client: jwt.PyJWKClient | None = None


def _jwks() -> jwt.PyJWKClient:
    # PyJWKClient caches keys internally; one instance for the process.
    global _jwks_client
    if _jwks_client is None:
        if not settings.SUPABASE_URL:
            raise HTTPException(500, "SUPABASE_URL not configured")
        _jwks_client = jwt.PyJWKClient(f"{settings.SUPABASE_URL}/auth/v1/.well-known/jwks.json")
    return _jwks_client


def verify_token(token: str) -> dict:
    """Independently verify a Supabase JWT — never trust the client.

    Dual-path: HS256 via shared secret on legacy projects (SUPABASE_JWT_SECRET
    set), else asymmetric RS256/ES256 via the project's JWKS endpoint.
    This project uses JWKS/ES256. aud and exp are always validated.
    """
    try:
        # leeway: local clocks drift a few seconds vs Supabase's — without it,
        # a freshly issued token can fail iat ("not yet valid") on first use.
        if settings.SUPABASE_JWT_SECRET:
            return jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                audience="authenticated",
                leeway=30,
            )
        key = _jwks().get_signing_key_from_jwt(token).key
        return jwt.decode(
            token, key, algorithms=["RS256", "ES256"], audience="authenticated", leeway=30
        )
    except jwt.PyJWTError as e:
        raise HTTPException(401, f"Invalid token: {e}") from e


@dataclass
class CurrentUser:
    """The auth contract for every route from here on."""

    id: uuid.UUID
    role: str
    email: str | None


def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_db),
) -> CurrentUser:
    if creds is None:
        raise HTTPException(401, "Missing bearer token")
    claims = verify_token(creds.credentials)
    user_id = uuid.UUID(claims["sub"])
    email = claims.get("email")

    profile = db.get(Profile, user_id)
    if profile is None:
        # Bootstrap-on-first-request: a profiles row always exists after any
        # authenticated call, whatever entry point the user hit first.
        meta = claims.get("user_metadata") or {}
        profile = Profile(
            user_id=user_id,
            role=meta.get("role", "candidate"),
            full_name=meta.get("full_name") or (email.split("@")[0] if email else "New user"),
        )
        db.add(profile)
        try:
            db.commit()
        except IntegrityError:
            # Concurrent first requests raced; the row exists now.
            db.rollback()
            profile = db.get(Profile, user_id)
    return CurrentUser(id=profile.user_id, role=profile.role, email=email)


def require_role(role: str):
    def dep(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if user.role != role:
            raise HTTPException(403, "Wrong role for this resource")
        return user

    return dep
