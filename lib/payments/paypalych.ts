import { createHash, timingSafeEqual } from "node:crypto";
import { amountsMatch as numbersMatch } from "./types";

/**
 * PayPalych signature verification and webhook parsing.
 *
 * The exact field names and MD5 formula below are NOT guessed — they're
 * cross-verified from two independent, real, published PayPalych
 * integrations (not just their SDK's doc comments):
 *
 * 1. bytestore/paypalych-whmcs (PHP, WHMCS gateway module) — the Result URL
 *    callback literally computes:
 *      strtoupper(md5($OutSum . ":" . $InvId . ":" . $secretKey))
 *    and compares it to the incoming `SignatureValue` field. Secret used is
 *    the same API token used to authenticate outbound API calls (Bearer).
 *    https://github.com/bytestore/paypalych-whmcs/blob/main/modules/gateways/callback/paypalych.php
 *
 * 2. github.com/dmedovich/paypalych-go-sdk (Go) — ships the same formula
 *    plus the Refund/Chargeback formulas below, with passing unit tests
 *    (webhooks_test.go) asserting the exact concatenation order.
 *
 * Payment (Result URL) webhook, application/x-www-form-urlencoded:
 *   InvId, OutSum, Commission, TrsId, Status, CurrencyIn, custom, SignatureValue, ...
 *   signature = MD5(OutSum:InvId:secret), uppercase hex
 *
 * Refund webhook:
 *   Id, Amount, Currency, Status, InvId, BillId, PaymentId, SignatureValue
 *   signature = MD5(Amount:Currency:BillId:PaymentId:Id:secret), uppercase hex
 *
 * Chargeback webhook:
 *   Id, Status, InvId, BillId, PaymentId, SignatureValue
 *   signature = MD5(BillId:PaymentId:Id:secret), uppercase hex
 *
 * NOT independently confirmed — verify against the actual PayPalych merchant
 * dashboard / docs before going live:
 *   - The production API base URL (seen as both https://paypalych.com/api/v1/
 *     and https://pal24.pro/api/v1/ across the two sources above).
 *   - Whether PayPalych ever issues a separate "signature secret" distinct
 *     from the API token — both real integrations above use one single
 *     token for both outbound Bearer auth and inbound signature verification,
 *     but PayPalych's own dashboard is the authority on this.
 *   - The exact allowed values of Refund/Chargeback `Status` beyond
 *     SUCCESS/FAIL (this file only implements those two, per spec).
 */

export type PaypalychPaymentFields = {
  invId: string;
  outSum: string;
  trsId: string;
  status: string;
  currencyIn: string;
  signature: string;
};

export type PaypalychRefundFields = {
  id: string;
  amount: string;
  currency: string;
  status: string;
  invId: string;
  billId: string;
  paymentId: string;
  signature: string;
};

export type PaypalychChargebackFields = {
  id: string;
  status: string;
  invId: string;
  billId: string;
  paymentId: string;
  signature: string;
};

function md5Signature(...parts: string[]): string {
  return createHash("md5").update(parts.join(":")).digest("hex").toUpperCase();
}

