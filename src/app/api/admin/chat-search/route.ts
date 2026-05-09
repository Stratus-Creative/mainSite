import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getCurrentAdmin } from "@/lib/admin-auth";

type RawMessage = {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  created_at: string;
  conversations: { page_url: string | null } | { page_url: string | null }[] | null;
};

function makeExcerpt(content: string, q: string, max = 200): string {
  const lower = content.toLowerCase();
  const needle = q.toLowerCase();
  const idx = lower.indexOf(needle);
  if (idx < 0) {
    return content.length > max ? content.slice(0, max - 1).trimEnd() + "…" : content;
  }
  // Center excerpt on the match.
  const halfWindow = Math.floor((max - needle.length) / 2);
  const start = Math.max(0, idx - halfWindow);
  const end = Math.min(content.length, start + max);
  let excerpt = content.slice(start, end);
  if (start > 0) excerpt = "…" + excerpt;
  if (end < content.length) excerpt = excerpt + "…";
  return excerpt.replace(/\s+/g, " ").trim();
}

export async function GET(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  // Escape ILIKE wildcards in the user-supplied term.
  const escaped = q.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("messages")
    .select("id, conversation_id, role, content, created_at, conversations(page_url)")
    .ilike("content", `%${escaped}%`)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Chat search failed:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }

  const rows = (data ?? []) as RawMessage[];
  const results = rows.map((m) => {
    const convo = Array.isArray(m.conversations) ? m.conversations[0] : m.conversations;
    return {
      message_id: m.id,
      conversation_id: m.conversation_id,
      role: m.role,
      page_url: convo?.page_url ?? null,
      created_at: m.created_at,
      content_excerpt: makeExcerpt(m.content ?? "", q),
    };
  });

  return NextResponse.json({ results });
}
