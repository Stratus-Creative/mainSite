"use client";

import { useMemo, useState } from "react";

export type TemplateRow = {
  id: string;
  name: string;
  category: string;
  subject: string;
  body: string;
  created_at: string;
  updated_at: string;
};

const DEFAULT_CATEGORIES = [
  "Follow-up",
  "Decline",
  "Status update",
  "General",
] as const;

const TOKEN_HINTS = [
  "{{ownerName}}",
  "{{businessName}}",
  "{{quoteAmount}}",
  "{{trackingLink}}",
];

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type FormState = {
  id: string | null;
  name: string;
  category: string;
  subject: string;
  body: string;
};

const EMPTY_FORM: FormState = {
  id: null,
  name: "",
  category: DEFAULT_CATEGORIES[0],
  subject: "",
  body: "",
};

export function TemplatesManager({ initial }: { initial: TemplateRow[] }) {
  const [templates, setTemplates] = useState<TemplateRow[]>(initial);
  const [editing, setEditing] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<string, TemplateRow[]>();
    for (const c of DEFAULT_CATEGORIES) map.set(c, []);
    for (const t of templates) {
      const arr = map.get(t.category) ?? [];
      arr.push(t);
      map.set(t.category, arr);
    }
    return map;
  }, [templates]);

  // Drop the placeholder reduce/map block at the end of the JSX — it was a no-op.
  // Categories not in DEFAULT_CATEGORIES are already included in `grouped` above.

  function startNew() {
    setErrorMsg(null);
    setStatusMsg(null);
    setEditing({ ...EMPTY_FORM });
  }

  function startEdit(t: TemplateRow) {
    setErrorMsg(null);
    setStatusMsg(null);
    setEditing({
      id: t.id,
      name: t.name,
      category: t.category,
      subject: t.subject,
      body: t.body,
    });
  }

  function cancelEdit() {
    setEditing(null);
    setErrorMsg(null);
  }

  async function save() {
    if (!editing) return;
    if (!editing.name.trim() || !editing.category.trim() || !editing.subject.trim() || !editing.body.trim()) {
      setErrorMsg("Name, category, subject, and body are all required.");
      return;
    }
    setSaving(true);
    setErrorMsg(null);
    try {
      if (editing.id) {
        const res = await fetch(`/api/admin/email-templates/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: editing.name,
            category: editing.category,
            subject: editing.subject,
            body: editing.body,
          }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.template) {
          setErrorMsg(json.error ?? "Update failed.");
        } else {
          const updated = json.template as TemplateRow;
          setTemplates((prev) =>
            prev.map((t) => (t.id === updated.id ? updated : t))
          );
          setEditing(null);
          setStatusMsg("Template saved.");
        }
      } else {
        const res = await fetch("/api/admin/email-templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: editing.name,
            category: editing.category,
            subject: editing.subject,
            body: editing.body,
          }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.template) {
          setErrorMsg(json.error ?? "Create failed.");
        } else {
          const created = json.template as TemplateRow;
          setTemplates((prev) => [...prev, created]);
          setEditing(null);
          setStatusMsg("Template created.");
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error.");
    } finally {
      setSaving(false);
      window.setTimeout(() => setStatusMsg(null), 2500);
    }
  }

  async function destroy(id: string) {
    if (!confirm("Delete this template? This cannot be undone.")) return;
    const prev = templates;
    setTemplates((t) => t.filter((x) => x.id !== id));
    const res = await fetch(`/api/admin/email-templates/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      setTemplates(prev);
      setErrorMsg("Delete failed.");
      window.setTimeout(() => setErrorMsg(null), 2500);
    }
  }

  const categoriesForSelect = Array.from(
    new Set([...DEFAULT_CATEGORIES, ...templates.map((t) => t.category)])
  );

  return (
    <div className="space-y-8">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div>
          {statusMsg && (
            <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
              {statusMsg}
            </p>
          )}
        </div>
        {!editing && (
          <button
            onClick={startNew}
            className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            New template
          </button>
        )}
      </div>

      {/* Editor */}
      {editing && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              {editing.id ? "Edit template" : "New template"}
            </p>
            {errorMsg && (
              <span className="text-xs text-red-400">{errorMsg}</span>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Name
              </label>
              <input
                value={editing.name}
                onChange={(e) =>
                  setEditing({ ...editing, name: e.target.value })
                }
                placeholder="First follow-up"
                className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
              />
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Category
              </label>
              <input
                list="email-template-categories"
                value={editing.category}
                onChange={(e) =>
                  setEditing({ ...editing, category: e.target.value })
                }
                placeholder="Follow-up"
                className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
              />
              <datalist id="email-template-categories">
                {categoriesForSelect.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          </div>

          <div>
            <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Subject
            </label>
            <input
              value={editing.subject}
              onChange={(e) =>
                setEditing({ ...editing, subject: e.target.value })
              }
              placeholder="Following up on your project"
              className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
            />
          </div>

          <div>
            <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Body
            </label>
            <textarea
              value={editing.body}
              onChange={(e) =>
                setEditing({ ...editing, body: e.target.value })
              }
              rows={10}
              placeholder="Hi {{ownerName}}, just checking in on your project…"
              className="mt-2 w-full resize-y rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
            />
          </div>

          <div className="rounded-lg border border-border/60 bg-background px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Tokens you can use
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {TOKEN_HINTS.map((t) => (
                <code
                  key={t}
                  className="rounded border border-border/60 bg-card px-2 py-0.5 font-mono text-[11px] text-foreground/80"
                >
                  {t}
                </code>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border/60 pt-4">
            <button
              onClick={cancelEdit}
              disabled={saving}
              className="rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-foreground disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
            >
              {saving ? "Saving…" : editing.id ? "Save changes" : "Create template"}
            </button>
          </div>
        </div>
      )}

      {/* Grouped list */}
      <div className="space-y-8">
        {Array.from(grouped.entries()).map(([category, list]) => (
          <div key={category}>
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              {category}
            </p>
            {list.length === 0 ? (
              <p className="mt-3 rounded-lg border border-border/60 bg-card px-4 py-3 text-xs text-muted-foreground">
                No templates in this category.
              </p>
            ) : (
              <ul className="mt-3 grid gap-px bg-border/60">
                {list.map((t) => (
                  <li
                    key={t.id}
                    className="flex flex-wrap items-center justify-between gap-3 bg-card px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {t.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {t.subject}
                      </p>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">
                        Updated {fmtDate(t.updated_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEdit(t)}
                        className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-foreground transition-colors hover:border-foreground"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => destroy(t.id)}
                        className="rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-accent hover:text-accent"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}

      </div>
    </div>
  );
}
