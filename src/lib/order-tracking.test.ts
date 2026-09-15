import { describe, expect, it } from "vitest";
import { mapCustomerOrder, validateOrderLookup } from "./order-tracking";

describe("order tracking", () => {
  it("normalizes order number and email", () => {
    expect(
      validateOrderLookup({
        orderNumber: " bb-s2-001 ",
        email: " Parent@Example.COM ",
      }),
    ).toEqual({
      ok: true,
      value: { orderNumber: "BB-S2-001", email: "parent@example.com" },
    });
  });

  it("rejects incomplete lookup credentials with a generic message", () => {
    expect(validateOrderLookup({ orderNumber: "", email: "" })).toEqual({
      ok: false,
      error: "We couldn't verify that order.",
    });
  });

  it("maps only customer-safe order fields and visible events", () => {
    const mapped = mapCustomerOrder(
      {
        order_number: "BB-S2-001",
        quantity: 1,
        fulfillment: "shipping",
        total_amount: 449,
        reservation_total: 200,
        balance_total: 249,
        status: "reserved",
        hold_expires_at: "2026-09-16T09:00:00.000Z",
        mobile: "09170000000",
      },
      [
        { kind: "reservation", status: "approved", admin_note: "internal", proof_path: "private/x.png" },
      ],
      [
        {
          event_type: "status_changed",
          title: "Reservation confirmed",
          message: "Your slot is secured.",
          to_status: "reserved",
          customer_visible: true,
          created_at: "2026-09-15T09:10:00.000Z",
        },
        {
          event_type: "admin_note",
          title: "Internal",
          message: "Do not expose",
          to_status: null,
          customer_visible: false,
          created_at: "2026-09-15T09:11:00.000Z",
        },
      ],
    );

    expect(mapped).toEqual({
      orderNumber: "BB-S2-001",
      quantity: 1,
      fulfillment: "shipping",
      totalAmount: 449,
      reservationTotal: 200,
      balanceTotal: 249,
      status: "reserved",
      holdExpiresAt: "2026-09-16T09:00:00.000Z",
      payments: { reservation: "approved", balance: "not_submitted" },
      events: [
        {
          type: "status_changed",
          title: "Reservation confirmed",
          message: "Your slot is secured.",
          status: "reserved",
          createdAt: "2026-09-15T09:10:00.000Z",
        },
      ],
    });

    expect(mapped).not.toHaveProperty("mobile");
    expect(JSON.stringify(mapped)).not.toContain("internal");
    expect(JSON.stringify(mapped)).not.toContain("private/x.png");
  });
});
