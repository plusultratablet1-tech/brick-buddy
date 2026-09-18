import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const pageSource = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");

describe("Brick Buddy editorial homepage", () => {
  it("contains the approved story-driven product sequence while keeping ordering tools", () => {
    expect(pageSource).toContain("BUILD • BOND • BRING");
    expect(pageSource).toContain("Meet Brick Buddy");
    expect(pageSource).toContain("Why Brick Buddy Exists");
    expect(pageSource).toContain("Build Anywhere");
    expect(pageSource).toContain("What’s Inside");
    expect(pageSource).toContain("Your Buddy Is a Surprise");
    expect(pageSource).toContain("Build Together");
    expect(pageSource).toContain("Portable by Design");
    expect(pageSource).toContain("Ready to Bring a Buddy?");
    expect(pageSource).toContain("12 × 2×4 bricks");
    expect(pageSource).toContain("6×10 build plate");
    expect(pageSource).toContain("<PreorderForm />");
    expect(pageSource).toContain("<OrderTracker />");
    expect(pageSource).toContain("<BuildIdeasPreview />");
  });

  it("uses the locked Brick Buddy product render as the main product image", () => {
    expect(pageSource).toContain("/images/brick-buddy-locked.png");
    expect(pageSource).toContain("Locked Brick Buddy product views");
  });
});
