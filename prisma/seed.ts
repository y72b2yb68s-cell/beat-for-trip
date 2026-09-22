import { PrismaClient } from "@prisma/client";
import { demoBeats } from "../lib/demo-data";
import { CURRENCY } from "../lib/currency";

const prisma = new PrismaClient();

async function main() {
  for (const beat of demoBeats) {
    await prisma.beat.upsert({
      where: { slug: beat.slug },
      // Re-running the seed also corrects currency drift on existing rows —
      // Beat For Trip only ever sells in EUR.
      update: { currency: CURRENCY },
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
        coverUrl: beat.coverUrl,
        previewUrl: beat.previewUrl,
        fileKey: "",
        status: beat.status,
      },
    });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    await prisma.admin.upsert({
      where: { email: adminEmail },
      update: {},
      create: { email: adminEmail },
    });
  }

  console.log(`Seeded ${demoBeats.length} beats.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
