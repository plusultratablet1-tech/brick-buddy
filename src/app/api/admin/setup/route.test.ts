import { describe, expect, it } from "vitest";
import { handleAdminSetupRequest } from "./route";

function request(body: unknown) {
  return new Request("http://localhost/api/admin/setup", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/admin/setup", () => {
  it("is unavailable outside preview/development", async () => {
    let created = false;
    const response = await handleAdminSetupRequest(
      request({ email: "admin@example.com", password: "secret123" }),
      { environment: "production", hasActiveAdmin: async () => false, createAdmin: async () => { created = true; return { ok: true as const }; } },
    );
    expect(response.status).toBe(404);
    expect(created).toBe(false);
  });

  it("locks after the first active admin exists", async () => {
    let created = false;
    const response = await handleAdminSetupRequest(
      request({ email: "admin@example.com", password: "secret123" }),
      { environment: "preview", hasActiveAdmin: async () => true, createAdmin: async () => { created = true; return { ok: true as const }; } },
    );
    expect(response.status).toBe(409);
    expect(created).toBe(false);
  });

  it("rejects invalid credentials before creating an admin", async () => {
    let created = false;
    const response = await handleAdminSetupRequest(
      request({ email: "bad", password: "short" }),
      { environment: "preview", hasActiveAdmin: async () => false, createAdmin: async () => { created = true; return { ok: true as const }; } },
    );
    expect(response.status).toBe(400);
    expect(created).toBe(false);
  });

  it("creates exactly one first admin in preview", async () => {
    const response = await handleAdminSetupRequest(
      request({ email: " OWNER@EXAMPLE.COM ", password: "secret123" }),
      {
        environment: "preview",
        hasActiveAdmin: async () => false,
        createAdmin: async (credentials) => {
          expect(credentials.email).toBe("owner@example.com");
          return { ok: true as const };
        },
      },
    );
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ ok: true });
  });

  it("returns a safe error if account creation fails", async () => {
    const response = await handleAdminSetupRequest(
      request({ email: "admin@example.com", password: "secret123" }),
      { environment: "preview", hasActiveAdmin: async () => false, createAdmin: async () => ({ ok: false as const }) },
    );
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Unable to create the admin account." });
  });
});
