import {
  ADMIN_AUTH_ERROR,
  adminCookieHeader,
  signInAdmin,
  type AdminCredentials,
  validateAdminCredentials,
} from "../../../../lib/admin-auth";

type AdminSignIn = (credentials: AdminCredentials) => ReturnType<typeof signInAdmin>;

export async function handleAdminLoginRequest(
  request: Request,
  signIn: AdminSignIn = signInAdmin,
): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: ADMIN_AUTH_ERROR }, { status: 401 });
  }

  const validation = validateAdminCredentials(body);
  if (!validation.ok) {
    return Response.json({ error: ADMIN_AUTH_ERROR }, { status: 401 });
  }

  try {
    const result = await signIn(validation.value);
    if (!result) {
      return Response.json({ error: ADMIN_AUTH_ERROR }, { status: 401 });
    }

    return Response.json(
      { user: { email: result.user.email } },
      {
        status: 200,
        headers: { "set-cookie": adminCookieHeader(result.accessToken, result.expiresIn) },
      },
    );
  } catch {
    return Response.json({ error: ADMIN_AUTH_ERROR }, { status: 401 });
  }
}

export async function POST(request: Request) {
  return handleAdminLoginRequest(request);
}
