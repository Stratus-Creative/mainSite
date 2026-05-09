"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SearchResult = {
  message_id: string;
  conversation_id: string;
  role: string;
  page_url: string | null;
  created_at: string;
  content_excerpt: string;
};

export function ChatSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const handle = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/admin/chat-search?q=${encodeURIComponent(trimmed)}`,
          { method: "GET" }
        );
        if (!res.ok) {
          if (!cancelled) {
            setError("Search failed.");
            setResults([]);
          }
          return;
        }
        const json = (await res.json()) as { results?: SearchResult[] };
        if (!cancelled) {
          setResults(json.results ?? []);
        }
      } catch {
        if (!cancelled) {
          setError("Search failed.");
          setResults([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [query]);

  const trimmed = query.trim();

  return (
    <div className="mt-3">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search chat messages…"
        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
      />

      {trimmed.length > 0 && trimmed.length < 2 && (
        <p className="mt-3 text-xs text-muted-foreground">
          Keep typing — at least 2 characters.
        </p>
      )}

      {loading && (
        <p className="mt-3 text-xs text-muted-foreground">Searching…</p>
      )}

      {error && (
        <p className="mt-3 text-xs text-amber-400">{error}</p>
      )}

      {!loading && !error && trimmed.length >= 2 && results.length === 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          No matches for “{trimmed}”.
        </p>
      )}

      {results.length > 0 && (
        <ul className="mt-4 divide-y divide-border/60">
          {results.map((r) => (
            <li key={r.message_id}>
              <Link
                href={`/admin/chats/${r.conversation_id}`}
                className="flex flex-col gap-1 py-3 transition-colors hover:bg-background/40"
              >
                <p className="line-clamp-2 text-sm text-foreground">
                  {r.content_excerpt}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {r.role} · {r.page_url ?? "—"} ·{" "}
                  {new Date(r.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