function signaturesEqual(actual: string, expected: string): boolean {
  const a = Buffer.from(actual.trim().toUpperCase());
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function paymentSignature(outSum: string, invId: string, secret: string): string {
  return md5Signature(outSum, invId, secret);
}

export function refundSignature(
  amount: string,
  currency: string,
  billId: string,
  paymentId: string,
  refundId: string,
  secret: string
): string {
  return md5Signature(amount, currency, billId, paymentId, refundId, secret);
}

export function chargebackSignature(billId: string, paymentId: string, chargebackId: string, secret: string): string {
  return md5Signature(billId, paymentId, chargebackId, secret);
}

export function verifyPaymentSignature(fields: PaypalychPaymentFields, secret: string): boolean {
  return signaturesEqual(fields.signature, paymentSignature(fields.outSum, fields.invId, secret));
}

export function verifyRefundSignature(fields: PaypalychRefundFields, secret: string): boolean {
  return signaturesEqual(
    fields.signature,
    refundSignature(fields.amount, fields.currency, fields.billId, fields.paymentId, fields.id, secret)
  );
}

export function verifyChargebackSignature(fields: PaypalychChargebackFields, secret: string): boolean {
  return signaturesEqual(fields.signature, chargebackSignature(fields.billId, fields.paymentId, fields.id, secret));
}

function required(values: URLSearchParams, key: string): string | null {
  const value = values.get(key);
  return value && value.trim() !== "" ? value : null;
}

export function parsePaymentFields(rawBody: string): PaypalychPaymentFields | null {
  const values = new URLSearchParams(rawBody);
  const invId = required(values, "InvId");
  const outSum = required(values, "OutSum");
  const trsId = required(values, "TrsId");
  const status = required(values, "Status");
  const currencyIn = required(values, "CurrencyIn");
  const signature = required(values, "SignatureValue");
  if (!invId || !outSum || !trsId || !status || !currencyIn || !signature) return null;
  return { invId, outSum, trsId, status, currencyIn, signature };
}

export function parseRefundFields(rawBody: string): PaypalychRefundFields | null {
  const values = new URLSearchParams(rawBody);
  const id = required(values, "Id");
  const amount = required(values, "Amount");
  const currency = required(values, "Currency");
  const status = required(values, "Status");
  const invId = required(values, "InvId");
  const billId = required(values, "BillId");
  const paymentId = required(values, "PaymentId");
  const signature = required(values, "SignatureValue");
  if (!id || !amount || !currency || !status || !invId || !billId || !paymentId || !signature) return null;
  return { id, amount, currency, status, invId, billId, paymentId, signature };
}

export function parseChargebackFields(rawBody: string): PaypalychChargebackFields | null {
  const values = new URLSearchParams(rawBody);
  const id = required(values, "Id");
  const status = required(values, "Status");
  const invId = required(values, "InvId");
  const billId = required(values, "BillId");
  const paymentId = required(values, "PaymentId");
  const signature = required(values, "SignatureValue");
  if (!id || !status || !invId || !billId || !paymentId || !signature) return null;
  return { id, status, invId, billId, paymentId, signature };
}

// Same tolerant comparator the Payment/Result webhook check uses
// (lib/payments/process-webhook.ts) — one shared definition, see
// lib/payments/types.ts#amountsMatch.
function amountsMatch(a: string, orderAmount: number): boolean {
  const parsed = Number.parseFloat(a);
  return Number.isFinite(parsed) && numbersMatch(parsed, orderAmount);
}

export type OrderForRefund = {
  amount: number;
  currency: string;
  status: string;
  refundId: string | null;
};

export type RefundDecision =
  | { action: "unknown-order" }
  | { action: "amount-mismatch" }
  | { action: "currency-mismatch" }
  | { action: "duplicate" }
  | { action: "apply" }
  | { action: "noop" };

/** Pure decision logic for a signature-verified refund webhook — no I/O, fully unit-testable. */
export function evaluateRefundWebhook(order: OrderForRefund | null, fields: PaypalychRefundFields): RefundDecision {
  if (!order) return { action: "unknown-order" };
  if (order.refundId === fields.id) return { action: "duplicate" };
  if (fields.status !== "SUCCESS") return { action: "noop" };
  if (!amountsMatch(fields.amount, order.amount)) return { action: "amount-mismatch" };
  if (fields.currency !== order.currency) return { action: "currency-mismatch" };
  return { action: "apply" };
}

export type OrderForChargeback = {
  status: string;
  chargebackId: string | null;
};

export type ChargebackDecision =
  | { action: "unknown-order" }
  | { action: "duplicate" }
  | { action: "apply" }
  | { action: "noop" };

/** Pure decision logic for a signature-verified chargeback webhook — no I/O, fully unit-testable. */
export function evaluateChargebackWebhook(
  order: OrderForChargeback | null,
  fields: PaypalychChargebackFields
): ChargebackDecision {
  if (!order) return { action: "unknown-order" };
  if (order.chargebackId === fields.id) return { action: "duplicate" };
  if (fields.status !== "SUCCESS") return { action: "noop" };
  return { action: "apply" };
}
