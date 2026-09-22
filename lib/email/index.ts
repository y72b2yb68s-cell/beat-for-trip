import type { EmailProvider } from "./types";
import { MockEmailProvider } from "./mock-provider";

/**
 * Single entry point for sending transactional email. Currently always the
 * mock provider (logs to the server console). To go live, implement
 * EmailProvider against Resend or SendGrid and return it from here based on
 * an env var (e.g. RESEND_API_KEY) — no caller needs to change.
 */
export function getEmailProvider(): EmailProvider {
  return new MockEmailProvider();
}

export type { EmailProvider, OrderConfirmationEmail } from "./types";
