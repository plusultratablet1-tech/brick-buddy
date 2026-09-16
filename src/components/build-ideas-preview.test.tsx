import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { BuildIdeasPreview } from "./build-ideas-preview";

it("promotes three starter builds and the build ideas route", () => {
  const html = renderToStaticMarkup(<BuildIdeasPreview />);

  expect(html).toContain("What can you build?");
  expect(html).toContain("Mini build guide + QR code");
  expect((html.match(/data-build-preview=/g) ?? []).length).toBe(3);
  expect(html).toContain('href="/build-ideas"');
  expect(html).toContain("Explore Build Ideas");
});
