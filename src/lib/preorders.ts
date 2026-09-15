export type Fulfillment = "shipping" | "meetup";

export type PreorderInput = {
  name: string;
  email: string;
  mobile: string;
  quantity: number;
  fulfillment: Fulfillment;
};

export type ValidationResult =
  | { ok: true; value: PreorderInput }
  | { ok: false; error: string };

export type OrderRpcRow = {
  order_number: string;
  quantity: number;
  total_amount: number;
  reservation_total: number;
  balance_total: number;
  status: string;
  hold_expires_at: string;
  remaining_slots: number;
};

export type AvailabilityRpcRow = {
  capacity: number;
  remaining_slots: number;
  sold_out: boolean;
};

export const DEMO_PAYMENT_INSTRUCTIONS = {
  isDemo: true,
  method: "GCash",
  accountName: "Brick Buddy Demo Account",
  accountNumber: "09XX XXX XXXX",
  notice: "DEMO ONLY — do not send real money to this account.",
} as const;

export function validatePreorderInput(input: unknown): ValidationResult {
  if (!input || typeof input !== "object") {
    return { ok: false, error: "Please complete all preorder fields." };
  }

  const record = input as Record<string, unknown>;

  if (typeof record.name !== "string") {
    return { ok: false, error: "Please enter a parent or guardian name." };
  }
  const name = record.name.trim();
  if (name.length < 1 || name.length > 120) {
    return { ok: false, error: "Please enter a valid parent or guardian name." };
  }

  if (typeof record.email !== "string") {
    return { ok: false, error: "Please enter a valid email address." };
  }
  const email = record.email.trim().toLowerCase();
  if (
    email.length < 3 ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  if (typeof record.mobile !== "string") {
    return { ok: false, error: "Please enter a valid mobile number." };
  }
  const mobile = record.mobile.trim().replace(/[\s()-]/g, "");
  if (!/^\+?\d{7,15}$/.test(mobile)) {
    return { ok: false, error: "Please enter a valid mobile number." };
  }

  if (
    typeof record.quantity !== "number" ||
    !Number.isInteger(record.quantity) ||
    record.quantity < 1 ||
    record.quantity > 3
  ) {
    return { ok: false, error: "Quantity must be between 1 and 3." };
  }

  if (record.fulfillment !== "shipping" && record.fulfillment !== "meetup") {
    return { ok: false, error: "Please choose shipping or meet-up." };
  }

  return {
    ok: true,
    value: {
      name,
      email,
      mobile,
      quantity: record.quantity,
      fulfillment: record.fulfillment,
    },
  };
}

export function mapOrderRow(row: OrderRpcRow) {
  return {
    order: {
      orderNumber: row.order_number,
      quantity: row.quantity,
      totalAmount: row.total_amount,
      reservationTotal: row.reservation_total,
      balanceTotal: row.balance_total,
      status: row.status,
      holdExpiresAt: row.hold_expires_at,
    },
    paymentInstructions: DEMO_PAYMENT_INSTRUCTIONS,
    remainingSlots: row.remaining_slots,
  };
}

export function mapAvailabilityRow(row: AvailabilityRpcRow) {
  return {
    capacity: row.capacity,
    remainingSlots: row.remaining_slots,
    soldOut: row.sold_out,
  };
}
