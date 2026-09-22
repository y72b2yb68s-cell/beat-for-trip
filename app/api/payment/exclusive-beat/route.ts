import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getPaymentProvider } from "@/lib/payments";
import { getExclusiveBeatTier } from "@/lib/exclusive-beat";
import { routing } from "@/i18n/routing";

const schema = z.object({
  email: z.string().trim().email(),
  name: z.string().trim().min(1),
  tierId: z.string().optional(),
  locale: z.enum(routing.locales).optional(),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid name and email address." }, { status: 400 });
  }

  const { email, name, tierId, locale } = parsed.data;

  // Price and currency always come from server-side tier config — the client
  // only ever selects a tier by id, never a price or currency.
  const tier = getExclusiveBeatTier(tierId);
  if (!tier) {
    return NextResponse.json({ error: "This exclusive beat tier is not available." }, { status: 404 });
  }

  const order = await prisma.order.create({
    data: {
      type: "EXCLUSIVE_BEAT",
      email,
      customerName: name,
      amount: tier.price,
      currency: tier.currency,
      paymentProvider: getPaymentProvider().name,
      status: "pending",
    },
  });

  try {
    const provider = getPaymentProvider();
    const payment = await provider.createPayment({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      description: "Exclusive Beat",
      customerEmail: email,
      locale: locale ?? routing.defaultLocale,
    });

    await prisma.order.update({ where: { id: order.id }, data: { paymentId: payment.paymentId } });

    return NextResponse.json({ redirectUrl: payment.redirectUrl });
  } catch (err) {
    await prisma.order.update({ where: { id: order.id }, data: { status: "failed" } });
    const message = err instanceof Error ? err.message : "Payment could not be started.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
