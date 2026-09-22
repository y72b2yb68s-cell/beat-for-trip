import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { Inter } from "next/font/google";
import "../globals.css";
import { routing, type AppLocale } from "@/i18n/routing";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MiniPlayer from "@/components/audio/MiniPlayer";
import { PlayerProvider } from "@/lib/player-context";
import { ToastProvider } from "@/lib/toast-context";
import ToastViewport from "@/components/ui/ToastViewport";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale as AppLocale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ToastProvider>
            <PlayerProvider>
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
              <MiniPlayer />
            </PlayerProvider>
            <ToastViewport />
          </ToastProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
