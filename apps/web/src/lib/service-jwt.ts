import { SignJWT } from "jose";

export async function signServiceJwt(userId: string, scopes: string[] = ["ai:chat", "rag:read"]) {
  const secret = process.env.SERVICE_JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("SERVICE_JWT_SECRET is missing or too short");
  }
  const key = new TextEncoder().encode(secret);

  return new SignJWT({ scopes })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuer("aegis-web")
    .setAudience("aegis-ai")
    .setIssuedAt()
    .setExpirationTime("60s")
    .sign(key);
}
