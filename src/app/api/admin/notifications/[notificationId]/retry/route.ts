import { requireAdmin } from "../../../../../../lib/admin-auth";
import { deliverNotification } from "../../../../../../lib/notifications";

type AdminUser = { id: string; email: string };
type Authorize = (request: Request) => Promise<AdminUser | null>;
type DeliveryResult = {
  status: "sent" | "failed" | "skipped";
  providerMessageId: string | null;
  error: string | null;
};
type Deliver = (notificationId: string) => Promise<DeliveryResult | null>;

export async function handleNotificationRetryRequest(
  request: Request,
  notificationId: string,
  authorize: Authorize = requireAdmin,
  deliver: Deliver = deliverNotification,
): Promise<Response> {
  const admin = await authorize(request);
  if (!admin) return Response.json({ error: "Unauthorized." }, { status: 401 });

  const result = await deliver(notificationId);
  if (!result) return Response.json({ error: "Notification not found." }, { status: 404 });

  return Response.json({ status: result.status, error: result.error }, { status: 200 });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ notificationId: string }> },
) {
  const { notificationId } = await context.params;
  return handleNotificationRetryRequest(request, notificationId);
}
