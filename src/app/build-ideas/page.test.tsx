import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import BuildIdeasPage, { metadata } from "./page";

describe("Build Ideas page", () => {
  it("renders the QR-friendly build ideas experience", () => {
    const html = renderToStaticMarkup(<BuildIdeasPage />);

    expect(html).toContain("Small builds. Big imagination.");
    expect(html).toContain("Got here by scanning the QR code");
    expect(html).toContain("Buddy Chair");
    expect(html).toContain("Rainbow Tower");
    expect(html).toContain("Build Together");
    expect(html).toContain("Back to Brick Buddy");
  });

  it("uses the approved page metadata", () => {
    expect(metadata.title).toBe("Brick Buddy Build Ideas | Bring • Build • Bond");
  });
});
