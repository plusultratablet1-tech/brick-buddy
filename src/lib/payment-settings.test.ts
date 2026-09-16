import { describe, expect, it } from "vitest";
import {
  mapAdminPaymentSettings,
  mapPublicPaymentSettings,
  validatePaymentSettingsInput,
} from "./payment-settings";

describe("payment settings model", () => {
  it("normalizes a valid active configuration", () => {
    expect(validatePaymentSettingsInput({
      method: " GCash ",
      accountName: " Juan Dela Cruz ",
      accountNumber: " 09171234567 ",
      instructions: " Save the receipt. ",
      isActive: true,
    })).toEqual({
      ok: true,
      value: {
        method: "GCash",
        accountName: "Juan Dela Cruz",
        accountNumber: "09171234567",
        instructions: "Save the receipt.",
        isActive: true,
      },
    });
  });

  it("allows an inactive blank configuration", () => {
    expect(validatePaymentSettingsInput({
      method: "GCash",
      accountName: "",
      accountNumber: "",
      instructions: "",
      isActive: false,
    }).ok).toBe(true);
  });

  it("rejects activation without both customer-visible account fields", () => {
    expect(validatePaymentSettingsInput({
      method: "GCash",
      accountName: "",
      accountNumber: "09171234567",
      instructions: "",
      isActive: true,
    }).ok).toBe(false);
    expect(validatePaymentSettingsInput({
      method: "GCash",
      accountName: "Juan",
      accountNumber: "",
      instructions: "",
      isActive: true,
    }).ok).toBe(false);
  });

  it("rejects invalid types and over-limit values", () => {
    expect(validatePaymentSettingsInput(null).ok).toBe(false);
    expect(validatePaymentSettingsInput({ method: 123, accountName: "", accountNumber: "", instructions: "", isActive: false }).ok).toBe(false);
    expect(validatePaymentSettingsInput({ method: "x".repeat(41), accountName: "", accountNumber: "", instructions: "", isActive: false }).ok).toBe(false);
    expect(validatePaymentSettingsInput({ method: "GCash", accountName: "x".repeat(121), accountNumber: "", instructions: "", isActive: false }).ok).toBe(false);
    expect(validatePaymentSettingsInput({ method: "GCash", accountName: "", accountNumber: "x".repeat(65), instructions: "", isActive: false }).ok).toBe(false);
    expect(validatePaymentSettingsInput({ method: "GCash", accountName: "", accountNumber: "", instructions: "x".repeat(501), isActive: false }).ok).toBe(false);
  });

  it("maps active settings to only customer-visible public fields", () => {
    const publicSettings = mapPublicPaymentSettings({
      id: "default",
      method: "GCash",
      account_name: "Juan Dela Cruz",
      account_number: "09171234567",
      instructions: "Save the receipt.",
      is_active: true,
      updated_at: "2026-09-16T00:00:00.000Z",
      updated_by: "admin-private-id",
    });

    expect(publicSettings).toEqual({
      method: "GCash",
      accountName: "Juan Dela Cruz",
      accountNumber: "09171234567",
      instructions: "Save the receipt.",
    });
    expect(JSON.stringify(publicSettings)).not.toContain("admin-private-id");
    expect(publicSettings).not.toHaveProperty("id");
    expect(publicSettings).not.toHaveProperty("updatedAt");
  });

  it("returns no public instructions for missing, inactive, or incomplete settings", () => {
    expect(mapPublicPaymentSettings(null)).toBeNull();
    expect(mapPublicPaymentSettings({
      id: "default", method: "GCash", account_name: "Juan", account_number: "0917", instructions: "", is_active: false,
      updated_at: "2026-09-16T00:00:00.000Z", updated_by: null,
    })).toBeNull();
    expect(mapPublicPaymentSettings({
      id: "default", method: "GCash", account_name: " ", account_number: "0917", instructions: "", is_active: true,
      updated_at: "2026-09-16T00:00:00.000Z", updated_by: null,
    })).toBeNull();
  });

  it("uses safe inactive defaults when no admin settings row exists", () => {
    expect(mapAdminPaymentSettings(null)).toEqual({
      method: "GCash",
      accountName: "",
      accountNumber: "",
      instructions: "",
      isActive: false,
      updatedAt: null,
    });
  });
});
