import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { AdminBar } from "@/components/admin-bar";
import { EditForm } from "./edit-form";

export const metadata: Metadata = {
  title: "Edit prompt — Stratus Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const PROMPT_KEY = "chat-system";

export default async function EditPromptPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const supabase = createServerClient();
  const { data } = await supabase
    .from("prompt_versions")
    .select("content")
    .eq("prompt_key", PROMPT_KEY)
    .eq("active", true)
    .maybeSingle();

  const initialContent = data?.content ?? "";

  return (
    <div className="min-h-screen bg-background">
      <AdminBar />

      <main className="mx-auto max-w-6xl px-6 py-12">
        <header className="mb-8">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Chat assistant
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Edit prompt</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Save creates a new version. Activate makes it live for the chat widget within ~60s.
          </p>
        </header>

        <EditForm promptKey={PROMPT_KEY} initialContent={initialContent} />
      </main>
    </div>
  );
}
