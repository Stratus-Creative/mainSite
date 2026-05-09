import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminBar } from "@/components/admin-bar";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createServerClient } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "System status — Stratus Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Status = "green" | "amber" | "red" | "unknown";

type ServiceCheck = {
  name: string;
  status: Status;
  detail: string;
  latencyMs?: number;
};

function dotClass(status: Status): string {
  switch (status) {
    case "green":
      return "bg-emerald-400";
    case "amber":
      return "bg-amber-400";
    case "red":
      return "bg-red-500";
    default:
      return "bg-muted-foreground/40";
  }
}

async function checkSupabase(): Promise<ServiceCheck> {
  const supabase = createServerClient();
  const start = Date.now();
  try {
    const { error } = await supabase
      .from("admin_users")
      .select("id", { count: "exact", head: true });
    const latency = Date.now() - start;
    if (error) {
      return {
        name: "Supabase DB",
        status: "red",
        detail: error.message,
        latencyMs: latency,
      };
    }
    const status: Status =
      latency < 500 ? "green" : latency < 1500 ? "amber" : "red";
    return {
      name: "Supabase DB",
      status,
      detail: `Round-trip ${latency}ms`,
      latencyMs: latency,
    };
  } catch (err) {
    return {
      name: "Supabase DB",
      status: "red",
      detail: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

async function checkResend(): Promise<ServiceCheck> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return {
      name: "Resend",
      status: "amber",
      detail: "RESEND_API_KEY not set",
    };
  }
  const start = Date.now();
  try {
    const res = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    });
    const latency = Date.now() - start;
    if (res.ok) {
      return {
        name: "Resend",
        status: "green",
        detail: `200 OK · ${latency}ms`,
        latencyMs: latency,
      };
    }
    return {
      name: "Resend",
      status: "red",
      detail: `HTTP ${res.status} · ${latency}ms`,
      latencyMs: latency,
    };
  } catch (err) {
    return {
      name: "Resend",
      status: "red",
      detail: err instanceof Error ? err.message : "Fetch failed",
    };
  }
}

async function checkAnthropic(): Promise<ServiceCheck> {
  // Don't ping Anthropic on every page load — it costs real money.
  // Instead infer health from recent ai_usage rows.
  const supabase = createServerClient();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  try {
    const [{ count: lastHour }, { count: lastDay }] = await Promise.all([
      supabase
        .from("ai_usage")
        .select("id", { count: "exact", head: true })
        .gte("created_at", oneHourAgo),
      supabase
        .from("ai_usage")
        .select("id", { count: "exact", head: true })
        .gte("created_at", oneDayAgo),
    ]);

    if ((lastHour ?? 0) > 0) {
      return {
        name: "Anthropic",
        status: "green",
        detail: `${lastHour} successful call${lastHour === 1 ? "" : "s"} in last hour`,
      };
    }
    if ((lastDay ?? 0) > 0) {
      return {
        name: "Anthropic",
        status: "amber",
        detail: `${lastDay} call${lastDay === 1 ? "" : "s"} in last 24h, none in last hour`,
      };
    }
    return {
      name: "Anthropic",
      status: "amber",
      detail: "No recent calls — health unknown",
    };
  } catch (err) {
    return {
      name: "Anthropic",
      status: "red",
      detail: err instanceof Error ? err.message : "Lookup failed",
    };
  }
}

async function checkStripe(): Promise<ServiceCheck> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return {
      name: "Stripe",
      status: "amber",
      detail: "STRIPE_SECRET_KEY not set",
    };
  }
  const start = Date.now();
  try {
    const res = await fetch("https://api.stripe.com/v1/balance", {
      headers: { Authorization: `Bearer ${key}` },
      cache: "no-store",
    });
    const latency = Date.now() - start;
    if (res.ok) {
      return {
        name: "Stripe",
        status: "green",
        detail: `200 OK · ${latency}ms`,
        latencyMs: latency,
      };
    }
    return {
      name: "Stripe",
      status: "red",
      detail: `HTTP ${res.status} · ${latency}ms`,
      latencyMs: latency,
    };
  } catch (err) {
    return {
      name: "Stripe",
      status: "red",
      detail: err instanceof Error ? err.message : "Fetch failed",
    };
  }
}

async function checkCron(): Promise<ServiceCheck> {
  const supabase = createServerClient();
  try {
    const { data, error } = await supabase
      .from("events")
      .select("action, created_at")
      .like("action", "cron.%")
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      return {
        name: "Cron",
        status: "amber",
        detail: error.message,
      };
    }

    const latest = data?.[0];
    if (!latest) {
      return {
        name: "Cron",
        status: "red",
        detail: "No cron runs ever recorded",
      };
    }

    const ageMs = Date.now() - new Date(latest.created_at).getTime();
    const ageHours = ageMs / (60 * 60 * 1000);
    let status: Status;
    if (ageHours <= 25) status = "green";
    else if (ageHours <= 48) status = "amber";
    else status = "red";

    return {
      name: "Cron",
      status,
      detail: `Last run ${formatAge(ageMs)} ago (${latest.action})`,
    };
  } catch (err) {
    return {
      name: "Cron",
      status: "red",
      detail: err instanceof Error ? err.message : "Lookup failed",
    };
  }
}

