import { describe, expect, it } from "vitest";
import {
  handleAdminPaymentSettingsGet,
  handleAdminPaymentSettingsPut,
} from "./route";

const admin = { id: "admin-user-1", email: "admin@example.com" };
const saved = {
  method: "GCash",
  accountName: "Juan Dela Cruz",
  accountNumber: "09171234567",
  instructions: "Save the receipt.",
  isActive: true,
  updatedAt: "2026-09-16T00:30:00.000Z",
};

function getRequest() {
  return new Request("http://localhost/api/admin/payment-settings");
}

function putRequest(body: unknown) {
  return new Request("http://localhost/api/admin/payment-settings", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("/api/admin/payment-settings", () => {
  it("returns 401 before loading settings when GET authorization fails", async () => {
    let loads = 0;
    const response = await handleAdminPaymentSettingsGet(
      getRequest(),
      async () => null,
      async () => { loads += 1; return saved; },
    );
    expect(response.status).toBe(401);
    expect(loads).toBe(0);
  });

  it("returns admin settings with no-store caching for an active admin", async () => {
    const response = await handleAdminPaymentSettingsGet(
      getRequest(),
      async () => admin,
      async () => saved,
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ settings: saved });
  });

  it("sanitizes GET loader failures", async () => {
    const response = await handleAdminPaymentSettingsGet(
      getRequest(),
      async () => admin,
      async () => { throw new Error("sensitive database detail"); },
    );
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Unable to load payment settings." });
  });

  it("returns 401 before saving settings when PUT authorization fails", async () => {
    let saves = 0;
    const response = await handleAdminPaymentSettingsPut(
      putRequest({ method: "GCash", accountName: "Juan", accountNumber: "0917", instructions: "", isActive: true }),
      async () => null,
      async () => { saves += 1; return saved; },
    );
    expect(response.status).toBe(401);
    expect(saves).toBe(0);
  });

  it("rejects invalid activation before calling the saver", async () => {
    let saves = 0;
    const response = await handleAdminPaymentSettingsPut(
      putRequest({ method: "GCash", accountName: "", accountNumber: "", instructions: "", isActive: true }),
      async () => admin,
      async () => { saves += 1; return saved; },
    );
    expect(response.status).toBe(400);
    expect(saves).toBe(0);
    expect((await response.json()).error).toContain("account name");
  });

  it("normalizes input and records the authenticated actor on PUT", async () => {
    let received: unknown;
    let actor = "";
    const response = await handleAdminPaymentSettingsPut(
      putRequest({
        method: " GCash ",
        accountName: " Juan Dela Cruz ",
        accountNumber: " 09171234567 ",
        instructions: " Save the receipt. ",
        isActive: true,
      }),
      async () => admin,
      async (input, actorUserId) => { received = input; actor = actorUserId; return saved; },
    );
    expect(response.status).toBe(200);
    expect(received).toEqual({
      method: "GCash",
      accountName: "Juan Dela Cruz",
      accountNumber: "09171234567",
      instructions: "Save the receipt.",
      isActive: true,
    });
    expect(actor).toBe("admin-user-1");
    expect(await response.json()).toEqual({ settings: saved });
  });

  it("sanitizes PUT backend failures", async () => {
    const response = await handleAdminPaymentSettingsPut(
      putRequest({ method: "GCash", accountName: "Juan", accountNumber: "0917", instructions: "", isActive: true }),
      async () => admin,
      async () => { throw new Error("sensitive database detail"); },
    );
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Unable to save payment settings." });
  });
});
