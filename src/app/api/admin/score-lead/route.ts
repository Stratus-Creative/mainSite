import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { scoreSubmission } from "@/lib/lead-scoring";

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const id = typeof body.id === "string" ? body.id : null;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data: submission, error: fetchError } = await supabase
    .from("submissions")
    .select(
      "id, owner_name, business_name, email, source, project_type, budget, message, website_url, concern"
    )
    .eq("id", id)
    .single();

  if (fetchError || !submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  const score = await scoreSubmission(submission);
  if (!score) {
    return NextResponse.json({ error: "Scoring failed" }, { status: 500 });
  }

  const { error: updateError } = await supabase
    .from("submissions")
    .update({ lead_score: score })
    .eq("id", id);

  if (updateError) {
    console.error("[score-lead] update failed:", updateError);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, score });
}
