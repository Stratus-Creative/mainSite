import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getCurrentAdmin } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { submissionId, body } = await request.json();

  if (!submissionId || typeof body !== "string" || !body.trim()) {
    return NextResponse.json(
      { error: "submissionId and body are required" },
      { status: 400 }
    );
  }

  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("submission_notes")
    .insert({
      submission_id: submissionId,
      author_id: admin.id,
      body: body.trim(),
    })
    .select("id, body, created_at")
    .single();

  if (error || !data) {
    console.error("Add note failed:", error);
    return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  }

  return NextResponse.json({
    id: data.id,
    body: data.body,
    created_at: data.created_at,
    author_email: admin.email,
  });
}
