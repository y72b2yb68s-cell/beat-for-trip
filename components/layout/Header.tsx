"use client";

import { Link } from "@/i18n/navigation";
import LanguageSwitcher from "./LanguageSwitcher";
import NavMenu from "./NavMenu";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6 lg:px-8">
        <div className="justify-self-start">
          <NavMenu />
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
