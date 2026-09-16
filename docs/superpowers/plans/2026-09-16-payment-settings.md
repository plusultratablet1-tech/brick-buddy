# Brick Buddy Payment Settings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the Brick Buddy owner manage customer-facing GCash instructions from the authenticated admin workspace and surface active instructions safely in preorder confirmation and order tracking.

**Architecture:** Add one locked-down singleton `payment_settings` row in Supabase. Server-only helpers validate, read, and update it; a protected admin API manages settings; customer APIs expose only active public fields and never fail an otherwise valid order solely because settings are unavailable.

**Tech Stack:** Next.js 16.3.5 App Router, React 19.2, TypeScript 5.9, Supabase JS 2.57, Supabase Postgres/Auth, Vitest 3.2.

**Spec:** `docs/superpowers/specs/2026-09-16-payment-settings-design.md`

## Global Constraints

- Preserve price ₱449 per unit, reservation ₱200, balance ₱249, and 24-hour unpaid hold.
- Preserve existing payment-proof review and order-status gating.
- Never hardcode the owner's real GCash account in source, tests, logs, or chat.
- Customer APIs expose only `method`, `accountName`, `accountNumber`, and `instructions` when settings are active.
- Inactive/missing/settings-read-failure states expose `paymentInstructions: null` and never invent dummy payment details.
- `anon` and generic `authenticated` roles get no direct table access.
- Keep production orders at 0 and availability at 15/15 during implementation verification.

---

### Task 1: Secure payment-settings data model

**Files:**
- Modify: `src/lib/database.types.ts`
- Supabase migration: `admin_managed_payment_settings`

**Interfaces:**
- Produces singleton `public.payment_settings` keyed by `id='default'`.
- Columns: `method`, `account_name`, `account_number`, `instructions`, `is_active`, `updated_at`, `updated_by`.

- [ ] **Step 1: Verify pre-migration state**

Run:
```sql
select to_regclass('public.payment_settings') as payment_settings;
select * from public.get_preorder_availability();
select count(*) as orders from public.orders;
```
Expected: table absent, capacity/remaining 15, orders 0.

- [ ] **Step 2: Apply migration**

```sql
create table public.payment_settings (
  id text primary key check (id = 'default'),
  method text not null default 'GCash' check (char_length(method) <= 40),
  account_name text not null default '' check (char_length(account_name) <= 120),
  account_number text not null default '' check (char_length(account_number) <= 64),
  instructions text not null default '' check (char_length(instructions) <= 500),
  is_active boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid null references auth.users(id),
  constraint active_payment_settings_complete check (
    not is_active or (char_length(btrim(account_name)) > 0 and char_length(btrim(account_number)) > 0)
  )
);

alter table public.payment_settings enable row level security;
revoke all on table public.payment_settings from anon, authenticated;
grant all on table public.payment_settings to service_role;

insert into public.payment_settings (id) values ('default');
```

- [ ] **Step 3: Verify security and clean launch state**

Run:
```sql
select id, method, account_name, account_number, instructions, is_active from public.payment_settings;
select grantee, privilege_type from information_schema.role_table_grants where table_schema='public' and table_name='payment_settings';
select * from public.get_preorder_availability();
select count(*) as orders from public.orders;
```
Expected: inactive default row, service-role-only access, 15/15, 0 orders.

- [ ] **Step 4: Add the table to `src/lib/database.types.ts`** with exact Row/Insert/Update fields and `updated_by -> auth.users` represented as no public-table relationship.

- [ ] **Step 5: Commit**

```bash
git add src/lib/database.types.ts
git commit -m "feat: add secure payment settings data model"
```

### Task 2: Payment-settings model and protected admin API

**Files:**
- Create: `src/lib/payment-settings.ts`
- Create: `src/lib/payment-settings.test.ts`
- Create: `src/app/api/admin/payment-settings/route.ts`
- Create: `src/app/api/admin/payment-settings/route.test.ts`

**Interfaces:**
- Produces `PublicPaymentSettings`, `AdminPaymentSettings`, `validatePaymentSettingsInput`, `getPublicPaymentSettings`, `getAdminPaymentSettings`, `updatePaymentSettings`.
- Produces authenticated `GET` and `PUT /api/admin/payment-settings`.

- [ ] **Step 1: Write failing model tests**

```ts
expect(validatePaymentSettingsInput({
  method: " GCash ", accountName: " Juan Dela Cruz ", accountNumber: " 09171234567 ", instructions: " Save the receipt. ", isActive: true,
})).toEqual({ ok: true, value: {
  method: "GCash", accountName: "Juan Dela Cruz", accountNumber: "09171234567", instructions: "Save the receipt.", isActive: true,
} });

expect(validatePaymentSettingsInput({
  method: "GCash", accountName: "", accountNumber: "", instructions: "", isActive: true,
}).ok).toBe(false);
```
Also assert inactive rows map to `null` publicly and active rows expose only the four public fields.

- [ ] **Step 2: Run targeted tests and confirm RED**

Run: `npm test -- src/lib/payment-settings.test.ts`
Expected: FAIL because module/functions do not exist.

- [ ] **Step 3: Implement `src/lib/payment-settings.ts`**

Use canonical id `default`, safe defaults `{ method:'GCash', accountName:'', accountNumber:'', instructions:'', isActive:false, updatedAt:null }`, server client reads/upserts, trimmed validation, and a public mapper that returns `null` unless active and complete.

- [ ] **Step 4: Re-run model tests and expect PASS**

Run: `npm test -- src/lib/payment-settings.test.ts`

- [ ] **Step 5: Write failing admin route tests** for 401 GET/PUT, successful GET, invalid activation 400, normalized PUT, actor UUID passed to updater, and sanitized backend failure.

