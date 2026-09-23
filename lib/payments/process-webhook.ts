import { prisma } from "@/lib/db";
import { getEmailProvider } from "@/lib/email";
import { DOWNLOAD_TOKEN_TTL_MS, generateDownloadToken, getOrderByPaymentId } from "@/lib/orders";
import { getPaymentProvider } from "./index";
import { amountsMatch } from "./types";

export type WebhookProcessResult =
  | { ok: true; status: "paid" | "failed" | "already-processed" }
  | { ok: false; error: string; statusCode: number };

/**
 * Single source of truth for turning a verified payment-provider event into
 * an Order state change. Both the real webhook endpoint (/api/payment/webhook)
 * and the mock gateway's "Pay Now" action funnel through this — an Order is
 * NEVER marked paid just because the user's browser was redirected somewhere.
 */
export async function processPaymentWebhook(
  rawBody: string,
  signature: string | null
): Promise<WebhookProcessResult> {
  const provider = getPaymentProvider();

  if (!provider.verifyWebhookSignature(rawBody, signature)) {
    return { ok: false, error: "Invalid signature", statusCode: 401 };
  }

  let event;
  try {
    event = provider.parseWebhookEvent(rawBody);
  } catch {
    return { ok: false, error: "Invalid payload", statusCode: 400 };
  }

  const order = await getOrderByPaymentId(event.paymentId);
  if (!order) {
    return { ok: false, error: "Order not found", statusCode: 404 };
  }

  if (order.status !== "pending") {
    return { ok: true, status: "already-processed" };
  }

  if (event.status === "paid") {
    // Only providers that supply amount/currency on the event (currently
    // PayPalych) get this check — Mock/Tribute omit both fields and are
    // unaffected. Must run before any status="paid" write or download token.
    if (event.amount !== undefined && !amountsMatch(event.amount, order.amount)) {
      return { ok: false, error: "Amount does not match the order", statusCode: 400 };
    }
    if (event.currency !== undefined && event.currency !== order.currency) {
      return { ok: false, error: "Currency does not match the order", statusCode: 400 };
    }

    const isExclusive = order.type === "EXCLUSIVE_BEAT";

    // Exclusive Beat orders have no file yet — the beat is produced after
    // payment — so no download token is ever issued for them.
    const downloadToken = isExclusive ? null : generateDownloadToken();
    const downloadTokenExpiresAt = isExclusive ? null : new Date(Date.now() + DOWNLOAD_TOKEN_TTL_MS);

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "paid",
        downloadToken,
        downloadTokenExpiresAt,
        ...(isExclusive ? { fulfillmentStatus: "PAID" } : {}),
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    await getEmailProvider().sendOrderConfirmation({
      to: order.email,
      itemLabel: isExclusive ? "Exclusive Beat" : (order.beat?.title ?? "Beat"),
      amount: order.amount,
      currency: order.currency,
      downloadUrl: isExclusive || !downloadToken ? undefined : `${appUrl}/api/download/${downloadToken}`,
    });

    return { ok: true, status: "paid" };
  }

  await prisma.order.update({ where: { id: order.id }, data: { status: "failed" } });
  return { ok: true, status: "failed" };
}
