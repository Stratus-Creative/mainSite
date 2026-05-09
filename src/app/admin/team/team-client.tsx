"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type MemberView = {
  id: string;
  email: string;
  role: "admin" | "staff";
  created_at: string;
  relCreated: string;
};

type InviteView = {
  token: string;
  email: string;
  role: "admin" | "staff";
  invited_by_email: string | null;
  expires_at: string;
  relExpires: string;
};

export function TeamClient({
  currentUserId,
  members,
  invites,
}: {
  currentUserId: string;
  members: MemberView[];
  invites: InviteView[];
}) {
  const router = useRouter();

  return (
    <div className="mt-10 space-y-10">
      <ActiveMembers currentUserId={currentUserId} members={members} onChange={() => router.refresh()} />
      <PendingInvites invites={invites} onChange={() => router.refresh()} />
      <InviteForm onSent={() => router.refresh()} />
    </div>
  );
}

function RoleBadge({ role }: { role: "admin" | "staff" }) {
  const label = role.toUpperCase();
  return (
    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
      {label}
    </span>
  );
}

function ActiveMembers({
  currentUserId,
  members,
  onChange,
}: {
  currentUserId: string;
  members: MemberView[];
  onChange: () => void;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function remove(id: string, email: string) {
    if (!confirm(`Remove ${email}? They'll lose access immediately.`)) return;
    setBusyId(id);
    setError(null);
    const res = await fetch(`/api/admin/team/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error ?? "Remove failed.");
      setBusyId(null);
      return;
    }
    setBusyId(null);
    onChange();
  }

  return (
    <section>
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        Active members
      </p>
      <div className="mt-3 rounded-xl border border-border bg-card">
        {members.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No members.</p>
        ) : (
          <ul className="divide-y divide-border">
            {members.map((m) => {
              const isSelf = m.id === currentUserId;
              return (
                <li
                  key={m.id}
                  className="flex items-center justify-between gap-4 px-6 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm text-foreground">{m.email}</p>
                    <p className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      <RoleBadge role={m.role} />
                      <span>·</span>
                      <span>joined {m.relCreated}</span>
                      {isSelf && (
                        <>
                          <span>·</span>
                          <span className="text-foreground">you</span>
                        </>
                      )}
                    </p>
                  </div>
                  {!isSelf && (
                    <button
                      onClick={() => remove(m.id, m.email)}
                      disabled={busyId === m.id}
                      className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-destructive hover:text-destructive disabled:opacity-50"
                    >
                      {busyId === m.id ? "Removing…" : "Remove"}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </section>
  );
}

function PendingInvites({
  invites,
  onChange,
}: {
  invites: InviteView[];
  onChange: () => void;
}) {
  const [busyToken, setBusyToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function revoke(token: string, email: string) {
    if (!confirm(`Revoke invite for ${email}?`)) return;
    setBusyToken(token);
    setError(null);
    const res = await fetch(`/api/admin/invites/${token}`, { method: "DELETE" });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error ?? "Revoke failed.");
      setBusyToken(null);
      return;
    }
    setBusyToken(null);
    onChange();
  }

  return (
    <section>
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        Pending invites
      </p>
      <div className="mt-3 rounded-xl border border-border bg-card">
        {invites.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No pending invites.</p>
        ) : (
          <ul className="divide-y divide-border">
            {invites.map((i) => (
              <li
                key={i.token}
                className="flex items-center justify-between gap-4 px-6 py-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-foreground">{i.email}</p>
                  <p className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <RoleBadge role={i.role} />
                    <span>·</span>
                    <span>
                      invited by {i.invited_by_email ?? "unknown"}
                    </span>
                    <span>·</span>
                    <span>expires {i.relExpires}</span>
                  </p>
                </div>
                <button
                  onClick={() => revoke(i.token, i.email)}
                  disabled={busyToken === i.token}
                  className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-destructive hover:text-destructive disabled:opacity-50"
                >
                  {busyToken === i.token ? "Revoking…" : "Revoke"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </section>
  );
}

function InviteForm({ onSent }: { onSent: () => void }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "staff">("staff");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setState("sending");
    const res = await fetch("/api/admin/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(json.error ?? "Failed to send invite.");
      setState("error");
      return;
    }
    setState("sent");
    setEmail("");
    setRole("staff");
    onSent();
    setTimeout(() => setState("idle"), 4000);
  }

  return (
    <section>
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        Send an invite
      </p>
      <form onSubmit={submit} className="mt-3 rounded-xl border border-border bg-card p-6 space-y-4">
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="teammate@example.com"
            className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-foreground focus:outline-none"
          />
        </div>
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "admin" | "staff")}
            className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-foreground focus:outline-none"
          >
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {state === "sent" && (
          <p className="text-sm text-accent">Invite sent.</p>
        )}
        <button
          type="submit"
          disabled={state === "sending"}
          className="rounded-full bg-foreground text-background px-5 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
        >
          {state === "sending" ? "Sending…" : "Send invite"}
        </button>
      </form>
    </section>
  );
}
