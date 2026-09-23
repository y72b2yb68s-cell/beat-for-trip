import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/require-admin";
import { listAllSiteContent, publishEntries, saveDrafts } from "@/lib/admin/website";
import { SITE_CONTENT_REGISTRY } from "@/lib/site-content-registry";
import { websiteContentUpdateSchema } from "@/lib/validation/website";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const content = await listAllSiteContent();
  return NextResponse.json({ registry: SITE_CONTENT_REGISTRY, content });
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = websiteContentUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    if (parsed.data.action === "save-draft") {
      await saveDrafts(parsed.data.entries);
    } else {
      await publishEntries(parsed.data.entries);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid CMS field";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const content = await listAllSiteContent();
  return NextResponse.json({ ok: true, content });
}
