import { z } from "zod";

export const searchModeSchema = z.enum(["web", "assistant", "vault"]);
export type SearchMode = z.infer<typeof searchModeSchema>;

export const tileSchema = z.object({
  id: z.string().cuid().or(z.string().min(1)),
  title: z.string().min(1, "Title is required").max(48, "Title must be 48 characters or fewer"),
  url: z.string().url("Enter a valid URL starting with https:// or http://"),
  icon: z.string().max(64).nullable().optional(),
  position: z.number().int().min(0).default(0),
  pinned: z.boolean().default(true),
  createdAt: z.string().or(z.date()).optional(),
});

export const createTileInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(48, "Max 48 characters"),
  url: z
    .string()
    .trim()
    .transform((val) => (/^https?:\/\//i.test(val) ? val : `https://${val}`))
    .pipe(z.string().url("Please enter a valid domain or URL")),
  icon: z.string().max(64).optional(),
  pinned: z.boolean().optional().default(true),
});

export const searchHistoryItemSchema = z.object({
  id: z.string(),
  query: z.string().min(1).max(500),
  mode: searchModeSchema,
  createdAt: z.string().or(z.date()),
});

export const createSearchHistoryInputSchema = z.object({
  query: z.string().trim().min(1, "Query cannot be empty").max(500),
  mode: searchModeSchema.default("web"),
});

export const userSettingsSchema = z.object({
  defaultSearchEngine: z.enum(["google", "duckduckgo", "kagi"]).default("google"),
  defaultMode: searchModeSchema.default("web"),
  theme: z.literal("dark").default("dark"),
  showTiles: z.boolean().default(true),
  keyboardShortcuts: z.boolean().default(true),
});

export type TileDTO = z.infer<typeof tileSchema>;
export type CreateTileInput = z.infer<typeof createTileInputSchema>;
export type SearchHistoryItemDTO = z.infer<typeof searchHistoryItemSchema>;
export type CreateSearchHistoryInput = z.infer<typeof createSearchHistoryInputSchema>;
export type UserSettingsDTO = z.infer<typeof userSettingsSchema>;
