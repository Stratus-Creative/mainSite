import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { AdminBar } from "@/components/admin-bar";
import { NotesEditor } from "../notes-editor";

export const metadata: Metadata = {
  title: "New Note — Stratus Admin",
  robots: { index: false, follow: false },
};

export default async function NewNotePage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-background">
      <AdminBar />

      <main className="mx-auto max-w-3xl px-6 py-12">
        <header className="mb-8">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Notes · New
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            New note
          </h1>
        </header>

        <NotesEditor />
      </main>
    </div>
  );
}
