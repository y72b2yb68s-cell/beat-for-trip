"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export default function NavMenu({
  beatsLabel,
  aboutLabel,
}: {
  beatsLabel?: string;
  aboutLabel?: string;
} = {}) {
  const pathname = usePathname();
  const t = useTranslations("header");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { href: "/beats", label: beatsLabel || t("beats") },
    { href: "/about", label: aboutLabel || t("about") },
  ];

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("menu")}
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-green hover:text-green"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          {open ? (
            <path d="M2 2L14 14M14 2L2 14" strokeLinecap="round" />
          ) : (
            <path d="M1 4H15M1 8H15M1 12H15" strokeLinecap="round" />
          )}
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-border bg-surface py-1.5 shadow-xl animate-fade-in">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "block px-4 py-2.5 text-sm font-medium uppercase tracking-wide",
                  active ? "text-green" : "text-foreground hover:bg-white/5"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
