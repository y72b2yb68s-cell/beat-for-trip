import type { PaymentProvider } from "./types";
import { MockPaymentProvider } from "./mock-provider";
import { TributePaymentProvider } from "./tribute-provider";
import { PayPalychPaymentProvider } from "./paypalych-provider";

/**
 * Single entry point the rest of the app uses to talk to "whichever payment
 * provider is active." Selection is automatic based on which credentials are
 * set in the environment; otherwise the mock provider keeps the full
 * buy → pay → webhook → order → download flow working end to end locally.
 */
export function getPaymentProvider(): PaymentProvider {
  if (process.env.PAYPALYCH_API_TOKEN && process.env.PAYPALYCH_SHOP_ID) {
    return new PayPalychPaymentProvider();
  }
  if (process.env.TRIBUTE_API_KEY && process.env.TRIBUTE_WEBHOOK_SECRET) {
    return new TributePaymentProvider();
  }
  return new MockPaymentProvider();
}

export type { CreatePaymentParams, CreatePaymentResult, PaymentProvider, WebhookEvent } from "./types";
