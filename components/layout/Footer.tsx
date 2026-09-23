import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getLocalizedContent, getPageContent } from "@/lib/site-content";
import { LEGAL_NAME, BUSINESS_ADDRESS, CONTACT_PHONE, FALLBACK_CONTACT_EMAIL } from "@/lib/business-info";

const SOCIAL_ICON_PATHS: Record<string, string> = {
  instagram:
    "M12 2c2.7 0 3 .01 4.1.06 1.1.05 1.8.2 2.4.45.6.25 1.1.6 1.6 1.1s.85 1 1.1 1.6c.25.6.4 1.3.45 2.4.05 1.1.06 1.4.06 4.1s-.01 3-.06 4.1c-.05 1.1-.2 1.8-.45 2.4-.25.6-.6 1.1-1.1 1.6s-1 .85-1.6 1.1c-.6.25-1.3.4-2.4.45-1.1.05-1.4.06-4.1.06s-3-.01-4.1-.06c-1.1-.05-1.8-.2-2.4-.45-.6-.25-1.1-.6-1.6-1.1s-.85-1-1.1-1.6c-.25-.6-.4-1.3-.45-2.4C2.01 15 2 14.7 2 12s.01-3 .06-4.1c.05-1.1.2-1.8.45-2.4.25-.6.6-1.1 1.1-1.6s1-.85 1.6-1.1c.6-.25 1.3-.4 2.4-.45C9 2.01 9.3 2 12 2zm0 5a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6zm5.2-3.4a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4z",
  twitter:
    "M18.9 3h3l-6.6 7.5L23 21h-6.4l-5-6.6L5.7 21H2.6l7-8-7.6-10h6.5l4.6 6.1z",
  youtube:
    "M21.6 7.2s-.2-1.5-.8-2.1c-.8-.8-1.7-.8-2.1-.9C15.9 4 12 4 12 4h0s-3.9 0-6.7.2c-.4 0-1.3.1-2.1.9-.6.6-.8 2.1-.8 2.1S2.2 9 2.2 10.7v1.5C2.2 14 2.4 15.7 2.4 15.7s.2 1.5.8 2.1c.8.8 1.8.8 2.3.9 1.6.2 6.5.2 6.5.2s3.9 0 6.7-.2c.4-.1 1.3-.1 2.1-.9.6-.6.8-2.1.8-2.1s.2-1.7.2-3.5v-1.5c0-1.7-.2-3.5-.2-3.5zM9.9 14.6V8.9l5.4 2.9z",
  tiktok:
    "M16.6 5.8a4.3 4.3 0 01-3.1-1.4v9.9a4.7 4.7 0 11-4.1-4.7v2.3a2.4 2.4 0 102 2.4V2h2.3a4.3 4.3 0 003 3.9z",
};

export default async function Footer() {
  const t = await getTranslations("footer");
  const locale = await getLocale();
  const content = await getPageContent("footer", locale);
  const settings = await getPageContent("settings", locale);
  const year = new Date().getFullYear();

  const tagline = getLocalizedContent(content, "general", "tagline", t("tagline"));
  const shopLabel = getLocalizedContent(content, "links", "shopLabel", t("shop"));
  const legalLabel = getLocalizedContent(content, "links", "legalLabel", t("legal"));
  const beatsLabel = getLocalizedContent(content, "links", "beatsLabel", t("beats"));
  const aboutLabel = getLocalizedContent(content, "links", "aboutLabel", t("about"));
  const termsLabel = getLocalizedContent(content, "links", "termsLabel", t("terms"));
  const privacyLabel = getLocalizedContent(content, "links", "privacyLabel", t("privacy"));
  const refundLabel = getLocalizedContent(content, "links", "refundLabel", t("refund"));
  const copyrightTemplate = getLocalizedContent(content, "copyright", "template", t("copyright", { year }));
  const copyright = copyrightTemplate.includes("{year}")
    ? copyrightTemplate.replace("{year}", String(year))
    : copyrightTemplate;

  const contactEmail = settings.contact?.contactEmail || FALLBACK_CONTACT_EMAIL;

  let socialLinks: Record<string, string> = {};
  const rawSocial = settings.social?.links;
  if (rawSocial) {
    try {
      socialLinks = JSON.parse(rawSocial);
    } catch {
      socialLinks = {};
    }
  }
  const activeSocialLinks = Object.entries(socialLinks).filter(([, url]) => url && url.trim() !== "");

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-lg font-bold tracking-[0.2em] text-foreground">
              BEAT<span className="text-green">FOR</span>TRIP
            </p>
            <p className="mt-2 max-w-xs text-sm text-muted">{tagline}</p>

            <div className="mt-3 flex flex-col gap-1 text-sm text-muted">
              <p>{LEGAL_NAME}</p>
              <p>{BUSINESS_ADDRESS}</p>
              <a href={`tel:${CONTACT_PHONE.replace(/\s+/g, "")}`} className="hover:text-green">
                {CONTACT_PHONE}
              </a>
              <a href={`mailto:${contactEmail}`} className="hover:text-green">
                {contactEmail}
              </a>
            </div>

            {activeSocialLinks.length > 0 && (
              <div className="mt-4 flex gap-3">
                {activeSocialLinks.map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={platform}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-green hover:text-green"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d={SOCIAL_ICON_PATHS[platform] ?? SOCIAL_ICON_PATHS.instagram} />
                    </svg>
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-12">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">{shopLabel}</span>
              <Link href="/beats" className="text-sm text-foreground hover:text-green">
                {beatsLabel}
              </Link>
              <Link href="/about" className="text-sm text-foreground hover:text-green">
                {aboutLabel}
              </Link>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">{legalLabel}</span>
              <Link href="/terms" className="text-sm text-foreground hover:text-green">
                {termsLabel}
              </Link>
              <Link href="/privacy" className="text-sm text-foreground hover:text-green">
                {privacyLabel}
              </Link>
              <Link href="/refund" className="text-sm text-foreground hover:text-green">
                {refundLabel}
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted">{copyright}</p>
          <div className="flex items-center gap-2">
            <span className="rounded border border-border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
              Visa
            </span>
            <span className="rounded border border-border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
              Mastercard
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
