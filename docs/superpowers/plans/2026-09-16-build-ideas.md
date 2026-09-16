# Brick Buddy Build Ideas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a public, QR-friendly `/build-ideas` page plus a homepage preview using only reproducible Brick Buddy starter builds made from the real included inventory.

**Architecture:** Keep the feature content-driven and isolated. A typed `build-ideas` data module is the source of truth for the six reproducible builds; a reusable visual component renders placements from that data; the route and homepage preview consume the same data so copy and visuals cannot drift. No order, payment, admin, or Supabase code is modified.

**Tech Stack:** Next.js 16.3.5 App Router, React 19.2, TypeScript 5.9, CSS Modules/global CSS, Vitest 3.2.

**Spec:** `docs/superpowers/specs/2026-09-16-build-ideas-design.md`

## Global Constraints

- Every illustrated starter build must use only standard 2×4 bricks from the included inventory: two each in red, yellow, orange, blue, green, and purple, plus the single 6×10 build plate.
- No wheels, specialty bricks, extra plates, or unavailable structural pieces.
- Surprise Buddy/minifigure may appear in copy but is never required as a structural piece.
- `/build-ideas` is public, authentication-free, and permanent for the printed QR target.
- Do not modify preorder pricing, inventory allocation, payment settings, proof uploads, tracking, order state, admin behavior, or database schema.
- Production merge still requires explicit owner approval.

---

### Task 1: Reproducible starter-build data model

**Files:**
- Create: `src/lib/build-ideas.ts`
- Create: `src/lib/build-ideas.test.ts`

**Interfaces:**
- Produces: `BrickColor`, `BrickPlacement`, `BuildIdea`, `brickBuddyInventory`, `buildIdeas`, `validateBuildIdea(build: BuildIdea): string[]`.
- Consumers: visual component, `/build-ideas` route, homepage preview.

- [ ] **Step 1: Write the failing inventory/data tests**

```ts
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
      const counts = Object.groupBy(build.placements, (brick) => brick.color);
      for (const group of Object.values(counts)) {
        expect(group?.length ?? 0).toBeLessThanOrEqual(2);
      }
    }
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npm test -- src/lib/build-ideas.test.ts`
Expected: FAIL because `src/lib/build-ideas.ts` does not exist.

- [ ] **Step 3: Implement the typed inventory and six exact layouts**

Use this coordinate convention: 6×10 plate is 10 studs wide (`x=0..9`) and 6 studs deep (`y=0..5`). `rotation: 0` has a 4×2 footprint; `rotation: 90` has a 2×4 footprint. `layer` is the brick stack height starting at 0.

```ts
export const brickColors = ["red", "yellow", "orange", "blue", "green", "purple"] as const;
export type BrickColor = (typeof brickColors)[number];

export type BrickPlacement = {
  color: BrickColor;
  x: number;
  y: number;
  layer: number;
  rotation: 0 | 90;
};

export type BuildIdea = {
  slug: string;
  name: string;
  difficulty: "Easy" | "Medium";
  label: "Quick Build" | "Build Challenge" | "Creative Build";
  story: string;
  steps: string[];
  remix: string;
  placements: BrickPlacement[];
};

export const brickBuddyInventory = {
  plate: { studsWide: 10, studsDeep: 6, quantity: 1 },
  bricks: Object.fromEntries(brickColors.map((color) => [color, 2])) as Record<BrickColor, number>,
};
```

Create these builds with legal plate coordinates and no more than two bricks of any color:

- `buddy-chair`: five bricks; two base bricks, seat, two-level back.
- `color-steps`: six bricks in three 2-stud-wide columns of heights 1, 2, and 3.
- `tiny-bridge`: four bricks; two supports and two side-by-side span bricks.
- `buddy-bench`: five bricks; two supports, two seat bricks, one raised back brick.
- `rainbow-tower`: six bricks stacked at one overlapping center position, alternating orientation.
- `buddy-hideout`: six bricks forming three two-brick-high U-shaped walls on the 6×10 plate.

`validateBuildIdea` must reject unknown colors by type, more than 12 placements, more than two of any color, negative coordinates/layers, and any footprint extending beyond the 10×6 plate.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `npm test -- src/lib/build-ideas.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/build-ideas.ts src/lib/build-ideas.test.ts
git commit -m "feat: define reproducible Brick Buddy build ideas"
```

---

### Task 2: Reusable Brick Buddy build visual

**Files:**
- Create: `src/components/build-idea-visual.tsx`
- Create: `src/components/build-idea-visual.module.css`
- Create: `src/components/build-idea-visual.test.tsx`

**Interfaces:**
- Consumes: `BuildIdea` and `BrickPlacement` from `@/lib/build-ideas`.
- Produces: `BuildIdeaVisual({ build, compact? })`.

- [ ] **Step 1: Write a render test using React server rendering**

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { buildIdeas } from "@/lib/build-ideas";
import { BuildIdeaVisual } from "./build-idea-visual";

