"use client";

import { useState } from "react";

const STATUSES = [
  { value: "received", label: "Received" },
  { value: "reviewing", label: "Reviewing" },
  { value: "quoted", label: "Quoted" },
  { value: "accepted", label: "Accepted" },
  { value: "closed", label: "Closed" },
];

interface Submission {
  id: string;
  status: string;
  internal_notes: string | null;
  quoted_amount: number | null;
  quoted_scope: string | null;
  stripe_payment_link: string | null;
  quoted_at: string | null;
  email: string | null;
  business_name: string | null;
  owner_name: string | null;
}

export function DetailForm({ submission }: { submission: Submission }) {
  const [status, setStatus] = useState(submission.status);
  const [notes, setNotes] = useState(submission.internal_notes ?? "");
  const [amount, setAmount] = useState(
    submission.quoted_amount?.toString() ?? ""
  );
  const [scope, setScope] = useState(submission.quoted_scope ?? "");
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [sendMsg, setSendMsg] = useState<string | null>(null);
  const [paymentLink, setPaymentLink] = useState(
    submission.stripe_payment_link
  );

  async function saveChanges() {
    setSaving(true);
    setSaveMsg(null);
    const res = await fetch("/api/admin/update-submission", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: submission.id,
        status,
        internal_notes: notes,
      }),
    });
    setSaving(false);
    setSaveMsg(res.ok ? "Saved." : "Save failed — try again.");
    setTimeout(() => setSaveMsg(null), 3000);
  }

  async function sendQuote() {
    if (!amount || !scope) {
      setSendMsg("Enter an amount and scope before sending.");
      return;
    }
    setSending(true);
    setSendMsg(null);
    const res = await fetch("/api/admin/send-quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: submission.id,
        amount: parseFloat(amount),
        scope,
      }),
    });
    const json = await res.json().catch(() => ({}));
    setSending(false);
    if (res.ok) {
      setStatus("quoted");
      setPaymentLink(json.paymentLink ?? null);
      setSendMsg("Quote sent — client email delivered.");
    } else {
      setSendMsg(json.error ?? "Send failed — try again.");
    }
    setTimeout(() => setSendMsg(null), 5000);
  }

  return (
    <div className="space-y-8">
      {/* Status + notes */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-6">
        <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          Status &amp; notes
        </p>

        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-foreground focus:outline-none"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Internal notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
            placeholder="Discovery call notes, next steps, anything you want to remember…"
            className="mt-2 w-full resize-y rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={saveChanges}
            disabled={saving}
            className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
          {saveMsg && (
            <span className="text-xs text-muted-foreground">{saveMsg}</span>
          )}
        </div>
      </div>

      {/* Quote + payment link */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Send a quote
          </p>
          {submission.quoted_at && (
            <span className="font-mono text-[10px] uppercase tracking-widest text-amber-400">
              Sent{" "}
              {new Date(submission.quoted_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </div>

        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Amount (USD)
          </label>
          <div className="relative mt-2">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              $
            </span>
            <input
              type="number"
              min="0"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1495"
              className="w-full rounded-lg border border-border bg-background py-2.5 pl-8 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Scope summary
          </label>
          <textarea
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            rows={4}
            placeholder="Single-page Starter site with Google reviews integration and click-to-call hero. Delivered in 5–7 business days."
            className="mt-2 w-full resize-y rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
          />
        </div>

        {paymentLink && (
          <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
              Payment link
            </p>
            <a
              href={paymentLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block break-all text-xs text-foreground/80 underline"
            >
              {paymentLink}
            </a>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border/60 pt-4">
          <button
            onClick={sendQuote}
            disabled={sending}
            className="rounded-full border border-accent bg-accent/10 px-5 py-2.5 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
          >
            {sending ? "Sending…" : submission.quoted_at ? "Resend quote" : "Send quote"}
          </button>
          {sendMsg && (
            <span className="text-xs text-muted-foreground">{sendMsg}</span>
          )}
        </div>
      </div>
    </div>
  );
}
