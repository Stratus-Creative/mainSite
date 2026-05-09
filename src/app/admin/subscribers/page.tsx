import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminBar } from "@/components/admin-bar";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createServerClient } from "@/lib/supabase";

type NewsletterEvent = {
  id: string;
  email: string;
  event_type: string;
  message_id: string | null;
  metadata: Record<string, unknown> | null;
  occurred_at: string;
};

type NewsletterStats = {
  empty: boolean;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  complained: number;
  recent: NewsletterEvent[];
};

async function loadNewsletterStats(): Promise<NewsletterStats> {
  const supabase = createServerClient();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [windowed, recent] = await Promise.all([
    supabase
      .from("newsletter_events")
      .select("event_type")
      .gte("occurred_at", thirtyDaysAgo),
    supabase
      .from("newsletter_events")
      .select("id, email, event_type, message_id, metadata, occurred_at")
      .order("occurred_at", { ascending: false })
      .limit(20),
  ]);

  const events = (windowed.data ?? []) as Array<{ event_type: string }>;
  const recentRows = (recent.data ?? []) as NewsletterEvent[];

  const counts = {
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    bounced: 0,
    complained: 0,
  };
  for (const e of events) {
    if (e.event_type === "email.sent") counts.sent++;
    else if (e.event_type === "email.delivered") counts.delivered++;
    else if (e.event_type === "email.opened") counts.opened++;
    else if (e.event_type === "email.clicked") counts.clicked++;
    else if (e.event_type === "email.bounced") counts.bounced++;
    else if (e.event_type === "email.complained") counts.complained++;
  }

  return {
    empty: events.length === 0 && recentRows.length === 0,
    ...counts,
    recent: recentRows,
  };
}

function pct(num: number, den: number): string {
  if (den <= 0) return "—";
  return `${((num / den) * 100).toFixed(1)}%`;
}

function eventTone(type: string): string {
  if (type === "email.bounced" || type === "email.complained" || type === "email.failed") {
    return "text-red-400";
  }
  if (type === "email.opened" || type === "email.clicked") return "text-emerald-400";
  if (type === "email.delivered") return "text-foreground";
  return "text-muted-foreground";
}

export const metadata: Metadata = {
  title: "Subscribers — Stratus Admin",
  robots: { index: false, follow: false },
};

type ResendContact = {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  unsubscribed: boolean;
};

type ResendListResponse = {
  data?: ResendContact[];
};

type FetchResult =
  | { kind: "ok"; contacts: ResendContact[] }
  | { kind: "missing-env"; missing: string[] }
  | { kind: "error"; status: number; message: string };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

