"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/beats", label: "Beats", exact: false },
  { href: "/admin/orders", label: "Orders", exact: false },
];

export default function AdminShell({ email, children }: { email: string; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const navContent = (
    <>
      <div className="px-4 py-6">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-foreground">
          BEAT<span className="text-green">FOR</span>TRIP
        </p>
        <p className="mt-1 text-xs text-muted">Admin Panel</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {navLinks.map((link) => {
          const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-green-dim text-green" : "text-muted hover:bg-white/5 hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border px-4 py-4">
        <p className="truncate text-xs text-muted">{email}</p>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="mt-2 text-xs font-semibold uppercase tracking-wide text-muted hover:text-green disabled:opacity-50"
        >
          {loggingOut ? "Signing out..." : "Log Out"}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-surface px-4 py-3 lg:hidden">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-foreground">
          BEAT<span className="text-green">FOR</span>TRIP
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open admin menu"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M1 4H15M1 8H15M1 12H15" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="flex">
        <aside className="hidden w-60 flex-shrink-0 flex-col border-r border-border bg-surface lg:sticky lg:top-0 lg:flex lg:h-screen">
          {navContent}
        </aside>

        {open && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
            <div className="relative flex h-full w-64 flex-col bg-surface animate-fade-in">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close admin menu"
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-border"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M1 1L13 13M13 1L1 13" strokeLinecap="round" />
                </svg>
              </button>
              {navContent}
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
