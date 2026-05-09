"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const STORAGE_KEY = "stratus_visitor_session";
const SESSION_REFRESH_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

type StoredSession = {
  id: string;
  createdAt: number;
};

function generateSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback: random hex string
  return Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, "0")
  ).join("");
}

function readOrCreateSession(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const now = Date.now();
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<StoredSession>;
      if (
        parsed &&
        typeof parsed.id === "string" &&
        parsed.id.length > 0 &&
        typeof parsed.createdAt === "number" &&
        now - parsed.createdAt < SESSION_REFRESH_MS
      ) {
        // Refresh createdAt so 30d window is rolling.
        const refreshed: StoredSession = { id: parsed.id, createdAt: now };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(refreshed));
        return parsed.id;
      }
    }
    const fresh: StoredSession = { id: generateSessionId(), createdAt: now };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    return fresh.id;
  } catch {
    return null;
  }
}

export function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    if (pathname.startsWith("/admin")) return;

    const sessionId = readOrCreateSession();
    if (!sessionId) return;

    const utm = {
      utm_source: searchParams.get("utm_source") ?? null,
      utm_medium: searchParams.get("utm_medium") ?? null,
      utm_campaign: searchParams.get("utm_campaign") ?? null,
      utm_content: searchParams.get("utm_content") ?? null,
      utm_term: searchParams.get("utm_term") ?? null,
    };

    const payload = {
      sessionId,
      pageUrl: window.location.pathname,
      referrer: document.referrer || null,
      utm,
    };

    // Fire-and-forget. keepalive lets the request finish during navigation.
    try {
      void fetch("/api/page-view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {
        // silent
      });
    } catch {
      // silent
    }
  }, [pathname, searchParams]);

  return null;
}
