import {
  mapOrderRow,
  type OrderRpcRow,
  type PreorderInput,
  validatePreorderInput,
} from "../../../lib/preorders";
import { enqueueNotification } from "../../../lib/notifications";
import { getSupabaseServerClient } from "../../../lib/supabase-server";

type RpcError = { message: string };
type CreateOrderResult = {
  data: OrderRpcRow[] | null;
  error: RpcError | null;
};
type CreateOrder = (input: PreorderInput) => Promise<CreateOrderResult>;
type NotifyPreorder = typeof enqueueNotification;

async function createOrderWithSupabase(input: PreorderInput): Promise<CreateOrderResult> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.rpc("create_preorder", {
    p_customer_name: input.name,
    p_email: input.email,
    p_mobile: input.mobile,
    p_quantity: input.quantity,
    p_fulfillment: input.fulfillment,
  });

  return {
    data: (data as OrderRpcRow[] | null) ?? null,
    error: error ? { message: error.message } : null,
  };
}

export async function handleCreatePreorderRequest(
  request: Request,
  createOrder: CreateOrder = createOrderWithSupabase,
  notifyPreorder: NotifyPreorder = enqueueNotification,
): Promise<Response> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Please send a valid preorder request." }, { status: 400 });
  }

  const validation = validatePreorderInput(body);
  if (!validation.ok) {
    return Response.json({ error: validation.error }, { status: 400 });
  }

  try {
    const { data, error } = await createOrder(validation.value);

    if (error) {
      if (error.message.includes("INSUFFICIENT_SLOTS")) {
        return Response.json(
          { error: "Not enough preorder slots remain for that quantity." },
          { status: 409 },
        );
      }

      return Response.json(
        { error: "We could not create your preorder. Please try again." },
        { status: 500 },
      );
    }

    const row = data?.[0];
    if (!row) {
      return Response.json(
        { error: "We could not create your preorder. Please try again." },
        { status: 500 },
      );
    }

    const response = mapOrderRow(row);
    try {
      await notifyPreorder({
        recipient: validation.value.email,
        template: "preorder_created",
        payload: { orderNumber: row.order_number, customerName: validation.value.name },
      });
    } catch {
      // Notifications are best-effort and must never roll back a valid preorder.
    }

    return Response.json(response, { status: 201 });
  } catch {
    return Response.json(
      { error: "We could not create your preorder. Please try again." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  return handleCreatePreorderRequest(request);
}
