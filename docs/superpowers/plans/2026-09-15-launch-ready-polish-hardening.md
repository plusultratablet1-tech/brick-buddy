# Brick Buddy Launch Polish + Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish Brick Buddy for launch with legal/privacy/safety disclosures, metadata/SEO/analytics, responsive UX hardening, complete regression coverage, Preview verification, and clean production rollout.

**Architecture:** Preserve the approved storefront direction and add focused launch surfaces rather than redesigning the site. Legal pages are static Next.js routes, analytics uses the official Vercel package, and release readiness is proven by automated tests plus one complete Preview scenario followed by test-data cleanup.

**Tech Stack:** Next.js 16.3.5, React 19.2, TypeScript 5.9, Vercel Analytics, Vitest 3.2, Supabase.

**Spec:** `docs/superpowers/specs/2026-09-15-launch-ready-phases-2-4-design.md`

## Global Constraints

- Do not invent shipping fees, refund guarantees, or delivery promises not defined by the business.
- Keep price copy at ₱449 total, ₱200 reservation, ₱249 balance, 24-hour unpaid hold.
- Keep independence disclosure: Brick Buddy is independent and not affiliated with, authorized by, or endorsed by the LEGO Group.
- Keep safety warning: small parts, not suitable for children under 3, adult supervision recommended.
- Preserve `BRING • BUILD • BOND` positioning.
- Production merge only after clean Preview end-to-end verification and cleanup.

---

### Task 1: Legal + privacy + safety pages

**Files:**
- Create: `src/app/privacy/page.tsx`
- Create: `src/app/terms/page.tsx`
- Create: `src/app/safety/page.tsx`
- Modify: `src/app/page.tsx`
- Modify relevant global CSS.

**Interfaces:**
- Static pages link from storefront footer and each other; no data mutation.

- [ ] **Step 1: Add page/content tests or build assertions** checking required price, hold, privacy-data categories, proof-verification language, independence disclosure, and safety warning are present.

- [ ] **Step 2: Run tests/build** and confirm missing routes/content fail.

- [ ] **Step 3: Implement pages** with plain-language operational disclosures and explicit note that the text is not jurisdiction-specific legal advice.

- [ ] **Step 4: Run tests/build** and expect PASS.

- [ ] **Step 5: Commit** `feat: add launch privacy terms and safety pages`.

### Task 2: Metadata, robots, sitemap, analytics

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/app/robots.ts`
- Create: `src/app/sitemap.ts`
- Modify: `package.json` / lockfile

**Interfaces:**
- Uses `@vercel/analytics/react` `<Analytics />`; metadata title/description reflect Brick Buddy and screen-free portable creative play.

- [ ] **Step 1: Add expected metadata/build checks** for title, description, sitemap routes, and robots production indexability.

- [ ] **Step 2: Install official `@vercel/analytics` dependency**.

- [ ] **Step 3: Implement metadata, robots, sitemap, and Analytics component** without adding third-party tracking beyond Vercel Analytics.

- [ ] **Step 4: Run `npm test` and `npm run build`** and expect PASS.

- [ ] **Step 5: Commit** `feat: add launch metadata seo and analytics`.

### Task 3: Storefront UX hardening

**Files:**
- Modify: `src/components/preorder-form.tsx`
- Modify: `src/components/preorder-form.module.css`
- Modify: `src/components/order-tracker.tsx`
- Modify: tracker/admin CSS as needed
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes existing availability/preorder/lookup/payment-proof APIs only.

- [ ] **Step 1: Add regression tests** for sold-out disablement, network/API errors, duplicate submission prevention, success confirmation, tracker loading/error/terminal states, upload progress/validation, and accessibility labels.

- [ ] **Step 2: Run targeted tests** and confirm RED for missing hardening behaviors.

- [ ] **Step 3: Implement UX improvements** with stable loading states, inline actionable errors, retry buttons where appropriate, disabled duplicate actions, mobile-friendly form/timeline/table overflow, and consistent success states.

- [ ] **Step 4: Run tests/build** and expect PASS.

- [ ] **Step 5: Commit** `fix: harden launch customer experience`.

### Task 4: Security/regression audit

**Files:**
- Modify tests and implementation only where audit exposes failures.

**Interfaces:**
- No new public interfaces; validates all existing ones.

- [ ] **Step 1: Run full test suite** `npm test`.
- [ ] **Step 2: Run production build** `npm run build`.
- [ ] **Step 3: Verify repository search** contains no real `SUPABASE_SECRET_KEY`, `RESEND_API_KEY`, passwords, proof URLs, or user PII.
- [ ] **Step 4: Verify Supabase security**: RLS enabled on Brick Buddy tables; anon direct table writes rejected; proof bucket private; service-only RPCs inaccessible to anon where appropriate.
- [ ] **Step 5: Verify capacity regression** by controlled test: 15 capacity, active states counted, expired/cancelled released, no oversell under sequential/concurrent-style RPC calls.
- [ ] **Step 6: Commit only evidence-driven fixes**.

### Task 5: Preview end-to-end launch rehearsal

**Files:**
- No source changes unless rehearsal finds a bug.

- [ ] **Step 1: Deploy `feature/launch-ready` Preview** and verify Vercel Ready.
- [ ] **Step 2: Ensure Preview has required Supabase vars; optional Resend vars may remain absent and must degrade to skipped notifications.**
- [ ] **Step 3: Create a clearly labeled test preorder through Preview.**
- [ ] **Step 4: Look up with correct order/email; verify wrong email gives generic failure.**
- [ ] **Step 5: Upload a safe test proof; confirm private storage object and pending payment row.**
- [ ] **Step 6: Bootstrap a temporary/approved admin identity, sign in, review proof, approve reservation, and verify `reserved` + timeline event.**
- [ ] **Step 7: Advance through `materials_secured -> building_qc -> balance_due`; upload/approve balance proof; continue `ready -> shipped -> completed`.**
- [ ] **Step 8: Verify customer tracker reflects each customer-visible event and admin-only data stays hidden.**
- [ ] **Step 9: Verify notification outbox records sent/skipped/failed as expected without blocking operations.**

### Task 6: Cleanup + PR + production rollout

- [ ] Delete all test proof objects, payment rows, events, notifications, and test orders.
- [ ] Reset order sequence only if there are still no real customer orders, preserving first real `BB-S2-001` behavior.
- [ ] Confirm clean launch database: 0 test orders and 15/15 availability unless real customer data now exists.
- [ ] Remove temporary test admin identity if it is not the production owner account; retain only explicitly approved admin allowlist entries.
- [ ] Run fresh `npm test` and `npm run build` after cleanup-related code changes, if any.
- [ ] Open Launch Ready PR to `main` with exact verification evidence.
- [ ] Merge only after user approval and all checks green.
- [ ] Verify production Vercel deployment, `/api/preorders/availability`, customer tracker, and admin login after merge.
