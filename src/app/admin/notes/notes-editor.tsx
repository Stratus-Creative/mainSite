"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Note } from "@/lib/notes";

interface Props {
  note?: Note;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function toLocalDatetimeValue(iso: string | null): string {
  if (!iso) return "";
  // datetime-local expects "YYYY-MM-DDTHH:MM"
  return iso.slice(0, 16);
}

function toIsoFromLocal(local: string): string | null {
  if (!local) return null;
  return new Date(local).toISOString();
}

export function NotesEditor({ note }: Props) {
  const router = useRouter();
  const isNew = !note;
  const isPublished = !!note?.published_at;

  const [title, setTitle] = useState(note?.title ?? "");
  const [slug, setSlug] = useState(note?.slug ?? "");
  const [description, setDescription] = useState(note?.description ?? "");
  const [tags, setTags] = useState((note?.tags ?? []).join(", "));
  const [body, setBody] = useState(note?.body ?? "");
  const [scheduledAt, setScheduledAt] = useState(
    toLocalDatetimeValue(note?.scheduled_at ?? null)
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugEdited, setSlugEdited] = useState(!isNew);

  // Auto-generate slug from title for new notes
  useEffect(() => {
    if (!slugEdited && isNew) {
      setSlug(slugify(title));
    }
  }, [title, slugEdited, isNew]);

  async function save(publishNow = false) {
    setSaving(true);
    setError(null);

    const payload = {
      slug,
      title,
      description,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      note_body: body,
      scheduled_at: toIsoFromLocal(scheduledAt),
    };

    try {
      let res: Response;

      if (isNew) {
        res = await fetch("/api/admin/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`/api/admin/notes/${note.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error ?? "Save failed");
      }

      const saved = await res.json();

      if (publishNow) {
        const pubRes = await fetch(
          `/api/admin/notes/${saved.id}/publish-now`,
          { method: "POST" }
        );
        if (!pubRes.ok) {
          const j = await pubRes.json();
          throw new Error(j.error ?? "Publish failed");
        }
      }

      router.push("/admin/notes");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSaving(false);
    }
  }

  async function unpublish() {
    if (!note) return;
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/admin/notes/${note.id}/unpublish`, {
      method: "POST",
    });
    if (!res.ok) {
      const j = await res.json();
      setError(j.error ?? "Unpublish failed");
      setSaving(false);
      return;
    }
    router.push("/admin/notes");
    router.refresh();
  }

  async function deleteNote() {
    if (!note) return;
    if (!confirm("Delete this draft? This cannot be undone.")) return;
    setSaving(true);
    const res = await fetch(`/api/admin/notes/${note.id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const j = await res.json();
      setError(j.error ?? "Delete failed");
      setSaving(false);
      return;
    }
    router.push("/admin/notes");
    router.refresh();
  }

  const fieldClass =
    "w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50";

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Title
        </label>
        <input
          className={fieldClass}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What the 98% SMS open rate actually means"
          disabled={isPublished || saving}
        />
      </div>

      {/* Slug */}
      <div>
        <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Slug
        </label>
        <input
          className={fieldClass}
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setSlugEdited(true);
          }}
          placeholder="what-the-98-percent-sms-open-rate-actually-means"
          disabled={isPublished || saving}
        />
      </div>

      {/* Description */}
      <div>
        <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Description
        </label>
        <textarea
          className={`${fieldClass} resize-none`}
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="One-paragraph summary shown in the notes index and newsletter."
          disabled={isPublished || saving}
        />
      </div>

      {/* Tags */}
      <div>
        <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Tags{" "}
          <span className="normal-case tracking-normal">(comma-separated)</span>
        </label>
        <input
          className={fieldClass}
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Marketing, SMS"
          disabled={isPublished || saving}
        />
      </div>

      {/* Body */}
      <div>
        <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Body{" "}
          <span className="normal-case tracking-normal">
            (**bold**, [link](url), bullet lists with "-")
          </span>
        </label>
        <textarea
          className={`${fieldClass} font-mono text-xs leading-relaxed`}
          rows={24}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write the article here…"
          disabled={isPublished || saving}
        />
      </div>

      {/* Schedule */}
      <div>
        <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Schedule{" "}
          <span className="normal-case tracking-normal">(UTC — leave blank to save as draft)</span>
        </label>
        {isPublished ? (
          <p className="text-sm text-muted-foreground">
            Published{" "}
            <span className="text-foreground">
              {new Date(note.published_at!).toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
                timeZone: "UTC",
              })}{" "}
              UTC
            </span>
          </p>
        ) : (
          <input
            type="datetime-local"
            className={fieldClass}
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            disabled={saving}
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
        {isPublished ? (
          <button
            onClick={unpublish}
            disabled={saving}
            className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-card disabled:opacity-50"
          >
            Unpublish
          </button>
        ) : (
          <>
            <button
              onClick={() => save(false)}
              disabled={saving || !title || !slug || !body}
              className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-card disabled:opacity-50"
            >
              {scheduledAt ? "Schedule" : "Save draft"}
            </button>
            <button
              onClick={() => save(true)}
              disabled={saving || !title || !slug || !body}
              className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Publishing…" : "Publish now"}
            </button>
          </>
        )}

        {!isPublished && !isNew && (
          <button
            onClick={deleteNote}
            disabled={saving}
            className="ml-auto text-sm text-muted-foreground transition-colors hover:text-red-500 disabled:opacity-50"
          >
            Delete draft
          </button>
        )}
      </div>
    </div>
  );
}
