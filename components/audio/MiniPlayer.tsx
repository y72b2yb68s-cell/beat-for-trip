"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { usePlayer } from "@/lib/player-context";
import { formatDuration } from "@/lib/utils";
import CoverArt from "@/components/beats/CoverArt";
import ProgressBar from "./ProgressBar";

export default function MiniPlayer() {
  const t = useTranslations("beat");
  const { currentBeat, isPlaying, currentTime, duration, toggle, seek, volume, setVolume } =
    usePlayer();

  if (!currentBeat) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur-md animate-fade-in">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 lg:px-8">
        <Link
          href={`/beats/${currentBeat.slug}`}
          className="flex min-w-0 flex-1 items-center gap-3 sm:flex-none sm:w-56"
        >
          <CoverArt
            src={currentBeat.coverUrl}
            alt={currentBeat.title}
            className="h-10 w-10 flex-shrink-0 rounded-md"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{currentBeat.title}</p>
            <p className="truncate text-xs text-muted">{t("previewLabel")}</p>
          </div>
        </Link>

        <button
          type="button"
          onClick={toggle}
          aria-label={isPlaying ? t("pause") : t("play")}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-green text-black transition-transform hover:scale-105"
        >
          {isPlaying ? (
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <rect x="3" y="2" width="3.5" height="12" rx="1" />
              <rect x="9.5" y="2" width="3.5" height="12" rx="1" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 2.5v11l9-5.5-9-5.5z" />
            </svg>
          )}
        </button>

        <span className="hidden w-10 flex-shrink-0 text-right text-xs text-muted tabular-nums sm:block">
          {formatDuration(currentTime)}
        </span>

        <div className="hidden flex-1 sm:block">
          <ProgressBar currentTime={currentTime} duration={duration} onSeek={seek} />
        </div>

        <span className="hidden w-10 flex-shrink-0 text-xs text-muted tabular-nums sm:block">
          {formatDuration(duration)}
        </span>

        <div className="hidden items-center gap-2 md:flex">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-muted">
            <path
              d="M2 6h2.5L8 3v10L4.5 10H2V6z"
              fill="currentColor"
            />
            <path
              d="M10.5 5.5a3 3 0 0 1 0 5"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            aria-label={t("volume")}
            className="h-1 w-20 cursor-pointer accent-[#00ff66]"
          />
        </div>
      </div>

      <div className="px-4 pb-2 sm:hidden">
        <ProgressBar currentTime={currentTime} duration={duration} onSeek={seek} />
      </div>
    </div>
  );
}
