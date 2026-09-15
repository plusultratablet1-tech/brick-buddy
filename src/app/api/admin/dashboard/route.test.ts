import { describe, expect, it } from "vitest";
import { handleAdminDashboardRequest } from "./route";

const request = () => new Request("http://localhost/api/admin/dashboard");

const summary = {
  remainingSlots: 15,
  totalActive: 0,
  awaitingPayment: 0,
  pendingProofs: 0,
  inProduction: 0,
  balanceDue: 0,
  ready: 0,
  completed: 0,
};

describe("GET /api/admin/dashboard", () => {
  it("returns 401 before loading data when admin authorization fails", async () => {
    let loads = 0;
    const response = await handleAdminDashboardRequest(
      request(),
      async () => null,
      async () => {
        loads += 1;
        return summary;
      },
    );
    expect(response.status).toBe(401);
    expect(loads).toBe(0);
  });

  it("returns operational summary for an active admin", async () => {
    const response = await handleAdminDashboardRequest(
      request(),
      async () => ({ id: "admin-1", email: "admin@example.com" }),
      async () => summary,
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ summary });
  });

  it("sanitizes data-loader failures", async () => {
    const response = await handleAdminDashboardRequest(
      request(),
      async () => ({ id: "admin-1", email: "admin@example.com" }),
      async () => {
        throw new Error("sensitive database detail");
      },
    );
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Unable to load admin dashboard." });
  });
});
