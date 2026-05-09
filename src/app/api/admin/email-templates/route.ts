import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getCurrentAdmin } from "@/lib/admin-auth";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("email_templates")
    .select("id, name, category, subject, body, created_at, updated_at")
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("[email-templates GET]", error);
    return NextResponse.json({ error: "Query failed" }, { status: 500 });
  }

  return NextResponse.json({ templates: data ?? [] });
}

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const category = typeof body.category === "string" ? body.category.trim() : "";
  const subject = typeof body.subject === "string" ? body.subject : "";
  const tplBody = typeof body.body === "string" ? body.body : "";

  if (!name || !category || !subject.trim() || !tplBody.trim()) {
    return NextResponse.json(
      { error: "name, category, subject, and body are required" },
      { status: 400 }
    );
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("email_templates")
    .insert({ name, category, subject, body: tplBody })
    .select("id, name, category, subject, body, created_at, updated_at")
    .single();

  if (error || !data) {
    console.error("[email-templates POST]", error);
    return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  }

  return NextResponse.json({ template: data });
}
