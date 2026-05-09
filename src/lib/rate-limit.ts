import { createServerClient } from "@/lib/supabase";

export interface RateLimitOptions {
  bucket: string;
  max: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  count: number;
}

export async function checkRateLimit({
  bucket,
  max,
  windowMs,
}: RateLimitOptions): Promise<RateLimitResult> {
  const supabase = createServerClient();
  const since = new Date(Date.now() - windowMs).toISOString();

  const { count, error } = await supabase
    .from("rate_limits")
    .select("id", { count: "exact", head: true })
    .eq("bucket", bucket)
    .gte("ts", since);

  if (error) {
    console.error("Rate limit query failed:", error.message);
    return { allowed: true, count: 0 };
  }

  const used = count ?? 0;
  if (used >= max) return { allowed: false, count: used };

  await supabase.from("rate_limits").insert({ bucket });
  return { allowed: true, count: used + 1 };
}

/**
 * Returns the real client IP. On Vercel, prefers `x-vercel-forwarded-for`
 * (set by Vercel's edge, cannot be spoofed by the client). For other proxies,
 * takes the rightmost entry of `x-forwarded-for` — the proxy-set value rather
 * than the leftmost client-claimed value, which is trivially spoofable.
 *
 * Why: trusting the leftmost XFF lets any caller bypass rate limiting and
 * login throttles by sending `X-Forwarded-For: 1.2.3.4`.
 */
export function getClientIp(req: Request): string {
  const vercelIp = req.headers.get("x-vercel-forwarded-for");
  if (vercelIp) {
    const first = vercelIp.split(",")[0]?.trim();
    if (first) return first;
  }

  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",");
    const last = parts[parts.length - 1]?.trim();
    if (last) return last;
  }

  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();

  return "unknown";
}
