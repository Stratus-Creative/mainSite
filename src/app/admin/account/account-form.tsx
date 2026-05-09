"use client";

import { useState } from "react";

export function AccountForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [state, setState] = useState<"idle" | "submitting" | "saved" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 12) {
      setError("New password must be at least 12 characters.");
      return;
    }
    if (newPassword !== confirm) {
      setError("New passwords do not match.");
      return;
    }
    if (newPassword === currentPassword) {
      setError("New password must be different from current password.");
      return;
    }

    setState("submitting");
    const res = await fetch("/api/admin/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const json = await res.json().catch(() => ({}));

    if (res.ok) {
      setState("saved");
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
      setTimeout(() => setState("idle"), 4000);
    } else {
      setState("error");
      setError(json.error ?? "Update failed.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Current password
        </label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="mt-2 w-full rounded-lg border border-border bg-card px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
        />
      </div>

      <div>
        <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          New password
        </label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={12}
          autoComplete="new-password"
          placeholder="Min 12 characters"
          className="mt-2 w-full rounded-lg border border-border bg-card px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
        />
      </div>

      <div>
        <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Confirm new password
        </label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          autoComplete="new-password"
          className="mt-2 w-full rounded-lg border border-border bg-card px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {state === "saved" && (
        <p className="text-sm text-accent">Password updated. Other devices have been signed out.</p>
      )}

      <button
        type="submit"
        disabled={state === "submitting"}
        className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
      >
        {state === "submitting" ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
