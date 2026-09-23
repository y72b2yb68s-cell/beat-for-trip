"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { formatPrice } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import Button from "@/components/ui/Button";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ExclusiveBeatBuyForm({ price }: { price: number }) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("exclusiveBeat");
  const tCheckout = useTranslations("checkout");
  const tFooter = useTranslations("footer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleBuy(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError(t("nameRequired"));
      return;
    }
    if (!emailPattern.test(email)) {
      setError(tCheckout("invalidEmail"));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/payment/exclusive-beat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, locale }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? tCheckout("genericError"));
        setLoading(false);
        return;
      }

      router.push(data.redirectUrl);
    } catch {
      setError(tCheckout("networkError"));
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <div className="mb-5 flex items-end justify-between">
        <span className="text-xs uppercase tracking-wide text-muted">{t("priceLabel")}</span>
        <span className="text-2xl font-semibold text-green">{formatPrice(price, locale)}</span>
      </div>

      <form onSubmit={handleBuy} className="flex flex-col gap-3">
        <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wide text-muted">
          {t("nameLabel")}
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("namePlaceholder")}
          required
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-green focus:outline-none"
        />

        <label htmlFor="email" className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted">
          {t("emailLabel")}
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("emailPlaceholder")}
          required
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-green focus:outline-none"
        />

        {error && <p className="text-sm text-red-400">{error}</p>}

        <Button type="submit" size="lg" disabled={loading} className="w-full">
          {loading ? tCheckout("processing") : t("buyButton", { price: formatPrice(price, locale) })}
        </Button>
        <p className="text-center text-xs text-muted">{t("emailHint")}</p>
        <p className="text-center text-xs text-muted">
          <Link href="/terms" className="hover:text-green hover:underline">
            {tFooter("terms")}
          </Link>
          {" · "}
          <Link href="/refund" className="hover:text-green hover:underline">
            {tFooter("refund")}
          </Link>
        </p>
      </form>
    </div>
  );
}