async function fetchSubscribers(): Promise<FetchResult> {
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  const apiKey = process.env.RESEND_API_KEY;

  const missing: string[] = [];
  if (!audienceId) missing.push("RESEND_AUDIENCE_ID");
  if (!apiKey) missing.push("RESEND_API_KEY");
  if (missing.length > 0) {
    return { kind: "missing-env", missing };
  }

  try {
    const res = await fetch(
      `https://api.resend.com/audiences/${audienceId}/contacts`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      const message = await res.text().catch(() => res.statusText);
      return { kind: "error", status: res.status, message: message || res.statusText };
    }

    const json = (await res.json()) as ResendListResponse;
    const contacts = (json.data ?? []).slice().sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return { kind: "ok", contacts };
  } catch (err) {
    return {
      kind: "error",
      status: 0,
      message: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export default async function SubscribersPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  const [result, newsletterStats] = await Promise.all([
    fetchSubscribers(),
    loadNewsletterStats(),
  ]);

  const contacts = result.kind === "ok" ? result.contacts : [];
  const total = contacts.length;
  const unsubscribed = contacts.filter((c) => c.unsubscribed).length;
  const active = total - unsubscribed;
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const last30 = contacts.filter(
    (c) => new Date(c.created_at).getTime() >= thirtyDaysAgo
  ).length;

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
            href="/admin/chats"
            className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            Chats
          </Link>
          <Link
            href="/admin/subscribers"
            className="font-mono text-[10px] uppercase tracking-widest text-foreground"
          >
            Subscribers
          </Link>
          <span className="ml-auto">
            <Link
              href="/admin"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              ← Back to Admin
            </Link>
          </span>
        </nav>

        {result.kind === "missing-env" ? (
          <div className="rounded-md border border-border/60 bg-card/40 p-8">
            <p className="font-mono text-[10px] uppercase tracking-widest text-amber-400">
              Configuration required
            </p>
            <h2 className="mt-2 text-lg font-semibold tracking-tight">
              Resend isn't configured
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              To view newsletter subscribers, set the following environment
              variable{result.missing.length > 1 ? "s" : ""} on the deployment:
            </p>
            <ul className="mt-3 space-y-1">
              {result.missing.map((name) => (
                <li
                  key={name}
                  className="font-mono text-xs text-foreground"
                >
                  {name}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">
              Subscribers are stored in a Resend audience, not in the database.
            </p>
          </div>
        ) : result.kind === "error" ? (
          <div className="rounded-md border border-amber-400/30 bg-card/40 p-8">
            <p className="font-mono text-[10px] uppercase tracking-widest text-amber-400">
              Resend API error
            </p>
            <h2 className="mt-2 text-lg font-semibold tracking-tight">
              Couldn't load subscribers
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Status: <span className="font-mono">{result.status || "n/a"}</span>
            </p>
            {result.message ? (
              <pre className="mt-3 overflow-x-auto rounded border border-border/60 bg-background p-3 font-mono text-xs text-muted-foreground">
                {result.message}
              </pre>
            ) : null}
          </div>
        ) : (
          <>
            {/* Summary tiles */}
            <div className="grid grid-cols-2 gap-px bg-border/60 sm:grid-cols-4">
              {[
                {
                  label: "Total",
                  value: total,
                  style: "text-foreground",
                },
                {
                  label: "Active",
                  value: active,
                  style: "text-emerald-400",
                },
                {
                  label: "Unsubscribed",
                  value: unsubscribed,
                  style: "text-amber-400",
                },
                {
                  label: "Last 30 days",
                  value: last30,
                  style: "text-accent",
                },
              ].map((stat) => (
                <div key={stat.label} className="bg-background px-6 py-5">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className={`mt-2 text-3xl font-semibold ${stat.style}`}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Subscribers list */}
            <div className="mt-10">
              <div className="flex items-center justify-between border-b border-border/60 pb-4">
                <h1 className="text-lg font-semibold tracking-tight">
                  Newsletter subscribers
                </h1>
                <span className="font-mono text-xs text-muted-foreground">
                  {total} total
                </span>
              </div>

              <div className="divide-y divide-border/60">
                {contacts.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-4 py-4 sm:gap-6"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{c.email}</p>
                      {(c.first_name || c.last_name) && (
                        <p className="truncate text-xs text-muted-foreground">
                          {[c.first_name, c.last_name].filter(Boolean).join(" ")}
                        </p>
                      )}
                    </div>

                    {c.unsubscribed && (
                      <span className="shrink-0 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest border-amber-400/30 text-amber-400">
                        Unsubscribed
                      </span>
                    )}

                    <p className="hidden shrink-0 font-mono text-xs text-muted-foreground sm:block">
                      {formatDate(c.created_at)}
                    </p>
                  </div>
                ))}

                {contacts.length === 0 && (
                  <p className="py-16 text-center text-sm text-muted-foreground">
                    No subscribers yet.
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {/* Newsletter analytics from local newsletter_events */}
        <section className="mt-12">
          <div className="mb-4 flex items-center justify-between border-b border-border/60 pb-3">
            <h2 className="text-base font-semibold tracking-tight">
              Newsletter analytics
            </h2>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              last 30 days
            </span>
          </div>

          {newsletterStats.empty ? (
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="font-mono text-[10px] uppercase tracking-widest text-amber-400">
                No newsletter events yet
              </p>
              <h3 className="mt-2 text-sm font-semibold tracking-tight">
                Configure the Resend webhook to start tracking
              </h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Point Resend at{" "}
                <span className="font-mono text-xs">
                  /api/webhooks/resend-newsletter?token=$RESEND_NEWSLETTER_SECRET
                </span>
                {" "}and select the email.* events. Sends, opens, clicks, and
                bounces will populate this section.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-px bg-border/60 sm:grid-cols-4">
                {[
                  {
                    label: "Sent",
                    value: newsletterStats.sent.toLocaleString("en-US"),
                    tone: "text-foreground",
                  },
                  {
                    label: "Open rate",
                    value: pct(newsletterStats.opened, newsletterStats.sent),
                    tone: "text-emerald-400",
                  },
                  {
                    label: "Click rate",
                    value: pct(newsletterStats.clicked, newsletterStats.sent),
                    tone: "text-accent",
                  },
                  {
                    label: "Bounce rate",
                    value: pct(newsletterStats.bounced, newsletterStats.sent),
                    tone: "text-amber-400",
                  },
                ].map((stat) => (
                  <div key={stat.label} className="bg-background px-6 py-5">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className={`mt-2 text-2xl font-semibold ${stat.tone}`}>
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-xl border border-border bg-card p-6">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <h3 className="text-sm font-semibold tracking-tight">
                    Recent newsletter activity
                  </h3>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {newsletterStats.recent.length} events
                  </span>
                </div>

                {newsletterStats.recent.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No recent activity.
                  </p>
                ) : (
                  <ul className="divide-y divide-border/60">
                    {newsletterStats.recent.map((e) => (
                      <li
                        key={e.id}
                        className="grid grid-cols-12 gap-3 py-3 text-sm"
                      >
                        <span
                          className={`col-span-3 font-mono text-xs ${eventTone(e.event_type)}`}
                        >
                          {e.event_type.replace(/^email\./, "")}
                        </span>
                        <span className="col-span-6 truncate">{e.email}</span>
                        <span className="col-span-3 text-right font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                          {new Date(e.occurred_at).toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
