import { describe, expect, it } from "vitest";
import {
  attemptNotificationDelivery,
  escapeHtml,
  renderNotification,
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
