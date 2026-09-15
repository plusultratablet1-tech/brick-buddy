import { describe, expect, it } from "vitest";
import { handleAdminPaymentReviewRequest } from "./route";

function request(body: unknown) {
  return new Request("http://localhost/api/admin/orders/BB-S2-001/payments/pay-1/review", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST admin payment review", () => {
  it("requires an active admin", async () => {
    let calls = 0;
    const response = await handleAdminPaymentReviewRequest(
      request({ action: "approved" }),
      "BB-S2-001",
      "pay-1",
      async () => null,
      async () => {
        calls += 1;
        return { ok: true, paymentStatus: "approved", orderStatus: "reserved" };
      },
    );
    expect(response.status).toBe(401);
    expect(calls).toBe(0);
  });

  it("rejects an invalid review action", async () => {
    const response = await handleAdminPaymentReviewRequest(
      request({ action: "maybe" }),
      "BB-S2-001",
      "pay-1",
      async () => ({ id: "admin-1", email: "admin@example.com" }),
      async () => ({ ok: true, paymentStatus: "approved", orderStatus: "reserved" }),
    );
    expect(response.status).toBe(400);
  });

  it("returns reviewed payment and order state", async () => {
    const response = await handleAdminPaymentReviewRequest(
      request({ action: "approved", adminNote: "Verified GCash" }),
      "bb-s2-001",
      "pay-1",
      async () => ({ id: "admin-1", email: "admin@example.com" }),
      async (input) => {
        expect(input.orderNumber).toBe("BB-S2-001");
        expect(input.paymentId).toBe("pay-1");
        expect(input.actorUserId).toBe("admin-1");
        return { ok: true, paymentStatus: "approved", orderStatus: "reserved" };
      },
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ paymentStatus: "approved", orderStatus: "reserved" });
  });
});
