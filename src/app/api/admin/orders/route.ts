import { requireAdmin } from "@/lib/admin-auth";
import { listAdminOrders } from "@/lib/admin-orders";

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return Response.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const url = new URL(request.url);
    const orders = await listAdminOrders({
      search: url.searchParams.get("q") ?? undefined,
      status: url.searchParams.get("status") ?? undefined,
    });
    return Response.json({ orders }, { status: 200, headers: { "cache-control": "no-store" } });
  } catch {
    return Response.json({ error: "Unable to load orders." }, { status: 500 });
  }
}
