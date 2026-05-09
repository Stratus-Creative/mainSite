import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { AdminBar } from "@/components/admin-bar";
import { TemplatesManager, type TemplateRow } from "./templates-manager";

export const metadata: Metadata = {
  title: "Email templates — Stratus Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function EmailTemplatesPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const supabase = createServerClient();
  const { data } = await supabase
    .from("email_templates")
    .select("id, name, category, subject, body, created_at, updated_at")
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  const initial: TemplateRow[] = (data ?? []) as TemplateRow[];

  return (
    <div className="min-h-screen bg-background">
      <AdminBar />
      <main className="mx-auto max-w-5xl px-6 py-12">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Email templates
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Reusable email bodies for follow-ups, declines, status updates, etc.
          </p>
        </div>

        <div className="mt-10">
          <TemplatesManager initial={initial} />
        </div>
      </main>
    </div>
  );
}
