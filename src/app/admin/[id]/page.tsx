import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase";
import { AdminBar } from "@/components/admin-bar";
import { DetailForm } from "./detail-form";

export const metadata: Metadata = {
  title: "Submission — Stratus Admin",
  robots: { index: false, follow: false },
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatBudget(budget: string | null) {
  if (!budget) return null;
  const map: Record<string, string> = {
    "under-2k": "Under $2K",
    "2k-5k": "$2K – $5K",
    "5k-15k": "$5K – $15K",
    "15k-plus": "$15K+",
    unsure: "Unsure / not specified",
  };
  return map[budget] ?? budget;
}

function sourceLabel(source: string | null) {
  if (source === "free-website-audit") return "Free audit request";
  if (source === "cost-estimator") return "Estimator → Inquiry";
  return "Direct inquiry";
}

function sourceBadge(source: string | null) {
  if (source === "free-website-audit")
    return "border-border text-muted-foreground";
  if (source === "cost-estimator")
    return "border-accent/40 bg-accent/10 text-accent";
  return "border-border text-muted-foreground";
}

// Splits a message that may contain an estimator block into its two parts.
function parseMessage(message: string | null): {
  estimatorMetrics: { label: string; value: string }[] | null;
  description: string | null;
} {
  if (!message) return { estimatorMetrics: null, description: null };

  const HEADER = "── ESTIMATE FROM /tools/cost-estimator ──";
  const DIVIDER = "── My project ──";

  if (!message.includes(HEADER)) {
    return { estimatorMetrics: null, description: message.trim() || null };
  }

  const afterHeader = message.split(HEADER)[1] ?? "";
  const [estimatorRaw, descriptionRaw] = afterHeader.split(DIVIDER);

  const metrics: { label: string; value: string }[] = [];
  for (const line of (estimatorRaw ?? "").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("Updated")) continue;
    const colonIdx = trimmed.indexOf(":");
    if (colonIdx === -1) continue;
    const label = trimmed.slice(0, colonIdx).trim();
    const value = trimmed.slice(colonIdx + 1).trim();
    if (label && value) metrics.push({ label, value });
  }

  return {
    estimatorMetrics: metrics.length > 0 ? metrics : null,
    description: descriptionRaw?.trim() || null,
  };
}

// ─── Page ───────────────────────────────────────────────────────────────────

interface Params {
  params: Promise<{ id: string }>;
}

export default async function AdminDetailPage({ params }: Params) {
  const { id } = await params;

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) notFound();

  const isAudit = data.source === "free-website-audit";
  const { estimatorMetrics, description } = parseMessage(data.message);

  return (
    <div className="min-h-screen bg-background">
      <AdminBar />

      <main className="mx-auto max-w-6xl px-6 py-12">
        {/* Back */}
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← All submissions
        </Link>

        {/* Header */}
        <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">
                {data.business_name ?? data.owner_name ?? "Submission"}
              </h1>
              <span
                className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest ${sourceBadge(data.source)}`}
              >
                {sourceLabel(data.source)}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatDate(data.created_at)}
            </p>
          </div>
          <Link
            href={`/quote/${data.id}`}
            target="_blank"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Client view ↗
          </Link>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-12">
          {/* ── Left: read-only details ── */}
          <div className="space-y-6 lg:col-span-5">

            {/* Contact */}
            <Section label="Contact">
              <Row label="Name" value={data.owner_name} />
              <Row label="Business" value={data.business_name} />
              <Row label="Email" value={data.email} />
              {data.phone && <Row label="Phone" value={data.phone} />}
              {data.contact_pref && (
                <Row
                  label="Reach by"
                  value={
                    data.contact_pref.charAt(0).toUpperCase() +
                    data.contact_pref.slice(1)
                  }
                  highlight={data.contact_pref !== "email"}
                />
              )}
              {(data.contact_pref === "text" || data.contact_pref === "either") && (
                <Row
                  label="SMS consent"
                  value={data.sms_consent ? "Yes — opted in" : "Not given"}
                  highlight={!data.sms_consent}
                />
              )}
            </Section>

            {/* Project details */}
            {!isAudit && (
              <Section label="Project">
                {data.project_type && (
                  <Row
                    label="Type"
                    value={
                      data.project_type.charAt(0).toUpperCase() +
                      data.project_type.slice(1)
                    }
                  />
                )}
                {data.budget && (
                  <Row label="Budget" value={formatBudget(data.budget) ?? "—"} />
                )}
              </Section>
            )}

            {/* Audit-specific */}
            {isAudit && (
              <Section label="Audit request">
                {data.website_url && (
                  <Row label="Website" value={data.website_url} />
                )}
                {data.concern && (
                  <Row
                    label="Main concern"
                    value={
                      data.concern.charAt(0).toUpperCase() +
                      data.concern.slice(1).replace(/-/g, " ")
                    }
                  />
                )}
              </Section>
            )}

            {/* Estimator output — shown as a structured metrics block */}
            {estimatorMetrics && (
              <div>
                <p className="font-mono text-[11px] uppercase tracking-widest text-accent">
                  Cost estimator output
                </p>
                <div className="mt-3 grid gap-px bg-border/60">
                  {estimatorMetrics.map((m) => (
                    <div key={m.label} className="flex items-baseline justify-between bg-background px-4 py-3">
                      <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                        {m.label}
                      </span>
                      <span className="text-sm text-foreground tabular-nums">
                        {m.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Client's own description */}
            {description && (
              <div>
                <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  {estimatorMetrics ? "Their project description" : "Message"}
                </p>
                <p className="mt-3 whitespace-pre-wrap rounded-lg border border-border bg-card px-5 py-4 text-sm text-foreground/80">
                  {description}
                </p>
              </div>
            )}

            {/* Reference */}
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50">
              {data.id}
            </p>
          </div>

          {/* ── Right: editable form ── */}
          <div className="lg:col-span-7">
            <DetailForm submission={data} />
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <div className="mt-3 grid gap-px bg-border/60">{children}</div>
    </div>
  );
}

function Row({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string | null;
  highlight?: boolean;
}) {
  if (!value) return null;
  return (
    <div className="flex items-baseline justify-between gap-4 bg-background px-4 py-3">
      <span className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <span
        className={`text-right text-sm ${highlight ? "text-accent" : "text-foreground"}`}
      >
        {value}
      </span>
    </div>
  );
}
