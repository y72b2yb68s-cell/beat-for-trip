"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

type OrderStatus = {
  status: string;
  type: string;
  beatTitle: string | null;
  beatSlug: string | null;
  amount: number;
  currency: string;
  downloadUrl: string | null;
};

function SuccessContent() {
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations("payment");
  const orderId = searchParams.get("order");
  const [order, setOrder] = useState<OrderStatus | null>(null);
  const [error, setError] = useState<string | null>(orderId ? null : t("missingOrder"));

  useEffect(() => {
    if (!orderId) return;

    let cancelled = false;
    let attempts = 0;

    async function poll() {
      attempts += 1;
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Order not found.");
        if (cancelled) return;
        setOrder(data);

        if (data.status === "pending" && attempts < 10) {
          setTimeout(poll, 1500);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 text-center">
        {error && (
          <>
            <p className="text-sm text-red-400">{error}</p>
            <Button href="/beats" variant="outline" className="mt-6 w-full">
              {t("backToBeats")}
            </Button>
          </>
        )}

        {!error && !order && <p className="text-sm text-muted">{t("confirming")}</p>}

        {!error && order && order.status === "pending" && (
          <p className="text-sm text-muted">{t("confirming")}</p>
        )}

        {!error && order && order.status === "paid" && order.type === "EXCLUSIVE_BEAT" && (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-dim">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-green">
                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="mt-5 text-lg font-bold uppercase tracking-tight text-foreground">
              {t("exclusiveOrderedTitle")}
            </h1>
            <p className="mt-2 text-sm text-muted">{formatPrice(order.amount, locale)}</p>
            <p className="mt-4 text-sm text-foreground/90">{t("exclusiveOrderedDescription")}</p>
            <p className="mt-4 text-xs text-muted">{t("exclusiveEmailSent")}</p>
          </>
        )}

        {!error && order && order.status === "paid" && order.type !== "EXCLUSIVE_BEAT" && (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-dim">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-green">
                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="mt-5 text-lg font-bold uppercase tracking-tight text-foreground">
              {t("successTitle")}
            </h1>
            <p className="mt-2 text-sm text-muted">
              {order.beatTitle} — {formatPrice(order.amount, locale)}
            </p>
            {order.downloadUrl && (
              <Button href={order.downloadUrl} size="lg" className="mt-6 w-full">
                {t("downloadBeat")}
              </Button>
            )}
            <p className="mt-4 text-xs text-muted">{t("emailSent")}</p>
          </>
        )}

        {!error && order && (order.status === "failed" || order.status === "refunded") && (
          <>
            <h1 className="text-lg font-bold uppercase tracking-tight text-foreground">
              {order.status === "failed" ? t("failedTitle") : t("refundedTitle")}
            </h1>
            <Link
              href={order.type === "EXCLUSIVE_BEAT" ? "/exclusive-beat" : `/beats/${order.beatSlug}`}
              className="mt-4 inline-block text-sm text-green"
            >
              {t("tryAgain")}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  );
}
