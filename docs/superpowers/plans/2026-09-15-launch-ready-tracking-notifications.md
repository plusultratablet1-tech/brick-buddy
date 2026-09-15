# Brick Buddy Tracking + Notifications Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add account-free customer order lookup, live status timeline, relevant payment-proof actions, and resilient transactional email notifications.

**Architecture:** Customers authenticate each lookup with normalized order number + matching preorder email. Tracking responses are explicitly customer-safe. Notification delivery is decoupled through `notification_outbox`, so order/payment actions never fail because email delivery is unavailable.

**Tech Stack:** Next.js 16.3.5 App Router, React 19.2, TypeScript 5.9, Supabase JS 2.57, Postgres, Resend HTTP API, Vitest 3.2.

**Spec:** `docs/superpowers/specs/2026-09-15-launch-ready-phases-2-4-design.md`

## Global Constraints

- No customer accounts.
- Lookup requires order number + matching normalized email.
- Wrong order number and wrong email return the same generic failure.
- Customer responses exclude mobile, internal admin notes, reviewer identity, raw proof paths, and notification errors.
- Status timeline uses customer-visible `order_events` only.
- Email failure must never roll back a valid order/payment change.
- If `RESEND_API_KEY` is absent, outbox entries are marked `skipped` and the core flow continues.

---

### Task 1: Customer-safe order lookup domain

**Files:**
- Create: `src/lib/order-tracking.ts`
- Create: `src/lib/order-tracking.test.ts`
- Create: `src/app/api/orders/lookup/route.ts`
- Create: `src/app/api/orders/lookup/route.test.ts`

**Interfaces:**
- Produces `validateOrderLookup(input)`, `mapCustomerOrder(order,payments,events)`, `lookupOrderForCustomer(orderNumber,email)`.

- [ ] **Step 1: Write failing tests** for normalization, generic failure, safe field mapping, payment-state mapping, event filtering, expired/cancelled rendering inputs.

```ts
expect(validateOrderLookup({ orderNumber: " bb-s2-001 ", email: " TEST@EXAMPLE.COM " })).toEqual({
  ok: true,
  value: { orderNumber: "BB-S2-001", email: "test@example.com" },
});
```

- [ ] **Step 2: Run targeted tests** and confirm RED.

- [ ] **Step 3: Implement** `POST /api/orders/lookup` using server Supabase client; return 404 with identical `{error:"We couldn't verify that order."}` for either mismatch; return only approved customer-safe payload on success.

- [ ] **Step 4: Re-run targeted tests** and expect PASS.

- [ ] **Step 5: Commit** `feat: add secure customer order lookup`.

### Task 2: Customer tracker UI

**Files:**
- Modify: `src/components/order-tracker.tsx`
- Create: `src/components/order-tracker.module.css`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Tracker calls `POST /api/orders/lookup` and `POST /api/orders/payment-proof` only.

- [ ] **Step 1: Add component behavior tests where practical** for empty state, loading, generic error, successful timeline, payment upload visibility, terminal states.

- [ ] **Step 2: Run tests** and confirm RED.

- [ ] **Step 3: Implement** live lookup form with order number/email, friendly status labels, event timeline, totals, hold deadline, payment state badges, and context-sensitive reservation/balance upload form.

- [ ] **Step 4: Verify keyboard labels, mobile layout, and disabled/loading states** in production build.

- [ ] **Step 5: Commit** `feat: add live customer order tracking`.

### Task 3: Notification outbox + adapter

**Files:**
- Modify: `src/lib/database.types.ts`
- Create: Supabase migration `launch_ready_notification_outbox`
- Create: `src/lib/notifications.ts`
- Create: `src/lib/notifications.test.ts`

**Interfaces:**
- Produces `enqueueNotification(...)`, `deliverNotification(id)`, `renderNotification(template,payload)`, provider adapter using `RESEND_API_KEY` and `ORDER_EMAIL_FROM`.

- [ ] **Step 1: Write failing tests** for supported templates, missing provider key => skipped, provider success => sent, provider failure => failed + attempt increment, and HTML escaping of customer-controlled values.

```ts
expect(renderNotification("reservation_approved", { orderNumber: "BB-S2-001" }).subject).toContain("BB-S2-001");
```

- [ ] **Step 2: Run targeted tests** and confirm RED.

- [ ] **Step 3: Apply migration** creating `notification_outbox` with RLS/no anon direct writes.

- [ ] **Step 4: Implement adapter** using `fetch("https://api.resend.com/emails", ...)`; never expose provider response/errors to customer routes; store message id or sanitized error.

- [ ] **Step 5: Re-run tests** and expect PASS.

- [ ] **Step 6: Commit** `feat: add resilient transactional notification outbox`.

### Task 4: Wire notifications to business events

**Files:**
- Modify: `src/app/api/preorders/route.ts`
- Modify: `src/app/api/orders/payment-proof/route.ts`
- Modify: admin payment review route
- Modify: admin status transition route
- Modify/add associated route tests.

**Interfaces:**
- Uses `enqueueNotification` after authoritative DB changes; delivery is best-effort.

- [ ] **Step 1: Write failing route tests** asserting successful core response when notification delivery throws, plus correct template enqueue for preorder-created, proof-received, proof-approved/rejected, balance-due, ready, shipped/completed.

- [ ] **Step 2: Run targeted tests** and confirm RED.

- [ ] **Step 3: Implement notification enqueue/delivery hooks** after DB success. Do not change customer-visible status solely because email succeeds/fails.

- [ ] **Step 4: Re-run tests** and expect PASS.

- [ ] **Step 5: Commit** `feat: notify customers about order milestones`.

### Task 5: Admin notification retry

**Files:**
- Create: `src/app/api/admin/notifications/[notificationId]/retry/route.ts`
- Create: route test
- Modify: `src/components/admin-order-detail.tsx`

**Interfaces:**
- Admin-only retry calls `deliverNotification(notificationId)` for failed/skipped/pending records; sent records reject duplicate retry unless explicitly supported.

- [ ] **Step 1: Write failing tests** for unauthorized, missing record, successful retry, provider failure retained as failed.

- [ ] **Step 2: Run tests** and confirm RED.

- [ ] **Step 3: Implement route + admin UI retry control**.

- [ ] **Step 4: Re-run tests** and expect PASS.

- [ ] **Step 5: Commit** `feat: add admin notification retry`.

### Task 6: Tracking/Notification verification gate

- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Verify correct order+email lookup succeeds and wrong email/order both return identical generic errors.
- [ ] Verify no customer payload contains `admin_note`, `proof_path`, `reviewed_by`, or mobile.
- [ ] Verify outbox records `skipped` without `RESEND_API_KEY` and order operations still succeed.
- [ ] Verify with a test Resend key later only after user configures it; do not require it for merge readiness.
