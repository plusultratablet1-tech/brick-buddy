import { describe, expect, it } from "vitest";
import { handleCreatePreorderRequest } from "./route";

const validBody = {
  name: "Juan Dela Cruz",
  email: "juan@example.com",
  mobile: "09171234567",
  quantity: 1,
  fulfillment: "shipping",
};

const orderResult = {
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

  it("returns 201 with the public order shape and demo payment instructions", async () => {
    const request = new Request("http://localhost/api/preorders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(validBody),
    });

    const response = await handleCreatePreorderRequest(request, async () => orderResult);

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
      paymentInstructions: {
        isDemo: true,
        method: "GCash",
        accountName: "Brick Buddy Demo Account",
        accountNumber: "09XX XXX XXXX",
        notice: "DEMO ONLY — do not send real money to this account.",
      },
      remainingSlots: 14,
    });
  });

  it("waits for the preorder notification to be durably enqueued before responding", async () => {
    const request = new Request("http://localhost/api/preorders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(validBody),
    });

    let release!: () => void;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    let settled = false;
    const responsePromise = handleCreatePreorderRequest(
      request,
      async () => orderResult,
      async () => {
        await gate;
        return "notification-1";
      },
    ).then((response) => {
      settled = true;
      return response;
    });

    await Promise.resolve();
    await Promise.resolve();
    expect(settled).toBe(false);
    release();
    expect((await responsePromise).status).toBe(201);
  });

  it("keeps a successful preorder successful if notification enqueue fails", async () => {
    const request = new Request("http://localhost/api/preorders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(validBody),
    });

    const response = await handleCreatePreorderRequest(
      request,
      async () => orderResult,
      async () => { throw new Error("email provider unavailable"); },
    );

    expect(response.status).toBe(201);
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
