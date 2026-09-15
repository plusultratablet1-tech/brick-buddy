# Brick Buddy Launch Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish Brick Buddy for public launch with legal/privacy/safety pages, metadata/SEO, analytics, resilient UI states, responsive cleanup, and a complete Preview-to-production verification pass.

**Architecture:** Preserve the approved storefront visual direction and existing preorder flow. Add focused App Router pages and metadata files, Vercel Analytics, and shared launch copy; then verify the full customer/admin journey on Preview before merging the single `feature/launch-ready` branch.

**Tech Stack:** Next.js 16.3.5 App Router, React 19.2, TypeScript 5.9, Vercel Analytics, Supabase, Vitest 3.2.

**Spec:** `docs/superpowers/specs/2026-09-15-launch-ready-phases-2-4-design.md`

## Global Constraints

- Do not invent shipping fees, refund promises, or delivery guarantees that are not defined by the business.
- Preserve the Brick Buddy independence statement and small-parts warning.
- Keep the Season 2 price at ₱449, reservation at ₱200, balance at ₱249, and unpaid hold at 24 hours.
- Keep Phase 1 preorder capacity and order numbering behavior unchanged.
- Launch polish must work on desktop and mobile and must not expose admin/customer secrets.
- Analytics must not require exposing Supabase secrets or payment-proof data.

---

### Task 1: Legal, privacy, safety, and preorder terms pages

**Files:**
- Create: `src/app/privacy/page.tsx`
- Create: `src/app/terms/page.tsx`
- Create: `src/app/safety/page.tsx`
- Create: `src/app/legal.module.css`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Produces public routes `/privacy`, `/terms`, `/safety` linked from the storefront footer.

- [ ] **Step 1: Write copy assertions or snapshot-oriented tests where practical** confirming the pages include the required values and disclosures.

Required exact business facts:

```text
₱449 total per unit
₱200 reservation per unit
₱249 remaining balance per unit
24-hour unpaid slot hold
Contains small parts; not suitable for children under 3
Brick Buddy is independent and is not affiliated with, authorized by, or endorsed by the LEGO Group
```

- [ ] **Step 2: Implement Privacy page** explaining collection/use of name, email, mobile, order/payment metadata, and uploaded payment proof for preorder operations and communication.

- [ ] **Step 3: Implement Terms page** covering small-batch preorder mechanics, reservation verification, hold expiry, balance due before fulfillment, and non-guaranteed timing language without inventing refund/shipping policy.

- [ ] **Step 4: Implement Safety page** with small-parts warning, age guidance, adult supervision recommendation, and independence statement.

- [ ] **Step 5: Add footer links** to all three routes and keep the existing disclosure visible on the main page.

- [ ] **Step 6: Run tests/build and commit** as `feat: add launch legal and safety pages`.

### Task 2: Metadata, sitemap, robots, and social defaults

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/app/sitemap.ts`
- Create: `src/app/robots.ts`

**Interfaces:**
- Produces stable metadata for the storefront and public legal pages.

- [ ] **Step 1: Add metadata assertions where practical** for title, description, robots indexability, and canonical base behavior.

- [ ] **Step 2: Implement root metadata** using Brick Buddy copy centered on portable screen-free creative play, Season 2 preorder, and `BRING • BUILD • BOND`.

- [ ] **Step 3: Add sitemap** for `/`, `/privacy`, `/terms`, `/safety`; do not include `/admin` or private API routes.

- [ ] **Step 4: Add robots** allowing public pages while discouraging crawling of `/admin` and `/api`.

- [ ] **Step 5: Run `npm run build` and commit** as `feat: add launch metadata and crawl controls`.

### Task 3: Vercel Analytics

**Files:**
- Modify: `package.json`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Uses `@vercel/analytics` only; no customer PII or payment data is sent manually.

- [ ] **Step 1: Add dependency** `@vercel/analytics` at a current compatible version.

- [ ] **Step 2: Render `<Analytics />`** once in the root layout.

- [ ] **Step 3: Run `npm install`, `npm test`, and `npm run build`**.

- [ ] **Step 4: Commit** as `feat: add Vercel Analytics`.

### Task 4: Storefront resilience and responsive cleanup

**Files:**
- Modify: `src/components/preorder-form.tsx`
- Modify: `src/components/preorder-form.module.css`
- Modify: `src/components/order-tracker.tsx`
- Modify: `src/components/order-tracker.module.css`
- Modify: `src/app/globals.css`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Produces consistent loading/error/success/expired/cancelled/sold-out states across preorder and tracking.

- [ ] **Step 1: Write failing behavior tests where practical** for disabled submit while loading, sold-out controls, lookup errors, upload errors, and terminal-state timeline rendering.

- [ ] **Step 2: Implement resilient form states** with visible inline errors, retry paths, clear success confirmations, and no fake payment completion claims.

- [ ] **Step 3: Improve responsive layout** for narrow phone widths, tablet, and desktop without changing the brand direction.

- [ ] **Step 4: Check accessibility basics**: labels tied to inputs, buttons have text, loading state announced, focus moves sensibly after successful lookup/submission, color is not the only status indicator.

- [ ] **Step 5: Run full tests/build and commit** as `feat: polish Brick Buddy launch experience`.

### Task 5: README/environment and operator runbook

**Files:**
- Modify: `README.md`
- Create: `docs/launch-runbook.md`

**Interfaces:**
- Documents required environment variables and safe operational procedures without including secret values.

- [ ] **Step 1: Update environment documentation** with:

```text
SUPABASE_URL
SUPABASE_SECRET_KEY
SUPABASE_PUBLISHABLE_KEY
RESEND_API_KEY (optional until email enabled)
ORDER_EMAIL_FROM (optional until email enabled)
```

- [ ] **Step 2: Document admin bootstrap**: create one Supabase Auth user, insert its user id/email into `admin_users`, verify login in Preview, never commit a password.

- [ ] **Step 3: Document operator flow** from pending proof through reservation approval, fulfillment status progression, balance review, and completion.

- [ ] **Step 4: Document test-data cleanup** including private storage objects, payment/events/outbox rows, order sequence reset only when no real orders exist, and final 15/15 availability check.

- [ ] **Step 5: Commit** as `docs: add Brick Buddy launch runbook`.

### Task 6: Full Preview verification and merge gate

**Files:**
- Update: PR description after verification.

**Interfaces:**
- Final gate for merging `feature/launch-ready` into `main`.

- [ ] **Step 1: Run `npm test`** and require all tests PASS.

- [ ] **Step 2: Run `npm run build`** and require production build PASS with public, customer, and admin routes present.

- [ ] **Step 3: Deploy Preview** and require Vercel status `success`.

- [ ] **Step 4: Execute one complete customer/admin scenario**: preorder -> lookup -> reservation proof -> admin approval -> materials secured -> building/QC -> balance due -> balance proof -> balance approval -> ready -> shipped -> completed.

- [ ] **Step 5: Verify security properties**: wrong email/order produce same generic lookup error, proof bucket is private, admin endpoints reject unauthenticated users, customer payloads omit internal notes/storage paths/reviewer ids.

- [ ] **Step 6: Verify email behavior**: if Resend is unconfigured, notification outbox records skipped/failure safely and business flow succeeds; if configured, send only to test addresses during Preview.

- [ ] **Step 7: Clean all test data/files** and confirm `orders=0`, launch availability `15/15`, and sequence restored for `BB-S2-001` only if no real customer order exists.

- [ ] **Step 8: Update PR verification evidence** and merge only after all checks are green.

- [ ] **Step 9: Verify production deployment** and production availability endpoint after merge; do not create a production test order unless explicitly intended.
