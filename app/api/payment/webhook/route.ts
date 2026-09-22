import { NextRequest, NextResponse } from "next/server";
import { processPaymentWebhook } from "@/lib/payments/process-webhook";

/**
 * Receives payment-status webhooks from the active provider (Tribute once
 * configured; unused while the mock provider is active — the mock gateway
 * calls processPaymentWebhook directly instead of over HTTP). The signature
 * header name below is a placeholder; adjust it to match Tribute's actual
 * webhook header once their docs are available.
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-signature");

  const result = await processPaymentWebhook(rawBody, signature);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.statusCode });
  }

  return NextResponse.json({ received: true, status: result.status });
}
