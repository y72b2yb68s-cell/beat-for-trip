import { createHmac, randomUUID } from "node:crypto";
import type { CreatePaymentParams, CreatePaymentResult, PaymentProvider, WebhookEvent } from "./types";

// Dev-only signing secret for the simulated gateway. Never used for real money —
// swapped out entirely once TRIBUTE_API_KEY/TRIBUTE_WEBHOOK_SECRET are set and
// PaymentService starts returning TributePaymentProvider instead.
const MOCK_SECRET = "mock-provider-dev-secret";

function sign(payload: string): string {
  return createHmac("sha256", MOCK_SECRET).update(payload).digest("hex");
}

/**
 * Simulates a hosted payment gateway (stands in for Tribute until credentials
 * exist). Mirrors the real flow: creates a pending payment + redirect URL,
 * then later verifies a signed webhook-style payload before an Order is
 * marked paid — nothing is ever marked paid purely off a browser redirect.
 */
export class MockPaymentProvider implements PaymentProvider {
  readonly name = "mock";

  async createPayment(params: CreatePaymentParams): Promise<CreatePaymentResult> {
    const paymentId = `mock_${randomUUID()}`;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const prefix = params.locale && params.locale !== "en" ? `/${params.locale}` : "";
    return {
      paymentId,
      redirectUrl: `${appUrl}${prefix}/payment/mock/${paymentId}`,
    };
  }

  signPayload(payload: string): string {
    return sign(payload);
  }

  verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
    if (!signature) return false;
    return signature === sign(rawBody);
  }

  parseWebhookEvent(rawBody: string): WebhookEvent {
    const data = JSON.parse(rawBody) as { paymentId?: unknown; status?: unknown };
    if (typeof data.paymentId !== "string") {
      throw new Error("Invalid mock webhook payload: missing paymentId");
    }
    if (data.status !== "paid" && data.status !== "failed") {
      throw new Error("Invalid mock webhook payload: invalid status");
    }
    return { paymentId: data.paymentId, status: data.status };
  }
}
