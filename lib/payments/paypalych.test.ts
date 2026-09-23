import { describe, expect, it } from "vitest";
import {
  chargebackSignature,
  evaluateChargebackWebhook,
  evaluateRefundWebhook,
  paymentSignature,
  parseChargebackFields,
  parsePaymentFields,
  parseRefundFields,
  refundSignature,
  verifyChargebackSignature,
  verifyPaymentSignature,
  verifyRefundSignature,
  type PaypalychChargebackFields,
  type PaypalychRefundFields,
} from "./paypalych";

const SECRET = "test-secret";

function paymentBody(overrides: Partial<Record<string, string>> = {}): string {
  const fields = {
    InvId: "order-1",
    OutSum: "30.00",
    TrsId: "trs-1",
    Status: "SUCCESS",
    CurrencyIn: "EUR",
    SignatureValue: paymentSignature("30.00", "order-1", SECRET),
    ...overrides,
  };
  return new URLSearchParams(fields).toString();
}

describe("PayPalych payment signature", () => {
  it("accepts a valid signature", () => {
    const fields = parsePaymentFields(paymentBody())!;
    expect(verifyPaymentSignature(fields, SECRET)).toBe(true);
  });

  it("rejects an invalid signature", () => {
    const fields = parsePaymentFields(paymentBody({ SignatureValue: "0".repeat(32) }))!;
    expect(verifyPaymentSignature(fields, SECRET)).toBe(false);
  });

  it("rejects a signature computed with the wrong secret", () => {
    const fields = parsePaymentFields(paymentBody())!;
    expect(verifyPaymentSignature(fields, "wrong-secret")).toBe(false);
  });

  it("rejects a signature that has been tampered with by changing the amount", () => {
    // SignatureValue still matches the original OutSum=30.00 — a tampered
    // amount must invalidate the signature, not just change the parsed value.
    const fields = parsePaymentFields(paymentBody({ OutSum: "9999.00" }))!;
    expect(verifyPaymentSignature(fields, SECRET)).toBe(false);
  });

  it("returns null for a payload missing required fields", () => {
    expect(parsePaymentFields("InvId=order-1")).toBeNull();
  });

  it("maps Status=SUCCESS to paid and anything else to failed", () => {
    const success = parsePaymentFields(paymentBody({ Status: "SUCCESS" }))!;
    const failed = parsePaymentFields(paymentBody({ Status: "FAILED" }))!;
    expect(success.status).toBe("SUCCESS");
    expect(failed.status).toBe("FAILED");
  });
});

function refundFields(overrides: Partial<PaypalychRefundFields> = {}): PaypalychRefundFields {
  const base: Omit<PaypalychRefundFields, "signature"> = {
    id: "refund-1",
    amount: "30.00",
    currency: "EUR",
    status: "SUCCESS",
    invId: "order-1",
    billId: "bill-1",
    paymentId: "payment-1",
    ...overrides,
  };
  const signature = refundSignature(base.amount, base.currency, base.billId, base.paymentId, base.id, SECRET);
  return { ...base, signature, ...overrides };
}

