import { describe, expect, it } from "vitest";
import {
  mapAvailabilityRow,
  mapOrderRow,
  validatePreorderInput,
} from "./preorders";

describe("validatePreorderInput", () => {
  it("normalizes a valid preorder", () => {
    const result = validatePreorderInput({
      name: "  Juan Dela Cruz  ",
      email: "  JUAN@Example.COM ",
      mobile: "0917 123-4567",
      quantity: 2,
      fulfillment: "shipping",
    });

    expect(result).toEqual({
      ok: true,
      value: {
        name: "Juan Dela Cruz",
        email: "juan@example.com",
        mobile: "09171234567",
        quantity: 2,
        fulfillment: "shipping",
      },
    });
  });

  it.each([
    "",
    "juan.example.com",
    "@example.com",
    "juan@",
  ])("rejects invalid email %j", (email) => {
    const result = validatePreorderInput({
      name: "Juan",
      email,
      mobile: "09171234567",
      quantity: 1,
      fulfillment: "shipping",
    });

    expect(result.ok).toBe(false);
  });

  it("rejects a blank name and a too-short mobile number", () => {
    expect(
      validatePreorderInput({
        name: "   ",
        email: "juan@example.com",
        mobile: "123",
        quantity: 1,
        fulfillment: "shipping",
      }).ok,
    ).toBe(false);
  });

  it.each([0, 4, 1.5, "2"])('rejects invalid quantity %j', (quantity) => {
    const result = validatePreorderInput({
      name: "Juan",
      email: "juan@example.com",
      mobile: "09171234567",
      quantity,
      fulfillment: "shipping",
    });

    expect(result.ok).toBe(false);
  });

  it("rejects unsupported fulfillment methods", () => {
    const result = validatePreorderInput({
      name: "Juan",
      email: "juan@example.com",
      mobile: "09171234567",
      quantity: 1,
      fulfillment: "pickup",
    });

    expect(result.ok).toBe(false);
  });
});

describe("database response mapping", () => {
  it("maps an order RPC row to the public API shape", () => {
    expect(
      mapOrderRow({
        order_number: "BB-S2-001",
        quantity: 2,
        total_amount: 898,
        reservation_total: 400,
        balance_total: 498,
        status: "awaiting_payment",
        hold_expires_at: "2026-09-16T03:00:00.000Z",
        remaining_slots: 13,
      }),
    ).toEqual({
      order: {
        orderNumber: "BB-S2-001",
        quantity: 2,
        totalAmount: 898,
        reservationTotal: 400,
        balanceTotal: 498,
        status: "awaiting_payment",
        holdExpiresAt: "2026-09-16T03:00:00.000Z",
      },
      remainingSlots: 13,
    });
  });

  it("maps availability RPC rows", () => {
    expect(
      mapAvailabilityRow({
        capacity: 15,
        remaining_slots: 7,
        sold_out: false,
      }),
    ).toEqual({ capacity: 15, remainingSlots: 7, soldOut: false });
  });
});
