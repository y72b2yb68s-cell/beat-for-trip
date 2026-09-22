import { NextRequest, NextResponse } from "next/server";
import { getOrderByDownloadToken } from "@/lib/orders";
import { storage } from "@/lib/storage";
import { extOf, mimeForFilename } from "@/lib/mime";
import { slugify } from "@/lib/utils";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const order = await getOrderByDownloadToken(token);

  if (!order) {
    return NextResponse.json({ error: "Invalid or expired download link." }, { status: 404 });
  }

  if (order.status !== "paid") {
    return NextResponse.json({ error: "This order has not been paid." }, { status: 403 });
  }

  if (!order.downloadTokenExpiresAt || order.downloadTokenExpiresAt.getTime() < Date.now()) {
    return NextResponse.json({ error: "This download link has expired." }, { status: 410 });
  }

  // Exclusive Beat orders never have a file to serve — the beat is produced
  // after payment. This order type should never reach here (no download
  // token is ever issued for it), but the check stays explicit and first.
  if (order.type === "EXCLUSIVE_BEAT" || !order.beat) {
    return NextResponse.json({ error: "This order does not have a downloadable file." }, { status: 404 });
  }

  if (!order.beat.fileKey) {
    return NextResponse.json({ error: "The file for this beat is not available yet." }, { status: 404 });
  }

  const fileBuffer = await storage.readProtectedFile(order.beat.fileKey).catch(() => null);
  if (!fileBuffer) {
    return NextResponse.json({ error: "The file for this beat is not available yet." }, { status: 404 });
  }

  const filename = `${slugify(order.beat.title)}.${extOf(order.beat.fileKey)}`;

  return new NextResponse(new Uint8Array(fileBuffer), {
    headers: {
      "Content-Type": mimeForFilename(order.beat.fileKey),
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": fileBuffer.length.toString(),
      "Cache-Control": "no-store",
    },
  });
}
