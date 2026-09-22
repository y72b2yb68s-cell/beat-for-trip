"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Beat } from "@/lib/types";
import { formatDuration } from "@/lib/utils";
import CoverArt from "./CoverArt";
import Price from "@/components/ui/Price";
import { usePlayer } from "@/lib/player-context";

export default function BeatCard({ beat }: { beat: Beat }) {
  const t = useTranslations("beat");
  const { currentBeat, isPlaying, play, toggle } = usePlayer();
  const isActive = currentBeat?.id === beat.id;
  const canPreview = Boolean(beat.previewUrl);

  function handlePlayClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!canPreview) return;
    if (isActive) {
      toggle();
    } else {
      play(beat);
    }
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-colors duration-200 hover:border-green/40">
      <Link href={`/beats/${beat.slug}`} className="relative block aspect-square">
        <CoverArt src={beat.coverUrl} alt={beat.title} className="h-full w-full" />

        <button
          type="button"
          onClick={handlePlayClick}
          disabled={!canPreview}
          aria-label={isActive && isPlaying ? t("pausePreview") : t("playPreview")}
          className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-green text-black shadow-lg transition-transform duration-200 hover:scale-105 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-muted"
        >
          {isActive && isPlaying ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="3" y="2" width="3.5" height="12" rx="1" />
              <rect x="9.5" y="2" width="3.5" height="12" rx="1" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 2.5v11l9-5.5-9-5.5z" />
            </svg>
          )}
        </button>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <Link href={`/beats/${beat.slug}`}>
            <h3 className="truncate text-base font-semibold text-foreground group-hover:text-green">
              {beat.title}
            </h3>
          </Link>
          <p className="mt-1 truncate text-xs text-muted">
            {beat.genre} · {beat.bpm} BPM · {beat.key} · {formatDuration(beat.duration)}
          </p>
        </div>

        <div className="mt-auto flex flex-col gap-2 pt-1">
          <Price price={beat.price} className="truncate" />
          <Link
            href={`/beats/${beat.slug}`}
            className="rounded-full bg-white/5 px-4 py-2 text-center text-xs font-semibold uppercase tracking-wide text-foreground transition-colors hover:bg-green hover:text-black"
          >
            {t("buyShort")}
          </Link>
        </div>
      </div>
    </div>
  );
}
