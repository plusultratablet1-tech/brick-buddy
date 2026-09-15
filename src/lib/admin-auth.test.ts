import { describe, expect, it } from "vitest";
import { validateAdminCredentials } from "./admin-auth";

describe("admin authentication", () => {
  it("normalizes an email and preserves the password", () => {
    expect(
      validateAdminCredentials({ email: " ADMIN@Example.COM ", password: "secret123" }),
    ).toEqual({
      ok: true,
      value: { email: "admin@example.com", password: "secret123" },
    });
  });

  it("rejects invalid email or short password with a generic message", () => {
    expect(validateAdminCredentials({ email: "bad", password: "x" })).toEqual({
      ok: false,
      error: "Invalid admin credentials.",
    });
  });

  it("rejects missing credentials", () => {
    expect(validateAdminCredentials(null)).toEqual({
      ok: false,
      error: "Invalid admin credentials.",
    });
  });
});
