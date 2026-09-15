import { getSupabaseServerClient } from "./supabase-server";

export type NotificationTemplate =
  | "preorder_created"
  | "proof_received"
  | "reservation_approved"
  | "payment_rejected"
  | "status_updated"
  | "balance_due"
  | "balance_approved"
  | "ready"
  | "shipped"
  | "completed";

export type NotificationPayload = {
  orderNumber: string;
  customerName?: string;
  message?: string;
};

export type NotificationMessage = {
  from: string;
  to: string;
  subject: string;
  html: string;
  apiKey: string;
};

type DeliveryRow = {
  recipient: string;
  template: NotificationTemplate;
  payload: NotificationPayload;
};

type ProviderConfig = { apiKey?: string; from?: string };
type ProviderSender = (message: NotificationMessage) => Promise<{ id: string }>;
type OrderLookup = (orderNumber: string) => Promise<string | null>;

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function resolveNotificationOrderId(
  explicitOrderId: string | null | undefined,
  orderNumber: string,
  lookup: OrderLookup,
) {
  if (explicitOrderId) return explicitOrderId;
  return lookup(orderNumber.trim().toUpperCase());
}

const COPY: Record<NotificationTemplate, { subject: string; heading: string; body: string }> = {
  preorder_created: { subject: "Brick Buddy preorder received", heading: "Preorder received", body: "Your preorder was created. Complete the reservation payment within the hold window to secure your slot." },
  proof_received: { subject: "Brick Buddy payment proof received", heading: "Payment proof received", body: "We received your payment proof and will review it before confirming the payment." },
  reservation_approved: { subject: "Brick Buddy reservation confirmed", heading: "Reservation confirmed", body: "Your reservation payment is approved and your Brick Buddy is secured in the batch." },
  payment_rejected: { subject: "Brick Buddy payment proof needs attention", heading: "Payment proof needs attention", body: "Your payment proof could not be approved. Please open your order tracker and submit a new proof." },
  status_updated: { subject: "Brick Buddy order updated", heading: "Order update", body: "There is a new update on your Brick Buddy order." },
  balance_due: { subject: "Brick Buddy balance is due", heading: "Balance due", body: "Your Brick Buddy has reached the balance-due stage. Open your order tracker for the latest details." },
  balance_approved: { subject: "Brick Buddy balance payment approved", heading: "Balance payment approved", body: "Your remaining balance payment proof has been approved." },
  ready: { subject: "Your Brick Buddy is ready", heading: "Ready for fulfillment", body: "Your Brick Buddy is ready for the selected fulfillment method." },
  shipped: { subject: "Your Brick Buddy has shipped", heading: "Order shipped", body: "Your Brick Buddy order has been marked as shipped." },
  completed: { subject: "Brick Buddy order completed", heading: "Order completed", body: "Your Brick Buddy order has been completed. Thank you for building with us." },
};

export function renderNotification(template: NotificationTemplate, payload: NotificationPayload) {
  const copy = COPY[template];
  const orderNumber = escapeHtml(payload.orderNumber);
  const customerName = payload.customerName ? escapeHtml(payload.customerName) : "there";
  const extra = payload.message ? `<p>${escapeHtml(payload.message)}</p>` : "";
  return {
    subject: `${copy.subject} • ${payload.orderNumber}`,
    html: `<div><p>Hi ${customerName},</p><h2>${copy.heading}</h2><p>${copy.body}</p>${extra}<p><strong>Order:</strong> ${orderNumber}</p><p>BRING • BUILD • BOND</p></div>`,
  };
}

async function sendWithResend(message: NotificationMessage): Promise<{ id: string }> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${message.apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: message.from,
      to: [message.to],
      subject: message.subject,
      html: message.html,
    }),
  });
  if (!response.ok) throw new Error("RESEND_DELIVERY_FAILED");
  const body = (await response.json()) as { id?: string };
  if (!body.id) throw new Error("RESEND_MESSAGE_ID_MISSING");
  return { id: body.id };
}

export async function attemptNotificationDelivery(
  row: DeliveryRow,
  config: ProviderConfig,
  sender: ProviderSender = sendWithResend,
) {
  if (!config.apiKey || !config.from) {
    return {
      status: "skipped" as const,
      providerMessageId: null,
      error: "Email provider is not configured.",
    };
  }

  const rendered = renderNotification(row.template, row.payload);
  try {
    const sent = await sender({
      from: config.from,
      to: row.recipient,
      subject: rendered.subject,
      html: rendered.html,
      apiKey: config.apiKey,
    });
    return { status: "sent" as const, providerMessageId: sent.id, error: null };
  } catch {
    return {
      status: "failed" as const,
      providerMessageId: null,
      error: "Email delivery failed.",
    };
  }
}

export async function deliverNotification(notificationId: string) {
  const supabase = getSupabaseServerClient();
  const { data: row, error } = await supabase
    .from("notification_outbox")
    .select("id,recipient,template,payload,attempt_count,status")
    .eq("id", notificationId)
    .maybeSingle();
  if (error || !row) return null;

  if (row.status === "sent") {
    return { status: "sent" as const, providerMessageId: null, error: null };
  }

  const result = await attemptNotificationDelivery(
    {
      recipient: row.recipient,
      template: row.template as NotificationTemplate,
      payload: row.payload as unknown as NotificationPayload,
    },
    { apiKey: process.env.RESEND_API_KEY, from: process.env.ORDER_EMAIL_FROM },
  );

  await supabase
    .from("notification_outbox")
    .update({
      status: result.status,
      attempt_count: row.attempt_count + 1,
      provider_message_id: result.providerMessageId,
      last_error: result.error,
      last_attempt_at: new Date().toISOString(),
    })
    .eq("id", row.id);

  return result;
}

export async function enqueueNotification(input: {
  orderId?: string | null;
  recipient: string;
  template: NotificationTemplate;
  payload: NotificationPayload;
}) {
  try {
    const supabase = getSupabaseServerClient();
    const orderId = await resolveNotificationOrderId(
      input.orderId,
      input.payload.orderNumber,
      async (orderNumber) => {
        const { data, error } = await supabase
          .from("orders")
          .select("id")
          .eq("order_number", orderNumber)
          .maybeSingle();
        if (error || !data) return null;
        return data.id;
      },
    );

    const { data, error } = await supabase
      .from("notification_outbox")
      .insert({
        order_id: orderId,
        recipient: input.recipient.trim().toLowerCase(),
        template: input.template,
        payload: JSON.parse(JSON.stringify(input.payload)),
      })
      .select("id")
      .single();
    if (error || !data) return null;
    await deliverNotification(data.id);
    return data.id;
  } catch {
    return null;
  }
}
