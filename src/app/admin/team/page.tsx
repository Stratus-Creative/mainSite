import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { AdminBar } from "@/components/admin-bar";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createServerClient } from "@/lib/supabase";
import { TeamClient } from "./team-client";

export const metadata: Metadata = {
  title: "Team — Stratus Admin",
  robots: { index: false, follow: false },
};

type Member = {
  id: string;
  email: string;
  role: "admin" | "staff";
  created_at: string;
};

type Invite = {
  token: string;
  email: string;
  role: "admin" | "staff";
  invited_by: string | null;
  invited_by_email: string | null;
  expires_at: string;
  created_at: string;
};

function relTime(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now();
  const abs = Math.abs(ms);
  const min = Math.round(abs / 60000);
  const hr = Math.round(abs / 3600000);
  const day = Math.round(abs / 86400000);
  const fmt =
    day >= 1 ? `${day}d` : hr >= 1 ? `${hr}h` : min >= 1 ? `${min}m` : "now";
  return ms >= 0 ? `in ${fmt}` : `${fmt} ago`;
}

export default async function TeamPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  if (admin.role !== "admin") {
    return (
      <div className="min-h-screen bg-background">
        <AdminBar />
        <main className="mx-auto max-w-3xl px-6 py-12">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Back to admin
          </Link>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">Team</h1>
          <div className="mt-8 rounded-xl border border-border bg-card p-6">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Admins only
            </p>
            <p className="mt-3 text-sm text-foreground">
              Managing teammates is restricted to admins. Contact an admin if you need access changes.
            </p>
          </div>
        </main>
      </div>
    );
  }

  const supabase = createServerClient();

  const { data: usersData } = await supabase
    .from("admin_users")
    .select("id, email, role, created_at")
    .order("created_at", { ascending: true });

  const members: Member[] = (usersData ?? []) as Member[];

  const nowIso = new Date().toISOString();
  const { data: invitesRaw } = await supabase
    .from("admin_invites")
    .select("token, email, role, invited_by, expires_at, created_at")
    .is("used_at", null)
    .gt("expires_at", nowIso)
    .order("created_at", { ascending: false });

  const inviterIds = Array.from(
    new Set((invitesRaw ?? []).map((i) => i.invited_by).filter(Boolean))
  ) as string[];
  const inviterEmails = new Map<string, string>();
  if (inviterIds.length > 0) {
    const { data: inviters } = await supabase
      .from("admin_users")
      .select("id, email")
      .in("id", inviterIds);
    for (const u of inviters ?? []) {
      inviterEmails.set(u.id as string, u.email as string);
    }
  }

  const invites: Invite[] = (invitesRaw ?? []).map((i) => ({
    token: i.token as string,
    email: i.email as string,
    role: i.role as "admin" | "staff",
    invited_by: (i.invited_by as string | null) ?? null,
    invited_by_email: i.invited_by ? inviterEmails.get(i.invited_by as string) ?? null : null,
    expires_at: i.expires_at as string,
    created_at: i.created_at as string,
  }));

  return (
    <div className="min-h-screen bg-background">
      <AdminBar />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to admin
        </Link>

        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Team</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage teammates and pending invitations.
        </p>

        <TeamClient
          currentUserId={admin.id}
          members={members.map((m) => ({
            ...m,
            relCreated: relTime(m.created_at),
          }))}
          invites={invites.map((i) => ({
            ...i,
            relExpires: relTime(i.expires_at),
          }))}
        />
      </main>
    </div>
  );
}
