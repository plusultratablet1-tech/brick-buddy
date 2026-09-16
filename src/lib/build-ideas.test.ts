import { describe, expect, it } from "vitest";
import { buildIdeas, validateBuildIdea } from "./build-ideas";

describe("Brick Buddy build ideas", () => {
  it("ships exactly six starter builds", () => {
    expect(buildIdeas).toHaveLength(6);
  });

  it("keeps every build inside the real Brick Buddy inventory", () => {
    for (const build of buildIdeas) {
      expect(validateBuildIdea(build), build.name).toEqual([]);
      expect(build.steps.length).toBeGreaterThanOrEqual(2);
      expect(build.steps.length).toBeLessThanOrEqual(4);
    }
  });

  it("never uses more than two bricks of any included color", () => {
    for (const build of buildIdeas) {
      const counts = build.placements.reduce<Record<string, number>>((acc, brick) => {
        acc[brick.color] = (acc[brick.color] ?? 0) + 1;
        return acc;
      }, {});

      for (const count of Object.values(counts)) {
        expect(count).toBeLessThanOrEqual(2);
      }
    }
  });
});
