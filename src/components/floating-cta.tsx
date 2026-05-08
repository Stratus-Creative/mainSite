"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const HIDDEN_PATHS = ["/start", "/support", "/success", "/cancel"];

export function FloatingCta() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      // Show after scrolling past first viewport — captures intent post-hero
      setVisible(window.scrollY > window.innerHeight * 0.7);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (HIDDEN_PATHS.some((p) => pathname?.startsWith(p))) return null;
  if (!visible) return null;

  return (
    <Link
      href="/start"
      aria-label="Start a project"
      className="group fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background shadow-lg shadow-black/40 transition-all hover:bg-accent hover:text-accent-foreground sm:bottom-8 sm:right-8"
    >
      <span
        aria-hidden="true"
        className="size-2 rounded-full bg-accent transition-colors group-hover:bg-accent-foreground"
      />
      Start a project
      <span
        aria-hidden="true"
        className="transition-transform group-hover:translate-x-0.5"
      >
        →
      </span>
    </Link>
  );
}
