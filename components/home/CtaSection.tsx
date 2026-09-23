import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";

export type CtaContent = {
  title?: string;
  subtitle?: string;
  button?: string;
};

// `content` is CMS-resolved server-side (see app/[locale]/page.tsx). The
// default title uses rich text (an accented word via t.rich); a CMS override
// replaces it with plain text — still on-brand, just without the per-word
// accent split — while the default (no override) keeps the original design.
export default function CtaSection({ content }: { content?: CtaContent }) {
  const t = useTranslations("home");

  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold uppercase tracking-tight text-foreground sm:text-4xl [&_span]:text-green">
          {content?.title || t.rich("ctaTitle", { accent: (chunks) => <span>{chunks}</span> })}
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm text-muted sm:text-base">
          {content?.subtitle || t("ctaSubtitle")}
        </p>
        <div className="mt-8 flex justify-center">
          <Button href="/beats" size="lg">
            {content?.button || t("browseAll")}
          </Button>
        </div>
      </div>
    </section>
  );
}
