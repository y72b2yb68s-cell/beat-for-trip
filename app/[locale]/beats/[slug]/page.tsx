import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getPublishedBeatBySlug } from "@/lib/beats";
import { formatDuration } from "@/lib/utils";
import { buildAlternates } from "@/lib/seo";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import CoverArt from "@/components/beats/CoverArt";
import AudioPlayer from "@/components/audio/AudioPlayer";
import BuyBox from "@/components/beats/BuyBox";

type Params = { locale: AppLocale; slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const beat = await getPublishedBeatBySlug(slug);
  if (!beat) {
    const t = await getTranslations({ locale, namespace: "metadata" });
    return { title: t("beats.title") };
  }

  return {
    title: beat.title,
    description: beat.description,
    alternates: buildAlternates(locale, `/beats/${beat.slug}`),
    openGraph: {
      title: `${beat.title} | Beat For Trip`,
      description: beat.description,
      images: beat.coverUrl ? [{ url: beat.coverUrl }] : undefined,
    },
  };
}

export default async function BeatDetailPage({ params }: { params: Promise<Params> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const beat = await getPublishedBeatBySlug(slug);
  if (!beat) notFound();

  const t = await getTranslations("beat");
  const tFooter = await getTranslations("footer");
  const tCheckout = await getTranslations("checkout");

  const stats = [
    { label: t("bpm"), value: beat.bpm },
    { label: t("key"), value: beat.key },
    { label: t("genre"), value: beat.genre },
    { label: t("duration"), value: formatDuration(beat.duration) },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,380px)_1fr]">
        <div className="mx-auto w-full max-w-sm lg:mx-0">
          <CoverArt
            src={beat.coverUrl}
            alt={beat.title}
            className="aspect-square w-full rounded-2xl"
            sizes="(max-width: 1024px) 90vw, 380px"
            priority
          />
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-green">
              {beat.genre}
            </p>
            <h1 className="mt-2 text-3xl font-extrabold uppercase tracking-tight text-foreground sm:text-4xl">
              {beat.title}
            </h1>
          </div>

          <div className="grid grid-cols-4 gap-3 border-y border-border py-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center sm:text-left">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                  {stat.label}
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground sm:text-base">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          <AudioPlayer beat={beat} />

          <div>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
              {t("description")}
            </h2>
            <p className="text-sm leading-relaxed text-foreground/90">{beat.description}</p>
          </div>

          <BuyBox beat={beat} />

          <div className="flex flex-col gap-1 rounded-xl border border-border bg-surface/50 px-4 py-3 text-xs text-muted">
            <p className="font-semibold uppercase tracking-wide text-foreground">{t("digitalProduct")}</p>
            <p>
              {t("format")}: WAV — {tCheckout("emailHint")}
            </p>
            <p>
              {t("license")}:{" "}
              <Link href="/terms" className="text-green hover:underline">
                {tFooter("terms")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
