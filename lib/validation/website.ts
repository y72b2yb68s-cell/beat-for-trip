import { z } from "zod";

const identifierSchema = z.object({
  page: z.string().trim().min(1).max(60),
  section: z.string().trim().min(1).max(60),
  key: z.string().trim().min(1).max(60),
  locale: z.string().trim().min(1).max(10),
});

export const saveDraftSchema = z.object({
  action: z.literal("save-draft"),
  entries: z
    .array(identifierSchema.extend({ draftValue: z.string().max(20000) }))
    .min(1)
    .max(200),
});

export const publishSchema = z.object({
  action: z.literal("publish"),
  entries: z.array(identifierSchema).min(1).max(200),
});

export const websiteContentUpdateSchema = z.discriminatedUnion("action", [saveDraftSchema, publishSchema]);

export type WebsiteContentUpdate = z.infer<typeof websiteContentUpdateSchema>;
