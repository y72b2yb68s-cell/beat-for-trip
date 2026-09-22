import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPaymentProvider } from "@/lib/payments";
import { MockPaymentProvider } from "@/lib/payments/mock-provider";
import { processPaymentWebhook } from "@/lib/payments/process-webhook";

const schema = z.object({ status: z.enum(["paid", "failed"]) });

/**
 * Stands in for the payment gateway calling our webhook after the user acts
 * on its hosted page. Builds the same signed payload a real provider would
 * send and runs it through the exact same processPaymentWebhook() the real
 * /api/payment/webhook endpoint uses — order state never flips just because
 * this route was hit.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  const provider = getPaymentProvider();
  if (!(provider instanceof MockPaymentProvider)) {
    return NextResponse.json({ error: "Mock payment is not active." }, { status: 400 });
  }

  const { paymentId } = await params;
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const rawBody = JSON.stringify({ paymentId, status: parsed.data.status });
  const signature = provider.signPayload(rawBody);

  const result = await processPaymentWebhook(rawBody, signature);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.statusCode });
  }

  return NextResponse.json({ status: result.status });
}
