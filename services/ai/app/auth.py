from dataclasses import dataclass

import jwt
from fastapi import Header, HTTPException, status

from app.config import settings


@dataclass(frozen=True)
class ServiceClaims:
    user_id: str
    scopes: list[str]


def verify_service_jwt(authorization: str = Header(default="")) -> ServiceClaims:
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Bearer service token",
        )
    token = authorization.removeprefix("Bearer ").strip()
    try:
        payload = jwt.decode(
            token,
            settings.service_jwt_secret,
            algorithms=["HS256"],
            audience="aegis-ai",
            issuer="aegis-web",
        )
    except jwt.PyJWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired service token",
        ) from exc

    user_id = str(payload.get("sub", ""))
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing subject in service token",
        )
    scopes = [str(s) for s in payload.get("scopes", [])]
    return ServiceClaims(user_id=user_id, scopes=scopes)
