"use client";

import type { SiteContentFieldDef } from "@/lib/site-content-registry";
import BeatSelectionInput from "./BeatSelectionInput";
import SocialLinksInput from "./SocialLinksInput";

const fieldClass =
  "w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-green focus:outline-none";
const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-wide text-muted";

export default function FieldInput({
  def,
  value,
  onChange,
}: {
  def: SiteContentFieldDef;
  value: string;
  onChange: (value: string) => void;
}) {
  const wide = def.type === "textarea" || def.type === "richtext" || def.type === "beat-selection" || def.type === "social-links";

  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <label className={labelClass}>{def.label}</label>

      {def.type === "text" || def.type === "url" ? (
        <input
          type={def.type === "url" ? "url" : "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={fieldClass}
        />
      ) : def.type === "number" ? (
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={fieldClass}
        />
      ) : def.type === "textarea" || def.type === "richtext" ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={4} className={fieldClass} />
      ) : def.type === "boolean" ? (
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" checked={value === "true"} onChange={(e) => onChange(e.target.checked ? "true" : "false")} />
          Enabled
        </label>
      ) : def.type === "beat-selection" ? (
        <BeatSelectionInput value={value} onChange={onChange} />
      ) : def.type === "social-links" ? (
        <SocialLinksInput value={value} onChange={onChange} />
      ) : null}

      {def.helpText && <p className="mt-1 text-xs text-muted">{def.helpText}</p>}
    </div>
  );
}
