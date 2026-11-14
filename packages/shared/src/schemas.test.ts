import { describe, expect, it } from "vitest";
import { createTileInputSchema, parseServerEnv, sseEventSchema } from "./index";

describe("@aegis/shared contracts", () => {
  it("normalizes tile URLs without explicit protocol", () => {
    const parsed = createTileInputSchema.parse({
      title: "Linear",
      url: "linear.app",
    });
    expect(parsed.url).toBe("https://linear.app");
  });

  it("validates typed SSE events", () => {
    const tokenEvent = sseEventSchema.parse({
      type: "token",
      data: { content: "Hello" },
    });
    expect(tokenEvent.type).toBe("token");
  });

  it("validates server environment variables", () => {
    const env = parseServerEnv({
      NODE_ENV: "test",
      DATABASE_URL: "postgresql://aegis:aegis@localhost:5432/aegis",
      NEXTAUTH_URL: "http://localhost:3000",
      NEXTAUTH_SECRET: "1234567890abcdef1234567890abcdef",
      SERVICE_JWT_SECRET: "1234567890abcdef1234567890abcdef",
    });
    expect(env.AI_SERVICE_URL).toBe("http://localhost:8000");
  });
});
