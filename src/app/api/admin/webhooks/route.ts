import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createServerClient } from "@/lib/supabase";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { EVENT_TYPES } from "@/lib/webhook-dispatch";
import { validateOutboundUrl } from "@/lib/url-safety";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("webhook_subscriptions")
    .select("id, url, label, events, active, secret, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[/api/admin/webhooks] list failed:", error);
    return NextResponse.json({ error: "Query failed" }, { status: 500 });
  }

  return NextResponse.json({ subscriptions: data ?? [] });
}

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const url = typeof body.url === "string" ? body.url.trim() : "";
  const label = typeof body.label === "string" ? body.label.trim() : "";
  const events = Array.isArray(body.events)
    ? body.events.filter(
        (e: unknown): e is string =>
          typeof e === "string" && (EVENT_TYPES as readonly string[]).includes(e)
      )
    : [];
  const secretInput = typeof body.secret === "string" ? body.secret.trim() : "";

  if (!url) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  const urlError = validateOutboundUrl(url);
  if (urlError) {
    return NextResponse.json({ error: urlError }, { status: 400 });
  }

  if (events.length === 0) {
    return NextResponse.json(
      { error: "at least one event is required" },
      { status: 400 }
    );
  }

  const secret = secretInput || randomBytes(24).toString("hex");

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("webhook_subscriptions")
    .insert({
      url,
      label: label || null,
      events,
      active: true,
      secret,
    })
    .select("id, url, label, events, active, secret, created_at")
    .single();

  if (error) {
    console.error("[/api/admin/webhooks] insert failed:", error);
    return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  }

  return NextResponse.json({ subscription: data });
}
