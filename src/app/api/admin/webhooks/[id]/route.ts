import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { EVENT_TYPES } from "@/lib/webhook-dispatch";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Ctx) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  const updates: Record<string, unknown> = {};
  if (typeof body.active === "boolean") updates.active = body.active;
  if (typeof body.label === "string") updates.label = body.label.trim() || null;
  if (Array.isArray(body.events)) {
    updates.events = body.events.filter(
      (e: unknown): e is string =>
        typeof e === "string" && (EVENT_TYPES as readonly string[]).includes(e)
    );
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "no updates" }, { status: 400 });
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from("webhook_subscriptions")
    .update(updates)
    .eq("id", id);

  if (error) {
    console.error("[/api/admin/webhooks/:id] PATCH failed:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createServerClient();
  const { error } = await supabase
    .from("webhook_subscriptions")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[/api/admin/webhooks/:id] DELETE failed:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
