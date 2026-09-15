export const GENERIC_LOOKUP_ERROR = "We couldn't verify that order.";

export type OrderLookup = {
  orderNumber: string;
  email: string;
};

export type OrderLookupValidation =
  | { ok: true; value: OrderLookup }
  | { ok: false; error: string };

type CustomerOrderSource = {
  order_number: string;
  quantity: number;
  fulfillment: string;
  total_amount: number;
  reservation_total: number;
  balance_total: number;
  status: string;
  hold_expires_at: string;
  mobile?: string;
};

type CustomerPaymentSource = {
  kind: string;
  status: string;
  admin_note?: string | null;
  proof_path?: string;
};

type CustomerEventSource = {
  event_type: string;
  title: string;
  message: string | null;
  to_status: string | null;
  customer_visible: boolean;
  created_at: string;
};

export function validateOrderLookup(input: unknown): OrderLookupValidation {
  if (!input || typeof input !== "object") {
    return { ok: false, error: GENERIC_LOOKUP_ERROR };
  }

  const record = input as Record<string, unknown>;
  if (typeof record.orderNumber !== "string" || typeof record.email !== "string") {
    return { ok: false, error: GENERIC_LOOKUP_ERROR };
  }

  const orderNumber = record.orderNumber.trim().toUpperCase();
  const email = record.email.trim().toLowerCase();

  if (!/^BB-[A-Z0-9]+-\d{3,}$/.test(orderNumber) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: GENERIC_LOOKUP_ERROR };
  }

  return { ok: true, value: { orderNumber, email } };
}

function paymentState(payments: CustomerPaymentSource[], kind: "reservation" | "balance") {
  const matches = payments.filter((payment) => payment.kind === kind);
  const approved = matches.find((payment) => payment.status === "approved");
  if (approved) return "approved";
  const pending = matches.find((payment) => payment.status === "pending");
  if (pending) return "pending";
  const rejected = matches.find((payment) => payment.status === "rejected");
  if (rejected) return "rejected";
  return "not_submitted";
}

export function mapCustomerOrder(
  order: CustomerOrderSource,
  payments: CustomerPaymentSource[],
  events: CustomerEventSource[],
) {
  return {
    orderNumber: order.order_number,
    quantity: order.quantity,
    fulfillment: order.fulfillment,
    totalAmount: order.total_amount,
    reservationTotal: order.reservation_total,
    balanceTotal: order.balance_total,
    status: order.status,
    holdExpiresAt: order.hold_expires_at,
    payments: {
      reservation: paymentState(payments, "reservation"),
      balance: paymentState(payments, "balance"),
    },
    events: events
      .filter((event) => event.customer_visible)
      .map((event) => ({
        type: event.event_type,
        title: event.title,
        message: event.message,
        status: event.to_status,
        createdAt: event.created_at,
      })),
  };
}
