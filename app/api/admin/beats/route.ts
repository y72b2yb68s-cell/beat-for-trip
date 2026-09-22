import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";
import { storage } from "@/lib/storage";
import { beatInputSchema } from "@/lib/validation/beat";
import { extractBeatFields, extractFile } from "@/lib/admin/parse-beat-form";
import { isSlugTaken, listAdminBeats } from "@/lib/admin/beats";
import { CURRENCY } from "@/lib/currency";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const beats = await listAdminBeats();
  return NextResponse.json({ beats });
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const parsed = beatInputSchema.safeParse(extractBeatFields(formData));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  if (await isSlugTaken(parsed.data.slug)) {
    return NextResponse.json({ error: "That slug is already in use." }, { status: 409 });
  }

  const cover = extractFile(formData, "cover");
  const preview = extractFile(formData, "preview");
  const full = extractFile(formData, "full");

  let coverUrl = "";
  let previewUrl = "";
  let fileKey = "";

  if (cover) coverUrl = await storage.savePublicFile("covers", cover.name, Buffer.from(await cover.arrayBuffer()));
  if (preview)
    previewUrl = await storage.savePublicFile("previews", preview.name, Buffer.from(await preview.arrayBuffer()));
  if (full) fileKey = await storage.saveProtectedFile(full.name, Buffer.from(await full.arrayBuffer()));

  const beat = await prisma.beat.create({
    // currency is never taken from the client — always EUR.
    data: { ...parsed.data, currency: CURRENCY, coverUrl, previewUrl, fileKey },
  });

  return NextResponse.json({ beat }, { status: 201 });
}
