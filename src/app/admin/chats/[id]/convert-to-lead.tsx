"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Props {
  conversationId: string;
  existingSubmissionId: string | null;
}

type Status =
  | { kind: "idle" }
  | { kind: "working" }
  | { kind: "done"; submissionId: string }
  | { kind: "error"; message: string };

export function ConvertToLead({ conversationId, existingSubmissionId }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  if (existingSubmissionId) {
    return (
      <Link
        href={`/admin/${existingSubmissionId}`}
        className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-2 text-xs font-medium text-accent transition-colors hover:bg-accent/20"
      >
        Linked to submission →
      </Link>
    );
  }

  if (status.kind === "done") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-2 text-xs font-medium text-accent">
        Lead created — redirecting…
      </span>
    );
  }

  async function handleClick() {
    setStatus({ kind: "working" });
    try {
      const res = await fetch("/api/admin/convert-chat-to-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok || !json?.submissionId) {
        const msg =
          typeof json?.error === "string"
            ? json.error
            : "Failed to convert chat to lead.";
        setStatus({ kind: "error", message: msg });
        return;
      }
      setStatus({ kind: "done", submissionId: json.submissionId });
      setTimeout(() => {
        router.push(`/admin/${json.submissionId}`);
      }, 1000);
    } catch {
      setStatus({
        kind: "error",
        message: "Network error — please try again.",
      });
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <button
        type="button"
        onClick={handleClick}
        disabled={status.kind === "working"}
        className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
      >
        {status.kind === "working" ? "Converting…" : "Convert to lead"}
      </button>
      {status.kind === "error" && (
        <p className="font-mono text-[10px] uppercase tracking-widest text-destructive">
          {status.message}
        </p>
      )}
    </div>
  );
}