function formatAge(ms: number): string {
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 48) return `${hr}h`;
  const day = Math.floor(hr / 24);
  return `${day}d`;
}

async function loadResourceCounts() {
  const supabase = createServerClient();
  const tables = [
    "submissions",
    "conversations",
    "messages",
    "ai_usage",
    "page_views",
    "newsletter_events",
    "events",
  ];

  const results = await Promise.allSettled(
    tables.map(async (t) => {
      const { count } = await supabase
        .from(t)
        .select("id", { count: "exact", head: true });
      return { table: t, count: count ?? 0 };
    })
  );

  return results.map((r, idx) =>
    r.status === "fulfilled"
      ? r.value
      : { table: tables[idx], count: -1 }
  );
}

async function loadRecentErrors() {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("events")
    .select("id, action, metadata, created_at")
    .eq("action", "server.error")
    .order("created_at", { ascending: false })
    .limit(20);
  return (data ?? []) as Array<{
    id: string;
    action: string;
    metadata: Record<string, unknown> | null;
    created_at: string;
  }>;
}

export default async function StatusPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const checksPromise = Promise.allSettled([
    checkSupabase(),
    checkResend(),
    checkAnthropic(),
    checkStripe(),
    checkCron(),
  ]);

  const [checksSettled, counts, errors] = await Promise.all([
    checksPromise,
    loadResourceCounts(),
    loadRecentErrors(),
  ]);

  const services: ServiceCheck[] = checksSettled.map((r, idx) => {
    if (r.status === "fulfilled") return r.value;
    const fallbackNames = ["Supabase DB", "Resend", "Anthropic", "Stripe", "Cron"];
    return {
      name: fallbackNames[idx] ?? "Unknown",
      status: "red" as Status,
      detail: r.reason instanceof Error ? r.reason.message : "Check failed",
    };
  });

  const overallStatus: Status = services.some((s) => s.status === "red")
    ? "red"
    : services.some((s) => s.status === "amber")
      ? "amber"
      : "green";

  return (
    <div className="min-h-screen bg-background">
      <AdminBar />

      <main className="mx-auto max-w-6xl px-6 py-12">
        <nav className="mb-8 flex items-center gap-6 border-b border-border/60 pb-4">
          <Link
            href="/admin"
            className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Back to admin
          </Link>
        </nav>

        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">System status</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Real-time checks of the services Stratus depends on.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2">
            <span className={`size-2.5 rounded-full ${dotClass(overallStatus)}`} />
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {overallStatus === "green"
                ? "All systems operational"
                : overallStatus === "amber"
                  ? "Degraded performance"
                  : "Service issue detected"}
            </span>
          </div>
        </header>

        {/* Service tiles */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div
              key={s.name}
              className="rounded-xl border border-border bg-card p-6"
            >
              <div className="flex items-center gap-3">
                <span className={`size-2.5 rounded-full ${dotClass(s.status)}`} />
                <h3 className="text-sm font-semibold">{s.name}</h3>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">{s.detail}</p>
              {typeof s.latencyMs === "number" && (
                <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Latency · {s.latencyMs}ms
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Recent errors */}
        <section className="mt-10 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h2 className="text-base font-semibold tracking-tight">Recent server errors</h2>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {errors.length} {errors.length === 1 ? "entry" : "entries"}
            </span>
          </div>
          {errors.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No errors logged.
            </p>
          ) : (
            <ul className="divide-y divide-border/60">
              {errors.map((e) => {
                const summary =
                  e.metadata && typeof e.metadata.summary === "string"
                    ? e.metadata.summary
                    : e.metadata
                      ? JSON.stringify(e.metadata)
                      : "—";
                return (
                  <li key={e.id} className="py-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-red-400">{e.action}</span>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        {new Date(e.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {summary}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Resource counts */}
        <section className="mt-10 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h2 className="text-base font-semibold tracking-tight">Resource counts</h2>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              live
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-px bg-border/60 sm:grid-cols-4 lg:grid-cols-7">
            {counts.map((c) => (
              <div key={c.table} className="bg-card px-4 py-3">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {c.table}
                </p>
                <p className="mt-1 text-xl font-semibold">
                  {c.count < 0 ? "—" : c.count.toLocaleString("en-US")}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
