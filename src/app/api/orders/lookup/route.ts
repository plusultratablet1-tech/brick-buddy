import {
  GENERIC_LOOKUP_ERROR,
  mapCustomerOrder,
  type OrderLookup,
  validateOrderLookup,
} from "../../../../lib/order-tracking";
import {
  getPublicPaymentSettings,
  type PublicPaymentSettings,
} from "../../../../lib/payment-settings";
import { getSupabaseServerClient } from "../../../../lib/supabase-server";

type LookupResult = {
  order: {
    order_number: string;
    quantity: number;
    fulfillment: string;
    total_amount: number;
    reservation_total: number;
    balance_total: number;
    status: string;
    hold_expires_at: string;
  };
  payments: { kind: string; status: string }[];
  events: {
    event_type: string;
    title: string;
    message: string | null;
    to_status: string | null;
    customer_visible: boolean;
    created_at: string;
  }[];
};

type LookupOrder = (credentials: OrderLookup) => Promise<LookupResult | null>;
type LoadPaymentSettings = () => Promise<PublicPaymentSettings | null>;

async function lookupOrderWithSupabase(credentials: OrderLookup): Promise<LookupResult | null> {
  const supabase = getSupabaseServerClient();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id,order_number,quantity,fulfillment,total_amount,reservation_total,balance_total,status,hold_expires_at")
    .eq("order_number", credentials.orderNumber)
    .eq("email", credentials.email)
    .maybeSingle();

  if (orderError) throw new Error("ORDER_LOOKUP_FAILED");
  if (!order) return null;

  const [{ data: payments, error: paymentsError }, { data: events, error: eventsError }] =
    await Promise.all([
      supabase
        .from("payments")
        .select("kind,status")
        .eq("order_id", order.id)
        .order("submitted_at", { ascending: false }),
      supabase
        .from("order_events")
        .select("event_type,title,message,to_status,customer_visible,created_at")
        .eq("order_id", order.id)
        .eq("customer_visible", true)
        .order("created_at", { ascending: true }),
    ]);

  if (paymentsError || eventsError) throw new Error("ORDER_LOOKUP_FAILED");

  return {
    order,
    payments: payments ?? [],
    events: events ?? [],
  };
}

export async function handleOrderLookupRequest(
  request: Request,
  lookupOrder: LookupOrder = lookupOrderWithSupabase,
  loadPaymentSettings: LoadPaymentSettings = getPublicPaymentSettings,
): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: GENERIC_LOOKUP_ERROR }, { status: 404 });
  }

  const validation = validateOrderLookup(body);
  if (!validation.ok) {
    return Response.json({ error: GENERIC_LOOKUP_ERROR }, { status: 404 });
  }

  try {
    const result = await lookupOrder(validation.value);
    if (!result) {
      return Response.json({ error: GENERIC_LOOKUP_ERROR }, { status: 404 });
    }

    const order = mapCustomerOrder(result.order, result.payments, result.events);
    const reservationDue =
      order.status === "awaiting_payment" &&
      ["not_submitted", "rejected"].includes(order.payments.reservation);
    const balanceDue =
      order.status === "balance_due" &&
      ["not_submitted", "rejected"].includes(order.payments.balance);

    let paymentInstructions: PublicPaymentSettings | null = null;
    if (reservationDue || balanceDue) {
      try {
        paymentInstructions = await loadPaymentSettings();
      } catch {
        // Order tracking remains available even if payment settings are temporarily unavailable.
      }
    }

    return Response.json(
      { order: { ...order, paymentInstructions } },
      { status: 200 },
    );
  } catch {
    return Response.json(
      { error: "We couldn't load that order right now. Please try again." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  return handleOrderLookupRequest(request);
}
