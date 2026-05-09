"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Step = "credentials" | "2fa";

export function AdminLoginClient() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submitCredentials(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(json.error ?? "Invalid credentials.");
      setLoading(false);
      return;
    }

    if (json?.require2FA) {
      setStep("2fa");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  async function submit2FA(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/2fa/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(json.error ?? "Invalid code.");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5">
          <span className="inline-block size-2 rounded-full bg-accent" />
          <span className="text-sm font-semibold tracking-tight">Stratus Admin</span>
        </div>

        {step === "credentials" ? (
          <>
            <h1 className="mt-10 text-3xl font-semibold tracking-tight">Sign in</h1>
            <p className="mt-2 text-sm text-muted-foreground">Admin access only.</p>

            <form onSubmit={submitCredentials} className="mt-8 space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                autoComplete="username"
                className="w-full rounded-lg border border-border bg-card px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-lg border border-border bg-card px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-foreground py-3 text-sm font-medium text-background transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="mt-10 text-3xl font-semibold tracking-tight">
              Two-factor code
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter the 6-digit code from your authenticator app, or a recovery code.
            </p>

            <form onSubmit={submit2FA} className="mt-8 space-y-4">
              <input
                type="text"
                inputMode="numeric"
                placeholder="123 456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                autoFocus
                autoComplete="one-time-code"
                className="w-full rounded-lg border border-border bg-card px-4 py-3 text-base font-mono tracking-widest text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-foreground py-3 text-sm font-medium text-background transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
              >
                {loading ? "Verifying…" : "Verify"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep("credentials");
                  setCode("");
                  setError(null);
                }}
                className="w-full text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                ← Back to sign in
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
