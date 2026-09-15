import { requireAdmin } from "../../../../../../lib/admin-auth";
import { enqueueNotification, type NotificationTemplate } from "../../../../../../lib/notifications";
import { isOrderStatus, type OrderStatus } from "../../../../../../lib/order-operations";
import { getSupabaseServerClient } from "../../../../../../lib/supabase-server";

type AdminUser = { id: string; email: string };
type Authorize = (request: Request) => Promise<AdminUser | null>;
type TransitionInput = {
  orderNumber: string;
  toStatus: OrderStatus;
  message: string;
  actorUserId: string;
};
type TransitionResult =
  | { ok: true; status: OrderStatus }
  | { ok: false; status: number; error: string };
type Transition = (input: TransitionInput) => Promise<TransitionResult>;

function notificationTemplate(status: OrderStatus): NotificationTemplate {
  if (status === "balance_due") return "balance_due";
  if (status === "ready") return "ready";
  if (status === "shipped") return "shipped";
  if (status === "completed") return "completed";
  return "status_updated";
}

async function transitionWithSupabase(input: TransitionInput): Promise<TransitionResult> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.rpc("transition_order_status", {
    p_order_number: input.orderNumber,
    p_to_status: input.toStatus,
    p_message: input.message,
    p_actor_user_id: input.actorUserId,
  });

  if (error || !data?.[0]) {
    if (error?.message.includes("INVALID_STATUS_TRANSITION")) {
      return { ok: false, status: 409, error: "That status change is not allowed." };
    }
    if (error?.message.includes("ORDER_NOT_FOUND")) {
      return { ok: false, status: 404, error: "Order not found." };
    }
    return { ok: false, status: 500, error: "Unable to update order status." };
  }

  const { data: order } = await supabase
    .from("orders")
    .select("id,email,customer_name")
    .eq("order_number", input.orderNumber)
    .maybeSingle();
  if (order) {
    await enqueueNotification({
      orderId: order.id,
      recipient: order.email,
      template: notificationTemplate(input.toStatus),
      payload: {
        orderNumber: input.orderNumber,
        customerName: order.customer_name,
        message: input.message || undefined,
      },
    });
  }

  return { ok: true, status: input.toStatus };
}

export async function handleAdminStatusRequest(
  request: Request,
  orderNumber: string,
  authorize: Authorize = requireAdmin,
  transition: Transition = transitionWithSupabase,
): Promise<Response> {
  const admin = await authorize(request);
  if (!admin) return Response.json({ error: "Unauthorized." }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid status request." }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return Response.json({ error: "Invalid status request." }, { status: 400 });
  }
  const record = body as Record<string, unknown>;
  if (!isOrderStatus(record.toStatus)) {
    return Response.json({ error: "Choose a valid order status." }, { status: 400 });
  }
  const message = typeof record.message === "string" ? record.message.trim().slice(0, 500) : "";

  try {
    const result = await transition({
      orderNumber: orderNumber.trim().toUpperCase(),
      toStatus: record.toStatus,
      message,
      actorUserId: admin.id,
    });
    if (!result.ok) return Response.json({ error: result.error }, { status: result.status });
    return Response.json({ status: result.status }, { status: 200 });
  } catch {
    return Response.json({ error: "Unable to update order status." }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ orderNumber: string }> },
) {
  const { orderNumber } = await context.params;
  return handleAdminStatusRequest(request, orderNumber);
}
