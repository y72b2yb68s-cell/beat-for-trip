import { NextRequest, NextResponse } from "next/server";
import { processPaymentWebhook } from "@/lib/payments/process-webhook";
import { parsePaymentFields } from "@/lib/payments/paypalych";

/**
 * PayPalych Result URL — server-to-server payment confirmation
 * (application/x-www-form-urlencoded). This is the ONLY source of truth for
 * marking an order paid; the Success/Fail redirect pages never do this
 * themselves (see app/[locale]/payment/success/page.tsx, which only polls
 * GET /api/orders/[id]).
 *
 * Reuses the existing generic processPaymentWebhook() — the same idempotent
 * pending->paid/failed logic Tribute would use — instead of duplicating it.
 * getPaymentProvider() resolves to PayPalychPaymentProvider once
 * PAYPALYCH_API_TOKEN/PAYPALYCH_SHOP_ID are set (see lib/payments/index.ts).
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const fields = parsePaymentFields(rawBody);
  if (!fields) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const result = await processPaymentWebhook(rawBody, fields.signature);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.statusCode });
  }

  return NextResponse.json({ received: true, status: result.status });
}
