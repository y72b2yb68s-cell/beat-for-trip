"use client";

export default function ProgressBar({
  currentTime,
  duration,
  onSeek,
  className,
}: {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  className?: string;
}) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    onSeek(ratio * duration);
  }

  return (
    <div
      role="slider"
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={duration}
      aria-valuenow={currentTime}
      onClick={handleClick}
      className={
        className ??
        "group/bar relative h-1.5 w-full cursor-pointer rounded-full bg-white/10"
      }
    >
      <div
        className="absolute inset-y-0 left-0 rounded-full bg-green"
        style={{ width: `${progress}%` }}
      />
      <div
        className="absolute top-1/2 h-3 w-3 -translate-y-1/2 -translate-x-1/2 rounded-full bg-green opacity-0 shadow-[0_0_8px_rgba(0,255,102,0.8)] transition-opacity group-hover/bar:opacity-100"
        style={{ left: `${progress}%` }}
      />
    </div>
  );
}
