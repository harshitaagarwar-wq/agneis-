import { z } from "zod";

export const sourceCitationSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string().url(),
  snippet: z.string().optional(),
  score: z.number().optional(),
  origin: z.enum(["vault", "web"]),
});

export const sseTokenEventSchema = z.object({
  type: z.literal("token"),
  data: z.object({
    content: z.string(),
  }),
});

export const sseSourceEventSchema = z.object({
  type: z.literal("source"),
  data: sourceCitationSchema,
});

export const sseStepEventSchema = z.object({
  type: z.literal("step"),
  data: z.object({
    stepId: z.string(),
    label: z.string(),
    status: z.enum(["pending", "running", "completed", "failed"]),
  }),
});

export const sseApprovalRequestEventSchema = z.object({
  type: z.literal("approval_request"),
  data: z.object({
    runId: z.string(),
    threadId: z.string(),
    action: z.string(),
    summary: z.string(),
    payload: z.record(z.unknown()),
  }),
});

export const sseDoneEventSchema = z.object({
  type: z.literal("done"),
  data: z.object({
    runId: z.string().optional(),
    finishReason: z.enum(["stop", "cancelled", "interrupted"]).default("stop"),
  }),
});

export const sseErrorEventSchema = z.object({
  type: z.literal("error"),
  data: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

export const sseEventSchema = z.discriminatedUnion("type", [
  sseTokenEventSchema,
  sseSourceEventSchema,
  sseStepEventSchema,
  sseApprovalRequestEventSchema,
  sseDoneEventSchema,
  sseErrorEventSchema,
]);

export type SourceCitation = z.infer<typeof sourceCitationSchema>;
export type SseEvent = z.infer<typeof sseEventSchema>;
