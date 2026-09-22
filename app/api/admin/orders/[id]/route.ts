import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";
import { getAdminOrderById } from "@/lib/admin/orders";

const FULFILLMENT_STATUSES = ["PAID", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;
const schema = z.object({ fulfillmentStatus: z.enum(FULFILLMENT_STATUSES) });

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await getAdminOrderById(id);
  if (!existing) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  // Fulfillment status only applies to Exclusive Beat orders — regular Beat
  // orders are fully resolved by payment status and the download token.
  if (existing.type !== "EXCLUSIVE_BEAT") {
    return NextResponse.json({ error: "This order has no fulfillment status." }, { status: 400 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const order = await prisma.order.update({
    where: { id },
    data: { fulfillmentStatus: parsed.data.fulfillmentStatus },
  });

  return NextResponse.json({ order });
}
