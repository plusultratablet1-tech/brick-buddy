import { getSupabaseServerClient } from "./supabase-server";

export type PublicPaymentSettings = {
  method: string;
  accountName: string;
  accountNumber: string;
  instructions: string;
};

export type AdminPaymentSettings = PublicPaymentSettings & {
  isActive: boolean;
  updatedAt: string | null;
};

export type PaymentSettingsInput = PublicPaymentSettings & {
  isActive: boolean;
};

export type PaymentSettingsRow = {
  id: string;
  method: string;
  account_name: string;
  account_number: string;
  instructions: string;
  is_active: boolean;
  updated_at: string;
  updated_by: string | null;
};

export type PaymentSettingsValidation =
  | { ok: true; value: PaymentSettingsInput }
  | { ok: false; error: string };

const DEFAULT_ADMIN_SETTINGS: AdminPaymentSettings = {
  method: "GCash",
  accountName: "",
  accountNumber: "",
  instructions: "",
  isActive: false,
  updatedAt: null,
};

export function validatePaymentSettingsInput(input: unknown): PaymentSettingsValidation {
  if (!input || typeof input !== "object") {
    return { ok: false, error: "Please enter valid payment settings." };
  }

  const record = input as Record<string, unknown>;
  if (
    typeof record.method !== "string" ||
    typeof record.accountName !== "string" ||
    typeof record.accountNumber !== "string" ||
    typeof record.instructions !== "string" ||
    typeof record.isActive !== "boolean"
  ) {
    return { ok: false, error: "Please enter valid payment settings." };
  }

  const method = record.method.trim();
  const accountName = record.accountName.trim();
  const accountNumber = record.accountNumber.trim();
  const instructions = record.instructions.trim();

  if (!method || method.length > 40) {
    return { ok: false, error: "Payment method must be between 1 and 40 characters." };
  }
  if (accountName.length > 120) {
    return { ok: false, error: "Account name must be 120 characters or fewer." };
  }
  if (accountNumber.length > 64) {
    return { ok: false, error: "Account number must be 64 characters or fewer." };
  }
  if (instructions.length > 500) {
    return { ok: false, error: "Customer instructions must be 500 characters or fewer." };
  }
  if (record.isActive && (!accountName || !accountNumber)) {
    return { ok: false, error: "Add both an account name and account number before activating payment instructions." };
  }

  return {
    ok: true,
    value: { method, accountName, accountNumber, instructions, isActive: record.isActive },
  };
}

export function mapAdminPaymentSettings(row: PaymentSettingsRow | null): AdminPaymentSettings {
  if (!row) return { ...DEFAULT_ADMIN_SETTINGS };
  return {
    method: row.method,
    accountName: row.account_name,
    accountNumber: row.account_number,
    instructions: row.instructions,
    isActive: row.is_active,
    updatedAt: row.updated_at,
  };
}

export function mapPublicPaymentSettings(row: PaymentSettingsRow | null): PublicPaymentSettings | null {
  if (!row?.is_active) return null;
  const method = row.method.trim();
  const accountName = row.account_name.trim();
  const accountNumber = row.account_number.trim();
  const instructions = row.instructions.trim();
  if (!method || !accountName || !accountNumber) return null;
  return { method, accountName, accountNumber, instructions };
}

async function loadPaymentSettingsRow(): Promise<PaymentSettingsRow | null> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("payment_settings")
    .select("id,method,account_name,account_number,instructions,is_active,updated_at,updated_by")
    .eq("id", "default")
    .maybeSingle();
  if (error) throw new Error("PAYMENT_SETTINGS_LOAD_FAILED");
  return (data as PaymentSettingsRow | null) ?? null;
}

export async function getAdminPaymentSettings(): Promise<AdminPaymentSettings> {
  return mapAdminPaymentSettings(await loadPaymentSettingsRow());
}

export async function getPublicPaymentSettings(): Promise<PublicPaymentSettings | null> {
  return mapPublicPaymentSettings(await loadPaymentSettingsRow());
}

export async function updatePaymentSettings(
  input: unknown,
  actorUserId: string,
): Promise<AdminPaymentSettings> {
  const validation = validatePaymentSettingsInput(input);
  if (!validation.ok) throw new Error("PAYMENT_SETTINGS_INVALID");

  const value = validation.value;
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("payment_settings")
    .upsert({
      id: "default",
      method: value.method,
      account_name: value.accountName,
      account_number: value.accountNumber,
      instructions: value.instructions,
      is_active: value.isActive,
      updated_at: new Date().toISOString(),
      updated_by: actorUserId,
    }, { onConflict: "id" })
    .select("id,method,account_name,account_number,instructions,is_active,updated_at,updated_by")
    .single();
  if (error || !data) throw new Error("PAYMENT_SETTINGS_SAVE_FAILED");
  return mapAdminPaymentSettings(data as PaymentSettingsRow);
}
