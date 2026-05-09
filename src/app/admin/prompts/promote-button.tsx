"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PromoteButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function promote() {
    if (!confirm("Make this version the live chat prompt?")) return;
    setPending(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/prompts/promote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? `HTTP ${res.status}`);
      }
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {err && <span className="text-xs text-destructive">{err}</span>}
      <button
        onClick={promote}
        disabled={pending}
        className="rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Promoting…" : "Promote to active"}
      </button>
    </div>
  );
}
