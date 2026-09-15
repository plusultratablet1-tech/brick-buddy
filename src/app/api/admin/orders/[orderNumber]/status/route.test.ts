import { describe, expect, it } from "vitest";
import { handleAdminStatusRequest } from "./route";

function request(body: unknown) {
  return new Request("http://localhost/api/admin/orders/BB-S2-001/status", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST admin order status", () => {
  it("returns 401 without an active admin", async () => {
    let calls = 0;
    const response = await handleAdminStatusRequest(
      request({ toStatus: "materials_secured" }),
      "BB-S2-001",
      async () => null,
      async () => {
        calls += 1;
        return { ok: true, status: "materials_secured" };
      },
    );
    expect(response.status).toBe(401);
    expect(calls).toBe(0);
  });

  it("rejects unknown target status", async () => {
    const response = await handleAdminStatusRequest(
      request({ toStatus: "made_up" }),
      "BB-S2-001",
      async () => ({ id: "admin-1", email: "admin@example.com" }),
      async () => ({ ok: true, status: "ready" }),
    );
    expect(response.status).toBe(400);
  });

  it("returns the authoritative transition result", async () => {
    const response = await handleAdminStatusRequest(
      request({ toStatus: "materials_secured", message: "Parts are ready" }),
      "bb-s2-001",
      async () => ({ id: "admin-1", email: "admin@example.com" }),
      async (input) => {
        expect(input).toEqual({
          orderNumber: "BB-S2-001",
          toStatus: "materials_secured",
          message: "Parts are ready",
          actorUserId: "admin-1",
        });
        return { ok: true, status: "materials_secured" };
      },
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "materials_secured" });
  });

  it("maps illegal transitions to conflict", async () => {
    const response = await handleAdminStatusRequest(
      request({ toStatus: "ready" }),
      "BB-S2-001",
      async () => ({ id: "admin-1", email: "admin@example.com" }),
      async () => ({ ok: false, status: 409, error: "That status change is not allowed." }),
    );
    expect(response.status).toBe(409);
  });
});
