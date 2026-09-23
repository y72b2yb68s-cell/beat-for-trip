"use client";

const PLATFORMS = [
  { key: "instagram", label: "Instagram" },
  { key: "twitter", label: "X / Twitter" },
  { key: "youtube", label: "YouTube" },
  { key: "tiktok", label: "TikTok" },
] as const;

type Links = Partial<Record<(typeof PLATFORMS)[number]["key"], string>>;

function parse(value: string): Links {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

const fieldClass =
  "w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-green focus:outline-none";

export default function SocialLinksInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const links = parse(value);

  function setLink(key: string, url: string) {
    const next = { ...links, [key]: url };
    onChange(JSON.stringify(next));
  }

  return (
    <div className="flex flex-col gap-3 sm:col-span-2">
      {PLATFORMS.map((p) => (
        <div key={p.key} className="flex items-center gap-3">
          <span className="w-24 flex-shrink-0 text-xs font-semibold uppercase tracking-wide text-muted">
            {p.label}
          </span>
          <input
            type="url"
            value={links[p.key] ?? ""}
            onChange={(e) => setLink(p.key, e.target.value)}
            placeholder="https://…"
            className={fieldClass}
          />
        </div>
      ))}
    </div>
  );
}
