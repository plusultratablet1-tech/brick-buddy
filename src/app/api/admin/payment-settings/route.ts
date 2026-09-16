import { requireAdmin } from "../../../../lib/admin-auth";
import {
  getAdminPaymentSettings,
  type AdminPaymentSettings,
  type PaymentSettingsInput,
  updatePaymentSettings,
  validatePaymentSettingsInput,
} from "../../../../lib/payment-settings";

type AdminUser = { id: string; email: string };
type Authorize = (request: Request) => Promise<AdminUser | null>;
type LoadSettings = () => Promise<AdminPaymentSettings>;
type SaveSettings = (input: PaymentSettingsInput, actorUserId: string) => Promise<AdminPaymentSettings>;

export async function handleAdminPaymentSettingsGet(
  request: Request,
  authorize: Authorize = requireAdmin,
  loadSettings: LoadSettings = getAdminPaymentSettings,
): Promise<Response> {
  const admin = await authorize(request);
  if (!admin) return Response.json({ error: "Unauthorized." }, { status: 401 });

  try {
    return Response.json(
      { settings: await loadSettings() },
      { status: 200, headers: { "cache-control": "no-store" } },
    );
  } catch {
    return Response.json({ error: "Unable to load payment settings." }, { status: 500 });
  }
}

export async function handleAdminPaymentSettingsPut(
  request: Request,
  authorize: Authorize = requireAdmin,
  saveSettings: SaveSettings = updatePaymentSettings,
): Promise<Response> {
  const admin = await authorize(request);
  if (!admin) return Response.json({ error: "Unauthorized." }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Please enter valid payment settings." }, { status: 400 });
  }

  const validation = validatePaymentSettingsInput(body);
  if (!validation.ok) {
    return Response.json({ error: validation.error }, { status: 400 });
  }

  try {
    const settings = await saveSettings(validation.value, admin.id);
    return Response.json({ settings }, { status: 200 });
  } catch {
    return Response.json({ error: "Unable to save payment settings." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return handleAdminPaymentSettingsGet(request);
}

export async function PUT(request: Request) {
  return handleAdminPaymentSettingsPut(request);
}
