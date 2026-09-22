import type { PaymentProvider } from "./types";
import { MockPaymentProvider } from "./mock-provider";
import { TributePaymentProvider } from "./tribute-provider";

/**
 * Single entry point the rest of the app uses to talk to "whichever payment
 * provider is active." Selection is automatic: Tribute is used once its
 * credentials are set in the environment, otherwise the mock provider keeps
 * the full buy → pay → webhook → order → download flow working end to end.
 */
export function getPaymentProvider(): PaymentProvider {
  if (process.env.TRIBUTE_API_KEY && process.env.TRIBUTE_WEBHOOK_SECRET) {
    return new TributePaymentProvider();
  }
  return new MockPaymentProvider();
}

export type { CreatePaymentParams, CreatePaymentResult, PaymentProvider, WebhookEvent } from "./types";
