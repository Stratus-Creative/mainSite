import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createServerClient } from "@/lib/supabase";
import { AdminBar } from "@/components/admin-bar";
import type { Note } from "@/lib/notes";

export const metadata: Metadata = {
  title: "Notes — Stratus Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

function statusBadge(note: Note) {
  if (note.published_at) {
    return (
      <span className="rounded-full bg-accent/20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-accent">
        Published
      </span>
    );
  }
  if (note.scheduled_at) {
    return (
      <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-yellow-600 dark:text-yellow-400">
        Scheduled
      </span>
    );
  }
  return (
    <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
      Draft
    </span>
  );
}

export default async function AdminNotesPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .order("created_at", { ascending: false });

  const notes = (error ? [] : (data ?? [])) as Note[];

  return (
    <div className="min-h-screen bg-background">
      <AdminBar />

      <main className="mx-auto max-w-6xl px-6 py-12">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Content
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Notes</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Write, schedule, and publish Decoded articles.
            </p>
          </div>
          <Link
            href="/admin/notes/new"
            className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            New note
          </Link>
        </header>

        {notes.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            No notes yet.{" "}
            <Link href="/admin/notes/new" className="underline text-foreground">
              Write the first one.
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {notes.map((note) => (
              <li key={note.id}>
                <Link
                  href={`/admin/notes/${note.id}`}
                  className="group flex items-start justify-between gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-foreground/30"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {statusBadge(note)}
                      <h2 className="truncate text-sm font-medium text-foreground group-hover:text-accent">
                        {note.title}
                      </h2>
                    </div>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {note.description}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-mono text-[10px] text-muted-foreground">
                      {note.published_at
                        ? `Published ${fmtDate(note.published_at)}`
                        : note.scheduled_at
                          ? `Scheduled ${fmtDate(note.scheduled_at)}`
                          : `Draft · ${fmtDate(note.created_at)}`}
                    </p>
                    <div className="mt-1 flex flex-wrap justify-end gap-1">
                      {note.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-muted-foreground"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
