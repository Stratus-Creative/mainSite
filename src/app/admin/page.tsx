import type { Metadata } from "next";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase";
import { AdminBar } from "@/components/admin-bar";

export const metadata: Metadata = {
  title: "Admin — Stratus Creative",
  robots: { index: false, follow: false },
};

const STATUS_STYLES: Record<string, string> = {
  received: "border-border text-muted-foreground",
  reviewing: "border-accent/40 text-accent",
  quoted: "border-amber-400/30 text-amber-400",
  accepted: "border-emerald-400/30 text-emerald-400",
  closed: "border-border text-muted-foreground",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function AdminPage() {
  const supabase = createServerClient();
  const { data: submissions } = await supabase
    .from("submissions")
    .select(
      "id, created_at, status, source, owner_name, business_name, project_type, budget, email"
    )
    .order("created_at", { ascending: false });

  const counts = {
    received: submissions?.filter((s) => s.status === "received").length ?? 0,
    reviewing: submissions?.filter((s) => s.status === "reviewing").length ?? 0,
    quoted: submissions?.filter((s) => s.status === "quoted").length ?? 0,
    accepted: submissions?.filter((s) => s.status === "accepted").length ?? 0,
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminBar />

      <main className="mx-auto max-w-6xl px-6 py-12">
        {/* Summary row */}
        <div className="grid grid-cols-2 gap-px bg-border/60 sm:grid-cols-4">
          {[
            { label: "Received", value: counts.received, style: "text-muted-foreground" },
            { label: "Reviewing", value: counts.reviewing, style: "text-accent" },
            { label: "Quoted", value: counts.quoted, style: "text-amber-400" },
            { label: "Accepted", value: counts.accepted, style: "text-emerald-400" },
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

        {/* Submissions list */}
        <div className="mt-10">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <h1 className="text-lg font-semibold tracking-tight">All submissions</h1>
            <span className="font-mono text-xs text-muted-foreground">
              {submissions?.length ?? 0} total
            </span>
          </div>

          <div className="divide-y divide-border/60">
            {submissions?.map((s) => (
              <Link
                key={s.id}
                href={`/admin/${s.id}`}
                className="group flex items-center gap-4 py-4 transition-colors hover:bg-card/30 sm:gap-6"
              >
                <span
                  className={`shrink-0 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest ${
                    STATUS_STYLES[s.status] ?? STATUS_STYLES.received
                  }`}
                >
                  {s.status}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {s.business_name ?? s.owner_name ?? "—"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {s.email}
                  </p>
                </div>

                <div className="hidden shrink-0 text-right sm:block">
                  <p className="text-xs text-muted-foreground">
                    {s.source === "audit-request" ? "Audit" : s.project_type ?? "Inquiry"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(s.created_at)}
                  </p>
                </div>

                <span
                  aria-hidden="true"
                  className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                >
                  →
                </span>
              </Link>
            ))}

            {(!submissions || submissions.length === 0) && (
              <p className="py-16 text-center text-sm text-muted-foreground">
                No submissions yet.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
