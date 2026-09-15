import { describe, expect, it } from "vitest";
import {
  getProofExtension,
  normalizePaymentKind,
  validatePaymentProofFile,
} from "./payment-proofs";

describe("payment proof validation", () => {
  it("accepts supported files up to 5 MB", () => {
    expect(validatePaymentProofFile({ type: "image/png", size: 5 * 1024 * 1024 })).toEqual({ ok: true });
    expect(validatePaymentProofFile({ type: "application/pdf", size: 1024 })).toEqual({ ok: true });
  });

  it("rejects oversized and unsupported files", () => {
    expect(validatePaymentProofFile({ type: "image/png", size: 5 * 1024 * 1024 + 1 })).toEqual({
      ok: false,
      error: "Payment proof must be 5 MB or smaller.",
    });
    expect(validatePaymentProofFile({ type: "image/gif", size: 1024 })).toEqual({
      ok: false,
      error: "Upload a JPG, PNG, WebP, or PDF payment proof.",
    });
  });

  it("normalizes only reservation or balance kinds", () => {
    expect(normalizePaymentKind(" RESERVATION ")).toBe("reservation");
    expect(normalizePaymentKind("balance")).toBe("balance");
    expect(normalizePaymentKind("other")).toBeNull();
  });

  it("uses MIME type rather than the original filename for extensions", () => {
    expect(getProofExtension("image/jpeg")).toBe("jpg");
    expect(getProofExtension("image/png")).toBe("png");
    expect(getProofExtension("image/webp")).toBe("webp");
    expect(getProofExtension("application/pdf")).toBe("pdf");
  });
});
