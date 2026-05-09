import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getCurrentAdmin } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    id?: string;
    tags?: unknown;
    flagged?: unknown;
    starred?: unknown;
  };

  if (!body.id || typeof body.id !== "string") {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};

  if (body.tags !== undefined) {
    if (!Array.isArray(body.tags)) {
      return NextResponse.json({ error: "tags must be an array" }, { status: 400 });
    }
    updates.tags = body.tags
      .filter((t): t is string => typeof t === "string")
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0)
      .slice(0, 30);
  }

  if (body.flagged !== undefined) {
    if (typeof body.flagged !== "boolean") {
      return NextResponse.json({ error: "flagged must be a boolean" }, { status: 400 });
    }
    updates.flagged = body.flagged;
  }

  if (body.starred !== undefined) {
    if (typeof body.starred !== "boolean") {
      return NextResponse.json({ error: "starred must be a boolean" }, { status: 400 });
    }
    updates.starred = body.starred;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from("conversations")
    .update(updates)
    .eq("id", body.id);

  if (error) {
    console.error("Chat update failed:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
