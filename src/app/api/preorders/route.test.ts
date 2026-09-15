import { describe, expect, it } from "vitest";
import { handleCreatePreorderRequest } from "./route";

const validBody = {
  name: "Juan Dela Cruz",
  email: "juan@example.com",
  mobile: "09171234567",
  quantity: 1,
  fulfillment: "shipping",
};

describe("POST /api/preorders", () => {
  it("returns 400 before calling the database when input is invalid", async () => {
    let calls = 0;
    const request = new Request("http://localhost/api/preorders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...validBody, quantity: 4 }),
    });

    const response = await handleCreatePreorderRequest(request, async () => {
      calls += 1;
      return { data: null, error: null };
    });

    expect(response.status).toBe(400);
    expect(calls).toBe(0);
  });

  it("returns 201 with the public order shape", async () => {
    const request = new Request("http://localhost/api/preorders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(validBody),
    });

    const response = await handleCreatePreorderRequest(request, async () => ({
      data: [
        {
          order_number: "BB-S2-001",
          quantity: 1,
          total_amount: 449,
          reservation_total: 200,
          balance_total: 249,
          status: "awaiting_payment",
          hold_expires_at: "2026-09-16T03:00:00.000Z",
          remaining_slots: 14,
        },
      ],
      error: null,
    }));

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({
      order: {
        orderNumber: "BB-S2-001",
        quantity: 1,
        totalAmount: 449,
        reservationTotal: 200,
        balanceTotal: 249,
        status: "awaiting_payment",
        holdExpiresAt: "2026-09-16T03:00:00.000Z",
      },
      remainingSlots: 14,
    });
  });

  it("returns 409 when Supabase reports insufficient slots", async () => {
    const request = new Request("http://localhost/api/preorders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(validBody),
    });

    const response = await handleCreatePreorderRequest(request, async () => ({
      data: null,
      error: { message: "INSUFFICIENT_SLOTS" },
    }));

    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({
      error: "Not enough preorder slots remain for that quantity.",
    });
  });

  it("does not expose raw database errors", async () => {
    const request = new Request("http://localhost/api/preorders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(validBody),
    });

    const response = await handleCreatePreorderRequest(request, async () => ({
      data: null,
      error: { message: "sensitive database detail" },
    }));

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body).toEqual({ error: "We could not create your preorder. Please try again." });
    expect(JSON.stringify(body)).not.toContain("sensitive database detail");
  });

  it("returns 400 for invalid JSON", async () => {
    const request = new Request("http://localhost/api/preorders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{not-json",
    });

    const response = await handleCreatePreorderRequest(request, async () => ({
      data: null,
      error: null,
    }));

    expect(response.status).toBe(400);
  });
});
