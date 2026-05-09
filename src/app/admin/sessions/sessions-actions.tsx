"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function RevokeButton({ token }: { token: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleRevoke() {
    setError(null);
    const res = await fetch(`/api/admin/sessions/${token}/revoke`, { method: "POST" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Revoke failed");
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleRevoke}
        disabled={pending}
        className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
      >
        {pending ? "Revoking…" : "Revoke"}
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

export function RevokeOthersButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleRevokeOthers() {
    setError(null);
    if (!confirm("Sign out every other device? This will not affect this browser.")) {
      return;
    }
    const res = await fetch(`/api/admin/sessions/revoke-others`, { method: "POST" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Revoke failed");
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleRevokeOthers}
        disabled={pending}
        className="rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Revoking…" : "Revoke all other devices"}
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
