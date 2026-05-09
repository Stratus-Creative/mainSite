import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { AdminBar } from "@/components/admin-bar";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createServerClient } from "@/lib/supabase";
import { AccountForm } from "./account-form";
import { TwoFactorCard } from "./two-factor-card";

export const metadata: Metadata = {
  title: "Account — Stratus Admin",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const supabase = createServerClient();
  const { data: twoFa } = await supabase
    .from("admin_2fa_secrets")
    .select("user_id, enabled")
    .eq("user_id", admin.id)
    .maybeSingle();
  const twoFaEnabled = !!twoFa?.enabled;

  return (
    <div className="min-h-screen bg-background">
      <AdminBar />

      <main className="mx-auto max-w-2xl px-6 py-12">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to admin
        </Link>

        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Signed in as <span className="text-foreground">{admin.email}</span> ·{" "}
          <span className="font-mono text-xs uppercase tracking-widest">{admin.role}</span>
        </p>

        <div className="mt-10">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Change password
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Updating your password signs out every other device but keeps you signed in here.
          </p>

          <div className="mt-6">
            <AccountForm />
          </div>
        </div>

        <div className="mt-12">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Two-factor authentication
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Add a TOTP code (Authy, 1Password, Google Authenticator) on top of your password.
          </p>

          <div className="mt-6">
            <TwoFactorCard initialEnabled={twoFaEnabled} />
          </div>
        </div>
      </main>
    </div>
  );
}
