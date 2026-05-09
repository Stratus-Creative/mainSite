import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase";
import { AdminBar } from "@/components/admin-bar";
import { DetailForm } from "./detail-form";
import { LeadScorePanel, type LeadScoreValue } from "./lead-score-panel";

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

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffSec = Math.round((now - then) / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? "" : "s"} ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 30) return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;
  const diffMo = Math.round(diffDay / 30);
  if (diffMo < 12) return `${diffMo} month${diffMo === 1 ? "" : "s"} ago`;
  const diffYr = Math.round(diffMo / 12);
  return `${diffYr} year${diffYr === 1 ? "" : "s"} ago`;
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
    .select(
      "id, created_at, status, source, owner_name, business_name, email, phone, website_url, project_type, budget, concern, message, contact_pref, sms_consent, lead_score, tags, internal_notes, next_followup_at, snoozed_until, lost_reason, lost_notes, scoped_hours, actual_hours, quoted_amount, quoted_scope, quoted_at, stripe_payment_link, audit_report, audit_summary, audit_score, audit_sent_at"
    )
    .eq("id", id)
    .single();

  if (error || !data) notFound();

  const { data: notesData } = await supabase
    .from("submission_notes")
    .select("id, body, created_at, admin_users(email)")
    .eq("submission_id", id)
    .order("created_at", { ascending: false });

  const { data: inboundData } = await supabase
    .from("inbound_emails")
    .select("id, from_email, subject, body_text, received_at")
    .eq("submission_id", id)
    .order("received_at", { ascending: false });

  const inboundEmails = (inboundData ?? []) as Array<{
    id: string;
    from_email: string | null;
    subject: string | null;
    body_text: string | null;
    received_at: string;
  }>;

  // Active drip sequence (if any) — passed to DetailForm as a prop.
  const { data: dripData } = await supabase
    .from("drip_sequences")
    .select("id, sequence_type, current_step, next_send_at, completed_at, cancelled_at, created_at")
    .eq("submission_id", id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const initialDrip = dripData
    ? {
        id: dripData.id as string,
        sequence_type: dripData.sequence_type as string,
        current_step: dripData.current_step as number,
        next_send_at: dripData.next_send_at as string | null,
        completed_at: dripData.completed_at as string | null,
        cancelled_at: dripData.cancelled_at as string | null,
      }
    : null;

  const initialNotes = (notesData ?? []).map((n) => {
    const author = Array.isArray(n.admin_users) ? n.admin_users[0] : n.admin_users;
    return {
      id: n.id as string,
      body: n.body as string,
      created_at: n.created_at as string,
      author_email: (author?.email as string | undefined) ?? null,
    };
  });

  // Top-tag suggestions across all submissions for autocomplete chips
  const { data: allTagsRows } = await supabase
    .from("submissions")
    .select("tags")
    .not("tags", "is", null);

  const tagCounts = new Map<string, number>();
  for (const row of allTagsRows ?? []) {
    const tags = (row as { tags: string[] | null }).tags;
    if (!Array.isArray(tags)) continue;
    for (const t of tags) {
      if (typeof t !== "string" || !t.trim()) continue;
      const key = t.trim().toLowerCase();
      tagCounts.set(key, (tagCounts.get(key) ?? 0) + 1);
    }
  }
  const tagSuggestions = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([t]) => t);

  const isAudit = data.source === "free-website-audit";
  const { estimatorMetrics, description } = parseMessage(data.message);

  // Chat attribution (if a chat session preceded this submission)
  const { data: attribRow } = await supabase
    .from("chat_attribution")
    .select("conversation_id, conversations(id, created_at)")
    .eq("submission_id", id)
    .maybeSingle();

  type AttribRow = {
    conversation_id: string;
    conversations:
      | { id: string; created_at: string }
      | { id: string; created_at: string }[]
      | null;
  };
  const attrib = attribRow as AttribRow | null;
  const attribConvo = attrib
    ? Array.isArray(attrib.conversations)
      ? attrib.conversations[0] ?? null
      : attrib.conversations
    : null;

  let chatMessageCount = 0;
  if (attrib?.conversation_id) {
    const { count } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("conversation_id", attrib.conversation_id);
    chatMessageCount = count ?? 0;
  }

  // Outbound email history for this submission
  const { data: outboundRows } = await supabase
    .from("outbound_emails")
    .select("id, subject, body, sent_at, recipient_email, admin_users(email)")
    .eq("submission_id", id)
    .order("sent_at", { ascending: false });

  type OutboundEmailRow = {
    id: string;
    subject: string;
    body: string;
    sent_at: string;
    recipient_email: string | null;
    admin_users: { email: string } | { email: string }[] | null;
  };
  const outboundEmails = ((outboundRows ?? []) as OutboundEmailRow[]).map(
    (r) => {
      const author = Array.isArray(r.admin_users)
        ? r.admin_users[0]
        : r.admin_users;
      return {
        id: r.id,
        subject: r.subject,
        body: r.body,
        sent_at: r.sent_at,
        recipient_email: r.recipient_email,
        author_email: author?.email ?? null,
      };
    }
  );

  function formatGap(chatStartedIso: string, submissionIso: string): string {
    const diffMs =
      new Date(submissionIso).getTime() - new Date(chatStartedIso).getTime();
    if (!Number.isFinite(diffMs) || diffMs < 0) return "moments";
    const minutes = Math.round(diffMs / 60000);
    if (minutes < 1) return "moments";
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"}`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"}`;
    const days = Math.round(hours / 24);
    return `${days} day${days === 1 ? "" : "s"}`;
  }

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

            {/* AI lead score */}
            <LeadScorePanel
              submissionId={data.id}
              initialScore={(data.lead_score ?? null) as LeadScoreValue}
            />

            {/* Chat attribution */}
            {attrib && attribConvo && (
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  From chat
                </p>
                <p className="mt-2 text-sm text-foreground">
                  Started chat {formatGap(attribConvo.created_at, data.created_at)} before submission
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {chatMessageCount} message{chatMessageCount === 1 ? "" : "s"} exchanged
                </p>
                <Link
                  href={`/admin/chats/${attrib.conversation_id}`}
                  className="mt-3 inline-flex items-center gap-1 text-xs text-accent transition-colors hover:underline"
                >
                  View transcript →
                </Link>
              </div>
            )}

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

            {/* Inbound emails (replies from the client) */}
            {inboundEmails.length > 0 && (
              <div>
                <p className="font-mono text-[11px] uppercase tracking-widest text-accent">
                  Replies from client
                </p>
                <ul className="mt-3 space-y-3">
                  {inboundEmails.map((m) => (
                    <li
                      key={m.id}
                      className="rounded-xl border border-border bg-card p-4"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground">
                          {m.subject || "(no subject)"}
                        </p>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                          {formatDate(m.received_at)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        from {m.from_email ?? "(unknown sender)"}
                      </p>
                      {m.body_text && (
                        <details className="mt-3">
                          <summary className="cursor-pointer text-xs text-muted-foreground transition-colors hover:text-foreground">
                            View body
                          </summary>
                          <pre className="mt-3 whitespace-pre-wrap rounded-lg border border-border/60 bg-background px-4 py-3 text-xs text-foreground/80">
                            {m.body_text}
                          </pre>
                        </details>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Reference */}
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50">
              {data.id}
            </p>
          </div>

          {/* ── Right: editable form ── */}
          <div className="space-y-8 lg:col-span-7">
            <DetailForm
              submission={data}
              initialNotes={initialNotes}
              initialFollowupAt={data.next_followup_at ?? null}
              initialTags={Array.isArray(data.tags) ? (data.tags as string[]) : []}
              initialSnoozedUntil={data.snoozed_until ?? null}
              initialLostReason={data.lost_reason ?? null}
              initialLostNotes={data.lost_notes ?? null}
              initialScopedHours={
                data.scoped_hours !== null && data.scoped_hours !== undefined
                  ? Number(data.scoped_hours)
                  : null
              }
              initialActualHours={
                data.actual_hours !== null && data.actual_hours !== undefined
                  ? Number(data.actual_hours)
                  : null
              }
              tagSuggestions={tagSuggestions}
              initialDrip={initialDrip}
            />

            {outboundEmails.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-6 space-y-5">
                <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  Outbound emails
                </p>
                <ul className="space-y-3">
                  {outboundEmails.map((m) => (
                    <li
                      key={m.id}
                      className="rounded-lg border border-border/60 bg-background px-4 py-3"
                    >
                      <p className="text-sm font-semibold text-foreground">
                        {m.subject}
                      </p>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        {(m.author_email ?? "unknown")} ·{" "}
                        {relativeTime(m.sent_at)}
                      </p>
                      <details className="mt-3">
                        <summary className="cursor-pointer text-xs text-muted-foreground transition-colors hover:text-foreground">
                          View
                        </summary>
                        <pre className="mt-3 whitespace-pre-wrap rounded-lg border border-border/60 bg-card px-4 py-3 text-xs text-foreground/80">
                          {m.body}
                        </pre>
                      </details>
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
