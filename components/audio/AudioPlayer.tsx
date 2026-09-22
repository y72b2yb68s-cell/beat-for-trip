"use client";

import { useTranslations } from "next-intl";
import type { Beat } from "@/lib/types";
import { usePlayer } from "@/lib/player-context";
import { formatDuration } from "@/lib/utils";
import ProgressBar from "./ProgressBar";

export default function AudioPlayer({ beat }: { beat: Beat }) {
  const t = useTranslations("beat");
  const { currentBeat, isPlaying, currentTime, duration, play, toggle, seek, volume, setVolume } =
    usePlayer();

  const isActive = currentBeat?.id === beat.id;
  const displayTime = isActive ? currentTime : 0;
  const displayDuration = isActive && duration > 0 ? duration : beat.duration;
  const canPreview = Boolean(beat.previewUrl);

  function handleToggle() {
    if (!canPreview) return;
    if (isActive) toggle();
    else play(beat);
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleToggle}
          disabled={!canPreview}
          aria-label={isActive && isPlaying ? t("pausePreview") : t("playPreview")}
          className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-green text-black shadow-[0_0_24px_rgba(0,255,102,0.3)] transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-muted disabled:shadow-none"
        >
          {isActive && isPlaying ? (
            <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
              <rect x="3" y="2" width="3.5" height="12" rx="1" />
              <rect x="9.5" y="2" width="3.5" height="12" rx="1" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 2.5v11l9-5.5-9-5.5z" />
            </svg>
          )}
        </button>

        <div className="flex-1">
          <div className="flex items-center justify-between text-xs text-muted tabular-nums">
            <span>{formatDuration(displayTime)}</span>
            <span>{formatDuration(displayDuration)}</span>
          </div>
          <ProgressBar currentTime={displayTime} duration={displayDuration} onSeek={seek} />
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-muted">
            <path d="M2 6h2.5L8 3v10L4.5 10H2V6z" fill="currentColor" />
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

      {!canPreview && <p className="mt-3 text-xs text-muted">{t("previewSoon")}</p>}
    </div>
  );
}
