import type { MetadataRoute } from "next";
import { getPublishedBeats } from "@/lib/beats";
import { localePath } from "@/lib/seo";
import { routing } from "@/i18n/routing";

const STATIC_PATHS = ["/", "/beats", "/exclusive-beat", "/about", "/terms", "/privacy"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const beats = await getPublishedBeats().catch(() => []);
  const beatPaths = beats.map((b) => `/beats/${b.slug}`);
  const paths = [...STATIC_PATHS, ...beatPaths];

  const entries: MetadataRoute.Sitemap = [];
  for (const path of paths) {
    for (const locale of routing.locales) {
      entries.push({ url: `${appUrl}${localePath(locale, path)}` });
    }
  }
  return entries;
}
