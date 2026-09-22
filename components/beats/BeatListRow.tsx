"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Beat } from "@/lib/types";
import { formatDuration, cn } from "@/lib/utils";
import CoverArt from "./CoverArt";
import Price from "@/components/ui/Price";
import { usePlayer } from "@/lib/player-context";

export default function BeatListRow({ beat }: { beat: Beat }) {
  const t = useTranslations("beat");
  const { currentBeat, isPlaying, play, toggle } = usePlayer();
  const isActive = currentBeat?.id === beat.id;
  const canPreview = Boolean(beat.previewUrl);

  function handlePlayClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!canPreview) return;
    if (isActive) toggle();
    else play(beat);
  }

  return (
    <div
      className={cn(
        "group relative flex items-center gap-3 px-3 py-3.5 transition-colors duration-150 hover:bg-white/[0.035] sm:gap-5 sm:px-4",
        isActive && "bg-green-dim"
      )}
    >
      {/* Hover/active accent — purely decorative, sits behind the interactive controls. */}
      <span
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 w-[2px] bg-green transition-opacity duration-150",
          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-60"
        )}
      />

      {/* Whole-row link, stretched behind the interactive controls (stacking handles click precedence, no JS bubbling tricks needed). */}
      <Link
        href={`/beats/${beat.slug}`}
        className="absolute inset-0 z-0"
        aria-label={beat.title}
        tabIndex={-1}
      />

      <div className="pointer-events-none relative z-[1] h-12 w-12 flex-shrink-0 sm:h-14 sm:w-14">
        <CoverArt
          src={beat.coverUrl}
          alt={beat.title}
          className={cn(
            "h-full w-full rounded-lg transition-shadow duration-150",
            isActive && "ring-2 ring-green/70"
          )}
        />
        <button
          type="button"
          onClick={handlePlayClick}
          disabled={!canPreview}
          aria-label={isActive && isPlaying ? t("pausePreview") : t("playPreview")}
          className="pointer-events-auto absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-green text-black opacity-90 shadow-md transition-all duration-150 group-hover:scale-110 group-hover:opacity-100 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-muted disabled:opacity-60 disabled:group-hover:scale-100"
        >
          {isActive && isPlaying ? (
            <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
              <rect x="3" y="2" width="3.5" height="12" rx="1" />
              <rect x="9.5" y="2" width="3.5" height="12" rx="1" />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 2.5v11l9-5.5-9-5.5z" />
            </svg>
          )}
        </button>
      </div>

      <div className="pointer-events-none relative z-[1] min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-sm font-bold tracking-tight transition-colors sm:text-base",
            isActive ? "text-green" : "text-foreground group-hover:text-green"
          )}
        >
          {beat.genre || t("fallbackGenre")}
        </p>
        <p className="mt-1 truncate text-xs text-muted/80">
          {beat.bpm} BPM · {beat.key} · {formatDuration(beat.duration)}
        </p>
      </div>

      <div className="pointer-events-none relative z-[1] flex flex-col items-end gap-1.5 sm:flex-row sm:items-center sm:gap-5">
        <Price price={beat.price} className="text-sm sm:text-base" />
        <Link
          href={`/beats/${beat.slug}`}
          aria-label={`${t("buyShort")} — ${beat.title}`}
          className="pointer-events-auto flex-shrink-0 rounded-full bg-white/5 px-4 py-2 text-center text-xs font-semibold uppercase tracking-wide text-foreground transition-colors hover:bg-green hover:text-black"
        >
          {t("buyShort")}
        </Link>
      </div>
    </div>
  );
}
