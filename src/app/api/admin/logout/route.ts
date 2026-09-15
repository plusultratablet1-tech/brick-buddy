import { clearAdminCookieHeader } from "../../../../lib/admin-auth";

export async function POST() {
  return Response.json(
    { success: true },
    {
      status: 200,
      headers: { "set-cookie": clearAdminCookieHeader() },
    },
  );
}
