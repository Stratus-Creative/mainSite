"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/work", label: "Work" },
  { href: "/services", label: "Services" },
  { href: "/pricing", label: "Pricing" },
  { href: "/notes", label: "Decoded" },
  { href: "/about", label: "About" },
];

export function SiteHeader({ activePath: _ }: { activePath?: string } = {}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <Link
            href="/"
            className="group flex items-center gap-2.5 text-sm font-semibold tracking-tight"
          >
            <span
              aria-hidden="true"
              className="logo-dot inline-block size-2 rounded-full bg-accent motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-125"
            />
            <span>Stratus Creative</span>
          </Link>

          <nav className="hidden items-center gap-8 sm:flex">
            {NAV_LINKS.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname?.startsWith(link.href + "/"));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm transition-colors ${
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/resources/free-website-audit"
              className="hidden sm:inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Free audit
            </Link>
            <Link
              href="/start"
              className="group hidden sm:inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-all hover:border-foreground hover:bg-foreground hover:text-background motion-safe:active:scale-[0.98] motion-safe:[transition-duration:240ms]"
            >
              Start a project
              <span
                aria-hidden="true"
                className="motion-safe:transition-transform motion-safe:duration-240 group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>

            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border transition-colors hover:border-foreground sm:hidden"
            >
              {open ? (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 2L14 14M14 2L2 14"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 4h12M2 8h12M2 12h12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div
          className="fixed inset-0 z-40 flex flex-col bg-background sm:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
        >
          <div className="flex items-center justify-between border-b border-border/60 px-6 py-5">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="group flex items-center gap-2.5 text-sm font-semibold tracking-tight"
            >
              <span
                aria-hidden="true"
                className="logo-dot inline-block size-2 rounded-full bg-accent motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-125"
              />
              <span>Stratus Creative</span>
            </Link>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border transition-colors hover:border-foreground"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2 2L14 14M14 2L2 14"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <nav className="flex flex-1 flex-col divide-y divide-border/60 overflow-y-auto px-6">
            {NAV_LINKS.map((link, i) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname?.startsWith(link.href + "/"));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`group flex items-baseline justify-between py-7 ${
                    isActive ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  <span className="text-3xl font-semibold tracking-tight transition-colors group-hover:text-foreground">
                    {link.label}
                  </span>
                  <span className="font-mono text-xs tracking-widest text-muted-foreground/50">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="space-y-3 border-t border-border/60 px-6 py-8">
            <Link
              href="/start"
              onClick={() => setOpen(false)}
              className="group flex items-center justify-between rounded-full bg-foreground px-6 py-4 text-base font-medium text-background transition-colors hover:bg-accent hover:text-accent-foreground motion-safe:active:scale-[0.98] motion-safe:transition-transform motion-safe:duration-150"
            >
              Start a project
              <span aria-hidden="true" className="motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5">→</span>
            </Link>
            <Link
              href="/resources/free-website-audit"
              onClick={() => setOpen(false)}
              className="group flex items-center justify-between rounded-full border border-border px-6 py-4 text-base font-medium text-foreground transition-colors hover:border-foreground motion-safe:active:scale-[0.98]"
            >
              Free audit
              <span aria-hidden="true" className="motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5">→</span>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
