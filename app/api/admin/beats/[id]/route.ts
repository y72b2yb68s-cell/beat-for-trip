import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";
import { storage } from "@/lib/storage";
import { beatInputSchema } from "@/lib/validation/beat";
import { extractBeatFields, extractFile } from "@/lib/admin/parse-beat-form";
import { getAdminBeatById, isSlugTaken } from "@/lib/admin/beats";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const beat = await getAdminBeatById(id);
  if (!beat) return NextResponse.json({ error: "Beat not found" }, { status: 404 });
  return NextResponse.json({ beat });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await getAdminBeatById(id);
  if (!existing) return NextResponse.json({ error: "Beat not found" }, { status: 404 });

  const formData = await request.formData();
  const rawFields = extractBeatFields(formData);
  const parsed = beatInputSchema.partial().safeParse(rawFields);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  if (parsed.data.slug && (await isSlugTaken(parsed.data.slug, id))) {
    return NextResponse.json({ error: "That slug is already in use." }, { status: 409 });
  }

  const cover = extractFile(formData, "cover");
  const preview = extractFile(formData, "preview");
  const full = extractFile(formData, "full");

  // Zod's `.partial()` still applies `.default()` for keys missing from the
  // input, which would silently overwrite fields the admin never touched
  // (e.g. resetting status to "unpublished" on a files-only upload). Only
  // copy fields that were actually present in the submitted form.
  const data: Record<string, unknown> = {};
  for (const key of Object.keys(rawFields)) {
    data[key] = (parsed.data as Record<string, unknown>)[key];
  }

  if (cover) {
    data.coverUrl = await storage.savePublicFile("covers", cover.name, Buffer.from(await cover.arrayBuffer()));
    if (existing.coverUrl) await storage.deletePublicFile(existing.coverUrl);
  }
  if (preview) {
    data.previewUrl = await storage.savePublicFile(
      "previews",
      preview.name,
      Buffer.from(await preview.arrayBuffer())
    );
    if (existing.previewUrl) await storage.deletePublicFile(existing.previewUrl);
  }
  if (full) {
    data.fileKey = await storage.saveProtectedFile(full.name, Buffer.from(await full.arrayBuffer()));
    if (existing.fileKey) await storage.deleteProtectedFile(existing.fileKey);
  }

  const beat = await prisma.beat.update({ where: { id }, data });
  return NextResponse.json({ beat });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await getAdminBeatById(id);
  if (!existing) return NextResponse.json({ error: "Beat not found" }, { status: 404 });

  if (existing.coverUrl) await storage.deletePublicFile(existing.coverUrl);
  if (existing.previewUrl) await storage.deletePublicFile(existing.previewUrl);
  if (existing.fileKey) await storage.deleteProtectedFile(existing.fileKey);

  await prisma.beat.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
