import { getSupabaseServerClient } from "./supabase-server";
import { getAllowedTransitions, isOrderStatus } from "./order-operations";

export type AdminOrderListOptions = { search?: string; status?: string };

export async function listAdminOrders(options: AdminOrderListOptions = {}) {
  const supabase = getSupabaseServerClient();
  let query = supabase
    .from("orders")
    .select("order_number,customer_name,email,mobile,quantity,fulfillment,total_amount,reservation_total,balance_total,status,hold_expires_at,created_at,updated_at")
    .order("created_at", { ascending: false });

  const status = options.status?.trim();
  if (status && isOrderStatus(status)) query = query.eq("status", status);

  const search = options.search?.trim();
  if (search) {
    const safe = search.replace(/[,%()]/g, " ").trim();
    if (safe) {
      query = query.or(
        `order_number.ilike.%${safe}%,customer_name.ilike.%${safe}%,email.ilike.%${safe}%,mobile.ilike.%${safe}%`,
      );
    }
  }

  const { data, error } = await query.limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function getAdminOrderDetail(orderNumber: string) {
  const supabase = getSupabaseServerClient();
  const normalized = orderNumber.trim().toUpperCase();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("order_number", normalized)
    .maybeSingle();
  if (orderError) throw orderError;
  if (!order) return null;

  const [{ data: payments, error: paymentsError }, { data: events, error: eventsError }, { data: notifications, error: notificationsError }] =
    await Promise.all([
      supabase.from("payments").select("*").eq("order_id", order.id).order("submitted_at", { ascending: false }),
      supabase.from("order_events").select("*").eq("order_id", order.id).order("created_at", { ascending: true }),
      supabase.from("notification_outbox").select("id,recipient,template,status,attempt_count,last_error,last_attempt_at,created_at").eq("order_id", order.id).order("created_at", { ascending: false }),
    ]);
  if (paymentsError || eventsError || notificationsError) {
    throw paymentsError ?? eventsError ?? notificationsError;
  }

  const paymentViews = await Promise.all(
    (payments ?? []).map(async (payment) => {
      const { data: signed } = await supabase.storage
        .from("payment-proofs")
        .createSignedUrl(payment.proof_path, 600);
      return {
        ...payment,
        proof_path: undefined,
        proofUrl: signed?.signedUrl ?? null,
      };
    }),
  );

  const balanceApproved = (payments ?? []).some(
    (payment) => payment.kind === "balance" && payment.status === "approved",
  );

  return {
    order,
    payments: paymentViews,
    events: events ?? [],
    notifications: notifications ?? [],
    allowedTransitions: isOrderStatus(order.status)
      ? getAllowedTransitions(order.status, { balanceApproved })
      : [],
  };
}
