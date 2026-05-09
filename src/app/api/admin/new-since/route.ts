import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getCurrentAdmin } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const since = url.searchParams.get("since");
  if (!since || Number.isNaN(new Date(since).getTime())) {
    return NextResponse.json({ error: "Missing or invalid 'since'" }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data, error, count } = await supabase
    .from("submissions")
    .select("id, created_at", { count: "exact" })
    .gt("created_at", since)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    console.error("new-since query failed:", error);
    return NextResponse.json({ error: "Query failed" }, { status: 500 });
  }

  const latestId = data && data.length > 0 ? data[0].id : undefined;
  return NextResponse.json({ count: count ?? 0, latestId });
}