- [ ] **Step 6: Implement protected route** using `requireAdmin`; return `{ settings }`; use status 400 for validation errors, 401 unauthorized, 500 generic load/save failures, and `cache-control: no-store` on successful GET.

- [ ] **Step 7: Run targeted route tests and expect PASS**

Run: `npm test -- src/app/api/admin/payment-settings/route.test.ts`

- [ ] **Step 8: Commit** `feat: add admin payment settings API`.

### Task 3: Customer API exposure without weakening order success

**Files:**
- Modify: `src/app/api/preorders/route.test.ts`
- Modify: `src/app/api/preorders/route.ts`
- Modify: `src/app/api/orders/lookup/route.test.ts`
- Modify: `src/app/api/orders/lookup/route.ts`

**Interfaces:**
- `POST /api/preorders` adds `paymentInstructions: PublicPaymentSettings | null`.
- `POST /api/orders/lookup` adds `paymentInstructions` only while reservation or balance payment is currently eligible for submission.

- [ ] **Step 1: Add failing preorder API tests**

Inject a `loadPaymentSettings` dependency after notification dependency. Assert an active object is returned in `paymentInstructions`; inactive/read failure returns `null` while status remains 201 and the created order remains successful.

- [ ] **Step 2: Run preorder route test and confirm RED**

Run: `npm test -- src/app/api/preorders/route.test.ts`

- [ ] **Step 3: Implement preorder API integration** by calling `getPublicPaymentSettings()` only after the order exists; wrap the settings read separately so failure maps to `null` and does not alter notification or order success.

- [ ] **Step 4: Run preorder tests and expect PASS**.

- [ ] **Step 5: Add failing lookup tests** for: `awaiting_payment + reservation not_submitted/rejected` exposes active settings; `balance_due + balance not_submitted/rejected` exposes active settings; reserved/pending/approved states return `paymentInstructions:null`; settings-read failure preserves status 200 and order data.

- [ ] **Step 6: Implement lookup integration** by mapping the order first, deriving payment eligibility from mapped payment states, then best-effort loading active settings only when payment is due.

- [ ] **Step 7: Run lookup tests and expect PASS**.

- [ ] **Step 8: Commit** `feat: expose active payment instructions to customers`.

### Task 4: Admin payment-settings UI

**Files:**
- Create: `src/components/admin-payment-settings.tsx`
- Modify: `src/components/admin-dashboard.tsx`
- Modify: `src/components/admin.module.css`

**Interfaces:**
- `AdminPaymentSettingsPanel` loads/saves `/api/admin/payment-settings` and redirects to `/admin/login` on 401.

- [ ] **Step 1: Implement focused panel component** with method, account name, account number, optional instructions, active checkbox, `Active`/`Inactive` badge, save button, and generic success/error feedback.

Core request shape:
```ts
await fetch('/api/admin/payment-settings', {
  method: 'PUT',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ method, accountName, accountNumber, instructions, isActive }),
});
```

- [ ] **Step 2: Mount the panel in `AdminDashboard`** between stats and order tools so payment configuration is visible before order operations.

- [ ] **Step 3: Add responsive admin styles** for payment form grid, status header, checkbox row, and feedback using existing admin visual language.

- [ ] **Step 4: Run full tests and build**

Run: `npm test && npm run build`
Expected: 0 failed tests and successful Next.js build.

- [ ] **Step 5: Commit** `feat: add payment settings admin panel`.

### Task 5: Customer payment-instruction UI

**Files:**
- Modify: `src/components/preorder-form.tsx`
- Modify: `src/components/preorder-form.module.css`
- Modify: `src/components/order-tracker.tsx`
- Modify: `src/components/order-tracker.module.css`

**Interfaces:**
- Shared client shape: `{ method:string; accountName:string; accountNumber:string; instructions:string } | null`.

- [ ] **Step 1: Extend preorder success type and UI**. When active settings exist, show exact reservation amount, method, account name/number, optional instructions, receipt/proof reminder, and "proof is reviewed before approval". When null, show a safe "Payment instructions are not currently published. Keep your order number and check the tracker before sending payment." message.

- [ ] **Step 2: Extend tracker response type and UI**. Render payment instructions directly above proof upload only when `showUpload && order.paymentInstructions`; when `showUpload` but settings are null, replace the upload form with an unavailable-instructions message so the customer is not encouraged to send money to an unknown destination.

- [ ] **Step 3: Add matching responsive payment-card styles** without hardcoded account values.

- [ ] **Step 4: Run full tests and build**

Run: `npm test && npm run build`
Expected: all tests pass and build succeeds.

- [ ] **Step 5: Commit** `feat: show configured payment instructions to customers`.

### Task 6: Preview release gate

**Files:**
- Update: `README.md` with admin-managed payment settings workflow.
- Update draft PR body with verification evidence.

- [ ] **Step 1: Verify database state**

```sql
select count(*) as orders from public.orders;
select count(*) as payments from public.payments;
select * from public.get_preorder_availability();
select id, is_active from public.payment_settings;
```
Expected: orders 0, payments 0, availability 15/15, payment settings inactive until owner configures them.

- [ ] **Step 2: Verify direct privileges** show no `anon` or generic `authenticated` access to `payment_settings`.

- [ ] **Step 3: Run fresh GitHub verification** and record exact test count plus build success.

- [ ] **Step 4: Verify latest Vercel Preview is READY**, homepage/admin login return 200, unauthenticated `/api/admin/payment-settings` returns 401, and no new runtime fatal/error logs are present.

- [ ] **Step 5: Run Supabase security advisor** and confirm no new direct-exposure finding from `payment_settings`.

- [ ] **Step 6: Keep PR draft/unmerged**. Production merge requires explicit owner approval after Preview review.
