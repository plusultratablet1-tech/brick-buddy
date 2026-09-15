import { createClient } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "./supabase-server";

export const ADMIN_COOKIE = "brick_buddy_admin";
export const ADMIN_AUTH_ERROR = "Invalid admin credentials.";

export type AdminCredentials = { email: string; password: string };

export function validateAdminCredentials(input: unknown):
  | { ok: true; value: AdminCredentials }
  | { ok: false; error: string } {
  if (!input || typeof input !== "object") {
    return { ok: false, error: ADMIN_AUTH_ERROR };
  }
  const record = input as Record<string, unknown>;
  if (typeof record.email !== "string" || typeof record.password !== "string") {
    return { ok: false, error: ADMIN_AUTH_ERROR };
  }
  const email = record.email.trim().toLowerCase();
  const password = record.password;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8 || password.length > 256) {
    return { ok: false, error: ADMIN_AUTH_ERROR };
  }
  return { ok: true, value: { email, password } };
}

function getAuthClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase auth configuration is missing.");
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
}

export async function signInAdmin(credentials: AdminCredentials) {
  const auth = getAuthClient();
  const { data, error } = await auth.auth.signInWithPassword(credentials);
  if (error || !data.user || !data.session) return null;

  const server = getSupabaseServerClient();
  const { data: admin, error: adminError } = await server
    .from("admin_users")
    .select("user_id,email,is_active")
    .eq("user_id", data.user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (adminError || !admin) return null;
  return {
    user: { id: data.user.id, email: data.user.email ?? admin.email },
    accessToken: data.session.access_token,
    expiresIn: data.session.expires_in,
  };
}

function readCookie(request: Request, name: string) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  for (const part of cookieHeader.split(";")) {
    const [rawName, ...rawValue] = part.trim().split("=");
    if (rawName === name) return decodeURIComponent(rawValue.join("="));
  }
  return null;
}

export async function requireAdmin(request: Request) {
  const token = readCookie(request, ADMIN_COOKIE);
  if (!token) return null;

  try {
    const auth = getAuthClient();
    const { data, error } = await auth.auth.getUser(token);
    if (error || !data.user) return null;

    const server = getSupabaseServerClient();
    const { data: admin, error: adminError } = await server
      .from("admin_users")
      .select("user_id,email,is_active")
      .eq("user_id", data.user.id)
      .eq("is_active", true)
      .maybeSingle();
    if (adminError || !admin) return null;

    return { id: data.user.id, email: data.user.email ?? admin.email };
  } catch {
    return null;
  }
}

export function adminCookieHeader(token: string, maxAge: number) {
  return `${ADMIN_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${Math.max(60, Math.floor(maxAge))}`;
}

export function clearAdminCookieHeader() {
  return `${ADMIN_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}