it("renders one visual brick for every placement", () => {
  const build = buildIdeas[0];
  const html = renderToStaticMarkup(<BuildIdeaVisual build={build} />);
  expect((html.match(/data-build-brick=/g) ?? []).length).toBe(build.placements.length);
  expect(html).toContain(`aria-label="${build.name} build diagram"`);
});
```

- [ ] **Step 2: Run the visual test and verify RED**

Run: `npm test -- src/components/build-idea-visual.test.tsx`
Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement the component**

Render a branded 6×10 plate and one absolutely positioned element per placement. Pass CSS custom properties for x, y, layer, width, depth, and color; render four/eight small stud dots decoratively without changing the piece inventory.

```tsx
export function BuildIdeaVisual({ build, compact = false }: { build: BuildIdea; compact?: boolean }) {
  return (
    <div className={compact ? `${styles.visual} ${styles.compact}` : styles.visual} aria-label={`${build.name} build diagram`}>
      <div className={styles.plate}>
        {build.placements.map((brick, index) => {
          const width = brick.rotation === 0 ? 4 : 2;
          const depth = brick.rotation === 0 ? 2 : 4;
          return (
            <span
              key={`${build.slug}-${index}`}
              data-build-brick={brick.color}
              className={styles.brick}
              style={{
                "--x": brick.x,
                "--y": brick.y,
                "--layer": brick.layer,
                "--brick-width": width,
                "--brick-depth": depth,
              } as React.CSSProperties}
            />
          );
        })}
      </div>
    </div>
  );
}
```

Use CSS-only styling; do not add image dependencies or third-party libraries.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run: `npm test -- src/lib/build-ideas.test.ts src/components/build-idea-visual.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/build-idea-visual.tsx src/components/build-idea-visual.module.css src/components/build-idea-visual.test.tsx
git commit -m "feat: render Brick Buddy build diagrams"
```

---

### Task 3: Public `/build-ideas` QR destination

**Files:**
- Create: `src/app/build-ideas/page.tsx`
- Create: `src/app/build-ideas/build-ideas.module.css`
- Create: `src/app/build-ideas/page.test.tsx`
- Modify: `src/app/sitemap.ts`

**Interfaces:**
- Consumes: `buildIdeas`, `brickBuddyInventory`, `BuildIdeaVisual`.
- Produces: public static route `/build-ideas` and sitemap entry.

- [ ] **Step 1: Write the route content test**

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import BuildIdeasPage, { metadata } from "./page";

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
```

- [ ] **Step 2: Run route test and verify RED**

Run: `npm test -- src/app/build-ideas/page.test.tsx`
Expected: FAIL because route does not exist.

- [ ] **Step 3: Implement the route**

Include, in order: branded header/back link, hero, inventory strip, six Quick Build cards with exact count/2–4 steps/remix prompt and `BuildIdeaVisual`, Build for Your Buddy prompt chips, six Brick Buddy challenges, Build Together prompts, Make It Your Own section, main-site return CTA, safety and independence disclaimer.

Metadata must be:

```ts
export const metadata = {
  title: "Brick Buddy Build Ideas | Bring • Build • Bond",
  description: "Simple Brick Buddy build ideas, Buddy challenges, and screen-free activities using the pieces included in your Brick Buddy.",
};
```

- [ ] **Step 4: Add `/build-ideas` to the sitemap**

Preserve existing sitemap entries and append `${baseUrl}/build-ideas` with a suitable `changeFrequency: "monthly"` and lower priority than the homepage.

- [ ] **Step 5: Run route/data/visual tests and verify GREEN**

Run: `npm test -- src/lib/build-ideas.test.ts src/components/build-idea-visual.test.tsx src/app/build-ideas/page.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/app/build-ideas src/app/sitemap.ts
git commit -m "feat: add Brick Buddy build ideas page"
```

---

### Task 4: Homepage “What can you build?” preview and release gate

**Files:**
- Create: `src/components/build-ideas-preview.tsx`
- Create: `src/components/build-ideas-preview.module.css`
- Create: `src/components/build-ideas-preview.test.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: first three items from `buildIdeas`, `BuildIdeaVisual`.
- Produces: promotional homepage preview linking to `/build-ideas`.

- [ ] **Step 1: Write the homepage preview component test**

```tsx
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
```

- [ ] **Step 2: Run preview test and verify RED**

Run: `npm test -- src/components/build-ideas-preview.test.tsx`
Expected: FAIL because preview component does not exist.

- [ ] **Step 3: Implement and mount the preview**

`BuildIdeasPreview` must render the first three starter builds, a compact visual for each, and copy explaining that the physical product includes a mini guide/QR route. In `src/app/page.tsx`, import the component and mount it directly after the existing `#product` section and before `#how`. Do not alter `PreorderForm`, `OrderTracker`, pricing, availability wording, or admin links.

- [ ] **Step 4: Run the complete automated gate**

Run:

```bash
npm test
npm run build
```

Expected: all existing tests plus new tests PASS; production build completes successfully.

- [ ] **Step 5: Commit the homepage integration**

```bash
git add src/components/build-ideas-preview.tsx src/components/build-ideas-preview.module.css src/components/build-ideas-preview.test.tsx src/app/page.tsx
git commit -m "feat: preview build ideas on homepage"
```

- [ ] **Step 6: Open a draft PR and verify Vercel Preview**

Verify on the Preview deployment:
- `/build-ideas` → 200 and visually readable on mobile-sized layout.
- homepage → 200 and new preview is between Product and How It Works.
- `/api/preorders/availability` remains 200 with the same live slot count.
- unauthenticated `/api/admin/payment-settings` remains 401.
- no new production/preview error or fatal runtime logs from the feature.

Do not merge to `main` until the owner explicitly approves production release.
