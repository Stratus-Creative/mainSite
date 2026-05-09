import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { AdminBar } from "@/components/admin-bar";

export const metadata: Metadata = {
  title: "Activity log — Stratus Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

const RESOURCE_FILTERS = [
  { value: "all", label: "All" },
  { value: "submission", label: "Submission" },
  { value: "conversation", label: "Conversation" },
  { value: "chat", label: "Chat" },
  { value: "quote", label: "Quote" },
  { value: "subscriber", label: "Subscriber" },
  { value: "prompt", label: "Prompt" },
] as const;

const RANGE_FILTERS = [
  { value: "all", label: "All time" },
  { value: "24h", label: "Last 24h" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
] as const;

const ACTOR_FILTERS = [
  { value: "all", label: "All actors" },
  { value: "me", label: "Me only" },
] as const;

type EventRow = {
  id: string;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  admin_users: { email: string } | { email: string }[] | null;
};

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo}mo ago`;
  const yr = Math.floor(day / 365);
  return `${yr}y ago`;
}

function actorEmail(row: EventRow): string {
  const u = row.admin_users;
  if (!u) return "system";
  if (Array.isArray(u)) return u[0]?.email ?? "system";
  return u.email ?? "system";
}

function summaryText(meta: Record<string, unknown> | null): string | null {
  if (!meta) return null;
  const candidates = [
    meta.business_name,
    meta.summary,
    meta.owner_name,
    meta.email,
    meta.scope,
    meta.prompt_key,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return c.length > 120 ? c.slice(0, 120) + "…" : c;
  }
  return null;
}

function resourceLink(resourceType: string | null, resourceId: string | null): string | null {
  if (!resourceType || !resourceId || resourceId === "00000000-0000-0000-0000-000000000000") {
    return null;
  }
  if (resourceType === "submission" || resourceType === "quote") {
    return `/admin/${resourceId}`;
  }
  if (resourceType === "conversation" || resourceType === "chat") {
    return `/admin/chats/${resourceId}`;
  }
  if (resourceType === "prompt") {
    return `/admin/prompts`;
  }
  return null;
}

function rangeStart(range: string): Date | null {
  const now = Date.now();
  if (range === "24h") return new Date(now - 24 * 60 * 60 * 1000);
  if (range === "7d") return new Date(now - 7 * 24 * 60 * 60 * 1000);
  if (range === "30d") return new Date(now - 30 * 24 * 60 * 60 * 1000);
  return null;
}

function buildHref(params: Record<string, string | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v && v !== "all") sp.set(k, v);
  }
  const q = sp.toString();
  return q ? `/admin/activity?${q}` : `/admin/activity`;
}

type Search = {
  resource?: string;
  range?: string;
  actor?: string;
  before?: string;
};

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const sp = await searchParams;
  const resource = RESOURCE_FILTERS.some((f) => f.value === sp.resource) ? sp.resource! : "all";
  const range = RANGE_FILTERS.some((f) => f.value === sp.range) ? sp.range! : "all";
  const actor = ACTOR_FILTERS.some((f) => f.value === sp.actor) ? sp.actor! : "all";
  const before = sp.before && !Number.isNaN(Date.parse(sp.before)) ? sp.before : null;

  const supabase = createServerClient();

  let q = supabase
    .from("events")
    .select(
      "id, action, resource_type, resource_id, metadata, created_at, admin_users(email)"
    )
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE);

  if (resource !== "all") q = q.eq("resource_type", resource);
  const startDate = rangeStart(range);
  if (startDate) q = q.gte("created_at", startDate.toISOString());
  if (actor === "me") q = q.eq("actor_id", admin.id);
  if (before) q = q.lt("created_at", before);

  const { data, error } = await q;
  const events = (error ? [] : (data ?? [])) as EventRow[];

  const oldest = events.length === PAGE_SIZE ? events[events.length - 1].created_at : null;
  const olderHref = oldest
    ? buildHref({ resource, range, actor, before: oldest })
    : null;

  return (
    <div className="min-h-screen bg-background">
      <AdminBar />

      <main className="mx-auto max-w-6xl px-6 py-12">
        {/* Tab nav */}
        <nav className="mb-8 flex items-center gap-6 border-b border-border/60 pb-4">
          <Link
            href="/admin"
            className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            Submissions
          </Link>
          <Link
            href="/admin/inbox"
            className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            Inbox
          </Link>
          <Link
            href="/admin/chats"
            className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            Chats
          </Link>
          <Link
            href="/admin/subscribers"
            className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            Subscribers
          </Link>
          <Link
            href="/admin/activity"
            className="font-mono text-[10px] uppercase tracking-widest text-foreground"
          >
            Activity
          </Link>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Activity log</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Every event that flowed through the system, newest first.
          </p>
        </header>

        {/* Filters */}
        <div className="mb-8 space-y-4 rounded-xl border border-border bg-card p-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Resource
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {RESOURCE_FILTERS.map((f) => (
                <Link
                  key={f.value}
                  href={buildHref({ resource: f.value, range, actor })}
                  className={`rounded-full px-3 py-1 text-xs transition-colors ${
                    resource === f.value
                      ? "bg-foreground text-background"
                      : "border border-border bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Date range
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {RANGE_FILTERS.map((f) => (
                <Link
                  key={f.value}
                  href={buildHref({ resource, range: f.value, actor })}
                  className={`rounded-full px-3 py-1 text-xs transition-colors ${
                    range === f.value
                      ? "bg-foreground text-background"
                      : "border border-border bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Actor
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {ACTOR_FILTERS.map((f) => (
                <Link
                  key={f.value}
                  href={buildHref({ resource, range, actor: f.value })}
                  className={`rounded-full px-3 py-1 text-xs transition-colors ${
                    actor === f.value
                      ? "bg-foreground text-background"
                      : "border border-border bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Log */}
        <div className="rounded-xl border border-border bg-card">
          {events.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-muted-foreground">
              No events match these filters.
            </div>
          ) : (
            <ul className="divide-y divide-border/30 font-mono text-xs">
              {events.map((ev) => {
                const link = resourceLink(ev.resource_type, ev.resource_id);
                const summary = summaryText(ev.metadata);
                const idShort = ev.resource_id
                  ? ev.resource_id.slice(0, 8)
                  : "—";
                return (
                  <li
                    key={ev.id}
                    className="flex items-start gap-4 px-5 py-3 leading-relaxed"
                  >
                    <span
                      className="w-20 shrink-0 text-muted-foreground"
                      title={ev.created_at}
                    >
                      {relativeTime(ev.created_at)}
                    </span>
                    <span className="w-44 shrink-0 truncate text-muted-foreground">
                      {actorEmail(ev)}
                    </span>
                    <span className="w-44 shrink-0 truncate text-foreground">
                      {ev.action}
                    </span>
                    <span className="w-44 shrink-0 truncate text-muted-foreground">
                      {ev.resource_type ?? "—"}
                      {link ? (
                        <>
                          {" · "}
                          <Link
                            href={link}
                            className="text-accent transition-colors hover:text-foreground"
                          >
                            {idShort}
                          </Link>
                        </>
                      ) : (
                        <>{` · ${idShort}`}</>
                      )}
                    </span>
                    <span className="flex-1 truncate text-muted-foreground">
                      {summary ?? ""}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {olderHref && (
          <div className="mt-6 flex justify-center">
            <Link
              href={olderHref}
              className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              Load older
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
