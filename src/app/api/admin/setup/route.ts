import { validateAdminCredentials, type AdminCredentials } from "@/lib/admin-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";

type CreateAdminResult = { ok: true } | { ok: false };
type SetupDependencies = {
  environment?: string;
  hasActiveAdmin?: () => Promise<boolean>;
  createAdmin?: (credentials: AdminCredentials) => Promise<CreateAdminResult>;
};

function currentEnvironment() {
  if (process.env.VERCEL_ENV) return process.env.VERCEL_ENV;
  return process.env.NODE_ENV === "development" ? "development" : "production";
}

async function hasActiveAdminWithSupabase() {
  const supabase = getSupabaseServerClient();
  const { count, error } = await supabase
    .from("admin_users")
    .select("user_id", { count: "exact", head: true })
    .eq("is_active", true);
  if (error) throw error;
  return (count ?? 0) > 0;
}

async function createAdminWithSupabase(credentials: AdminCredentials): Promise<CreateAdminResult> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email: credentials.email,
    password: credentials.password,
    email_confirm: true,
  });
  if (error || !data.user) return { ok: false };

  const { error: allowlistError } = await supabase.from("admin_users").insert({
    user_id: data.user.id,
    email: credentials.email,
    is_active: true,
  });

  if (allowlistError) {
    await supabase.auth.admin.deleteUser(data.user.id).catch(() => null);
    return { ok: false };
  }

  return { ok: true };
}

export async function handleAdminSetupRequest(
  request: Request,
  dependencies: SetupDependencies = {},
): Promise<Response> {
  const environment = dependencies.environment ?? currentEnvironment();
  if (environment !== "preview" && environment !== "development") {
    return Response.json({ error: "Not found." }, { status: 404 });
  }

  const hasActiveAdmin = dependencies.hasActiveAdmin ?? hasActiveAdminWithSupabase;
  const createAdmin = dependencies.createAdmin ?? createAdminWithSupabase;

  try {
    if (await hasActiveAdmin()) {
      return Response.json({ error: "Admin setup is already complete." }, { status: 409 });
    }
  } catch {
    return Response.json({ error: "Unable to check admin setup." }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Enter a valid admin email and password." }, { status: 400 });
  }

  const validation = validateAdminCredentials(body);
  if (!validation.ok) {
    return Response.json({ error: "Enter a valid admin email and password." }, { status: 400 });
  }

  try {
    const result = await createAdmin(validation.value);
    if (!result.ok) {
      return Response.json({ error: "Unable to create the admin account." }, { status: 500 });
    }
    return Response.json({ ok: true }, { status: 201 });
  } catch {
    return Response.json({ error: "Unable to create the admin account." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return handleAdminSetupRequest(request);
}
