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

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const COPY: Record<NotificationTemplate, { subject: string; heading: string; body: string }> = {
  preorder_created: {
    subject: "Brick Buddy preorder received",
    heading: "Preorder received",
    body: "Your preorder was created. Complete the reservation payment within the hold window to secure your slot.",
  },
  proof_received: {
    subject: "Brick Buddy payment proof received",
    heading: "Payment proof received",
    body: "We received your payment proof and will review it before confirming the payment.",
  },
  reservation_approved: {
    subject: "Brick Buddy reservation confirmed",
    heading: "Reservation confirmed",
    body: "Your reservation payment is approved and your Brick Buddy is secured in the batch.",
  },
  payment_rejected: {
    subject: "Brick Buddy payment proof needs attention",
    heading: "Payment proof needs attention",
    body: "Your payment proof could not be approved. Please open your order tracker and submit a new proof.",
  },
  status_updated: {
    subject: "Brick Buddy order updated",
    heading: "Order update",
    body: "There is a new update on your Brick Buddy order.",
  },
  balance_due: {
    subject: "Brick Buddy balance is due",
    heading: "Balance due",
    body: "Your Brick Buddy has reached the balance-due stage. Open your order tracker for the latest details.",
  },
  balance_approved: {
    subject: "Brick Buddy balance payment approved",
    heading: "Balance payment approved",
    body: "Your remaining balance payment proof has been approved.",
  },
  ready: {
    subject: "Your Brick Buddy is ready",
    heading: "Ready for fulfillment",
    body: "Your Brick Buddy is ready for the selected fulfillment method.",
  },
  shipped: {
    subject: "Your Brick Buddy has shipped",
    heading: "Order shipped",
    body: "Your Brick Buddy order has been marked as shipped.",
  },
  completed: {
    subject: "Brick Buddy order completed",
    heading: "Order completed",
    body: "Your Brick Buddy order has been completed. Thank you for building with us.",
  },
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
