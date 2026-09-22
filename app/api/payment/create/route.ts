import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getPaymentProvider } from "@/lib/payments";
import { CURRENCY } from "@/lib/currency";
import { routing } from "@/i18n/routing";

const schema = z.object({
  beatId: z.string().min(1),
  email: z.string().trim().email(),
  locale: z.enum(routing.locales).optional(),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const { beatId, email, locale } = parsed.data;

  // Price always comes from the database — never from the client. Currency
  // is always EUR, never taken from the client or even from the beat row.
  const beat = await prisma.beat.findFirst({ where: { id: beatId, status: "published" } });
  if (!beat) {
    return NextResponse.json({ error: "This beat is not available." }, { status: 404 });
  }
  if (!beat.fileKey) {
    return NextResponse.json({ error: "This beat is not available for purchase yet." }, { status: 400 });
  }

  const order = await prisma.order.create({
    data: {
      email,
      beatId: beat.id,
      amount: beat.price,
      currency: CURRENCY,
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
      description: beat.title,
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
