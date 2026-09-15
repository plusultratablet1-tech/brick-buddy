export const MAX_PROOF_BYTES = 5 * 1024 * 1024;

const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

export type PaymentKind = "reservation" | "balance";

export function validatePaymentProofFile(file: { type: string; size: number }) {
  if (!Object.prototype.hasOwnProperty.call(MIME_EXTENSIONS, file.type)) {
    return { ok: false as const, error: "Upload a JPG, PNG, WebP, or PDF payment proof." };
  }
  if (file.size <= 0) {
    return { ok: false as const, error: "Choose a payment proof file to upload." };
  }
  if (file.size > MAX_PROOF_BYTES) {
    return { ok: false as const, error: "Payment proof must be 5 MB or smaller." };
  }
  return { ok: true as const };
}

export function normalizePaymentKind(value: unknown): PaymentKind | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  return normalized === "reservation" || normalized === "balance" ? normalized : null;
}

export function getProofExtension(mimeType: string) {
  return MIME_EXTENSIONS[mimeType] ?? null;
}
