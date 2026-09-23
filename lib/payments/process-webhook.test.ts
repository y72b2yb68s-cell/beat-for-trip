import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { paymentSignature } from "./paypalych";

const { findFirst, update } = vi.hoisted(() => ({
  findFirst: vi.fn(),
  update: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    order: { findFirst, update },
  },
}));

// processPaymentWebhook is imported after the mock is registered above.
const { processPaymentWebhook } = await import("./process-webhook");

const SECRET = "paypalych-test-secret";

type FakeOrder = {
  id: string;
  status: string;
  type: string;
  amount: number;
  currency: string;
  email: string;
  paymentId: string;
  beat: { title: string } | null;
};

function makeOrder(overrides: Partial<FakeOrder> = {}): FakeOrder {
  return {
    id: "order-1",
    status: "pending",
    type: "BEAT",
    amount: 30,
    currency: "EUR",
    email: "buyer@example.com",
    paymentId: "order-1",
    beat: { title: "Test Beat" },
    ...overrides,
  };
}

function paypalychBody(overrides: Partial<Record<string, string>> = {}): string {
  const fields = {
    InvId: "order-1",
    OutSum: "30.00",
    TrsId: "trs-1",
    Status: "SUCCESS",
    CurrencyIn: "EUR",
    ...overrides,
  };
  const signature =
    overrides.SignatureValue ?? paymentSignature(fields.OutSum, fields.InvId, SECRET);
  return new URLSearchParams({ ...fields, SignatureValue: signature }).toString();
}

describe("processPaymentWebhook — PayPalych amount/currency validation", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    findFirst.mockReset();
    update.mockReset();
    process.env.PAYPALYCH_API_TOKEN = SECRET;
    process.env.PAYPALYCH_SHOP_ID = "shop-1";
    delete process.env.TRIBUTE_API_KEY;
    delete process.env.TRIBUTE_WEBHOOK_SECRET;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("valid payment: correct amount + currency -> marks the order paid", async () => {
    findFirst.mockResolvedValue(makeOrder());
    const body = paypalychBody({ OutSum: "30.00", CurrencyIn: "EUR" });

    const result = await processPaymentWebhook(body, paymentSignature("30.00", "order-1", SECRET));

    expect(result).toEqual({ ok: true, status: "paid" });
    expect(update).toHaveBeenCalledTimes(1);
    expect(update.mock.calls[0][0]).toMatchObject({
      where: { id: "order-1" },
      data: expect.objectContaining({ status: "paid" }),
    });
  });

  it("wrong amount -> rejected, order NOT marked paid", async () => {
    findFirst.mockResolvedValue(makeOrder({ amount: 30 }));
    const body = paypalychBody({ OutSum: "999.00", CurrencyIn: "EUR" });

    const result = await processPaymentWebhook(body, paymentSignature("999.00", "order-1", SECRET));

    expect(result).toEqual({ ok: false, error: "Amount does not match the order", statusCode: 400 });
    expect(update).not.toHaveBeenCalled();
  });

  it("wrong currency -> rejected, order NOT marked paid", async () => {
    findFirst.mockResolvedValue(makeOrder({ amount: 30, currency: "EUR" }));
    const body = paypalychBody({ OutSum: "30.00", CurrencyIn: "USD" });

    const result = await processPaymentWebhook(body, paymentSignature("30.00", "order-1", SECRET));

    expect(result).toEqual({ ok: false, error: "Currency does not match the order", statusCode: 400 });
    expect(update).not.toHaveBeenCalled();
  });

  it("correct signature + wrong amount -> rejected specifically for amount, not signature", async () => {
    findFirst.mockResolvedValue(makeOrder({ amount: 30 }));
    // Signature is valid for the (tampered) OutSum it actually covers — proves
    // rejection comes from the Order-amount comparison, not a bad signature.
    const outSum = "50.00";
    const body = paypalychBody({ OutSum: outSum, SignatureValue: paymentSignature(outSum, "order-1", SECRET) });

    const result = await processPaymentWebhook(body, paymentSignature(outSum, "order-1", SECRET));

    expect(result).toMatchObject({ ok: false, error: "Amount does not match the order" });
  });

  it("correct signature + wrong currency -> rejected specifically for currency, not signature", async () => {
    findFirst.mockResolvedValue(makeOrder({ amount: 30, currency: "EUR" }));
    const outSum = "30.00";
    const body = paypalychBody({ OutSum: outSum, CurrencyIn: "USD" });

    const result = await processPaymentWebhook(body, paymentSignature(outSum, "order-1", SECRET));

    expect(result).toMatchObject({ ok: false, error: "Currency does not match the order" });
  });

  it("duplicate SUCCESS after the order is already paid -> idempotent, no re-write", async () => {
    findFirst.mockResolvedValue(makeOrder({ status: "paid" }));
    const body = paypalychBody({ OutSum: "30.00", CurrencyIn: "EUR" });

    const result = await processPaymentWebhook(body, paymentSignature("30.00", "order-1", SECRET));

    expect(result).toEqual({ ok: true, status: "already-processed" });
    expect(update).not.toHaveBeenCalled();
  });

  it("invalid signature -> rejected before any amount/currency check runs", async () => {
    findFirst.mockResolvedValue(makeOrder());
    // The provider re-derives the signature from the body's own fields (see
    // PayPalychPaymentProvider.verifyWebhookSignature) — so to actually
    // exercise rejection, the SignatureValue embedded in the body itself
    // must be wrong, exactly as a real tampered/forged webhook would be.
    const body = paypalychBody({ OutSum: "30.00", CurrencyIn: "EUR", SignatureValue: "0".repeat(32) });

    const result = await processPaymentWebhook(body, "0".repeat(32));

    expect(result).toEqual({ ok: false, error: "Invalid signature", statusCode: 401 });
    expect(findFirst).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });
});

describe("processPaymentWebhook — existing Mock provider behavior is unchanged", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    findFirst.mockReset();
    update.mockReset();
    delete process.env.PAYPALYCH_API_TOKEN;
    delete process.env.PAYPALYCH_SHOP_ID;
    delete process.env.TRIBUTE_API_KEY;
    delete process.env.TRIBUTE_WEBHOOK_SECRET;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("Mock provider events carry no amount/currency, so no validation is applied", async () => {
    // getPaymentProvider() falls back to MockPaymentProvider when no
    // PayPalych/Tribute env vars are set (lib/payments/index.ts) — this
    // exercises the real, unmodified mock provider end to end.
    const { MockPaymentProvider } = await import("./mock-provider");
    const mock = new MockPaymentProvider();

    // The order's real amount (50) intentionally differs from anything in
    // the mock payload — proves the new check is skipped, not just passing.
    findFirst.mockResolvedValue(makeOrder({ amount: 50, currency: "EUR", paymentId: "mock_abc" }));

    const rawBody = JSON.stringify({ paymentId: "mock_abc", status: "paid" });
    const signature = mock.signPayload(rawBody);

    const result = await processPaymentWebhook(rawBody, signature);

    expect(result).toEqual({ ok: true, status: "paid" });
    expect(update).toHaveBeenCalledTimes(1);
    expect(update.mock.calls[0][0].data).toMatchObject({ status: "paid" });
  });
});
