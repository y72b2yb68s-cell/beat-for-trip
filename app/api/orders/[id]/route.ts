import { NextRequest, NextResponse } from "next/server";
import { getOrderById } from "@/lib/orders";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const isExclusive = order.type === "EXCLUSIVE_BEAT";

  return NextResponse.json({
    id: order.id,
    type: order.type,
    status: order.status,
    beatTitle: isExclusive ? null : (order.beat?.title ?? null),
    beatSlug: isExclusive ? null : (order.beat?.slug ?? null),
    amount: order.amount,
    currency: order.currency,
    downloadUrl:
      !isExclusive && order.status === "paid" && order.downloadToken
        ? `/api/download/${order.downloadToken}`
        : null,
  });
}
