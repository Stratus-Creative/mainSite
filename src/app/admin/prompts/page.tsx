import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { AdminBar } from "@/components/admin-bar";
import { PromoteButton } from "./promote-button";

export const metadata: Metadata = {
  title: "Prompts — Stratus Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const PROMPT_KEY = "chat-system";

type VersionRow = {
  id: string;
  prompt_key: string;
  content: string;
  summary: string | null;
  created_by: string | null;
  active: boolean;
  created_at: string;
  admin_users: { email: string } | { email: string }[] | null;
};

function actorEmail(row: VersionRow): string {
  const u = row.admin_users;
  if (!u) return "system";
  if (Array.isArray(u)) return u[0]?.email ?? "system";
  return u.email ?? "system";
}

function wordCount(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function PromptsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const sp = await searchParams;
  const expandedId = sp.view ?? null;

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("prompt_versions")
    .select(
      "id, prompt_key, content, summary, created_by, active, created_at, admin_users(email)"
    )
    .eq("prompt_key", PROMPT_KEY)
    .order("created_at", { ascending: false });

  const versions = (error ? [] : (data ?? [])) as VersionRow[];
  const active = versions.find((v) => v.active) ?? null;

  return (
    <div className="min-h-screen bg-background">
      <AdminBar />

      <main className="mx-auto max-w-6xl px-6 py-12">
        <header className="mb-8">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Chat assistant
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Prompt versioning</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Edit the live system prompt for the chat widget without redeploying.
          </p>
        </header>

        {/* Active prompt */}
        <section className="mb-12 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Active chat prompt
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {active
                  ? `${fmtDate(active.created_at)} · ${actorEmail(active)}`
                  : "No DB version active — using hardcoded fallback."}
              </p>
            </div>
            <Link
              href="/admin/prompts/edit"
              className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              Edit
            </Link>
          </div>

          <pre className="mt-4 max-h-[500px] overflow-auto rounded-lg border border-border/60 bg-background p-4 font-mono text-xs leading-relaxed text-foreground/90 whitespace-pre-wrap">
            {active?.content ?? "(no active version stored — chat is using the hardcoded BASE_PROMPT)"}
          </pre>
        </section>

        {/* Version history */}
        <section>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Version history
          </p>

          {versions.length === 0 ? (
            <div className="mt-4 rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
              No prompt versions saved yet. Click Edit to save the first one.
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {versions.map((v) => {
                const isExpanded = expandedId === v.id;
                const collapseHref = `/admin/prompts`;
                const expandHref = `/admin/prompts?view=${v.id}`;
                return (
                  <li
                    key={v.id}
                    className="rounded-xl border border-border bg-card p-6"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                            {fmtDate(v.created_at)}
                          </span>
                          {v.active && (
                            <span className="rounded-full bg-accent/20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-accent">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-sm font-medium text-foreground">
                          {v.summary ?? "(no summary)"}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {actorEmail(v)} · {wordCount(v.content)} words
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Link
                          href={isExpanded ? collapseHref : expandHref}
                          className="rounded-full border border-border px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-card"
                        >
                          {isExpanded ? "Hide" : "View"}
                        </Link>
                        {!v.active && <PromoteButton id={v.id} />}
                      </div>
                    </div>

                    {isExpanded && (
                      <pre className="mt-4 max-h-[400px] overflow-auto rounded-lg border border-border/60 bg-background p-4 font-mono text-xs leading-relaxed text-foreground/90 whitespace-pre-wrap">
                        {v.content}
                      </pre>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
