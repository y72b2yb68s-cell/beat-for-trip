import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { evaluateChargebackWebhook, parseChargebackFields, verifyChargebackSignature } from "@/lib/payments/paypalych";

/**
 * PayPalych Chargeback URL — server-to-server notification of a confirmed
 * card chargeback. Sets the same "refunded" status the UI already renders
 * (see app/[locale]/payment/success/page.tsx) — there's no separate
 * chargeback UI state, and adding one would be a design change. `chargebackId`
 * distinguishes it from a voluntary refund for admins/support.
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
  const fields = parseChargebackFields(rawBody);
  if (!fields) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (!verifyChargebackSignature(fields, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const order = await prisma.order.findUnique({
    where: { id: fields.invId },
    select: { status: true, chargebackId: true },
  });

  const decision = evaluateChargebackWebhook(order, fields);

  switch (decision.action) {
    case "unknown-order":
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    case "duplicate":
    case "noop":
      return NextResponse.json({ received: true });
    case "apply":
      await prisma.order.update({
        where: { id: fields.invId },
        data: { status: "refunded", chargebackId: fields.id },
      });
      return NextResponse.json({ received: true });
  }
}
