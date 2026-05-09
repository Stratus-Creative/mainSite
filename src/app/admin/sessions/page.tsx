import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { AdminBar } from "@/components/admin-bar";
import { RevokeButton, RevokeOthersButton } from "./sessions-actions";

export const metadata: Metadata = {
  title: "Active sessions — Stratus Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const SESSION_COOKIE = "admin-session";

type SessionRow = {
  token: string;
  user_id: string;
  ip: string | null;
  user_agent: string | null;
  last_seen_at: string | null;
  expires_at: string;
  admin_users: { email: string } | { email: string }[] | null;
};

type FailedRow = {
  id: string;
  ip: string | null;
  email_attempted: string | null;
  user_agent: string | null;
  created_at: string;
};

function relativeTime(iso: string | null): string {
  if (!iso) return "—";
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

function abbreviate(s: string | null, n = 60): string {
  if (!s) return "—";
  return s.length > n ? s.slice(0, n) + "…" : s;
}

function emailFor(row: SessionRow): string {
  const u = row.admin_users;
  if (!u) return "—";
  if (Array.isArray(u)) return u[0]?.email ?? "—";
  return u.email ?? "—";
}

export default async function SessionsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const store = await cookies();
  const currentToken = store.get(SESSION_COOKIE)?.value ?? "";

  const supabase = createServerClient();
  const nowIso = new Date().toISOString();

  const { data: sessionsData } = await supabase
    .from("admin_sessions")
    .select("token, user_id, ip, user_agent, last_seen_at, expires_at, admin_users(email)")
    .gt("expires_at", nowIso)
    .order("last_seen_at", { ascending: false });
  const sessions = (sessionsData ?? []) as SessionRow[];

  const { data: failedData } = await supabase
    .from("failed_logins")
    .select("id, ip, email_attempted, user_agent, created_at")
    .order("created_at", { ascending: false })
    .limit(20);
  const failed = (failedData ?? []) as FailedRow[];

  return (
    <div className="min-h-screen bg-background">
      <AdminBar />

      <main className="mx-auto max-w-6xl px-6 py-12">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to admin
        </Link>

        <header className="mt-6 mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Active sessions</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Devices currently signed in. Revoke any you don&apos;t recognize.
            </p>
          </div>
          <RevokeOthersButton />
        </header>

        <div className="rounded-xl border border-border bg-card">
          {sessions.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-muted-foreground">
              No active sessions.
            </div>
          ) : (
            <ul className="divide-y divide-border/30">
              {sessions.map((s) => {
                const isCurrent = s.token === currentToken;
                return (
                  <li
                    key={s.token}
                    className="flex flex-wrap items-start justify-between gap-4 px-6 py-4"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {emailFor(s)}
                        </span>
                        {isCurrent && (
                          <span className="rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-accent">
                            This device
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-[11px] text-muted-foreground">
                        <span>{s.ip ?? "no ip"}</span>
                        <span className="mx-2">·</span>
                        <span>{abbreviate(s.user_agent, 60)}</span>
                      </div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        Last seen {relativeTime(s.last_seen_at)}
                      </p>
                    </div>
                    <div className="shrink-0">
                      {isCurrent ? (
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                          Current
                        </span>
                      ) : (
                        <RevokeButton token={s.token} />
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {failed.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-semibold tracking-tight">
              Recent failed login attempts
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Last {failed.length} failed attempt{failed.length === 1 ? "" : "s"}, newest first.
            </p>

            <div className="mt-6 rounded-xl border border-border bg-card">
              <ul className="divide-y divide-border/30 font-mono text-xs">
                {failed.map((f) => (
                  <li
                    key={f.id}
                    className="flex flex-wrap items-start gap-4 px-5 py-3 leading-relaxed"
                  >
                    <span
                      className="w-20 shrink-0 text-muted-foreground"
                      title={f.created_at}
                    >
                      {relativeTime(f.created_at)}
                    </span>
                    <span className="w-36 shrink-0 truncate text-foreground">
                      {f.ip ?? "—"}
                    </span>
                    <span className="w-56 shrink-0 truncate text-muted-foreground">
                      {f.email_attempted ?? "—"}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-muted-foreground">
                      {abbreviate(f.user_agent, 60)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
