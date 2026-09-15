import { describe, expect, it } from "vitest";
import { handleNotificationRetryRequest } from "./route";

describe("POST admin notification retry", () => {
  const request = new Request("http://localhost/api/admin/notifications/n-1/retry", { method: "POST" });

  it("requires an active admin", async () => {
    let calls = 0;
    const response = await handleNotificationRetryRequest(
      request,
      "n-1",
      async () => null,
      async () => {
        calls += 1;
        return { status: "sent", providerMessageId: "msg-1", error: null };
      },
    );
    expect(response.status).toBe(401);
    expect(calls).toBe(0);
  });

  it("returns retry delivery status", async () => {
    const response = await handleNotificationRetryRequest(
      request,
      "n-1",
      async () => ({ id: "admin-1", email: "admin@example.com" }),
      async () => ({ status: "failed", providerMessageId: null, error: "Email delivery failed." }),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "failed", error: "Email delivery failed." });
  });

  it("returns not found for unknown notification", async () => {
    const response = await handleNotificationRetryRequest(
      request,
      "missing",
      async () => ({ id: "admin-1", email: "admin@example.com" }),
      async () => null,
    );
    expect(response.status).toBe(404);
  });
});
