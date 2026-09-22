import { prisma } from "@/lib/db";
import type { Beat as PrismaBeat } from "@prisma/client";

/** Full row including fileKey/coverUrl/previewUrl — admin-only, never sent to public pages. */
export type AdminBeat = PrismaBeat;

export async function listAdminBeats(): Promise<AdminBeat[]> {
  return prisma.beat.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getAdminBeatById(id: string): Promise<AdminBeat | null> {
  return prisma.beat.findUnique({ where: { id } });
}

export async function isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
  const existing = await prisma.beat.findUnique({ where: { slug } });
  if (!existing) return false;
  return existing.id !== excludeId;
}
