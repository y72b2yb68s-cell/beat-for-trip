import { prisma } from "@/lib/db";
import type { SiteContent } from "@prisma/client";
import { getFieldDef } from "@/lib/site-content-registry";

export async function listAllSiteContent(): Promise<SiteContent[]> {
  return prisma.siteContent.findMany();
}

export type SaveDraftEntry = {
  page: string;
  section: string;
  key: string;
  locale: string;
  draftValue: string;
};

export type PublishEntry = {
  page: string;
  section: string;
  key: string;
  locale: string;
};

/** Only registered (page, section, key) combinations may ever be written — the registry is the sole source of truth. */
function assertRegistered(page: string, section: string, key: string) {
  if (!getFieldDef(page, section, key)) {
    throw new Error(`Unknown CMS field: ${page}/${section}/${key} — not in SITE_CONTENT_REGISTRY`);
  }
}

export async function saveDrafts(entries: SaveDraftEntry[]): Promise<void> {
  for (const entry of entries) {
    assertRegistered(entry.page, entry.section, entry.key);
  }

  await prisma.$transaction(
    entries.map((entry) =>
      prisma.siteContent.upsert({
        where: {
          page_section_key_locale: {
            page: entry.page,
            section: entry.section,
            key: entry.key,
            locale: entry.locale,
          },
        },
        update: { draftValue: entry.draftValue },
        create: {
          page: entry.page,
          section: entry.section,
          key: entry.key,
          locale: entry.locale,
          draftValue: entry.draftValue,
        },
      })
    )
  );
}

/** Copies draftValue -> value for each entry that has a draft. Entries with no existing row or no draft are skipped. */
export async function publishEntries(entries: PublishEntry[]): Promise<void> {
  for (const entry of entries) {
    assertRegistered(entry.page, entry.section, entry.key);
  }

  const rows = await prisma.siteContent.findMany({
    where: {
      OR: entries.map((e) => ({ page: e.page, section: e.section, key: e.key, locale: e.locale })),
    },
  });

  const publishable = rows.filter((r) => r.draftValue !== null);
  if (publishable.length === 0) return;

  await prisma.$transaction(
    publishable.map((row) => prisma.siteContent.update({ where: { id: row.id }, data: { value: row.draftValue } }))
  );
}
