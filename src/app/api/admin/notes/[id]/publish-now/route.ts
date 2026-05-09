import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createServerClient } from "@/lib/supabase";
import { triggerDeploy } from "@/lib/deploy";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(_req: Request, { params }: Params) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("notes")
    .update({ published_at: new Date().toISOString() })
    .eq("id", id)
    .select("slug, title, description")
    .single();

  if (error) {
    console.error("[admin/notes/:id/publish-now] DB error:", error);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }

  // Fire deploy hook so the article goes live immediately
  await triggerDeploy();

  return NextResponse.json({ ok: true, slug: data.slug });
}
