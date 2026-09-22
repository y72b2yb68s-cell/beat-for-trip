export type CreatePaymentParams = {
  orderId: string;
  amount: number; // major currency units, e.g. 29.99
  currency: string;
  description: string;
  customerEmail: string;
  /** Locale the buyer is browsing in, used to localize any hosted payment page we control. */
  locale?: string;
};

export type CreatePaymentResult = {
  /** Provider-side identifier for this payment/session, stored on the Order. */
  paymentId: string;
  /** Where to send the browser to complete payment (a hosted payment page, or a mock stand-in). */
  redirectUrl: string;
};

export type WebhookEvent = {
  paymentId: string;
  status: "paid" | "failed";
};

export interface PaymentProvider {
  readonly name: string;
  createPayment(params: CreatePaymentParams): Promise<CreatePaymentResult>;
  verifyWebhookSignature(rawBody: string, signature: string | null): boolean;
  parseWebhookEvent(rawBody: string): WebhookEvent;
}
