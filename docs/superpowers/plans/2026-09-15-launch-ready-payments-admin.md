# Brick Buddy Payments + Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add secure admin authentication, private payment-proof storage, payment review, and controlled order-status operations without weakening Phase 1 capacity logic.

**Architecture:** Keep Phase 1 preorder creation intact. Extend Supabase with admin/payment/event tables and transactional RPCs; all privileged access stays behind Next.js server routes. Admin identity uses Supabase Auth plus an explicit `admin_users` allowlist.

**Tech Stack:** Next.js 16.3.5 App Router, React 19.2, TypeScript 5.9, Supabase JS 2.57, Supabase Postgres/Auth/Storage, Vitest 3.2.

**Spec:** `docs/superpowers/specs/2026-09-15-launch-ready-phases-2-4-design.md`

## Global Constraints

- Preserve `POST /api/preorders` and `GET /api/preorders/availability` behavior.
- Preserve 15-unit Season 2 capacity and `BB-S2-001` sequential numbering.
- Keep `SUPABASE_SECRET_KEY` server-only.
- Private proof bucket: `payment-proofs`.
- Allowed proof types: JPEG, PNG, WebP, PDF; maximum 5 MB.
- Admin authorization requires both a valid Supabase Auth session and active `admin_users` membership.
- Reservation approval may transition `awaiting_payment -> reserved`; balance approval must not auto-advance fulfillment.
- Every status transition writes an immutable `order_events` row.

---

### Task 1: Database + Storage foundation

**Files:**
- Modify: `src/lib/database.types.ts`
- Create: Supabase migration `launch_ready_payments_admin`

**Interfaces:**
- Produces tables `admin_users`, `payments`, `order_events`; bucket `payment-proofs`; RPCs `review_payment(uuid,text,text)` and `transition_order_status(text,text,text)`.

- [ ] **Step 1: Write database verification SQL before migration**

```sql
select to_regclass('public.admin_users'), to_regclass('public.payments'), to_regclass('public.order_events');
```

Expected before migration: all `null`.

- [ ] **Step 2: Apply migration** extending `orders.status` to `awaiting_payment,reserved,materials_secured,building_qc,balance_due,ready,shipped,completed,expired,cancelled`; update `get_preorder_availability()` so every non-terminal active status consumes capacity; create three tables with RLS and no anon direct write policies; create private `payment-proofs` bucket with 5 MB and allowed MIME types; add transactional RPCs.

- [ ] **Step 3: Verify migration**

```sql
select id, public, file_size_limit, allowed_mime_types from storage.buckets where id='payment-proofs';
select status, count(*) from public.orders group by status;
select * from public.get_preorder_availability();
```

Expected: private bucket, 5 MB limit, availability still 15/15 on clean data.

- [ ] **Step 4: Regenerate `src/lib/database.types.ts`** to include all new tables/RPCs.

- [ ] **Step 5: Commit**

```bash
git add src/lib/database.types.ts
git commit -m "feat: add launch ready payment data model"
```

### Task 2: Admin session/auth guard

**Files:**
- Create: `src/lib/admin-auth.ts`
- Create: `src/lib/admin-auth.test.ts`
- Create: `src/app/api/admin/login/route.ts`
- Create: `src/app/api/admin/login/route.test.ts`
- Create: `src/app/api/admin/logout/route.ts`

**Interfaces:**
- Produces `validateAdminCredentials(input)`, `requireAdmin(request)`, and signed HTTP-only cookie `brick_buddy_admin`.

- [ ] **Step 1: Write failing tests** for normalized email, missing password, invalid session cookie, authenticated-but-not-allowlisted user, and active admin.

```ts
expect(validateAdminCredentials({ email: " ADMIN@EXAMPLE.COM ", password: "secret123" })).toEqual({
  ok: true,
  value: { email: "admin@example.com", password: "secret123" },
});
```

- [ ] **Step 2: Run** `npm test -- src/lib/admin-auth.test.ts src/app/api/admin/login/route.test.ts` and confirm failure.

- [ ] **Step 3: Implement minimal auth** using Supabase password sign-in server-side, store only the access/refresh session material in secure HTTP-only SameSite=Lax cookies, and require matching `admin_users.is_active=true` before success.

- [ ] **Step 4: Re-run targeted tests** and expect PASS.

- [ ] **Step 5: Commit** `feat: add secure admin authentication`.

### Task 3: Payment-proof submission core

