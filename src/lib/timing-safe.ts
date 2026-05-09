import { timingSafeEqual } from "crypto";

/**
 * Constant-time string equality. Returns false for any length mismatch (which
 * is itself observable, but the secret is non-zero length and known to the
 * server, so attackers can't learn anything by varying input length).
 */
export function safeEqual(a: string | null | undefined, b: string): boolean {
  if (typeof a !== "string") return false;
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}
