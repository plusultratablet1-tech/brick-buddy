import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Home from "./page";

describe("Brick Buddy editorial homepage", () => {
  it("renders the approved story-driven product sequence while keeping ordering tools", () => {
    const html = renderToStaticMarkup(<Home />);

    expect(html).toContain("BUILD • BOND • BRING");
    expect(html).toContain("Meet Brick Buddy");
    expect(html).toContain("Why Brick Buddy Exists");
    expect(html).toContain("Build Anywhere");
    expect(html).toContain("What’s Inside");
    expect(html).toContain("Your Buddy Is a Surprise");
    expect(html).toContain("Build Together");
    expect(html).toContain("Portable by Design");
    expect(html).toContain("Ready to Bring a Buddy?");
    expect(html).toContain("12 × 2×4 bricks");
    expect(html).toContain("6×10 build plate");
    expect(html).toContain("Preorder");
    expect(html).toContain("Track your order");
  });

  it("uses the locked Brick Buddy product render as the main product image", () => {
    const html = renderToStaticMarkup(<Home />);

    expect(html).toContain("/images/brick-buddy-locked.png");
    expect(html).toContain("Locked Brick Buddy product views");
  });
});
