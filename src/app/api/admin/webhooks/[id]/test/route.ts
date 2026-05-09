import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import { createServerClient } from "@/lib/supabase";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { validateOutboundUrl } from "@/lib/url-safety";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Ctx) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("webhook_subscriptions")
    .select("id, url, secret")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  // Re-validate the URL on every test — defense-in-depth in case a row was
  // inserted directly to the DB or before the validation rules existed.
  const urlError = validateOutboundUrl(data.url);
  if (urlError) {
    return NextResponse.json({ ok: false, error: urlError }, { status: 400 });
  }

  const body = JSON.stringify({
    event: "test",
    timestamp: new Date().toISOString(),
    data: {
      message: "Hello from Stratus webhooks",
      from: admin.email,
    },
  });

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "User-Agent": "Stratus-Creative-Webhook/1",
  };
  if (data.secret) {
    headers["X-Stratus-Signature"] =
      "sha256=" + createHmac("sha256", data.secret).update(body).digest("hex");
  }

  const start = Date.now();
  try {
    const res = await fetch(data.url, {
      method: "POST",
      headers,
      body,
    });
    const latencyMs = Date.now() - start;
    if (!res.ok) {
      return NextResponse.json({
        ok: false,
        status: res.status,
        latencyMs,
        error: `HTTP ${res.status}`,
      });
    }
    return NextResponse.json({ ok: true, status: res.status, latencyMs });
  } catch (err) {
    const latencyMs = Date.now() - start;
    return NextResponse.json({
      ok: false,
      latencyMs,
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
}
