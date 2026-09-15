import { describe, expect, it } from "vitest";
import { handleAvailabilityRequest } from "./route";

describe("GET /api/preorders/availability", () => {
  it("returns the public availability shape", async () => {
    const response = await handleAvailabilityRequest(async () => ({
      data: [{ capacity: 15, remaining_slots: 9, sold_out: false }],
      error: null,
    }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      capacity: 15,
      remainingSlots: 9,
      soldOut: false,
    });
  });

  it("returns a generic 500 without exposing database details", async () => {
    const response = await handleAvailabilityRequest(async () => ({
      data: null,
      error: { message: "private database error" },
    }));

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body).toEqual({ error: "Availability is temporarily unavailable." });
    expect(JSON.stringify(body)).not.toContain("private database error");
  });
});
