import { requireAdmin } from "../../../../lib/admin-auth";
import { getSupabaseServerClient } from "../../../../lib/supabase-server";

type AdminUser = { id: string; email: string };
type Authorize = (request: Request) => Promise<AdminUser | null>;

type DashboardSummary = {
  remainingSlots: number;
  totalActive: number;
  awaitingPayment: number;
  pendingProofs: number;
  inProduction: number;
  balanceDue: number;
  ready: number;
  completed: number;
};
type LoadDashboard = () => Promise<DashboardSummary>;

async function loadDashboardWithSupabase(): Promise<DashboardSummary> {
  const supabase = getSupabaseServerClient();
  const [{ data: availability, error: availabilityError }, { data: orders, error: ordersError }, { data: payments, error: paymentsError }] =
    await Promise.all([
      supabase.rpc("get_preorder_availability"),
      supabase.from("orders").select("status"),
      supabase.from("payments").select("status"),
    ]);
  if (availabilityError || ordersError || paymentsError) throw new Error("DASHBOARD_LOAD_FAILED");

  const statuses = (orders ?? []).map((order) => order.status);
  const active = statuses.filter((status) => !["expired", "cancelled"].includes(status));
  return {
    remainingSlots: availability?.[0]?.remaining_slots ?? 0,
    totalActive: active.length,
    awaitingPayment: statuses.filter((status) => status === "awaiting_payment").length,
    pendingProofs: (payments ?? []).filter((payment) => payment.status === "pending").length,
    inProduction: statuses.filter((status) => ["reserved", "materials_secured", "building_qc"].includes(status)).length,
    balanceDue: statuses.filter((status) => status === "balance_due").length,
    ready: statuses.filter((status) => ["ready", "shipped"].includes(status)).length,
    completed: statuses.filter((status) => status === "completed").length,
  };
}

export async function handleAdminDashboardRequest(
  request: Request,
  authorize: Authorize = requireAdmin,
  loadDashboard: LoadDashboard = loadDashboardWithSupabase,
): Promise<Response> {
  const admin = await authorize(request);
  if (!admin) return Response.json({ error: "Unauthorized." }, { status: 401 });

  try {
    return Response.json({ summary: await loadDashboard() }, { status: 200 });
  } catch {
    return Response.json({ error: "Unable to load admin dashboard." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return handleAdminDashboardRequest(request);
}
