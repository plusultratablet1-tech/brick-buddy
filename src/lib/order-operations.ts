export const STATUS_LABELS = {
  awaiting_payment: "Awaiting reservation payment",
  reserved: "Reserved",
  materials_secured: "Materials secured",
  building_qc: "Building / quality check",
  balance_due: "Balance due",
  ready: "Ready",
  shipped: "Shipped",
  completed: "Completed",
  expired: "Expired",
  cancelled: "Cancelled",
} as const;

export type OrderStatus = keyof typeof STATUS_LABELS;

const ALLOWED_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  awaiting_payment: ["reserved", "cancelled", "expired"],
  reserved: ["materials_secured", "cancelled"],
  materials_secured: ["building_qc", "cancelled"],
  building_qc: ["balance_due", "cancelled"],
  balance_due: ["ready", "cancelled"],
  ready: ["shipped", "completed", "cancelled"],
  shipped: ["completed", "cancelled"],
  completed: [],
  expired: [],
  cancelled: [],
};

export const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  awaiting_payment: "reserved",
  reserved: "materials_secured",
  materials_secured: "building_qc",
  building_qc: "balance_due",
  balance_due: "ready",
  ready: "shipped",
  shipped: "completed",
};

export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(STATUS_LABELS, value);
}

export function validateStatusTransition(from: string, to: string) {
  if (!isOrderStatus(from) || !isOrderStatus(to)) return false;
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function getAllowedTransitions(status: OrderStatus) {
  return [...ALLOWED_TRANSITIONS[status]];
}
