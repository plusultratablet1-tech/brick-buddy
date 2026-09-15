# Brick Buddy Phase 1 Preorder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the demo preorder form with a real guest preorder system backed by Supabase, with atomic 15-slot inventory, 24-hour holds, and real `BB-S2-001` order numbers.

**Architecture:** Next.js route handlers own all customer-facing database access. They call server-only Supabase RPCs; Postgres owns slot locking, expiration, pricing, and sequential order-number generation. The browser only receives aggregate availability and the created order summary.

**Tech Stack:** Next.js 16.3.5, React 19.2, TypeScript 5.9, Supabase Postgres, `@supabase/supabase-js`, Vitest.

**Spec:** `docs/superpowers/specs/2026-09-15-phase1-preorder-design.md`

## Global Constraints

- Guest checkout only; no customer login in Phase 1.
- Launch capacity is exactly 15 units.
- Quantity is 1–3 units per order.
- Unit price is ₱449; reservation is ₱200; balance is ₱249.
- Holds expire after 24 hours while status is `awaiting_payment`.
- Browser must never receive `SUPABASE_SECRET_KEY`.
- Direct anonymous writes to `orders` remain blocked by RLS.
- Merge to `main` only after database tests, automated tests, and production build pass.

---

### Task 1: Create the database schema and atomic preorder RPCs

**Files:**
- Database migration in Supabase project `dyevdriqotjliumnistw`

**Interfaces:**
- Produces RPC `create_preorder(p_customer_name text, p_email text, p_mobile text, p_quantity integer, p_fulfillment text)`.
- Produces RPC `get_preorder_availability()`.
- Produces tables `launch_batches` and `orders`.

- [ ] **Step 1: Apply a migration** creating the tables, sequence, indexes, RLS, active Season 2 batch, `create_preorder`, and `get_preorder_availability`.
- [ ] **Step 2: Run transactional database checks** for one-unit creation, multi-unit consumption, sequential numbering, insufficient capacity, expired holds, and RLS blocking.
- [ ] **Step 3: Clean test rows and restart the order sequence at 1** so launch availability returns to 15.
- [ ] **Step 4: Run Supabase security/performance advisors** and fix any relevant schema issues.

### Task 2: Add testable server-side preorder validation

**Files:**
- Modify: `package.json`
- Create: `src/lib/preorders.ts`
- Test: `src/lib/preorders.test.ts`

**Interfaces:**
- Produces `validatePreorderInput(input: unknown)` returning normalized customer input or a validation error.
- Produces response-mapping helpers for database order/availability rows.

- [ ] **Step 1: Add Vitest and Supabase JS dependencies/scripts.**
- [ ] **Step 2: Write failing tests** for valid normalization, invalid email, invalid mobile/blank fields, quantity outside 1–3, and invalid fulfillment.
- [ ] **Step 3: Run tests and confirm RED.**
- [ ] **Step 4: Implement minimal validation/mapping code.**
- [ ] **Step 5: Run tests and confirm GREEN.**

### Task 3: Add server-only Supabase client and API routes

**Files:**
- Create: `src/lib/supabase-server.ts`
- Create: `src/app/api/preorders/route.ts`
- Create: `src/app/api/preorders/availability/route.ts`
- Test: `src/app/api/preorders/route.test.ts`

**Interfaces:**
- `POST /api/preorders` returns HTTP 201 with order summary + remaining slots, 400 for validation, 409 for insufficient slots, and generic 500 otherwise.
- `GET /api/preorders/availability` returns capacity, remaining slots, and sold-out state.

- [ ] **Step 1: Write failing route tests** around validation and database-error-to-status mapping using injected helpers where needed.
- [ ] **Step 2: Run tests and confirm RED.**
- [ ] **Step 3: Implement the server-only Supabase client and route handlers.**
- [ ] **Step 4: Run tests and confirm GREEN.**

### Task 4: Replace the demo preorder UI with the live reservation flow

**Files:**
- Modify: `src/components/preorder-form.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css` only if new states need styling.

**Interfaces:**
- Loads `GET /api/preorders/availability`.
- Submits to `POST /api/preorders`.
- Displays real order number, reservation total, balance total, hold deadline, remaining slots, errors, and sold-out state.

- [ ] **Step 1: Update copy from 10 slots to 15 slots and remove the V1 demo claim.**
- [ ] **Step 2: Implement availability loading and quantity disabling.**
- [ ] **Step 3: Implement live submission with pending/error/success states.**
- [ ] **Step 4: Keep payment wording explicit that payment has not yet been received.**

### Task 5: Verification and rollout preparation

**Files:**
- Modify: `README.md` with required environment variables and local verification commands.

- [ ] **Step 1: Run all Vitest tests.**
- [ ] **Step 2: Run `npm run build` and require a clean production build.**
- [ ] **Step 3: Confirm database availability is 15 and there are zero test orders.**
- [ ] **Step 4: Confirm the feature branch contains no server secret.**
- [ ] **Step 5: Determine whether Vercel environment variables can be written through the available integration; if not, stop before production merge and provide the exact two required settings.**
- [ ] **Step 6: Open a PR to `main` only after all verification passes.**
