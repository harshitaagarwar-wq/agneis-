import { z } from "zod";

export const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid PostgreSQL connection string"),
  REDIS_URL: z.string().url().optional().or(z.literal("")),
  UPSTASH_REDIS_REST_URL: z.string().url().optional().or(z.literal("")),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional().default(""),
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL"),
  NEXTAUTH_SECRET: z.string().min(16, "NEXTAUTH_SECRET must be at least 16 characters"),
  GOOGLE_CLIENT_ID: z.string().optional().default(""),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(""),
  GITHUB_ID: z.string().optional().default(""),
  GITHUB_SECRET: z.string().optional().default(""),
  SERVICE_JWT_SECRET: z.string().min(16, "SERVICE_JWT_SECRET must be at least 16 characters"),
  AI_SERVICE_URL: z.string().url().default("http://localhost:8000"),
  ANTHROPIC_API_KEY: z.string().optional().default(""),
  VOYAGE_API_KEY: z.string().optional().default(""),
  OPENAI_API_KEY: z.string().optional().default(""),
  TAVILY_API_KEY: z.string().optional().default(""),
  LANGFUSE_PUBLIC_KEY: z.string().optional().default(""),
  LANGFUSE_SECRET_KEY: z.string().optional().default(""),
  LANGFUSE_HOST: z.string().url().optional().default("https://cloud.langfuse.com"),
  SENTRY_DSN: z.string().optional().default(""),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function parseServerEnv(rawEnv: Record<string, string | undefined> = process.env): ServerEnv {
  const result = serverEnvSchema.safeParse(rawEnv);
  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid Aegis server environment configuration:\n${formatted}`);
  }
  return result.data;
}

export const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().default("Aegis"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

export function parsePublicEnv(rawEnv: Record<string, string | undefined> = process.env): PublicEnv {
  return publicEnvSchema.parse({
    NEXT_PUBLIC_APP_NAME: rawEnv.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_URL: rawEnv.NEXT_PUBLIC_APP_URL,
  });
}
