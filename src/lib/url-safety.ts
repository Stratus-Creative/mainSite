/**
 * URL safety helpers — used to validate destinations for outbound HTTP calls
 * (e.g. user-configured webhook URLs) to prevent SSRF against private network
 * ranges, cloud metadata services, and loopback.
 */

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "ip6-localhost",
  "ip6-loopback",
]);

const BLOCKED_HOST_SUFFIXES = [".local", ".internal", ".localhost"];

function isPrivateIPv4(host: string): boolean {
  const m = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return false;
  const [a, b] = [Number(m[1]), Number(m[2])];
  if (a === 10) return true; // 10.0.0.0/8
  if (a === 127) return true; // loopback
  if (a === 0) return true; // 0.0.0.0/8
  if (a === 169 && b === 254) return true; // link-local + AWS/GCP/Azure IMDS
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
  if (a === 192 && b === 168) return true; // 192.168.0.0/16
  if (a === 100 && b >= 64 && b <= 127) return true; // 100.64.0.0/10 CGNAT
  if (a >= 224) return true; // multicast + reserved
  return false;
}

function isPrivateIPv6(host: string): boolean {
  // hostname comes wrapped in [...] from URL parser; strip brackets
  const h = host.replace(/^\[|\]$/g, "").toLowerCase();
  if (h === "::1" || h === "::") return true;
  if (h.startsWith("fc") || h.startsWith("fd")) return true; // unique local
  if (h.startsWith("fe80:") || h.startsWith("fe9") || h.startsWith("fea") || h.startsWith("feb")) return true; // link-local fe80::/10
  return false;
}

/**
 * Returns null if the URL is safe for outbound fetch, or an error message
 * describing why it was rejected. Only http(s) is accepted.
 */
export function validateOutboundUrl(raw: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return "url is invalid";
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return "url must be http(s)";
  }

  const hostname = parsed.hostname.toLowerCase();
  if (!hostname) return "url has no host";

  if (BLOCKED_HOSTNAMES.has(hostname)) {
    return "url targets a blocked host";
  }
  if (BLOCKED_HOST_SUFFIXES.some((s) => hostname.endsWith(s))) {
    return "url targets a blocked host";
  }
  if (isPrivateIPv4(hostname)) {
    return "url targets a private network";
  }
  if (hostname.includes(":") && isPrivateIPv6(hostname)) {
    return "url targets a private network";
  }

  return null;
}
