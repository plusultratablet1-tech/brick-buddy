import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { buildIdeas } from "@/lib/build-ideas";
import { BuildIdeaVisual } from "./build-idea-visual";

describe("BuildIdeaVisual", () => {
  it("renders one visual brick for every placement", () => {
    const build = buildIdeas[0];
    const html = renderToStaticMarkup(<BuildIdeaVisual build={build} />);

    expect((html.match(/data-build-brick=/g) ?? []).length).toBe(build.placements.length);
    expect(html).toContain(`aria-label="${build.name} build diagram"`);
  });
});
