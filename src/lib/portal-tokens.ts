import { randomBytes, createHash } from "crypto";
import { createServerClient } from "@/lib/supabase";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://stratus-creative.com";

const ONE_HOUR_MS = 60 * 60 * 1000;
const ONE_DAY_MS = 24 * ONE_HOUR_MS;

export function hashPortalToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

/**
 * Create a portal token for a submission. Returns the raw token string and the
 * full sign-in URL. Only the sha256 hash is persisted — a DB read exposure does
 * not yield usable tokens. The raw token only ever exists in the URL.
 */
export async function createPortalToken(
  submissionId: string,
  ttlMs: number = ONE_HOUR_MS
): Promise<{ token: string; url: string } | null> {
  const supabase = createServerClient();
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashPortalToken(token);
  const expiresAt = new Date(Date.now() + ttlMs).toISOString();

  const { error } = await supabase.from("portal_tokens").insert({
    token_hash: tokenHash,
    submission_id: submissionId,
    expires_at: expiresAt,
  });

  if (error) {
    console.error("[portal-tokens] insert failed:", error);
    return null;
  }

  return {
    token,
    url: `${SITE_URL}/portal/${token}`,
  };
}

export const PORTAL_TOKEN_TTL_HOUR = ONE_HOUR_MS;
export const PORTAL_TOKEN_TTL_DAY = ONE_DAY_MS;