**Files:**
- Create: `src/lib/payment-proofs.ts`
- Create: `src/lib/payment-proofs.test.ts`
- Create: `src/app/api/orders/payment-proof/route.ts`
- Create: `src/app/api/orders/payment-proof/route.test.ts`

**Interfaces:**
- Produces `validatePaymentProofFile(file)`, `normalizePaymentKind(value)`, and server upload flow keyed by order number + email.

- [ ] **Step 1: Write failing tests** for MIME allowlist, 5 MB limit, reservation eligibility, balance eligibility, duplicate pending proof rejection, randomized path, and cleanup when database insert fails.

```ts
expect(validatePaymentProofFile({ type: "image/png", size: 5 * 1024 * 1024 })).toEqual({ ok: true });
expect(validatePaymentProofFile({ type: "image/png", size: 5 * 1024 * 1024 + 1 }).ok).toBe(false);
```

- [ ] **Step 2: Run targeted tests** and confirm RED.

- [ ] **Step 3: Implement** multipart `POST /api/orders/payment-proof`; authenticate customer by normalized order number + email; upload to `payment-proofs/<order-id>/<uuid>.<safe-ext>`; insert `payments(status='pending')`; append customer-visible `payment_proof_submitted` event; never return `proof_path`.

- [ ] **Step 4: Run targeted tests** and expect PASS.

- [ ] **Step 5: Commit** `feat: add private payment proof submission`.

### Task 4: Admin payment review + status transition APIs

**Files:**
- Create: `src/lib/order-operations.ts`
- Create: `src/lib/order-operations.test.ts`
- Create: `src/app/api/admin/orders/[orderNumber]/payments/[paymentId]/review/route.ts`
- Create: `src/app/api/admin/orders/[orderNumber]/status/route.ts`
- Create: API route tests for both routes.

**Interfaces:**
- Produces `ALLOWED_TRANSITIONS`, `validateStatusTransition(from,to)`, `reviewPayment(...)`, `transitionOrderStatus(...)`.

- [ ] **Step 1: Write failing tests** for legal forward transitions, cancellation, illegal skip, reservation approval, rejection, double-review rejection, and balance approval not changing fulfillment state.

```ts
expect(validateStatusTransition("reserved", "materials_secured")).toBe(true);
expect(validateStatusTransition("reserved", "ready")).toBe(false);
```

- [ ] **Step 2: Run targeted tests** and confirm RED.

- [ ] **Step 3: Implement** admin-protected routes using transactional RPCs; each status change writes one event; proof review stores reviewer/time/note; approved reservation proof transitions to `reserved` only when current status is `awaiting_payment`.

- [ ] **Step 4: Re-run tests** and expect PASS.

- [ ] **Step 5: Commit** `feat: add payment review and order transitions`.

### Task 5: Admin dashboard UI

**Files:**
- Create: `src/app/admin/login/page.tsx`
- Create: `src/app/admin/page.tsx`
- Create: `src/app/admin/orders/[orderNumber]/page.tsx`
- Create: `src/components/admin-login-form.tsx`
- Create: `src/components/admin-dashboard.tsx`
- Create: `src/components/admin-order-detail.tsx`
- Create: `src/components/admin.module.css`
- Create: `src/app/api/admin/dashboard/route.ts`
- Create: `src/app/api/admin/orders/route.ts`
- Create: `src/app/api/admin/orders/[orderNumber]/route.ts`

**Interfaces:**
- Admin pages consume only protected `/api/admin/*` endpoints; proof previews use short-lived signed URLs returned after authorization.

- [ ] **Step 1: Write API tests** asserting 401 without admin, customer fields only for authenticated admin, dashboard counts, filters, and signed proof URL generated only on detail route.

- [ ] **Step 2: Run tests** and confirm RED.

- [ ] **Step 3: Implement API routes and UI** with summary cards, searchable/filterable order table, proof review controls, transition controls, payment records, and event history.

- [ ] **Step 4: Run tests + `npm run build`** and expect PASS.

- [ ] **Step 5: Commit** `feat: add Brick Buddy admin dashboard`.

### Task 6: Payments/Admin verification gate

- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Verify Phase 1 availability on clean DB remains 15/15.
- [ ] Verify RLS/anon table writes remain blocked.
- [ ] Verify bucket is private and direct public URL does not work.
- [ ] Verify no secret/publishable key value is committed.
- [ ] Commit any test-driven fixes with focused messages before proceeding to the tracking plan.
