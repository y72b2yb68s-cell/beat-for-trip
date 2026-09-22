import { NextRequest, NextResponse } from "next/server";
import { getOrderByPaymentId } from "@/lib/orders";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ paymentId: string }> }) {
  const { paymentId } = await params;
  const order = await getOrderByPaymentId(paymentId);
  if (!order) {
    return NextResponse.json({ error: "Payment session not found." }, { status: 404 });
  }

  return NextResponse.json({
    beatTitle: order.type === "EXCLUSIVE_BEAT" ? "Exclusive Beat" : (order.beat?.title ?? "Beat"),
    amount: order.amount,
    currency: order.currency,
    status: order.status,
    orderId: order.id,
  });
}
