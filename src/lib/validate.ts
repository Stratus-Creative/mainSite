const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isEmail(value: unknown): value is string {
  return typeof value === "string" && value.length <= 254 && EMAIL_REGEX.test(value);
}

export function clampString(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export function optionalString(value: unknown, max: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (trimmed.length === 0) return undefined;
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max);
}

export function safePath(value: unknown, max: number = 256): string {
  if (typeof value !== "string") return "/";
  const noQuery = value.split(/[?#]/)[0] ?? "/";
  const safe = noQuery.replace(/[^a-zA-Z0-9/_\-.]/g, "");
  if (!safe.startsWith("/")) return "/";
  return safe.slice(0, max);
}

export function safeSessionId(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/[^a-zA-Z0-9_\-]/g, "").slice(0, 64);
}
