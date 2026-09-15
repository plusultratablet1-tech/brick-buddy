import { describe, expect, it } from "vitest";
import { handleSupabaseDiagnosticRequest } from "./route";

describe("Supabase diagnostic endpoint", () => {
  it("reports missing server configuration without exposing values", async () => {
    const response = await handleSupabaseDiagnosticRequest({
      supabaseUrl: undefined,
      supabaseSecretKey: undefined,
      probe: async () => ({ ok: true }),
    });

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      diagnostic: "brick-buddy-supabase",
      environment: {
        supabaseUrl: "missing",
        supabaseSecretKey: "missing",
        keyType: "missing",
      },
      connection: {
        status: "not_checked",
        availabilityRpc: "not_checked",
      },
    });
  });

  it("identifies a publishable key and reports rejected credentials safely", async () => {
    const response = await handleSupabaseDiagnosticRequest({
      supabaseUrl: "https://example.supabase.co",
      supabaseSecretKey: "sb_publishable_example",
      probe: async () => ({ ok: false, category: "credentials_rejected" }),
    });

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      diagnostic: "brick-buddy-supabase",
      environment: {
        supabaseUrl: "present",
        supabaseSecretKey: "present",
        keyType: "publishable",
      },
      connection: {
        status: "rejected",
        availabilityRpc: "failed",
        category: "credentials_rejected",
      },
    });
  });

  it("reports a successful server-secret connection", async () => {
    const response = await handleSupabaseDiagnosticRequest({
      supabaseUrl: "https://example.supabase.co",
      supabaseSecretKey: "sb_secret_example",
      probe: async () => ({ ok: true }),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      diagnostic: "brick-buddy-supabase",
      environment: {
        supabaseUrl: "present",
        supabaseSecretKey: "present",
        keyType: "secret",
      },
      connection: {
        status: "accepted",
        availabilityRpc: "ok",
      },
    });
  });
});
