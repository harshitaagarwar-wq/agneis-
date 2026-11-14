import { describe, expect, it } from "vitest";
import { jwtVerify } from "jose";
import { signServiceJwt } from "./service-jwt";

describe("signServiceJwt", () => {
  it("signs a short-lived HS256 JWT with sub and scopes", async () => {
    process.env.SERVICE_JWT_SECRET = "test-service-secret-key-minimum-32-chars";
    const token = await signServiceJwt("user_123", ["ai:chat"]);

    const key = new TextEncoder().encode(process.env.SERVICE_JWT_SECRET);
    const { payload } = await jwtVerify(token, key, {
      issuer: "aegis-web",
      audience: "aegis-ai",
    });

    expect(payload.sub).toBe("user_123");
    expect(payload.scopes).toEqual(["ai:chat"]);
    expect(payload.exp).toBeDefined();
  });
});
