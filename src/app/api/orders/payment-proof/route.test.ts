import { describe, expect, it } from "vitest";
import { handlePaymentProofRequest } from "./route";

function requestWith(overrides: Partial<Record<string, string>> = {}, file?: File) {
  const form = new FormData();
  form.set("orderNumber", overrides.orderNumber ?? "BB-S2-001");
  form.set("email", overrides.email ?? "parent@example.com");
  form.set("kind", overrides.kind ?? "reservation");
  form.set("amount", overrides.amount ?? "200");
  form.set("note", overrides.note ?? "GCash payment");
  form.set("proof", file ?? new File(["proof"], "receipt.png", { type: "image/png" }));
  return new Request("http://localhost/api/orders/payment-proof", { method: "POST", body: form });
}

describe("POST /api/orders/payment-proof", () => {
  it("normalizes customer credentials and returns a pending proof", async () => {
    let received: Record<string, unknown> | undefined;
    const response = await handlePaymentProofRequest(
      requestWith({ orderNumber: " bb-s2-001 ", email: " Parent@Example.com " }),
      async (input) => {
        received = input as unknown as Record<string, unknown>;
        return { ok: true, payment: { kind: "reservation", status: "pending" } };
      },
    );

    expect(received?.orderNumber).toBe("BB-S2-001");
    expect(received?.email).toBe("parent@example.com");
    expect(received?.amount).toBe(200);
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ payment: { kind: "reservation", status: "pending" } });
  });

  it("rejects an unsupported proof file before submission", async () => {
    let calls = 0;
    const response = await handlePaymentProofRequest(
      requestWith({}, new File(["gif"], "proof.gif", { type: "image/gif" })),
      async () => {
        calls += 1;
        return { ok: true, payment: { kind: "reservation", status: "pending" } };
      },
    );
    expect(response.status).toBe(400);
    expect(calls).toBe(0);
  });

  it("returns a generic verification error when the order cannot be verified", async () => {
    const response = await handlePaymentProofRequest(requestWith(), async () => ({
      ok: false,
      status: 404,
      error: "We couldn't verify that order.",
    }));
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "We couldn't verify that order." });
  });

  it("rejects duplicate or ineligible payment proof safely", async () => {
    const response = await handlePaymentProofRequest(requestWith(), async () => ({
      ok: false,
      status: 409,
      error: "A reservation payment proof is already pending or approved.",
    }));
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({
      error: "A reservation payment proof is already pending or approved.",
    });
  });
});
