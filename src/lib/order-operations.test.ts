import { describe, expect, it } from "vitest";
import {
  NEXT_STATUS,
  STATUS_LABELS,
  getAllowedTransitions,
  validateStatusTransition,
} from "./order-operations";

describe("order operations", () => {
  it("allows the normal forward production path after reservation", () => {
    expect(validateStatusTransition("reserved", "materials_secured")).toBe(true);
    expect(validateStatusTransition("materials_secured", "building_qc")).toBe(true);
    expect(validateStatusTransition("building_qc", "balance_due")).toBe(true);
    expect(validateStatusTransition("balance_due", "ready")).toBe(true);
    expect(validateStatusTransition("ready", "shipped")).toBe(true);
    expect(validateStatusTransition("shipped", "completed")).toBe(true);
  });

  it("does not let the generic status control bypass reservation approval", () => {
    expect(validateStatusTransition("awaiting_payment", "reserved")).toBe(false);
    expect(getAllowedTransitions("awaiting_payment")).toEqual(["cancelled", "expired"]);
  });

  it("only exposes ready after the balance payment is approved", () => {
    expect(getAllowedTransitions("balance_due", { balanceApproved: false })).toEqual(["cancelled"]);
    expect(getAllowedTransitions("balance_due", { balanceApproved: true })).toEqual(["ready", "cancelled"]);
  });

  it("rejects skipped or terminal transitions", () => {
    expect(validateStatusTransition("reserved", "ready")).toBe(false);
    expect(validateStatusTransition("completed", "ready")).toBe(false);
    expect(validateStatusTransition("cancelled", "reserved")).toBe(false);
  });

  it("allows admin cancellation from active states", () => {
    expect(validateStatusTransition("reserved", "cancelled")).toBe(true);
    expect(validateStatusTransition("balance_due", "cancelled")).toBe(true);
  });

  it("defines friendly labels and the default next step", () => {
    expect(STATUS_LABELS.building_qc).toBe("Building / quality check");
    expect(NEXT_STATUS.reserved).toBe("materials_secured");
    expect(NEXT_STATUS.ready).toBe("shipped");
  });
});
