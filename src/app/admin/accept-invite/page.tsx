import type { Metadata } from "next";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase";
import { AcceptInviteClient } from "./accept-invite-client";

export const metadata: Metadata = {
  title: "Accept invite — Stratus Admin",
  robots: { index: false, follow: false },
};

// Hits Supabase to validate the invite token; must run at request time.
export const dynamic = "force-dynamic";

type SearchParams = Promise<{ token?: string | string[] }>;

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5">
          <span className="inline-block size-2 rounded-full bg-accent" />
          <span className="text-sm font-semibold tracking-tight">Stratus Admin</span>
        </div>
        {children}
      </div>
    </div>
  );
}

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const tokenRaw = params?.token;
  const token = Array.isArray(tokenRaw) ? tokenRaw[0] : tokenRaw;

  if (!token || typeof token !== "string") {
    return (
      <Shell>
        <h1 className="mt-10 text-2xl font-semibold tracking-tight">
          Invalid invite
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          No invite token was provided.
        </p>
        <Link
          href="/admin/login"
          className="mt-6 inline-block text-sm text-muted-foreground hover:text-foreground"
        >
          Go to sign in →
        </Link>
      </Shell>
    );
  }

  const supabase = createServerClient();
  const { data: invite } = await supabase
    .from("admin_invites")
    .select("token, email, role, expires_at, used_at")
    .eq("token", token)
    .maybeSingle();

  const valid =
    !!invite &&
    !invite.used_at &&
    new Date(invite.expires_at as string) > new Date();

  if (!valid || !invite) {
    return (
      <Shell>
        <h1 className="mt-10 text-2xl font-semibold tracking-tight">
          Invalid or expired invite
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ask whoever invited you to send a fresh link.
        </p>
        <Link
          href="/admin/login"
          className="mt-6 inline-block text-sm text-muted-foreground hover:text-foreground"
        >
          Go to sign in →
        </Link>
      </Shell>
    );
  }

  return (
    <Shell>
      <h1 className="mt-10 text-2xl font-semibold tracking-tight">
        Accept your invite
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Set a password to activate your account.
      </p>
      <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        Role: {(invite.role as string).toUpperCase()}
      </p>
      <div className="mt-6">
        <AcceptInviteClient
          token={token}
          email={invite.email as string}
        />
      </div>
    </Shell>
  );
}
