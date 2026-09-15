import {
  mapAvailabilityRow,
  type AvailabilityRpcRow,
} from "../../../../lib/preorders";
import { getSupabaseServerClient } from "../../../../lib/supabase-server";

type RpcError = { message: string };
type AvailabilityResult = {
  data: AvailabilityRpcRow[] | null;
  error: RpcError | null;
};
type LoadAvailability = () => Promise<AvailabilityResult>;

async function loadAvailabilityFromSupabase(): Promise<AvailabilityResult> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_preorder_availability");

  return {
    data: (data as AvailabilityRpcRow[] | null) ?? null,
    error: error ? { message: error.message } : null,
  };
}

export async function handleAvailabilityRequest(
  loadAvailability: LoadAvailability = loadAvailabilityFromSupabase,
): Promise<Response> {
  try {
    const { data, error } = await loadAvailability();

    if (error) {
      return Response.json(
        { error: "Availability is temporarily unavailable." },
        { status: 500 },
      );
    }

    const row = data?.[0];
    if (!row) {
      return Response.json(
        { error: "Availability is temporarily unavailable." },
        { status: 500 },
      );
    }

    return Response.json(mapAvailabilityRow(row), { status: 200 });
  } catch {
    return Response.json(
      { error: "Availability is temporarily unavailable." },
      { status: 500 },
    );
  }
}

export async function GET() {
  return handleAvailabilityRequest();
}
