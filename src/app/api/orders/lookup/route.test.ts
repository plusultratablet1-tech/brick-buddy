import { describe, expect, it } from "vitest";
import { handleOrderLookupRequest } from "./route";

const validRequest = () =>
  new Request("http://localhost/api/orders/lookup", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ orderNumber: " bb-s2-001 ", email: " Parent@Example.com " }),
  });

const result = {
  order: {
    order_number: "BB-S2-001",
    quantity: 1,
    fulfillment: "shipping",
    total_amount: 449,
    reservation_total: 200,
    balance_total: 249,
    status: "reserved",
    hold_expires_at: "2026-09-16T09:00:00.000Z",
  },
  payments: [{ kind: "reservation", status: "approved" }],
  events: [
    {
      event_type: "status_changed",
      title: "Reservation confirmed",
      message: "Your slot is secured.",
      to_status: "reserved",
      customer_visible: true,
      created_at: "2026-09-15T09:10:00.000Z",
    },
  ],
};

describe("POST /api/orders/lookup", () => {
  it("normalizes credentials before lookup and returns a customer-safe order", async () => {
    let received: unknown;
    const response = await handleOrderLookupRequest(validRequest(), async (credentials) => {
      received = credentials;
      return result;
    });

    expect(received).toEqual({ orderNumber: "BB-S2-001", email: "parent@example.com" });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.order.orderNumber).toBe("BB-S2-001");
    expect(body.order.payments.reservation).toBe("approved");
    expect(JSON.stringify(body)).not.toContain("proof_path");
    expect(JSON.stringify(body)).not.toContain("admin_note");
  });

  it("uses the same generic response for invalid credentials", async () => {
    const request = new Request("http://localhost/api/orders/lookup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ orderNumber: "", email: "bad" }),
    });
    const response = await handleOrderLookupRequest(request, async () => result);
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "We couldn't verify that order." });
  });

  it("uses the same generic response when no matching order exists", async () => {
    const response = await handleOrderLookupRequest(validRequest(), async () => null);
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "We couldn't verify that order." });
  });

  it("does not expose lookup backend failures", async () => {
    const response = await handleOrderLookupRequest(validRequest(), async () => {
      throw new Error("sensitive database detail");
    });
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body).toEqual({ error: "We couldn't load that order right now. Please try again." });
    expect(JSON.stringify(body)).not.toContain("sensitive database detail");
  });
});
