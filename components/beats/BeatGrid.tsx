import { useTranslations } from "next-intl";
import type { Beat } from "@/lib/types";
import BeatCard from "./BeatCard";

export default function BeatGrid({ beats }: { beats: Beat[] }) {
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
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
      {beats.map((beat) => (
        <BeatCard key={beat.id} beat={beat} />
      ))}
    </div>
  );
}
