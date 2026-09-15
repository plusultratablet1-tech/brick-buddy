import { describe, expect, it } from "vitest";
import { handleAdminLoginRequest } from "./route";

function request(body: unknown) {
  return new Request("http://localhost/api/admin/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/admin/login", () => {
  it("rejects invalid credentials before sign-in", async () => {
    let calls = 0;
    const response = await handleAdminLoginRequest(
      request({ email: "bad", password: "x" }),
      async () => {
        calls += 1;
        return null;
      },
    );
    expect(response.status).toBe(401);
    expect(calls).toBe(0);
    expect(await response.json()).toEqual({ error: "Invalid admin credentials." });
  });

  it("uses a generic error when authentication/allowlist fails", async () => {
    const response = await handleAdminLoginRequest(
      request({ email: "admin@example.com", password: "secret123" }),
      async () => null,
    );
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Invalid admin credentials." });
  });

  it("sets a secure HTTP-only session cookie on success", async () => {
    const response = await handleAdminLoginRequest(
      request({ email: " ADMIN@EXAMPLE.COM ", password: "secret123" }),
      async (credentials) => ({
        user: { id: "user-1", email: credentials.email },
        accessToken: "access-token",
        expiresIn: 3600,
      }),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ user: { email: "admin@example.com" } });
    const cookie = response.headers.get("set-cookie") ?? "";
    expect(cookie).toContain("brick_buddy_admin=");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("Secure");
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).not.toContain("SUPABASE_SECRET_KEY");
  });
});
