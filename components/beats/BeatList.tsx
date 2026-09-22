import { useTranslations } from "next-intl";
import type { Beat } from "@/lib/types";
import BeatListRow from "./BeatListRow";

export default function BeatList({ beats }: { beats: Beat[] }) {
  const t = useTranslations("catalog");

  if (beats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-24 text-center">
        <p className="text-lg font-semibold text-foreground">{t("noResultsTitle")}</p>
        <p className="mt-2 text-sm text-muted">{t("noResultsHint")}</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-white/[0.06] overflow-hidden rounded-2xl border border-border bg-surface">
      {beats.map((beat) => (
        <BeatListRow key={beat.id} beat={beat} />
      ))}
    </div>
  );
}
