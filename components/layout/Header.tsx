import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getPageContent } from "@/lib/site-content";
import LanguageSwitcher from "./LanguageSwitcher";
import NavMenu from "./NavMenu";

// Server Component (no "use client") so it can read CMS nav-label overrides
// directly; NavMenu/LanguageSwitcher remain client components underneath.
export default async function Header() {
  const locale = await getLocale();
  const content = await getPageContent("layout", locale);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6 lg:px-8">
        <div className="justify-self-start">
          <NavMenu beatsLabel={content.nav?.beatsLabel} aboutLabel={content.nav?.aboutLabel} />
        </div>

        <Link
          href="/"
          className="justify-self-center text-lg font-bold tracking-[0.2em] text-foreground"
        >
          BEAT<span className="text-green">FOR</span>TRIP
        </Link>

        <div className="justify-self-end">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
