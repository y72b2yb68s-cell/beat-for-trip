import { PrismaClient } from "@prisma/client";
import { CURRENCY } from "../lib/currency";

const prisma = new PrismaClient();

/**
 * Demo-only seed: the 5 real beats the client uploaded locally, recreated here
 * by metadata only (title/price/etc). Filenames below must match whatever is
 * uploaded to the Railway volume at /data/storage/beats via
 * `railway volume files upload` — this script never touches the audio files
 * themselves, only the DB rows that reference them by fileKey.
 *
 * Safe to run on every deploy: upsert by slug, never duplicates.
 */
const demoRealBeats = [
  {
    title: "Evidense",
    slug: "evidense",
    description: "Jazz beat for chill",
    genre: "Afrobeat",
    bpm: 85,
    key: "G# min",
    duration: 215,
    price: 30,
    fileKey: "1e5d2369-f89f-433f-b1c2-c52ec67d99af-chill-jazz---evidence.mp3",
  },
  {
    title: "LUMA",
    slug: "luma",
    description: "Glitch rage beat",
    genre: "Hip Hop",
    bpm: 150,
    key: "F# min",
    duration: 140,
    price: 50,
    fileKey: "6ba21584-5a72-4302-b11a-c24f25d7a62f-glitch-rage---luma.mp3",
  },
  {
    title: "Love It",
    slug: "love-it",
    description: "R&B beat",
    genre: "RnB",
    bpm: 95,
    key: "Dm",
    duration: 262,
    price: 40,
    fileKey: "55a89c23-4ff6-44f3-9b15-194fa510b85e-r-b---love-it.mp3",
  },
  {
    title: "Frank",
    slug: "frank",
    description: "R&N boom Bap beat",
    genre: "RnB",
    bpm: 90,
    key: "F# min",
    duration: 281,
    price: 90,
    fileKey: "65c5b189-f543-4ac7-b4ca-ab4858285197-r-b-x-boom-bap---frank.mp3",
  },
  {
    title: "though",
    slug: "though",
    description: "Raje beat like 2Hollis",
    genre: "Trap",
    bpm: 155,
    key: "B minnor",
    duration: 142,
    price: 130,
    fileKey: "e667dafd-9663-4a40-9b50-1d545466f4da-rage-beat---though.mp3",
  },
];

async function main() {
  for (const beat of demoRealBeats) {
    await prisma.beat.upsert({
      where: { slug: beat.slug },
      update: {
        title: beat.title,
        description: beat.description,
        genre: beat.genre,
        bpm: beat.bpm,
        key: beat.key,
        duration: beat.duration,
        price: beat.price,
        currency: CURRENCY,
        fileKey: beat.fileKey,
        status: "published",
      },
      create: {
        title: beat.title,
        slug: beat.slug,
        description: beat.description,
        genre: beat.genre,
        bpm: beat.bpm,
        key: beat.key,
        duration: beat.duration,
        price: beat.price,
        currency: CURRENCY,
        coverUrl: "",
        previewUrl: "",
        fileKey: beat.fileKey,
        status: "published",
      },
    });
  }

  console.log(`Demo seed: upserted ${demoRealBeats.length} real beats.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
