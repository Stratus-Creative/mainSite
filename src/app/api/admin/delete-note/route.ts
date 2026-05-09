import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getCurrentAdmin } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await request.json();

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const supabase = createServerClient();

  // Authorization: staff can only delete their own notes; admins can delete any.
  const deleteQuery = supabase.from("submission_notes").delete().eq("id", id);
  if (admin.role !== "admin") {
    deleteQuery.eq("author_id", admin.id);
  }
  const { error } = await deleteQuery;

  if (error) {
    console.error("Delete note failed:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
