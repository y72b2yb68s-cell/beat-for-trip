"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import type { Beat } from "@/lib/types";
import { Link } from "@/i18n/navigation";
import Price from "@/components/ui/Price";
import Button from "@/components/ui/Button";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function BuyBox({ beat }: { beat: Beat }) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("checkout");
  const tBeat = useTranslations("beat");
  const tFooter = useTranslations("footer");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleBuy(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!emailPattern.test(email)) {
      setError(t("invalidEmail"));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ beatId: beat.id, email, locale }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? t("genericError"));
        setLoading(false);
        return;
      }

      router.push(data.redirectUrl);
    } catch {
      setError(t("networkError"));
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <div className="mb-5 flex items-end justify-between">
        <span className="text-xs uppercase tracking-wide text-muted">{t("price")}</span>
        <Price price={beat.price} className="text-2xl" />
      </div>

      <form onSubmit={handleBuy} className="flex flex-col gap-3">
        <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-muted">
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
          {loading ? t("processing") : tBeat("buy")}
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
