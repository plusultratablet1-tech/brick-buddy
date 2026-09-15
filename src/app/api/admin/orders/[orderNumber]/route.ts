import { requireAdmin } from "../../../../../../lib/admin-auth";
import { getAdminOrderDetail } from "../../../../../../lib/admin-orders";

export async function GET(
  request: Request,
  context: { params: Promise<{ orderNumber: string }> },
) {
  const admin = await requireAdmin(request);
  if (!admin) return Response.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const { orderNumber } = await context.params;
    const detail = await getAdminOrderDetail(orderNumber);
    if (!detail) return Response.json({ error: "Order not found." }, { status: 404 });
    return Response.json(detail, { status: 200, headers: { "cache-control": "no-store" } });
  } catch {
    return Response.json({ error: "Unable to load order." }, { status: 500 });
  }
}
