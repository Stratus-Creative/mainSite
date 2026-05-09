"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AcceptInviteClient({
  token,
  email,
}: {
  token: string;
  email: string;
}) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 12) {
      setError("Password must be at least 12 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);

    const res = await fetch("/api/admin/invites/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(json.error ?? "Failed to accept invite.");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Email
        </label>
        <input
          type="email"
          value={email}
          readOnly
          className="mt-2 w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-muted-foreground"
        />
      </div>
      <div>
        <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          minLength={12}
          placeholder="Min 12 characters"
          className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-foreground focus:outline-none"
        />
      </div>
      <div>
        <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Confirm password
        </label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          autoComplete="new-password"
          minLength={12}
          className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-foreground focus:outline-none"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
      >
        {loading ? "Accepting…" : "Accept invite"}
      </button>
    </form>
  );
}
