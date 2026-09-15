import { randomUUID } from "node:crypto";
import {
  getProofExtension,
  normalizePaymentKind,
  type PaymentKind,
  validatePaymentProofFile,
} from "../../../../lib/payment-proofs";
import { GENERIC_LOOKUP_ERROR, validateOrderLookup } from "../../../../lib/order-tracking";
import { getSupabaseServerClient } from "../../../../lib/supabase-server";

type ProofInput = {
  orderNumber: string;
  email: string;
  kind: PaymentKind;
  amount: number;
  note: string;
  proof: File;
};

type SubmitResult =
  | { ok: true; payment: { kind: PaymentKind; status: "pending" } }
  | { ok: false; status: number; error: string };

type SubmitProof = (input: ProofInput) => Promise<SubmitResult>;

function safePaymentError(message: string, kind: PaymentKind): SubmitResult {
  if (message.includes("ORDER_NOT_VERIFIED")) {
    return { ok: false, status: 404, error: GENERIC_LOOKUP_ERROR };
  }
  if (message.includes("PAYMENT_ALREADY_ACTIVE")) {
    return {
      ok: false,
      status: 409,
      error: `A ${kind} payment proof is already pending or approved.`,
    };
  }
  if (message.includes("PAYMENT_NOT_ELIGIBLE")) {
    return {
      ok: false,
      status: 409,
      error:
        kind === "reservation"
          ? "This order is not eligible for a reservation payment proof."
          : "The balance payment is not due for this order yet.",
    };
  }
  return { ok: false, status: 500, error: "We couldn't upload your payment proof. Please try again." };
}

async function submitProofWithSupabase(input: ProofInput): Promise<SubmitResult> {
  const supabase = getSupabaseServerClient();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id")
    .eq("order_number", input.orderNumber)
    .eq("email", input.email)
    .maybeSingle();

  if (orderError) {
    return { ok: false, status: 500, error: "We couldn't upload your payment proof. Please try again." };
  }
  if (!order) return { ok: false, status: 404, error: GENERIC_LOOKUP_ERROR };

  const extension = getProofExtension(input.proof.type);
  if (!extension) {
    return { ok: false, status: 400, error: "Upload a JPG, PNG, WebP, or PDF payment proof." };
  }

  const proofPath = `${order.id}/${randomUUID()}.${extension}`;
  const bytes = await input.proof.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from("payment-proofs")
    .upload(proofPath, bytes, {
      contentType: input.proof.type,
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    return { ok: false, status: 500, error: "We couldn't upload your payment proof. Please try again." };
  }

  const { data, error } = await supabase.rpc("submit_payment_proof", {
    p_order_number: input.orderNumber,
    p_email: input.email,
    p_kind: input.kind,
    p_submitted_amount: input.amount,
    p_customer_note: input.note,
    p_proof_path: proofPath,
    p_proof_mime_type: input.proof.type,
    p_proof_original_name: input.proof.name,
  });

  if (error || !data?.[0]) {
    await supabase.storage.from("payment-proofs").remove([proofPath]);
    return safePaymentError(error?.message ?? "PAYMENT_SUBMISSION_FAILED", input.kind);
  }

  return {
    ok: true,
    payment: { kind: input.kind, status: "pending" },
  };
}

export async function handlePaymentProofRequest(
  request: Request,
  submitProof: SubmitProof = submitProofWithSupabase,
): Promise<Response> {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Please submit a valid payment proof form." }, { status: 400 });
  }

  const lookup = validateOrderLookup({
    orderNumber: form.get("orderNumber"),
    email: form.get("email"),
  });
  if (!lookup.ok) {
    return Response.json({ error: GENERIC_LOOKUP_ERROR }, { status: 404 });
  }

  const kind = normalizePaymentKind(form.get("kind"));
  if (!kind) {
    return Response.json({ error: "Choose a valid payment type." }, { status: 400 });
  }

  const proof = form.get("proof");
  if (!(proof instanceof File)) {
    return Response.json({ error: "Choose a payment proof file to upload." }, { status: 400 });
  }
  const fileValidation = validatePaymentProofFile(proof);
  if (!fileValidation.ok) {
    return Response.json({ error: fileValidation.error }, { status: 400 });
  }

  const amountText = String(form.get("amount") ?? "").trim();
  const amount = Number(amountText);
  if (!Number.isInteger(amount) || amount < 0 || amount > 1_000_000) {
    return Response.json({ error: "Enter a valid payment amount." }, { status: 400 });
  }

  const noteValue = form.get("note");
  const note = typeof noteValue === "string" ? noteValue.trim().slice(0, 500) : "";

  try {
    const result = await submitProof({
      ...lookup.value,
      kind,
      amount,
      note,
      proof,
    });
    if (!result.ok) {
      return Response.json({ error: result.error }, { status: result.status });
    }
    return Response.json({ payment: result.payment }, { status: 201 });
  } catch {
    return Response.json(
      { error: "We couldn't upload your payment proof. Please try again." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  return handlePaymentProofRequest(request);
}
