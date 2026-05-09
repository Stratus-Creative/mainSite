import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getCurrentAdmin } from "@/lib/admin-auth";

interface RouteCtx {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteCtx) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (typeof body.name === "string" && body.name.trim()) update.name = body.name.trim();
  if (typeof body.category === "string" && body.category.trim()) update.category = body.category.trim();
  if (typeof body.subject === "string") update.subject = body.subject;
  if (typeof body.body === "string") update.body = body.body;

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("email_templates")
    .update(update)
    .eq("id", id)
    .select("id, name, category, subject, body, created_at, updated_at")
    .single();

  if (error || !data) {
    console.error("[email-templates PATCH]", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ template: data });
}

export async function DELETE(_request: Request, { params }: RouteCtx) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const supabase = createServerClient();
  const { error } = await supabase.from("email_templates").delete().eq("id", id);

  if (error) {
    console.error("[email-templates DELETE]", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
