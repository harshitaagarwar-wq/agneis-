from fastapi import Depends, FastAPI

from app.auth import ServiceClaims, verify_service_jwt

app = FastAPI(title="Aegis AI Service", version="0.1.0")


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "aegis-ai"}


@app.get("/v1/whoami")
async def whoami(claims: ServiceClaims = Depends(verify_service_jwt)) -> dict[str, object]:
    return {"user_id": claims.user_id, "scopes": claims.scopes}
