import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getCurrentAdmin } from "@/lib/admin-auth";

const EXPORT_COLUMNS = [
  "id",
  "created_at",
  "status",
  "source",
  "owner_name",
  "business_name",
  "email",
  "phone",
  "project_type",
  "budget",
  "timeline",
  "quoted_amount",
  "quoted_at",
  "next_followup_at",
  "snoozed_until",
  "lost_reason",
  "lost_notes",
  "scoped_hours",
  "actual_hours",
  "tags",
] as const;

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  let str: string;
  if (Array.isArray(value)) {
    str = value.join("; ");
  } else if (typeof value === "object") {
    str = JSON.stringify(value);
  } else {
    str = String(value);
  }
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("submissions")
    .select(EXPORT_COLUMNS.join(", "))
    .order("created_at", { ascending: false });

  if (error) {
    console.error("CSV export query failed:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }

  const rows = ((data ?? []) as unknown) as Array<Record<string, unknown>>;
  const header = EXPORT_COLUMNS.join(",");
  const body = rows
    .map((row) => EXPORT_COLUMNS.map((col) => csvEscape(row[col])).join(","))
    .join("\n");
  const csv = `${header}\n${body}\n`;

  const today = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="stratus-submissions-${today}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
