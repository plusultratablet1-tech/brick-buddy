import { describe, expect, it } from "vitest";
import {
  attemptNotificationDelivery,
  escapeHtml,
  renderNotification,
  resolveNotificationOrderId,
} from "./notifications";

describe("notifications", () => {
  it("renders an order-specific reservation approval email", () => {
    const rendered = renderNotification("reservation_approved", {
      orderNumber: "BB-S2-001",
      customerName: "Juan",
    });
    expect(rendered.subject).toContain("BB-S2-001");
    expect(rendered.html).toContain("Reservation confirmed");
  });

  it("renders all launch templates", () => {
    for (const template of [
      "preorder_created",
      "proof_received",
      "reservation_approved",
      "payment_rejected",
      "status_updated",
      "balance_due",
      "balance_approved",
      "ready",
      "shipped",
      "completed",
    ] as const) {
      expect(renderNotification(template, { orderNumber: "BB-S2-001" }).subject.length).toBeGreaterThan(0);
    }
  });

  it("escapes customer-controlled HTML", () => {
    expect(escapeHtml('<img src=x onerror="bad">')).toBe("&lt;img src=x onerror=&quot;bad&quot;&gt;");
    expect(renderNotification("status_updated", {
      orderNumber: "BB-S2-001",
      message: "<script>alert(1)</script>",
    }).html).not.toContain("<script>");
  });

  it("links a notification to its order when no order id was supplied", async () => {
    let lookedUp = "";
    const orderId = await resolveNotificationOrderId(null, "BB-S2-001", async (orderNumber) => {
      lookedUp = orderNumber;
      return "order-123";
    });
    expect(lookedUp).toBe("BB-S2-001");
    expect(orderId).toBe("order-123");
  });

  it("keeps an explicit order id without doing another lookup", async () => {
    let calls = 0;
    const orderId = await resolveNotificationOrderId("order-123", "BB-S2-001", async () => {
      calls += 1;
      return "wrong";
    });
    expect(calls).toBe(0);
    expect(orderId).toBe("order-123");
  });

  it("skips delivery when email provider configuration is missing", async () => {
    const result = await attemptNotificationDelivery(
      {
        recipient: "parent@example.com",
        template: "preorder_created",
        payload: { orderNumber: "BB-S2-001" },
      },
      { apiKey: undefined, from: undefined },
      async () => ({ id: "never" }),
    );
    expect(result).toEqual({
      status: "skipped",
      providerMessageId: null,
      error: "Email provider is not configured.",
    });
  });

  it("records a successful provider message id", async () => {
    const result = await attemptNotificationDelivery(
      {
        recipient: "parent@example.com",
        template: "reservation_approved",
        payload: { orderNumber: "BB-S2-001" },
      },
      { apiKey: "key", from: "Brick Buddy <orders@example.com>" },
      async (message) => {
        expect(message.to).toBe("parent@example.com");
        return { id: "resend-1" };
      },
    );
    expect(result).toEqual({ status: "sent", providerMessageId: "resend-1", error: null });
  });

  it("records provider failure without throwing", async () => {
    const result = await attemptNotificationDelivery(
      {
        recipient: "parent@example.com",
        template: "status_updated",
        payload: { orderNumber: "BB-S2-001" },
      },
      { apiKey: "key", from: "orders@example.com" },
      async () => {
        throw new Error("provider exploded");
      },
    );
    expect(result.status).toBe("failed");
    expect(result.providerMessageId).toBeNull();
    expect(result.error).toBe("Email delivery failed.");
  });
});
