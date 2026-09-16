# Brick Buddy Build Ideas Design

## Goal
Create a dedicated `/build-ideas` experience that extends the physical Brick Buddy product with reproducible mini-build inspiration, parent/child prompts, and a QR-friendly destination, while keeping the preorder/payment system unchanged.

## Product constraints
- Every illustrated starter build must be reproducible with the real Brick Buddy inventory: exactly 12 standard 2×4 bricks, two each in red, yellow, orange, blue, green, and purple, plus the 6×10 build plate.
- The Surprise Buddy/minifigure may appear as a character in the scene but must not be required as a structural piece.
- Do not show wheels, specialty bricks, plates other than the included 6×10 plate, or any other unavailable element in a starter-build instruction.
- The page must encourage remixing rather than imply there is only one correct build.

## Homepage change
Extend the existing "What's inside?" area with a compact "What can you build?" preview. It should explain that Brick Buddy includes a mini build guide and QR code, show three starter-build previews, and link to `/build-ideas` with an "Explore Build Ideas" CTA.

The preview is promotional only. It must not change preorder forms, pricing, inventory, payment, tracking, or admin behavior.

## `/build-ideas` page
Create a mobile-first public page with the following content hierarchy:

1. Hero: "Brick Buddy Build Ideas" / "Small builds. Big imagination." / BRING • BUILD • BOND, plus copy for visitors arriving from the printed QR code.
2. Inventory strip: 12 colorful 2×4 bricks, one 6×10 build plate, one Surprise Buddy, and an explicit note that the ideas are starting points.
3. Quick Builds: six starter cards—Buddy Chair, Color Steps, Tiny Bridge, Buddy Bench, Rainbow Tower, Buddy Hideout.
4. Build for Your Buddy: open-ended prompts such as chair, bed, table, lookout tower, doorway, stage, throne, and secret base.
5. Brick Buddy Challenge: Tallest, Strongest, Six-Color, Buddy Home, 5-Minute, and Copy Me challenges.
6. Build Together: parent/guardian/sibling prompts that reinforce the BOND brand pillar.
7. Make It Your Own: encourage changing colors, combining ideas, and rebuilding.
8. Return CTA to the main Brick Buddy preorder/tracker experience.
9. Safety and independent-brand disclaimer consistent with the rest of the site.

## Starter-build instruction model
Each of the six starter builds should have a clear, compact instruction presentation suitable for mobile and later reuse on a printed one-pager. For V1, each build needs:
- name
- difficulty label
- short purpose/story line
- exact brick count used
- 2–4 concise assembly steps
- a simple visual representation generated in the site from CSS/HTML or a static site asset, not an instruction that requires unavailable pieces
- a remix prompt

The visual does not need to mimic official LEGO instruction manuals. It should be clearly Brick Buddy branded and easy for a child/parent to follow.

## QR destination
The permanent destination for the printed insert is:
`https://brick-buddy-ten.vercel.app/build-ideas`

The page must work without authentication and be safe to link from a printed QR code. No query parameter is required for V1.

## SEO and navigation
- Page title: `Brick Buddy Build Ideas | Bring • Build • Bond`
- Meta description: `Simple Brick Buddy build ideas, Buddy challenges, and screen-free activities using the pieces included in your Brick Buddy.`
- Add `/build-ideas` to the sitemap.
- Add a suitable homepage link/CTA; no top-navigation redesign is required for V1.

## Safety and legal copy
Use the existing site language: Brick Buddy contains small parts, is not suitable for children under 3, and adult supervision is recommended. State that Brick Buddy is independent and is not affiliated with, authorized by, sponsored by, or endorsed by the LEGO Group.

## Non-goals for V1
- No user accounts or saved builds.
- No community upload/gallery.
- No analytics requirement.
- No QR generation/download tool in the website.
- No changes to pricing, order status, payment settings, slot allocation, proof uploads, or admin order operations.

## Testing and release
- Add tests for build-data validity so every starter build uses no more than 12 2×4 bricks and no unsupported piece type.
- Add route/content tests for the new page where practical within the existing Vitest setup.
- Run the full test suite and production build.
- Deploy to Vercel Preview and verify `/build-ideas`, homepage, and live preorder availability.
- Production merge requires explicit owner approval.