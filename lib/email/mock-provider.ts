import type { EmailProvider, OrderConfirmationEmail } from "./types";
import { formatPrice } from "@/lib/utils";

/** Logs the email instead of sending it. Swap for Resend/SendGrid in lib/email/index.ts. */
export class MockEmailProvider implements EmailProvider {
  async sendOrderConfirmation(payload: OrderConfirmationEmail): Promise<void> {
    const suffix = payload.downloadUrl
      ? ` Download: ${payload.downloadUrl}`
      : " We'll contact you with the next steps.";
    console.log(
      `[mock-email] Order confirmation to ${payload.to}: "${payload.itemLabel}" — ` +
        `${formatPrice(payload.amount, payload.currency)}.${suffix}`
    );
  }
}
