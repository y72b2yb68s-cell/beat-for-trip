import type { CreatePaymentParams, CreatePaymentResult, PaymentProvider, WebhookEvent } from "./types";

/**
 * Tribute integration skeleton. Intentionally throws until TRIBUTE_API_KEY /
 * TRIBUTE_WEBHOOK_SECRET are set — PaymentService only ever hands out this
 * provider once both are configured, so these errors should never surface in
 * normal operation. Fill in the TODOs below against Tribute's real API docs
 * once the key is issued; no other part of the app needs to change.
 */
export class TributePaymentProvider implements PaymentProvider {
  readonly name = "tribute";

  private get apiKey(): string {
    const key = process.env.TRIBUTE_API_KEY;
    if (!key) throw new Error("TRIBUTE_API_KEY is not configured");
    return key;
  }

  private get webhookSecret(): string {
    const secret = process.env.TRIBUTE_WEBHOOK_SECRET;
    if (!secret) throw new Error("TRIBUTE_WEBHOOK_SECRET is not configured");
    return secret;
  }

  async createPayment(params: CreatePaymentParams): Promise<CreatePaymentResult> {
    void this.apiKey;
    void params;
    // TODO(tribute): POST to Tribute's payment-creation endpoint with
    // amount/currency/description/customerEmail and a webhook + return URL,
    // then return { paymentId, redirectUrl } from its response.
    throw new Error("Tribute payment provider is not yet implemented.");
  }

  verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
    void this.webhookSecret;
    void rawBody;
    void signature;
    // TODO(tribute): verify using Tribute's documented webhook signature
    // scheme (typically HMAC-SHA256 of the raw body using the webhook secret).
    throw new Error("Tribute webhook verification is not yet implemented.");
  }

  parseWebhookEvent(rawBody: string): WebhookEvent {
    void rawBody;
    // TODO(tribute): map Tribute's webhook payload shape to { paymentId, status }.
    throw new Error("Tribute webhook parsing is not yet implemented.");
  }
}
