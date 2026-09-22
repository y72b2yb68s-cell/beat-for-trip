import { z } from "zod";

export const beatInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers and hyphens only"),
  description: z.string().trim().min(1, "Description is required").max(5000),
  genre: z.string().trim().min(1, "Genre is required").max(60),
  bpm: z.coerce.number().int().min(1).max(400),
  key: z.string().trim().min(1, "Key is required").max(20),
  duration: z.coerce.number().int().min(1).max(3600),
  price: z.coerce.number().min(0).max(100000),
  status: z.enum(["published", "unpublished"]).default("unpublished"),
});

export type BeatInput = z.infer<typeof beatInputSchema>;
