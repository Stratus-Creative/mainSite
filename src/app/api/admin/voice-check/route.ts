import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { checkVoice } from "@/lib/voice-check";

const MAX_TEXT = 8_000;

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const text = body && typeof body.text === "string" ? body.text : "";
  if (!text.trim()) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }
  if (text.length > MAX_TEXT) {
    return NextResponse.json({ error: "text too long" }, { status: 400 });
  }

  const result = await checkVoice(text);
  return NextResponse.json(result);
}
