import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { evaluateRefundWebhook, parseRefundFields, verifyRefundSignature } from "@/lib/payments/paypalych";

/**
 * PayPalych Refund URL — server-to-server notification that a refund was
 * issued for a previously paid order. Not part of the generic
 * PaymentProvider abstraction (Refund isn't a pending->paid/failed
 * transition), so it talks to the Order table directly.
 *
 * Only active once PAYPALYCH_API_TOKEN is set — without it there is no
 * secret to verify against, so every request is rejected (fails closed).
 */
export async function POST(request: NextRequest) {
  const secret = process.env.PAYPALYCH_API_TOKEN;
  if (!secret) {
    return NextResponse.json({ error: "PayPalych is not configured" }, { status: 503 });
  }

  const rawBody = await request.text();
  const fields = parseRefundFields(rawBody);
  if (!fields) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (!verifyRefundSignature(fields, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const order = await prisma.order.findUnique({
    where: { id: fields.invId },
    select: { amount: true, currency: true, status: true, refundId: true },
  });

  const decision = evaluateRefundWebhook(order, fields);

  switch (decision.action) {
    case "unknown-order":
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    case "amount-mismatch":
      return NextResponse.json({ error: "Amount does not match the order" }, { status: 400 });
    case "currency-mismatch":
      return NextResponse.json({ error: "Currency does not match the order" }, { status: 400 });
    case "duplicate":
    case "noop":
      // Already applied, or a FAIL notification — acknowledge without
      // repeating any side effects (idempotent by design).
      return NextResponse.json({ received: true });
    case "apply":
      await prisma.order.update({
        where: { id: fields.invId },
        data: { status: "refunded", refundId: fields.id },
      });
      return NextResponse.json({ received: true });
  }
}
