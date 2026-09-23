"use client";

import { useEffect, useState } from "react";
import type { Beat as PrismaBeat } from "@prisma/client";

function parseIds(value: string): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export default function BeatSelectionInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [beats, setBeats] = useState<PrismaBeat[] | null>(null);
  const selectedIds = parseIds(value);

  useEffect(() => {
    fetch("/api/admin/beats")
      .then((res) => res.json())
      .then((data) => setBeats(data.beats ?? []))
      .catch(() => setBeats([]));
  }, []);

  function toggle(id: string) {
    const next = selectedIds.includes(id) ? selectedIds.filter((v) => v !== id) : [...selectedIds, id];
    onChange(JSON.stringify(next));
  }

  function move(id: string, direction: -1 | 1) {
    const index = selectedIds.indexOf(id);
    const target = index + direction;
    if (target < 0 || target >= selectedIds.length) return;
    const next = [...selectedIds];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(JSON.stringify(next));
  }

  if (beats === null) {
    return <p className="text-xs text-muted sm:col-span-2">Loading beats…</p>;
  }

  if (beats.length === 0) {
    return <p className="text-xs text-muted sm:col-span-2">No beats yet — add one under Beats first.</p>;
  }

  return (
    <div className="flex flex-col gap-2 sm:col-span-2">
      {selectedIds.length > 0 && (
        <div className="mb-2 flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">Selected order</span>
          {selectedIds.map((id, i) => {
            const beat = beats.find((b) => b.id === id);
            return (
              <div
                key={id}
                className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              >
                <span className="truncate">
                  {i + 1}. {beat?.title ?? "(deleted beat)"}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => move(id, -1)}
                    disabled={i === 0}
                    className="rounded px-1.5 text-xs text-muted hover:text-green disabled:opacity-30"
                    aria-label="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(id, 1)}
                    disabled={i === selectedIds.length - 1}
                    className="rounded px-1.5 text-xs text-muted hover:text-green disabled:opacity-30"
                    aria-label="Move down"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => toggle(id)}
                    className="rounded px-1.5 text-xs text-muted hover:text-red-400"
                    aria-label="Remove"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <span className="text-xs font-semibold uppercase tracking-wide text-muted">All beats</span>
      <div className="grid max-h-56 grid-cols-1 gap-1 overflow-y-auto rounded-lg border border-border p-2 sm:grid-cols-2">
        {beats.map((beat) => (
          <label key={beat.id} className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-white/5">
            <input type="checkbox" checked={selectedIds.includes(beat.id)} onChange={() => toggle(beat.id)} />
            <span className="truncate text-foreground">{beat.title}</span>
            <span className="ml-auto flex-shrink-0 text-xs text-muted">{beat.status}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