describe("PayPalych refund", () => {
  it("parses a well-formed refund payload", () => {
    const raw = new URLSearchParams({
      Id: "refund-1",
      Amount: "30.00",
      Currency: "EUR",
      Status: "SUCCESS",
      InvId: "order-1",
      BillId: "bill-1",
      PaymentId: "payment-1",
      SignatureValue: refundSignature("30.00", "EUR", "bill-1", "payment-1", "refund-1", SECRET),
    }).toString();
    expect(parseRefundFields(raw)).not.toBeNull();
  });

  it("accepts a valid refund signature", () => {
    expect(verifyRefundSignature(refundFields(), SECRET)).toBe(true);
  });

  it("rejects an invalid refund signature", () => {
    const fields = refundFields({ signature: "0".repeat(32) });
    expect(verifyRefundSignature(fields, SECRET)).toBe(false);
  });

  it("unknown order -> unknown-order", () => {
    const decision = evaluateRefundWebhook(null, refundFields());
    expect(decision.action).toBe("unknown-order");
  });

  it("amount mismatch -> amount-mismatch", () => {
    const order = { amount: 50, currency: "EUR", status: "paid", refundId: null };
    const decision = evaluateRefundWebhook(order, refundFields({ amount: "30.00" }));
    expect(decision.action).toBe("amount-mismatch");
  });

  it("currency mismatch -> currency-mismatch", () => {
    const order = { amount: 30, currency: "USD", status: "paid", refundId: null };
    const decision = evaluateRefundWebhook(order, refundFields({ currency: "EUR" }));
    expect(decision.action).toBe("currency-mismatch");
  });

  it("duplicate SUCCESS (already applied) -> duplicate, no re-application", () => {
    const order = { amount: 30, currency: "EUR", status: "refunded", refundId: "refund-1" };
    const decision = evaluateRefundWebhook(order, refundFields({ id: "refund-1", status: "SUCCESS" }));
    expect(decision.action).toBe("duplicate");
  });

  it("SUCCESS on a fresh order -> apply", () => {
    const order = { amount: 30, currency: "EUR", status: "paid", refundId: null };
    const decision = evaluateRefundWebhook(order, refundFields({ status: "SUCCESS" }));
    expect(decision.action).toBe("apply");
  });

  it("FAIL -> noop (no state change)", () => {
    const order = { amount: 30, currency: "EUR", status: "paid", refundId: null };
    const decision = evaluateRefundWebhook(order, refundFields({ status: "FAIL" }));
    expect(decision.action).toBe("noop");
  });
});

function chargebackFields(overrides: Partial<PaypalychChargebackFields> = {}): PaypalychChargebackFields {
  const base: Omit<PaypalychChargebackFields, "signature"> = {
    id: "chargeback-1",
    status: "SUCCESS",
    invId: "order-1",
    billId: "bill-1",
    paymentId: "payment-1",
    ...overrides,
  };
  const signature = chargebackSignature(base.billId, base.paymentId, base.id, SECRET);
  return { ...base, signature, ...overrides };
}

describe("PayPalych chargeback", () => {
  it("parses a well-formed chargeback payload", () => {
    const raw = new URLSearchParams({
      Id: "chargeback-1",
      Status: "SUCCESS",
      InvId: "order-1",
      BillId: "bill-1",
      PaymentId: "payment-1",
      SignatureValue: chargebackSignature("bill-1", "payment-1", "chargeback-1", SECRET),
    }).toString();
    expect(parseChargebackFields(raw)).not.toBeNull();
  });

  it("accepts a valid chargeback signature", () => {
    expect(verifyChargebackSignature(chargebackFields(), SECRET)).toBe(true);
  });

  it("rejects an invalid chargeback signature", () => {
    expect(verifyChargebackSignature(chargebackFields({ signature: "0".repeat(32) }), SECRET)).toBe(false);
  });

  it("unknown order -> unknown-order", () => {
    const decision = evaluateChargebackWebhook(null, chargebackFields());
    expect(decision.action).toBe("unknown-order");
  });

  it("duplicate SUCCESS -> duplicate, no re-application", () => {
    const order = { status: "refunded", chargebackId: "chargeback-1" };
    const decision = evaluateChargebackWebhook(order, chargebackFields({ id: "chargeback-1", status: "SUCCESS" }));
    expect(decision.action).toBe("duplicate");
  });

  it("SUCCESS on a fresh order -> apply", () => {
    const order = { status: "paid", chargebackId: null };
    const decision = evaluateChargebackWebhook(order, chargebackFields({ status: "SUCCESS" }));
    expect(decision.action).toBe("apply");
  });

  it("FAIL -> noop (no state change)", () => {
    const order = { status: "paid", chargebackId: null };
    const decision = evaluateChargebackWebhook(order, chargebackFields({ status: "FAIL" }));
    expect(decision.action).toBe("noop");
  });
});

// Sanity check against the PHP reference implementation this was verified
// against (bytestore/paypalych-whmcs callback/paypalych.php):
//   strtoupper(md5($OutSum . ":" . $InvId . ":" . $secretKey))
describe("signature formula matches the verified reference implementation", () => {
  it("payment signature is MD5(OutSum:InvId:secret) uppercase hex", async () => {
    const { createHash } = await import("node:crypto");
    const expected = createHash("md5").update("380.55:order-1:api-secret").digest("hex").toUpperCase();
    expect(paymentSignature("380.55", "order-1", "api-secret")).toBe(expected);
  });
});
