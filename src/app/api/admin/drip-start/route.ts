import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { SEQUENCES, isValidSequenceType } from "@/lib/drip-sequences";

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { submissionId, sequenceType } = await request.json();
  if (!submissionId || typeof submissionId !== "string") {
    return NextResponse.json({ error: "Missing submissionId" }, { status: 400 });
  }
  if (!sequenceType || !isValidSequenceType(sequenceType)) {
    return NextResponse.json({ error: "Invalid sequenceType" }, { status: 400 });
  }

  const supabase = createServerClient();

  // Cancel any active sequences on this submission first — only one runs at a time.
  await supabase
    .from("drip_sequences")
    .update({ cancelled_at: new Date().toISOString() })
    .eq("submission_id", submissionId)
    .is("cancelled_at", null)
    .is("completed_at", null);

  const firstStep = SEQUENCES[sequenceType][0];
  const nextSendAt = new Date();
  nextSendAt.setUTCDate(nextSendAt.getUTCDate() + firstStep.delayDays);

  const { data, error } = await supabase
    .from("drip_sequences")
    .insert({
      submission_id: submissionId,
      sequence_type: sequenceType,
      current_step: 0,
      next_send_at: nextSendAt.toISOString(),
    })
    .select("id, sequence_type, current_step, next_send_at")
    .single();

  if (error) {
    console.error("[drip-start] insert failed:", error);
    return NextResponse.json({ error: "insert_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, sequence: data });
}
