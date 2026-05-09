"use client";

import { useState } from "react";

type View = "disabled" | "enrolling" | "enabled";

type SetupResponse = {
  secret: string;
  otpauth_url: string;
  qrCodeDataUrl: string;
  recoveryCodes: string[];
};

export function TwoFactorCard({ initialEnabled }: { initialEnabled: boolean }) {
  const [view, setView] = useState<View>(initialEnabled ? "enabled" : "disabled");
  const [setup, setSetup] = useState<SetupResponse | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function startSetup() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/2fa/setup", { method: "POST" });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(json.error ?? "Setup failed.");
      return;
    }
    setSetup(json as SetupResponse);
    setView("enrolling");
  }

  async function confirmCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/2fa/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(json.error ?? "Could not verify code.");
      return;
    }
    setSetup(null);
    setCode("");
    setView("enabled");
  }

  async function disable() {
    if (typeof window !== "undefined") {
      if (!window.confirm("Disable 2FA? Your account will be protected by password only.")) return;
    }
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/2fa/disable", { method: "POST" });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(json.error ?? "Disable failed.");
      return;
    }
    setView("disabled");
  }

  if (view === "enabled") {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3">
          <span className="inline-block size-2 rounded-full bg-accent" />
          <p className="text-sm text-foreground">2FA is on.</p>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          You&apos;ll be asked for a code from your authenticator app each time you sign in.
        </p>
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        <button
          onClick={disable}
          disabled={busy}
          className="mt-5 rounded-full border border-border px-4 py-2 text-xs text-muted-foreground transition-colors hover:border-destructive hover:text-destructive disabled:opacity-50"
        >
          {busy ? "Disabling…" : "Disable"}
        </button>
      </div>
    );
  }

  if (view === "enrolling" && setup) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-sm text-foreground">
          Scan this QR code in your authenticator app, then enter the 6-digit code it shows.
        </p>

        <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="rounded-lg border border-border bg-background p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={setup.qrCodeDataUrl}
              alt="2FA QR code"
              width={200}
              height={200}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Or paste this secret
            </p>
            <p className="mt-2 break-all rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs text-foreground">
              {setup.secret}
            </p>

            <p className="mt-5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Recovery codes
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Save these somewhere safe. Each can be used once if you lose your device.
            </p>
            <ul className="mt-2 grid grid-cols-2 gap-1 rounded-lg border border-border bg-background p-3 font-mono text-xs">
              {setup.recoveryCodes.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        </div>

        <form onSubmit={confirmCode} className="mt-6 space-y-3">
          <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Verification code
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            autoComplete="one-time-code"
            placeholder="123 456"
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-mono tracking-widest focus:border-foreground focus:outline-none"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={busy}
              className="rounded-full bg-foreground text-background px-5 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
            >
              {busy ? "Verifying…" : "Verify and enable"}
            </button>
            <button
              type="button"
              onClick={() => {
                setSetup(null);
                setCode("");
                setError(null);
                setView("disabled");
              }}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <p className="text-sm text-foreground">2FA is off.</p>
      <p className="mt-2 text-sm text-muted-foreground">
        Add a second factor to keep your account safe even if your password leaks.
      </p>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      <button
        onClick={startSetup}
        disabled={busy}
        className="mt-5 rounded-full bg-foreground text-background px-5 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
      >
        {busy ? "Setting up…" : "Add 2FA"}
      </button>
    </div>
  );
}
