"use client";

import { use, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { formatPrice } from "@/lib/utils";
import Button from "@/components/ui/Button";

type MockOrder = {
  beatTitle: string;
  amount: number;
  currency: string;
  status: string;
  orderId: string;
};

export default function MockPaymentPage({ params }: { params: Promise<{ paymentId: string }> }) {
  const { paymentId } = use(params);
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("payment");
  const [order, setOrder] = useState<MockOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<"paid" | "failed" | null>(null);

  useEffect(() => {
    fetch(`/api/payment/mock/${paymentId}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? t("sessionNotFound"));
        setOrder(data);
      })
      .catch((err) => setError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentId]);

  async function handleAction(status: "paid" | "failed") {
    setProcessing(status);
    try {
      const res = await fetch(`/api/payment/mock/${paymentId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      if (status === "paid" && order) {
        router.push(`/payment/success?order=${order.orderId}`);
      } else {
        router.push("/payment/failed");
      }
    } catch {
      setError(t("confirmError"));
      setProcessing(null);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted">
          {t("mockGatewayTitle")}
        </p>
        <p className="mt-1 text-center text-[11px] text-muted">{t("mockGatewaySubtitle")}</p>

        {error && <p className="mt-6 text-center text-sm text-red-400">{error}</p>}

        {!order && !error && <p className="mt-6 text-center text-sm text-muted">{t("loading")}</p>}

        {order && (
          <>
            <div className="mt-6 rounded-xl border border-border bg-background p-4 text-center">
              <p className="text-sm text-muted">{order.beatTitle}</p>
              <p className="mt-1 text-2xl font-bold text-green">
                {formatPrice(order.amount, locale)}
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <Button onClick={() => handleAction("paid")} disabled={processing !== null} size="lg">
                {processing === "paid" ? t("loading") : t("payNow")}
              </Button>
              <Button
                onClick={() => handleAction("failed")}
                disabled={processing !== null}
                variant="outline"
                size="sm"
              >
                {processing === "failed" ? t("loading") : t("simulateFailed")}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
