import type { CreatePaymentParams, CreatePaymentResult, PaymentProvider, WebhookEvent } from "./types";
import { parsePaymentFields, verifyPaymentSignature } from "./paypalych";

// Seen as both https://paypalych.com/api/v1/ and https://pal24.pro/api/v1/ in
// real PayPalych integrations — confirm the correct one for your shop and
// override with PAYPALYCH_API_BASE_URL if needed.
const DEFAULT_BASE_URL = "https://paypalych.com/api/v1/";

/**
 * PayPalych integration. Reuses the existing generic webhook pipeline
 * (lib/payments/process-webhook.ts) for the Payment/Result flow — only
 * Refund and Chargeback (which aren't "pending -> paid/failed" transitions)
 * get their own dedicated routes, see app/api/payment/paypalych/.
 *
 * `createPayment`'s returned `paymentId` is deliberately the same value as
 * `params.orderId` (our own Order.id), not PayPalych's bill_id. PayPalych's
 * Result webhook only carries `InvId` (which we set to Order.id when
 * creating the bill) — it does not carry the bill_id — so mirroring
 * Order.id into Order.paymentId at creation time is what makes the existing
 * `getOrderByPaymentId(event.paymentId)` lookup in process-webhook.ts resolve
 * correctly without any changes to that shared code path.
 */
export class PayPalychPaymentProvider implements PaymentProvider {
  readonly name = "paypalych";

  private get apiToken(): string {
    const token = process.env.PAYPALYCH_API_TOKEN;
    if (!token) throw new Error("PAYPALYCH_API_TOKEN is not configured");
    return token;
  }

  private get shopId(): string {
    const shopId = process.env.PAYPALYCH_SHOP_ID;
    if (!shopId) throw new Error("PAYPALYCH_SHOP_ID is not configured");
    return shopId;
  }

  private get baseUrl(): string {
    const raw = process.env.PAYPALYCH_API_BASE_URL ?? DEFAULT_BASE_URL;
    // new URL("bill/create", base) silently drops the last path segment of
    // `base` when it has no trailing slash (e.g. ".../api/v1" -> ".../api/bill/create").
    // Normalize once here so every caller gets the intended ".../api/v1/bill/create".
    return raw.endsWith("/") ? raw : `${raw}/`;
  }

  async createPayment(params: CreatePaymentParams): Promise<CreatePaymentResult> {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const prefix = params.locale && params.locale !== "en" ? `/${params.locale}` : "";
    const successUrl = `${appUrl}${prefix}/payment/success?order=${params.orderId}`;
    const failUrl = `${appUrl}${prefix}/payment/failed?order=${params.orderId}`;

    const body = new URLSearchParams({
      shop_id: this.shopId,
      order_id: params.orderId,
      amount: params.amount.toFixed(2),
      currency_in: params.currency,
      description: params.description,
      type: "normal",
      success_url: successUrl,
      fail_url: failUrl,
    });

    const response = await fetch(new URL("bill/create", this.baseUrl), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: body.toString(),
    });

    const data = (await response.json().catch(() => null)) as
      | { success?: boolean; link_page_url?: string; link_url?: string; bill_id?: string; message?: string }
      | null;

    if (!response.ok || !data?.success) {
      throw new Error(data?.message ?? `PayPalych bill creation failed (HTTP ${response.status})`);
    }

    const redirectUrl = data.link_page_url ?? data.link_url;
    if (!redirectUrl) {
      throw new Error("PayPalych bill creation response is missing a redirect URL");
    }

    return { paymentId: params.orderId, redirectUrl };
  }

  verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
    if (!signature) return false;
    const fields = parsePaymentFields(rawBody);
    if (!fields) return false;
    return verifyPaymentSignature(fields, this.apiToken);
  }

  parseWebhookEvent(rawBody: string): WebhookEvent {
    const fields = parsePaymentFields(rawBody);
    if (!fields) {
      throw new Error("Invalid PayPalych payment webhook payload");
    }
    return {
      paymentId: fields.invId,
      status: fields.status === "SUCCESS" ? "paid" : "failed",
      amount: Number.parseFloat(fields.outSum),
      currency: fields.currencyIn,
    };
  }
}
