"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SetupClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
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
    const res = await fetch("/api/admin/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      const json = await res.json().catch(() => ({}));
      setError(json.error ?? "Setup failed.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5">
          <span className="inline-block size-2 rounded-full bg-accent" />
          <span className="text-sm font-semibold tracking-tight">Stratus Admin</span>
        </div>

        <h1 className="mt-10 text-3xl font-semibold tracking-tight">First-time setup</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Create the first admin account. This page will be unavailable after.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
          />
          <input
            type="password"
            placeholder="Password (min 12 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={12}
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-foreground py-3 text-sm font-medium text-background transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
          >
            {loading ? "Creating…" : "Create admin account"}
          </button>
        </form>
      </div>
    </div>
  );
}
