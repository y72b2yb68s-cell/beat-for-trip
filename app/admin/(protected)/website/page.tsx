import { listAllSiteContent } from "@/lib/admin/website";
import { SITE_CONTENT_REGISTRY } from "@/lib/site-content-registry";
import WebsiteEditor, { type SiteContentRow } from "@/components/admin/WebsiteEditor";

export const dynamic = "force-dynamic";

export default async function AdminWebsitePage() {
  const rows = await listAllSiteContent();

  const content: SiteContentRow[] = rows.map((row) => ({
    page: row.page,
    section: row.section,
    key: row.key,
    locale: row.locale,
    value: row.value,
    draftValue: row.draftValue,
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold uppercase tracking-tight text-foreground">Website</h1>
        <p className="mt-1 text-sm text-muted">
          Edit the public site&apos;s text content per language. Save Draft to keep working on it privately,
          Publish when it&apos;s ready to go live.
        </p>
      </div>
      <WebsiteEditor registry={SITE_CONTENT_REGISTRY} initialContent={content} />
    </div>
  );
}
