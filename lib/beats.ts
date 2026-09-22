import { prisma } from "./db";
import type { Beat, BeatStatus } from "./types";
import type { Beat as PrismaBeat } from "@prisma/client";

export function toPublicBeat(b: PrismaBeat): Beat {
  return {
    id: b.id,
    title: b.title,
    slug: b.slug,
    description: b.description,
    genre: b.genre,
    bpm: b.bpm,
    key: b.key,
    duration: b.duration,
    price: b.price,
    currency: b.currency,
    coverUrl: b.coverUrl,
    previewUrl: b.previewUrl,
    status: b.status as BeatStatus,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  };
}

export async function getPublishedBeats(): Promise<Beat[]> {
  const beats = await prisma.beat.findMany({
    where: { status: "published" },
    orderBy: { createdAt: "desc" },
  });
  return beats.map(toPublicBeat);
}

export async function getPublishedBeatBySlug(slug: string): Promise<Beat | null> {
  const beat = await prisma.beat.findFirst({ where: { slug, status: "published" } });
  return beat ? toPublicBeat(beat) : null;
}
