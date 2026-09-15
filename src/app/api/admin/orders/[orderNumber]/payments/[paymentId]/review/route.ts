import { requireAdmin } from "../../../../../../../../lib/admin-auth";
import { getSupabaseServerClient } from "../../../../../../../../lib/supabase-server";

type AdminUser = { id: string; email: string };
type Authorize = (request: Request) => Promise<AdminUser | null>;
type ReviewInput = {
  orderNumber: string;
  paymentId: string;
  action: "approved" | "rejected";
  adminNote: string | null;
  actorUserId: string;
};
type ReviewResult =
  | { ok: true; paymentStatus: string; orderStatus: string }
  | { ok: false; status: number; error: string };
type ReviewPayment = (input: ReviewInput) => Promise<ReviewResult>;

function normalizeOrderNumber(value: string) {
  return value.trim().toUpperCase();
}

async function reviewPaymentWithSupabase(input: ReviewInput): Promise<ReviewResult> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.rpc("review_payment", {
    p_payment_id: input.paymentId,
    p_action: input.action,
    p_admin_note: input.adminNote ?? "",
    p_actor_user_id: input.actorUserId,
  });

  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("already") || message.includes("pending") || message.includes("invalid")) {
      return { ok: false, status: 409, error: "That payment can no longer be reviewed." };
    }
    return { ok: false, status: 500, error: "Unable to review payment." };
  }

  const row = data?.[0];
  if (!row || row.order_number !== input.orderNumber) {
    return { ok: false, status: 404, error: "Payment not found." };
  }

  return {
    ok: true,
    paymentStatus: row.payment_status,
    orderStatus: row.order_status,
  };
}

export async function handleAdminPaymentReviewRequest(
  request: Request,
  orderNumber: string,
  paymentId: string,
  authorize: Authorize = requireAdmin,
  reviewPayment: ReviewPayment = reviewPaymentWithSupabase,
): Promise<Response> {
  const admin = await authorize(request);
  if (!admin) return Response.json({ error: "Unauthorized." }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  if (record.action !== "approved" && record.action !== "rejected") {
    return Response.json({ error: "Choose approved or rejected." }, { status: 400 });
  }

  const adminNote =
    typeof record.adminNote === "string" && record.adminNote.trim()
      ? record.adminNote.trim().slice(0, 1000)
      : null;

  const result = await reviewPayment({
    orderNumber: normalizeOrderNumber(orderNumber),
    paymentId,
    action: record.action,
    adminNote,
    actorUserId: admin.id,
  });

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  return Response.json(
    { paymentStatus: result.paymentStatus, orderStatus: result.orderStatus },
    { status: 200 },
  );
}

export async function POST(
  request: Request,
  context: { params: Promise<{ orderNumber: string; paymentId: string }> },
) {
  const { orderNumber, paymentId } = await context.params;
  return handleAdminPaymentReviewRequest(request, orderNumber, paymentId);
}
