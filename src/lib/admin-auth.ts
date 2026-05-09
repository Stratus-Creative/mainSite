import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { createServerClient } from "./supabase";

const SESSION_COOKIE = "admin-session";
const SESSION_DAYS = 14;

export type AdminUser = {
  id: string;
  email: string;
  role: "admin" | "staff";
};

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

function expiryDate(): Date {
  const d = new Date();
  d.setDate(d.getDate() + SESSION_DAYS);
  return d;
}

/** Look up the current admin user from the session cookie. Returns null if no valid session. */
export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const supabase = createServerClient();
  const { data } = await supabase
    .from("admin_sessions")
    .select("expires_at, admin_users(id, email, role)")
    .eq("token", token)
    .maybeSingle();

  if (!data) return null;
  if (new Date(data.expires_at) < new Date()) return null;

  // Supabase returns admin_users as an object when it's a single FK lookup,
  // but the type system can model it as an array. Normalize it.
  const user = Array.isArray(data.admin_users) ? data.admin_users[0] : data.admin_users;
  if (!user) return null;

  // Fire-and-forget: touch the session's last_seen_at so the active sessions
  // view actually reflects current activity. Don't await.
  void (async () => {
    try {
      await supabase
        .from("admin_sessions")
        .update({ last_seen_at: new Date().toISOString() })
        .eq("token", token);
    } catch (err) {
      console.error("Failed to touch session last_seen_at:", err);
    }
  })();

  return { id: user.id, email: user.email, role: user.role };
}

/** Create a new session for the given user, set the cookie, and return the token. */
export async function createSession(
  userId: string,
  options: { ip?: string | null; userAgent?: string | null } = {}
): Promise<string> {
  const token = generateToken();
  const expires = expiryDate();
  const supabase = createServerClient();
  await supabase.from("admin_sessions").insert({
    token,
    user_id: userId,
    expires_at: expires.toISOString(),
    ip: options.ip ?? null,
    user_agent: options.userAgent ?? null,
    last_seen_at: new Date().toISOString(),
  });

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires,
    path: "/",
  });

  return token;
}

/** Destroy the current session and clear the cookie. */
export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    const supabase = createServerClient();
    await supabase.from("admin_sessions").delete().eq("token", token);
  }
  store.delete(SESSION_COOKIE);
}

/** Returns true if at least one admin user exists. Used to gate the setup flow. */
export async function adminUsersExist(): Promise<boolean> {
  const supabase = createServerClient();
  const { count } = await supabase
    .from("admin_users")
    .select("id", { count: "exact", head: true });
  return (count ?? 0) > 0;
}
