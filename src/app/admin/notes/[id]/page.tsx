import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createServerClient } from "@/lib/supabase";
import { AdminBar } from "@/components/admin-bar";
import { NotesEditor } from "../notes-editor";
import type { Note } from "@/lib/notes";

export const metadata: Metadata = {
  title: "Edit Note — Stratus Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ id: string }>;
}

export default async function EditNotePage({ params }: Params) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const { id } = await params;
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) notFound();
  const note = data as Note;

  const statusLabel = note.published_at
    ? "Published"
    : note.scheduled_at
      ? "Scheduled"
      : "Draft";

  return (
    <div className="min-h-screen bg-background">
      <AdminBar />

      <main className="mx-auto max-w-3xl px-6 py-12">
        <header className="mb-8">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/notes"
              className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
            >
              ← Notes
            </Link>
            <span className="text-muted-foreground/40">·</span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {statusLabel}
            </span>
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            {note.title}
          </h1>
          {note.published_at && (
            <p className="mt-1 text-sm text-muted-foreground">
              Live at{" "}
              <a
                href={`/notes/${note.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-foreground"
              >
                /notes/{note.slug}
              </a>
            </p>
          )}
        </header>

        <NotesEditor note={note} />
      </main>
    </div>
  );
}
