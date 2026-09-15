import { describe, expect, it } from "vitest";
import { escapeHtml, renderNotification } from "./notifications";

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
});
