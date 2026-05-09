"use client";

import { useEffect, useRef, useState } from "react";

const DRIP_OPTIONS: { value: string; label: string }[] = [
  { value: "no-reply-followup", label: "No-reply follow-up (3 emails / 14 days)" },
  { value: "post-quote-followup", label: "Post-quote follow-up (2 emails / 14 days)" },
];

export type DripState = {
  id: string;
  sequence_type: string;
  current_step: number;
  next_send_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
};

const STATUSES = [
  { value: "received", label: "Received" },
  { value: "reviewing", label: "Reviewing" },
  { value: "quoted", label: "Quoted" },
  { value: "accepted", label: "Accepted" },
  { value: "closed", label: "Closed" },
];

const LOST_REASONS = [
  "Too expensive",
  "Wrong fit",
  "Went silent",
  "Went with competitor",
  "Scope creep",
  "Bad timing",
  "Other",
];

const CONFETTI_COLORS = [
  "var(--accent, #f97316)",
  "#34d399", // emerald-400
  "#fbbf24", // amber-400
  "var(--foreground, #fafafa)",
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
  source?: string | null;
  audit_report?: string | null;
  audit_summary?: string | null;
  audit_score?: number | null;
  audit_sent_at?: string | null;
}

export type Note = {
  id: string;
  body: string;
  created_at: string;
  author_email: string | null;
};

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffSec = Math.round((now - then) / 1000);

  if (diffSec < 5) return "just now";
  if (diffSec < 60) return `${diffSec} seconds ago`;
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

function toLocalInputValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatFollowup(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatCurrency(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function DetailForm({
  submission,
  initialNotes,
  initialFollowupAt,
  initialTags,
  initialSnoozedUntil,
  initialLostReason,
  initialLostNotes,
  initialScopedHours,
  initialActualHours,
  tagSuggestions,
  initialDrip = null,
}: {
  submission: Submission;
  initialNotes: Note[];
  initialFollowupAt: string | null;
  initialTags: string[];
  initialSnoozedUntil: string | null;
  initialLostReason: string | null;
  initialLostNotes: string | null;
  initialScopedHours: number | null;
  initialActualHours: number | null;
  tagSuggestions: string[];
  initialDrip?: DripState | null;
}) {
  // Status is committed only after passing through any required modals.
  const [status, setStatus] = useState(submission.status);
  // Track previous committed status separately, so the lost-deal modal can revert.
  const previousStatusRef = useRef<string>(submission.status);

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

  // Activity timeline state
  const [timeline, setTimeline] = useState<Note[]>(initialNotes);
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [noteMsg, setNoteMsg] = useState<string | null>(null);

  // Follow-up reminder state
  const [followupAt, setFollowupAt] = useState<string | null>(initialFollowupAt);
  const [followupInput, setFollowupInput] = useState<string>(
    toLocalInputValue(initialFollowupAt)
  );
  const [savingFollowup, setSavingFollowup] = useState(false);
  const [followupMsg, setFollowupMsg] = useState<string | null>(null);

  // Tags
  const [tags, setTags] = useState<string[]>(initialTags);
  const [tagInput, setTagInput] = useState("");
  const [tagMsg, setTagMsg] = useState<string | null>(null);

  // Snooze
  const [snoozedUntil, setSnoozedUntil] = useState<string | null>(initialSnoozedUntil);
  const [snoozeInput, setSnoozeInput] = useState<string>(
    toLocalInputValue(initialSnoozedUntil)
  );
  const [savingSnooze, setSavingSnooze] = useState(false);
  const [snoozeMsg, setSnoozeMsg] = useState<string | null>(null);

  // Lost-deal modal
  const [lostModalOpen, setLostModalOpen] = useState(false);
  const [lostReason, setLostReason] = useState<string>(
    initialLostReason ?? LOST_REASONS[0]
  );
  const [lostNotes, setLostNotes] = useState<string>(initialLostNotes ?? "");

  // Project hours
  const [scopedHours, setScopedHours] = useState<string>(
    initialScopedHours !== null ? String(initialScopedHours) : ""
  );
  const [actualHours, setActualHours] = useState<string>(
    initialActualHours !== null ? String(initialActualHours) : ""
  );
  const [savingHours, setSavingHours] = useState(false);
  const [hoursMsg, setHoursMsg] = useState<string | null>(null);

  // Confetti + closed-toast
  const [confetti, setConfetti] = useState(false);
  const [closedToast, setClosedToast] = useState<string | null>(null);

  // Audit composer
  const isAudit = submission.source === "free-website-audit";
  const [auditReport, setAuditReport] = useState<string>(submission.audit_report ?? "");
  const [auditSummary, setAuditSummary] = useState<string>(submission.audit_summary ?? "");
  const [auditScore, setAuditScore] = useState<string>(
    submission.audit_score !== null && submission.audit_score !== undefined
      ? String(submission.audit_score)
      : ""
  );
  const [auditSentAt, setAuditSentAt] = useState<string | null>(submission.audit_sent_at ?? null);
  const [savingAudit, setSavingAudit] = useState(false);
  const [sendingAudit, setSendingAudit] = useState(false);
  const [auditMsg, setAuditMsg] = useState<string | null>(null);
  const [auditUrl, setAuditUrl] = useState<string | null>(null);

  async function saveAuditDraft() {
    setSavingAudit(true);
    setAuditMsg(null);
    const res = await fetch("/api/admin/update-submission", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: submission.id,
        audit_report: auditReport,
        audit_summary: auditSummary || null,
        audit_score: auditScore ? Number(auditScore) : null,
      }),
    });
    setSavingAudit(false);
    setAuditMsg(res.ok ? "Draft saved." : "Save failed — try again.");
    setTimeout(() => setAuditMsg(null), 3000);
  }

  async function sendAuditToClient() {
    if (!auditReport.trim() || auditReport.trim().length < 20) {
      setAuditMsg("Write at least one section before sending.");
      return;
    }
    if (!confirm("Send this audit to the client now?")) return;

    setSendingAudit(true);
    setAuditMsg(null);
    // Save the latest draft first
    await fetch("/api/admin/update-submission", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: submission.id,
        audit_report: auditReport,
        audit_summary: auditSummary || null,
        audit_score: auditScore ? Number(auditScore) : null,
      }),
    });
    const res = await fetch("/api/admin/send-audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: submission.id }),
    });
    const json = await res.json().catch(() => ({}));
    setSendingAudit(false);
    if (res.ok) {
      setAuditSentAt(new Date().toISOString());
      setAuditUrl(json.auditUrl ?? null);
      setAuditMsg("Audit sent — client email delivered.");
    } else {
      setAuditMsg(json.error ?? "Send failed — try again.");
    }
    setTimeout(() => setAuditMsg(null), 6000);
  }

  // Drip sequence
  const [drip, setDrip] = useState<DripState | null>(initialDrip);
  const [dripChoice, setDripChoice] = useState<string>(DRIP_OPTIONS[0].value);
  const [dripBusy, setDripBusy] = useState(false);
  const [dripMsg, setDripMsg] = useState<string | null>(null);

  const dripActive =
    drip !== null && !drip.cancelled_at && !drip.completed_at;

  async function startDrip() {
    setDripBusy(true);
    setDripMsg(null);
    try {
      const res = await fetch("/api/admin/drip-start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: submission.id,
          sequenceType: dripChoice,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok && json.sequence) {
        setDrip({
          id: json.sequence.id,
          sequence_type: json.sequence.sequence_type,
          current_step: json.sequence.current_step,
          next_send_at: json.sequence.next_send_at,
          completed_at: null,
          cancelled_at: null,
        });
        setDripMsg("Sequence started.");
      } else {
        setDripMsg(json.error ?? "Start failed.");
      }
    } catch {
      setDripMsg("Network error.");
    } finally {
      setDripBusy(false);
      window.setTimeout(() => setDripMsg(null), 3000);
    }
  }

  async function cancelDrip() {
    if (!drip) return;
    setDripBusy(true);
    setDripMsg(null);
    try {
      const res = await fetch("/api/admin/drip-cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: drip.id }),
      });
      if (res.ok) {
        setDrip({ ...drip, cancelled_at: new Date().toISOString() });
        setDripMsg("Cancelled.");
      } else {
        setDripMsg("Cancel failed.");
      }
    } catch {
      setDripMsg("Network error.");
    } finally {
      setDripBusy(false);
      window.setTimeout(() => setDripMsg(null), 3000);
    }
  }

  // AI draft reply
  const [drafting, setDrafting] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);
  const [draftBody, setDraftBody] = useState<string | null>(null);
  const [copyMsg, setCopyMsg] = useState<string | null>(null);

  // Compose & send email
  type ComposeTemplate = {
    id: string;
    name: string;
    category: string;
    subject: string;
    body: string;
  };
  const [emailTemplates, setEmailTemplates] = useState<ComposeTemplate[]>([]);
  const [emailTemplatesLoaded, setEmailTemplatesLoaded] = useState(false);
  const [emailTemplateId, setEmailTemplateId] = useState<string>("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailCategory, setEmailCategory] = useState<string>("manual");
  const [emailSending, setEmailSending] = useState(false);
  const [emailMsg, setEmailMsg] = useState<string | null>(null);

  // Voice check on outbound email body
  type VoiceIssue = {
    rule: string;
    severity: "warn" | "block";
    excerpt: string;
    message: string;
  };
  const [voiceChecking, setVoiceChecking] = useState(false);
  const [voiceResult, setVoiceResult] = useState<{
    issues: VoiceIssue[];
    score: number;
  } | null>(null);
  const [voiceMsg, setVoiceMsg] = useState<string | null>(null);

  async function runVoiceCheck() {
    if (!emailBody.trim()) {
      setVoiceMsg("Write a body first.");
      window.setTimeout(() => setVoiceMsg(null), 2500);
      return;
    }
    setVoiceChecking(true);
    setVoiceResult(null);
    try {
      const res = await fetch("/api/admin/voice-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: emailBody }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && Array.isArray(json.issues)) {
        setVoiceResult({ issues: json.issues, score: json.score ?? 0 });
      } else {
        setVoiceMsg(json.error ?? "Check failed.");
      }
    } catch {
      setVoiceMsg("Network error.");
    } finally {
      setVoiceChecking(false);
      window.setTimeout(() => setVoiceMsg(null), 2500);
    }
  }

  function voiceScoreColor(score: number): string {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    return "text-red-400";
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/email-templates");
        const json = await res.json().catch(() => ({}));
        if (!cancelled && res.ok && Array.isArray(json.templates)) {
          setEmailTemplates(json.templates as ComposeTemplate[]);
        }
      } catch (err) {
        console.error("Failed to load email templates:", err);
      } finally {
        if (!cancelled) setEmailTemplatesLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function applyTokens(s: string): string {
    const ownerName =
      submission.owner_name ?? submission.business_name ?? "there";
    const businessName = submission.business_name ?? "";
    const quoteAmount =
      submission.quoted_amount !== null && submission.quoted_amount !== undefined
        ? formatCurrency(submission.quoted_amount)
        : "";
    const trackingLink =
      typeof window !== "undefined"
        ? `${window.location.origin}/quote/${submission.id}`
        : `/quote/${submission.id}`;
    return s
      .replace(/\{\{\s*ownerName\s*\}\}/g, ownerName)
      .replace(/\{\{\s*businessName\s*\}\}/g, businessName)
      .replace(/\{\{\s*quoteAmount\s*\}\}/g, quoteAmount)
      .replace(/\{\{\s*trackingLink\s*\}\}/g, trackingLink);
  }

  function applyTemplate(id: string) {
    setEmailTemplateId(id);
    if (!id) return;
    const tpl = emailTemplates.find((t) => t.id === id);
    if (!tpl) return;
    setEmailSubject(applyTokens(tpl.subject));
    setEmailBody(applyTokens(tpl.body));
    setEmailCategory(tpl.category || "manual");
  }

  async function sendEmail() {
    if (!submission.email || !emailSubject.trim() || !emailBody.trim()) return;
    setEmailSending(true);
    setEmailMsg(null);
    try {
      const res = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: submission.id,
          subject: emailSubject,
          body: emailBody,
          category: emailCategory,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        setEmailMsg(json.error ?? "Send failed.");
      } else {
        setEmailSubject("");
        setEmailBody("");
        setEmailTemplateId("");
        setEmailCategory("manual");
        setEmailMsg("Email sent · saved to timeline.");
      }
    } catch (err) {
      console.error(err);
      setEmailMsg("Network error.");
    } finally {
      setEmailSending(false);
      window.setTimeout(() => setEmailMsg(null), 4000);
    }
  }

  async function generateDraft() {
    setDrafting(true);
    setDraftError(null);
    try {
      const res = await fetch("/api/admin/draft-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: submission.id }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok || typeof json.draft !== "string") {
        setDraftError(json.error ?? "Draft failed.");
      } else {
        setDraftBody(json.draft);
      }
    } catch (err) {
      console.error(err);
      setDraftError("Network error.");
    } finally {
      setDrafting(false);
    }
  }

  async function copyDraft() {
    if (!draftBody) return;
    try {
      await navigator.clipboard.writeText(draftBody);
      setCopyMsg("Copied.");
    } catch {
      setCopyMsg("Copy failed.");
    }
    window.setTimeout(() => setCopyMsg(null), 2000);
  }

  function openMailto() {
    if (!draftBody) return;
    const to = submission.email ?? "";
    const subject = `Re: your inquiry${submission.business_name ? ` — ${submission.business_name}` : ""}`;
    const url = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(draftBody)}`;
    window.location.href = url;
  }

  function discardDraft() {
    setDraftBody(null);
    setDraftError(null);
    setCopyMsg(null);
  }

  function fireConfetti() {
    setConfetti(true);
    window.setTimeout(() => setConfetti(false), 2500);
  }

  // ── Tags helpers ──────────────────────────────────────────────────
  async function persistTags(next: string[]) {
    setTagMsg(null);
    const res = await fetch("/api/admin/update-submission", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: submission.id, tags: next }),
    });
    if (!res.ok) {
      setTagMsg("Save failed.");
    } else {
      setTagMsg("Saved.");
    }
    window.setTimeout(() => setTagMsg(null), 2500);
  }

  function addTag(raw: string) {
    const cleaned = raw.trim().toLowerCase();
    if (!cleaned) return;
    if (tags.includes(cleaned)) {
      setTagInput("");
      return;
    }
    const next = [...tags, cleaned];
    setTags(next);
    setTagInput("");
    void persistTags(next);
  }

  function removeTag(t: string) {
    const next = tags.filter((x) => x !== t);
    setTags(next);
    void persistTags(next);
  }

  function onTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  }

  // ── Snooze helpers ────────────────────────────────────────────────
  async function persistSnooze(iso: string | null) {
    setSavingSnooze(true);
    setSnoozeMsg(null);
    const res = await fetch("/api/admin/update-submission", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: submission.id, snoozed_until: iso }),
    });
    setSavingSnooze(false);
    if (res.ok) {
      setSnoozedUntil(iso);
      setSnoozeMsg(iso ? "Snoozed." : "Cleared.");
    } else {
      setSnoozeMsg("Save failed.");
    }
    window.setTimeout(() => setSnoozeMsg(null), 2500);
  }

  function saveSnooze() {
    const iso = snoozeInput ? new Date(snoozeInput).toISOString() : null;
    void persistSnooze(iso);
  }

  function snoozePreset(days: number) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const iso = d.toISOString();
    setSnoozeInput(toLocalInputValue(iso));
    void persistSnooze(iso);
  }

  function clearSnooze() {
    setSnoozeInput("");
    void persistSnooze(null);
  }

  // ── Status-change orchestration (with lost-deal modal) ────────────
  function onStatusSelectChange(next: string) {
    if (
      next === "closed" &&
      previousStatusRef.current !== "closed" &&
      status !== "closed"
    ) {
      // Defer status change until modal is confirmed
      setLostModalOpen(true);
      // Don't set status yet — the select's value is bound to state, and we
      // intentionally keep state showing the prior status until confirm.
      return;
    }
    setStatus(next);
  }

  async function confirmCloseFromModal() {
    setLostModalOpen(false);
    setSaving(true);
    setSaveMsg(null);
    const res = await fetch("/api/admin/update-submission", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: submission.id,
        status: "closed",
        internal_notes: notes,
        lost_reason: lostReason,
        lost_notes: lostNotes,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setStatus("closed");
      previousStatusRef.current = "closed";
      setSaveMsg("Saved.");
    } else {
      setSaveMsg("Save failed — try again.");
    }
    window.setTimeout(() => setSaveMsg(null), 3000);
  }

  function cancelLostModal() {
    setLostModalOpen(false);
    // No state change needed — status was never advanced.
  }

  async function saveChanges() {
    const prev = previousStatusRef.current;
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
    if (res.ok) {
      previousStatusRef.current = status;
      setSaveMsg("Saved.");
      // Confetti + toast on transition into accepted
      if (status === "accepted" && prev !== "accepted") {
        fireConfetti();
        const amt = submission.quoted_amount;
        if (amt) {
          setClosedToast(`${formatCurrency(amt)} closed!`);
          window.setTimeout(() => setClosedToast(null), 4000);
        } else {
          setClosedToast("Project accepted!");
          window.setTimeout(() => setClosedToast(null), 4000);
        }
      }
    } else {
      setSaveMsg("Save failed — try again.");
    }
    window.setTimeout(() => setSaveMsg(null), 3000);
  }

  // ── Notes ─────────────────────────────────────────────────────────
  async function addNote() {
    const trimmed = newNote.trim();
    if (!trimmed) return;
    setAddingNote(true);
    setNoteMsg(null);
    const res = await fetch("/api/admin/add-note", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submissionId: submission.id, body: trimmed }),
    });
    setAddingNote(false);
    if (res.ok) {
      const note: Note = await res.json();
      setTimeline((prev) => [note, ...prev]);
      setNewNote("");
    } else {
      setNoteMsg("Couldn't add note — try again.");
      window.setTimeout(() => setNoteMsg(null), 3000);
    }
  }

  async function deleteNote(id: string) {
    const prev = timeline;
    setTimeline((t) => t.filter((n) => n.id !== id));
    const res = await fetch("/api/admin/delete-note", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      setTimeline(prev);
      setNoteMsg("Couldn't delete note — try again.");
      window.setTimeout(() => setNoteMsg(null), 3000);
    }
  }

  // ── Follow-up ─────────────────────────────────────────────────────
  async function saveFollowup() {
    setSavingFollowup(true);
    setFollowupMsg(null);
    const iso = followupInput ? new Date(followupInput).toISOString() : null;
    const res = await fetch("/api/admin/update-submission", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: submission.id, next_followup_at: iso }),
    });
    setSavingFollowup(false);
    if (res.ok) {
      setFollowupAt(iso);
      setFollowupMsg(iso ? "Reminder saved." : "Reminder cleared.");
    } else {
      setFollowupMsg("Save failed — try again.");
    }
    window.setTimeout(() => setFollowupMsg(null), 3000);
  }

  async function clearFollowup() {
    setFollowupInput("");
    setSavingFollowup(true);
    setFollowupMsg(null);
    const res = await fetch("/api/admin/update-submission", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: submission.id, next_followup_at: null }),
    });
    setSavingFollowup(false);
    if (res.ok) {
      setFollowupAt(null);
      setFollowupMsg("Reminder cleared.");
    } else {
      setFollowupMsg("Clear failed — try again.");
    }
    window.setTimeout(() => setFollowupMsg(null), 3000);
  }

  // ── Quote ─────────────────────────────────────────────────────────
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
      previousStatusRef.current = "quoted";
      setPaymentLink(json.paymentLink ?? null);
      setSendMsg("Quote sent — client email delivered.");
    } else {
      setSendMsg(json.error ?? "Send failed — try again.");
    }
    window.setTimeout(() => setSendMsg(null), 5000);
  }

  // ── Hours tracker ─────────────────────────────────────────────────
  async function saveHours() {
    setSavingHours(true);
    setHoursMsg(null);
    const scopedNum = scopedHours === "" ? null : parseFloat(scopedHours);
    const actualNum = actualHours === "" ? null : parseFloat(actualHours);
    const res = await fetch("/api/admin/update-submission", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: submission.id,
        scoped_hours: scopedNum,
        actual_hours: actualNum,
      }),
    });
    setSavingHours(false);
    setHoursMsg(res.ok ? "Saved." : "Save failed.");
    window.setTimeout(() => setHoursMsg(null), 2500);
  }

  // Variance calc
  const scopedNum = parseFloat(scopedHours);
  const actualNum = parseFloat(actualHours);
  const showVariance =
    !isNaN(scopedNum) && !isNaN(actualNum) && scopedNum > 0;
  const variancePct = showVariance
    ? Math.round(((actualNum - scopedNum) / scopedNum) * 100)
    : 0;

  const showHoursCard = status === "accepted" || status === "closed";

  const tagSuggestionsFiltered = tagSuggestions.filter(
    (s) => !tags.includes(s)
  );

  return (
    <div className="space-y-8">
      {/* Confetti overlay */}
      {confetti && <ConfettiBurst />}

      {/* Closed toast */}
      {closedToast && (
        <div
          className="fixed left-1/2 top-6 z-[100] -translate-x-1/2 rounded-full border border-accent/40 bg-card px-5 py-3 text-sm font-medium text-accent shadow-lg"
          role="status"
        >
          {closedToast}
        </div>
      )}

      {/* Lost-deal modal */}
      {lostModalOpen && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-background/80 px-6 backdrop-blur"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 space-y-5 shadow-xl">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                Closing this deal
              </p>
              <h2 className="mt-2 text-lg font-semibold tracking-tight">
                Why is this closing?
              </h2>
            </div>

            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Reason
              </label>
              <select
                value={lostReason}
                onChange={(e) => setLostReason(e.target.value)}
                className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-foreground focus:outline-none"
              >
                {LOST_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Notes (optional)
              </label>
              <textarea
                value={lostNotes}
                onChange={(e) => setLostNotes(e.target.value)}
                rows={4}
                placeholder="Anything worth remembering for next time…"
                className="mt-2 w-full resize-y rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border/60 pt-4">
              <button
                onClick={cancelLostModal}
                className="rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-foreground"
              >
                Cancel
              </button>
              <button
                onClick={confirmCloseFromModal}
                disabled={saving}
                className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
              >
                {saving ? "Saving…" : "Confirm close"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tags */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Tags
          </p>
          {tagMsg && (
            <span className="text-xs text-muted-foreground">{tagMsg}</span>
          )}
        </div>

        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground"
              >
                {t}
                <button
                  onClick={() => removeTag(t)}
                  aria-label={`Remove ${t}`}
                  className="text-muted-foreground transition-colors hover:text-accent"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No tags yet.</p>
        )}

        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Add a tag
          </label>
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={onTagKeyDown}
            onBlur={() => tagInput.trim() && addTag(tagInput)}
            placeholder="press Enter or comma to add…"
            className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
          />
        </div>

        {tagSuggestionsFiltered.length > 0 && (
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Suggestions
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {tagSuggestionsFiltered.map((s) => (
                <button
                  key={s}
                  onClick={() => addTag(s)}
                  className="inline-flex items-center rounded-full border border-border/60 bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

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
            onChange={(e) => onStatusSelectChange(e.target.value)}
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

      {/* Snooze */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-6">
        <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          Snooze
        </p>

        {snoozedUntil && (
          <p className="text-sm text-foreground">
            Snoozed until{" "}
            <span className="text-accent">{formatFollowup(snoozedUntil)}</span>
          </p>
        )}

        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Wake up on
          </label>
          <input
            type="datetime-local"
            value={snoozeInput}
            onChange={(e) => setSnoozeInput(e.target.value)}
            className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-foreground focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => snoozePreset(1)}
            disabled={savingSnooze}
            className="rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-foreground hover:text-foreground disabled:opacity-60"
          >
            1 day
          </button>
          <button
            onClick={() => snoozePreset(3)}
            disabled={savingSnooze}
            className="rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-foreground hover:text-foreground disabled:opacity-60"
          >
            3 days
          </button>
          <button
            onClick={() => snoozePreset(7)}
            disabled={savingSnooze}
            className="rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-foreground hover:text-foreground disabled:opacity-60"
          >
            1 week
          </button>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-3">
            <button
              onClick={saveSnooze}
              disabled={savingSnooze}
              className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
            >
              {savingSnooze ? "Saving…" : "Save snooze"}
            </button>
            {snoozedUntil && (
              <button
                onClick={clearSnooze}
                disabled={savingSnooze}
                className="rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-foreground disabled:opacity-60"
              >
                Clear
              </button>
            )}
          </div>
          {snoozeMsg && (
            <span className="text-xs text-muted-foreground">{snoozeMsg}</span>
          )}
        </div>
      </div>

      {/* Activity timeline */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-6">
        <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          Activity timeline
        </p>

        <div>
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows={3}
            placeholder="Log a call, decision, or follow-up note…"
            className="w-full resize-y rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
          />
          <div className="mt-3 flex items-center justify-between">
            <button
              onClick={addNote}
              disabled={addingNote || !newNote.trim()}
              className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
            >
              {addingNote ? "Adding…" : "Add note"}
            </button>
            {noteMsg && (
              <span className="text-xs text-muted-foreground">{noteMsg}</span>
            )}
          </div>
        </div>

        {timeline.length > 0 ? (
          <ul className="space-y-3 border-t border-border/60 pt-5">
            {timeline.map((n) => (
              <li
                key={n.id}
                className="rounded-lg border border-border/60 bg-background px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="whitespace-pre-wrap text-sm text-foreground">
                    {n.body}
                  </p>
                  <button
                    onClick={() => deleteNote(n.id)}
                    aria-label="Delete note"
                    className="shrink-0 text-muted-foreground transition-colors hover:text-accent"
                  >
                    ×
                  </button>
                </div>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {(n.author_email ?? "unknown")} · {relativeTime(n.created_at)}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="border-t border-border/60 pt-5 text-xs text-muted-foreground">
            No activity yet — add the first entry above.
          </p>
        )}
      </div>

      {/* Follow-up reminder */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-6">
        <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          Follow-up reminder
        </p>

        {followupAt && (
          <p className="text-sm text-foreground">
            Reminder set for{" "}
            <span className="text-accent">{formatFollowup(followupAt)}</span>
          </p>
        )}

        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Date &amp; time
          </label>
          <input
            type="datetime-local"
            value={followupInput}
            onChange={(e) => setFollowupInput(e.target.value)}
            className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-foreground focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-3">
            <button
              onClick={saveFollowup}
              disabled={savingFollowup}
              className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
            >
              {savingFollowup ? "Saving…" : "Save reminder"}
            </button>
            {followupAt && (
              <button
                onClick={clearFollowup}
                disabled={savingFollowup}
                className="rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-foreground disabled:opacity-60"
              >
                Clear
              </button>
            )}
          </div>
          {followupMsg && (
            <span className="text-xs text-muted-foreground">{followupMsg}</span>
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

        {paymentLink && paymentLink.startsWith("https://") && (
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

      {/* Send email */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Send email
          </p>
          {emailMsg && (
            <span className="text-xs text-muted-foreground">{emailMsg}</span>
          )}
        </div>

        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Use template
          </label>
          <select
            value={emailTemplateId}
            onChange={(e) => applyTemplate(e.target.value)}
            disabled={!emailTemplatesLoaded}
            className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-foreground focus:outline-none disabled:opacity-60"
          >
            <option value="">
              {emailTemplatesLoaded
                ? emailTemplates.length === 0
                  ? "No templates yet — write from scratch"
                  : "Select a template…"
                : "Loading templates…"}
            </option>
            {emailTemplates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.category} · {t.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            To
          </label>
          <input
            value={submission.email ?? ""}
            readOnly
            className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-muted-foreground focus:border-foreground focus:outline-none"
          />
          {!submission.email && (
            <p className="mt-2 text-xs text-amber-400">
              No recipient email on this submission — cannot send.
            </p>
          )}
        </div>

        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Subject
          </label>
          <input
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            placeholder="Following up on your project"
            className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
          />
        </div>

        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Body
          </label>
          <textarea
            value={emailBody}
            onChange={(e) => setEmailBody(e.target.value)}
            rows={10}
            placeholder="Hi there, just wanted to check in…"
            className="mt-2 w-full resize-y rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
          />
        </div>

        {voiceResult && (
          <div className="rounded-lg border border-border/60 bg-background p-4">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Voice score
              </p>
              <span
                className={`font-mono text-sm font-semibold ${voiceScoreColor(voiceResult.score)}`}
              >
                {voiceResult.score}
              </span>
            </div>
            {voiceResult.issues.length === 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">
                No issues found. Voice looks clean.
              </p>
            ) : (
              <ul className="mt-3 space-y-1.5">
                {voiceResult.issues.map((iss, i) => (
                  <li key={i} className="text-xs">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {iss.rule}
                    </span>
                    <span className="ml-2 text-foreground/80">
                      {iss.message}
                    </span>
                    {iss.excerpt && (
                      <span className="ml-2 italic text-muted-foreground">
                        &ldquo;{iss.excerpt}&rdquo;
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border/60 pt-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={sendEmail}
              disabled={
                emailSending ||
                !emailSubject.trim() ||
                !emailBody.trim() ||
                !submission.email
              }
              className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
            >
              {emailSending ? "Sending…" : "Send email"}
            </button>
            <button
              onClick={runVoiceCheck}
              disabled={voiceChecking || !emailBody.trim()}
              className="rounded-full border border-border px-4 py-2 text-xs font-medium text-foreground transition-colors hover:border-foreground disabled:opacity-60"
            >
              {voiceChecking ? "Checking…" : "Check voice"}
            </button>
          </div>
          {voiceMsg && (
            <span className="text-xs text-muted-foreground">{voiceMsg}</span>
          )}
        </div>
      </div>

      {/* Drip sequence */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Drip sequence
          </p>
          {dripMsg && (
            <span className="text-xs text-muted-foreground">{dripMsg}</span>
          )}
        </div>

        {dripActive && drip ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
                {drip.sequence_type}
              </p>
              <p className="mt-2 text-sm text-foreground">
                Step {drip.current_step + 1} queued
                {drip.next_send_at && (
                  <>
                    {" "}— next send{" "}
                    <span className="text-accent">
                      {formatFollowup(drip.next_send_at)}
                    </span>
                  </>
                )}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Will auto-cancel if the lead replies or moves to accepted/closed.
              </p>
            </div>
            <button
              onClick={cancelDrip}
              disabled={dripBusy}
              className="rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-foreground disabled:opacity-60"
            >
              {dripBusy ? "Working…" : "Cancel sequence"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {drip && (drip.cancelled_at || drip.completed_at) && (
              <p className="text-xs text-muted-foreground">
                Last sequence ({drip.sequence_type}) {drip.cancelled_at ? "was cancelled" : "completed"}.
              </p>
            )}
            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Sequence
              </label>
              <select
                value={dripChoice}
                onChange={(e) => setDripChoice(e.target.value)}
                className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-foreground focus:outline-none"
              >
                {DRIP_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={startDrip}
              disabled={dripBusy}
              className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
            >
              {dripBusy ? "Starting…" : "Start sequence"}
            </button>
          </div>
        )}
      </div>

      {/* Project hours */}
      {showHoursCard && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Project hours
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Scoped hours
              </label>
              <input
                type="number"
                min="0"
                step="0.25"
                value={scopedHours}
                onChange={(e) => setScopedHours(e.target.value)}
                placeholder="20"
                className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
              />
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Actual hours
              </label>
              <input
                type="number"
                min="0"
                step="0.25"
                value={actualHours}
                onChange={(e) => setActualHours(e.target.value)}
                placeholder="22.5"
                className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
              />
            </div>
          </div>

          {showVariance && (
            <p className="text-sm">
              <span
                className={
                  variancePct > 0
                    ? "text-amber-400"
                    : variancePct < 0
                    ? "text-emerald-400"
                    : "text-muted-foreground"
                }
              >
                {variancePct > 0
                  ? `+${variancePct}% over scope`
                  : variancePct < 0
                  ? `${variancePct}% under scope`
                  : "On scope"}
              </span>
            </p>
          )}

          <div className="flex items-center justify-between">
            <button
              onClick={saveHours}
              disabled={savingHours}
              className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
            >
              {savingHours ? "Saving…" : "Save hours"}
            </button>
            {hoursMsg && (
              <span className="text-xs text-muted-foreground">{hoursMsg}</span>
            )}
          </div>
        </div>
      )}

      {/* AI assist */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            AI assist
          </p>
          {draftError && (
            <span className="text-xs text-red-400">{draftError}</span>
          )}
        </div>

        {!draftBody && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Generate a personal-voice email draft using the lead&apos;s message,
              your internal notes, and recent activity. You can edit before sending.
            </p>
            <button
              onClick={generateDraft}
              disabled={drafting}
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
            >
              {drafting && (
                <span
                  className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-background border-t-transparent"
                  aria-hidden
                />
              )}
              {drafting ? "Drafting…" : "Draft AI reply"}
            </button>
          </div>
        )}

        {draftBody !== null && (
          <div className="space-y-4">
            <textarea
              value={draftBody}
              onChange={(e) => setDraftBody(e.target.value)}
              rows={12}
              className="w-full resize-y rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
            />
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={copyDraft}
                  className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  Copy to clipboard
                </button>
                <button
                  onClick={openMailto}
                  disabled={!submission.email}
                  className="rounded-full border border-accent bg-accent/10 px-5 py-2.5 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
                >
                  Send via email
                </button>
                <button
                  onClick={generateDraft}
                  disabled={drafting}
                  className="rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-foreground disabled:opacity-60"
                >
                  {drafting ? "Regenerating…" : "Regenerate"}
                </button>
                <button
                  onClick={discardDraft}
                  className="rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                >
                  Discard
                </button>
              </div>
              {copyMsg && (
                <span className="text-xs text-muted-foreground">{copyMsg}</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Audit composer — only for free-website-audit submissions */}
      {isAudit && (
        <div className="rounded-xl border border-accent/30 bg-card p-6 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-accent">
                Audit report
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Write the findings here. When you click Send, the client gets an
                email with a magic-link to a polished public audit page.
              </p>
            </div>
            {auditSentAt && (
              <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400">
                Sent{" "}
                {new Date(auditSentAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Score (1–10)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                step="1"
                value={auditScore}
                onChange={(e) => setAuditScore(e.target.value)}
                placeholder="7"
                className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                One-line takeaway
              </label>
              <input
                type="text"
                value={auditSummary}
                onChange={(e) => setAuditSummary(e.target.value)}
                placeholder="Solid foundation, but mobile experience and SEO need work."
                className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Findings (Markdown)
            </label>
            <textarea
              value={auditReport}
              onChange={(e) => setAuditReport(e.target.value)}
              rows={20}
              placeholder={`## What's working\n- Fast load times\n- Clean nav\n\n## What needs work\n- Mobile menu collapses past 600px\n- No alt text on hero images\n\n## Quick wins\n1. Add Google Business Profile integration\n2. Compress hero image (currently 4.2 MB)\n3. Fix the broken contact form on /about`}
              className="mt-2 w-full resize-y rounded-lg border border-border bg-background px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Supports headings (##), bold (**text**), lists, links, and code. The public audit page renders this with full Markdown styling.
            </p>
          </div>

          {auditUrl && (
            <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
                Audit link
              </p>
              <a
                href={auditUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block break-all text-xs text-foreground/80 underline"
              >
                {auditUrl}
              </a>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={saveAuditDraft}
                disabled={savingAudit || sendingAudit}
                className="rounded-full border border-border px-4 py-2 text-xs font-medium text-foreground transition-colors hover:border-foreground/40 disabled:opacity-60"
              >
                {savingAudit ? "Saving…" : "Save draft"}
              </button>
              <button
                onClick={sendAuditToClient}
                disabled={savingAudit || sendingAudit || !auditReport.trim()}
                className="rounded-full bg-foreground px-5 py-2 text-xs font-medium text-background transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
              >
                {sendingAudit
                  ? "Sending…"
                  : auditSentAt
                    ? "Resend audit"
                    : "Send audit to client"}
              </button>
            </div>
            {auditMsg && (
              <span className="text-xs text-muted-foreground">{auditMsg}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Confetti burst ─────────────────────────────────────────────────
type ConfettiPiece = {
  left: number;
  delay: number;
  duration: number;
  rotate: number;
  color: string;
  size: number;
  drift: number;
};

function ConfettiBurst() {
  // Generate 30 pieces with stable per-mount randomness
  const piecesRef = useRef<ConfettiPiece[] | null>(null);
  if (piecesRef.current === null) {
    piecesRef.current = Array.from({ length: 30 }, (_, i) => ({
      left: 50 + (Math.random() - 0.5) * 30,
      delay: Math.random() * 0.3,
      duration: 1.4 + Math.random() * 0.8,
      rotate: Math.random() * 720 - 360,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      size: 6 + Math.random() * 6,
      drift: (Math.random() - 0.5) * 240,
    }));
  }
  const pieces = piecesRef.current;
  // Inject keyframes once
  useEffect(() => {
    const id = "confetti-keyframes";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @keyframes confetti-fall {
        0% { transform: translate3d(0,0,0) rotate(0deg); opacity: 1; }
        100% { transform: translate3d(var(--drift), 90vh, 0) rotate(var(--rot)); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }, []);
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 100,
        overflow: "hidden",
      }}
      aria-hidden="true"
    >
      {pieces.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: "-12px",
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size * 0.4}px`,
            background: p.color,
            borderRadius: "1px",
            animation: `confetti-fall ${p.duration}s ${p.delay}s ease-in forwards`,
            ["--drift" as string]: `${p.drift}px`,
            ["--rot" as string]: `${p.rotate}deg`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
