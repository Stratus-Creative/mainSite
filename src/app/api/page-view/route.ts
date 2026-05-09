import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

const FIELDS = {
  sessionId: 128,
  pageUrl: 1024,
  referrer: 1024,
  utm: 256,
};

function clampStr(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  if (!trimmed) return null;
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

function safeSession(v: unknown): string | null {
  const s = clampStr(v, FIELDS.sessionId);
  if (!s) return null;
  // Allow UUID-ish characters only
  return s.replace(/[^a-zA-Z0-9_\-]/g, "").slice(0, FIELDS.sessionId) || null;
}

function safePagePath(v: unknown): string | null {
  const s = clampStr(v, FIELDS.pageUrl);
  if (!s) return null;
  // Keep only path-safe chars; must start with `/`
  if (!s.startsWith("/")) return null;
  return s.replace(/[^a-zA-Z0-9/_\-.~%?&=]/g, "").slice(0, FIELDS.pageUrl);
}

function safeUtm(v: unknown): string | null {
  const s = clampStr(v, FIELDS.utm);
  if (!s) return null;
  return s.replace(/[^a-zA-Z0-9_\-.+]/g, "").slice(0, FIELDS.utm) || null;
}

function safeReferrer(v: unknown): string | null {
  const s = clampStr(v, FIELDS.referrer);
  if (!s) return null;
  // Validate against a URL parser; non-URLs become null.
  try {
    const u = new URL(s);
    return u.toString().slice(0, FIELDS.referrer);
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  // Always return 204 — never echo, never leak errors back to public callers.
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return new NextResponse(null, { status: 204 });
    }

    const sessionId = safeSession((body as Record<string, unknown>).sessionId);
    const pageUrl = safePagePath((body as Record<string, unknown>).pageUrl);

    if (!sessionId || !pageUrl) {
      return new NextResponse(null, { status: 204 });
    }

    const referrer = safeReferrer((body as Record<string, unknown>).referrer);
    const utmRaw =
      ((body as Record<string, unknown>).utm as Record<string, unknown>) ?? {};

    const row = {
      session_id: sessionId,
      page_url: pageUrl,
      referrer,
      utm_source: safeUtm(utmRaw.utm_source),
      utm_medium: safeUtm(utmRaw.utm_medium),
      utm_campaign: safeUtm(utmRaw.utm_campaign),
      utm_content: safeUtm(utmRaw.utm_content),
      utm_term: safeUtm(utmRaw.utm_term),
    };

    const supabase = createServerClient();
    const { error } = await supabase.from("page_views").insert(row);
    if (error) {
      console.error("[/api/page-view] insert failed:", error);
    }
  } catch (err) {
    console.error("[/api/page-view] threw:", err);
  }
  return new NextResponse(null, { status: 204 });
}
