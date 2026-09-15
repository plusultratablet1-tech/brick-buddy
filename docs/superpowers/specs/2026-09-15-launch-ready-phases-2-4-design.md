# Brick Buddy Launch Ready — Phases 2–4 Design

## Goal

Turn the working Phase 1 preorder system into a launch-ready operating system for Brick Buddy by adding payment-proof handling, secure admin order management, customer order tracking, transactional notifications, launch polish, and production hardening without weakening the existing 15-slot reservation logic.

The implementation will be developed on `feature/launch-ready` and merged only after Preview verification passes end-to-end.

## Success Criteria

The finished system must allow a customer to:

- Create a preorder without an account.
- Receive and keep a real Brick Buddy order number.
- Look up an order using the order number plus the same email used at checkout.
- Upload reservation or balance payment proof securely.
- See the current order status and customer-visible timeline.
- Receive transactional email updates when configured.

The finished system must allow the Brick Buddy owner/admin to:

- Sign in securely at `/admin` using Supabase Auth.
- View all orders and their payment/fulfillment state.
- Review payment proofs from private storage.
- Approve or reject proofs with an optional admin note.
- Move orders through controlled fulfillment statuses.
- See the full order event history.
- Retry failed transactional notifications when needed.

The existing Phase 1 preorder flow must continue to prevent overselling the 15-unit Season 2 launch batch.

## Recommended Architecture

Brick Buddy remains a Next.js application deployed on Vercel with Supabase as the data, authentication, and private-file layer.

Sensitive operations remain server-side. The browser never receives the Supabase secret key and never writes directly to Brick Buddy application tables or private proof storage.

The launch-ready system is separated into four modules:

1. **Preorder core** — existing Phase 1 order creation and availability logic. This remains the source of truth for capacity and order-number generation.
2. **Payments** — payment proof submission, review, and approval/rejection state.
3. **Order operations** — customer tracking, order events, fulfillment status transitions, and admin dashboard actions.
4. **Notifications and launch layer** — transactional email, SEO/analytics/legal polish, resilience, and production verification.

These modules communicate through explicit server-side functions and database constraints rather than client-side assumptions.

## Authentication and Authorization

### Customers

Customers do not create accounts.

A customer lookup or upload request must provide:

- `order_number`
- the exact email address used when the order was created, normalized to lowercase/trimmed form

The server returns the same generic not-found/invalid response whether the order number is wrong or the email does not match. Customer APIs never return internal admin notes, raw payment storage paths, or unrelated customer data.

### Admin

Admin access uses Supabase Auth email/password authentication.

Authorization is not based only on being an authenticated Supabase user. An authenticated user must also have an active record in a new `admin_users` allowlist table.

The initial launch requires one admin account. Additional admins can be added later without changing the authorization model.

Admin sessions use secure HTTP-only cookies through the Next.js server layer. Every `/api/admin/*` route verifies both the active auth session and the `admin_users` allowlist before reading or mutating order data.

## Data Model

### Existing `orders` table

The current table remains the canonical order record.

The status constraint will be extended to allow:

- `awaiting_payment`
- `reserved`
- `materials_secured`
- `building_qc`
- `balance_due`
- `ready`
- `shipped`
- `completed`
- `expired`
- `cancelled`

Capacity behavior remains unchanged: only unexpired `awaiting_payment` orders and active `reserved`/fulfillment orders consume launch capacity. `expired` and `cancelled` orders do not consume capacity.

The implementation must preserve the Phase 1 atomic reservation function and update its capacity-status logic carefully so later fulfillment statuses remain counted as sold/reserved units.

### `admin_users`

Purpose: explicit authorization allowlist for admin access.

Fields:

- `user_id uuid primary key references auth.users(id) on delete cascade`
- `email text not null`
- `is_active boolean not null default true`
- `created_at timestamptz not null default now()`

No anonymous/public table access is permitted.

### `payments`

Purpose: one record per submitted reservation or balance payment proof.

Fields:

- `id uuid primary key default gen_random_uuid()`
- `order_id uuid not null references orders(id) on delete cascade`
- `kind text not null check kind in ('reservation','balance')`
- `expected_amount integer not null check expected_amount >= 0`
- `submitted_amount integer null check submitted_amount >= 0`
- `status text not null default 'pending' check status in ('pending','approved','rejected')`
- `proof_path text not null`
- `proof_mime_type text not null`
- `proof_original_name text not null`
- `customer_note text null`
- `admin_note text null`
- `submitted_at timestamptz not null default now()`
- `reviewed_at timestamptz null`
- `reviewed_by uuid null references auth.users(id)`

For launch, only one active pending/approved payment per order/kind should exist. A rejected proof may be superseded by a new submission.

Reservation proof approval changes an order from `awaiting_payment` to `reserved`. Balance proof approval records payment completion but does not automatically skip fulfillment status; the admin controls the fulfillment status separately.

### `order_events`

Purpose: immutable timeline of important order changes.

Fields:

- `id uuid primary key default gen_random_uuid()`
- `order_id uuid not null references orders(id) on delete cascade`
- `event_type text not null`
- `from_status text null`
- `to_status text null`
- `title text not null`
- `message text null`
- `customer_visible boolean not null default true`
- `actor_type text not null check actor_type in ('system','customer','admin')`
- `actor_user_id uuid null references auth.users(id)`
- `created_at timestamptz not null default now()`

Events are append-only. Updating or deleting prior customer-visible history is not part of the launch scope.

### `notification_outbox`

Purpose: make email failures visible and retryable without blocking order operations.

Fields:

- `id uuid primary key default gen_random_uuid()`
- `order_id uuid null references orders(id) on delete cascade`
- `recipient text not null`
- `template text not null`
- `payload jsonb not null default '{}'::jsonb`
- `status text not null default 'pending' check status in ('pending','sent','failed','skipped')`
- `attempt_count integer not null default 0`
- `provider_message_id text null`
- `last_error text null`
- `last_attempt_at timestamptz null`
- `created_at timestamptz not null default now()`

Core order/payment operations succeed even when email delivery fails. Failed messages remain available for admin retry.

## Private Payment-Proof Storage

Create a private Supabase Storage bucket named `payment-proofs`.

Accepted file types:

- JPEG
- PNG
- WebP
- PDF

Maximum file size: 5 MB.

Customers do not upload directly with anonymous Storage permissions. The Next.js server validates order number/email, validates file type and size, creates a randomized server-controlled storage path, and uploads the file using server credentials.

Stored filenames must not trust the original filename for uniqueness or path construction.

The admin dashboard receives short-lived signed URLs from the server only after admin authorization succeeds.

Payment proofs are never placed in a public bucket.

## Customer Tracking Flow

The storefront gains an order tracking area with fields for order number and email.

The tracking endpoint returns only customer-safe data:

- order number
- quantity
- fulfillment method
- order total
- reservation total
- balance total
- current fulfillment status
- reservation hold deadline when relevant
- payment states for reservation/balance
- customer-visible order events

The UI shows a clear status timeline using friendly labels:

- Awaiting reservation payment
- Reserved
- Materials secured
- Building / quality check
- Balance due
- Ready
- Shipped
- Completed

Expired/cancelled orders show a terminal state instead of the normal progress timeline.

Payment-proof upload appears only when it is relevant to the order/payment state.

## Payment Submission Flow

For reservation payment:

1. Customer looks up the order using order number + email.
2. Server verifies the order is eligible for reservation proof submission.
3. Customer uploads proof and may enter the amount paid plus an optional note.
4. Server validates file type/size and writes the private file.
5. A `payments` row is created with `status='pending'`.
6. A customer-visible `order_events` row records that payment proof was submitted.
7. Admin sees the payment in the review queue.

For balance payment, the same flow applies when the order is at or beyond `balance_due` and still has an unpaid balance.

Submitting proof does not automatically mark payment as approved.

## Admin Dashboard

### `/admin/login`

Email/password login form using Supabase Auth.

Failed login messages remain generic. Successful login redirects to `/admin`.

### `/admin`

Launch dashboard summary:

- total active orders
- awaiting payment
- pending proof reviews
- reserved/in production
- balance due
- ready/shipped/completed
- remaining launch slots

Order table supports basic status filtering and search by order number, customer name, email, or mobile.

### `/admin/orders/[orderNumber]`

Detailed order view includes:

- customer/contact details
- quantity and fulfillment method
- pricing totals
- current status
- hold deadline
- reservation and balance payment records
- proof preview/download through signed private access
- approve/reject controls
- status-transition controls
- full event history
- internal admin notes associated with proof reviews

The admin UI does not expose raw service credentials or direct table mutation controls.

## Status Transition Rules

The server enforces valid transitions rather than accepting arbitrary status strings from the browser.

Primary path:

`awaiting_payment → reserved → materials_secured → building_qc → balance_due → ready → shipped → completed`

Additional terminal paths:

- `awaiting_payment → expired`
- active status → `cancelled` by admin

The UI may allow an admin to correct a status backward only through an explicit controlled override action if implemented. The default launch interface follows the primary forward path.

Approving reservation payment creates the `reserved` transition automatically when the current status is `awaiting_payment`.

Balance-payment approval does not automatically move `balance_due` to `ready`; production readiness remains an admin-controlled fulfillment decision.

Every status transition creates an `order_events` record in the same logical operation.

## Notifications

Transactional customer email uses Resend through a server-side notification adapter.

Environment variable:

- `RESEND_API_KEY`

Optional configuration:

- `ORDER_EMAIL_FROM`

The initial templates are:

- preorder created / reservation instructions
- payment proof received
- reservation payment approved
- payment proof rejected
- order status updated
- balance due
- balance payment approved
- ready for fulfillment
- shipped/completed

Email sending is best-effort after the authoritative database action. The notification outbox records attempts and failures.

If `RESEND_API_KEY` is not configured, notifications are recorded as `skipped` and the rest of the website remains functional. Launch can therefore be tested before email-provider credentials are supplied.

SMS is intentionally out of scope for this build.

## API Surface

Existing Phase 1 routes remain:

- `POST /api/preorders`
- `GET /api/preorders/availability`

New customer routes:

- `POST /api/orders/lookup`
- `POST /api/orders/payment-proof`

New admin-auth routes:

- `POST /api/admin/login`
- `POST /api/admin/logout`

New protected admin routes:

- `GET /api/admin/dashboard`
- `GET /api/admin/orders`
- `GET /api/admin/orders/[orderNumber]`
- `POST /api/admin/orders/[orderNumber]/payments/[paymentId]/review`
- `POST /api/admin/orders/[orderNumber]/status`
- `POST /api/admin/notifications/[notificationId]/retry`

The exact route grouping may be adjusted to follow existing Next.js App Router conventions, but these capabilities and authorization boundaries are required.

## Security Requirements

- Preserve RLS on all Brick Buddy application tables.
- No direct anonymous table insert/update/delete access.
- No public Storage access to `payment-proofs`.
- Keep `SUPABASE_SECRET_KEY` server-only.
- Add a server-side Supabase publishable/anon key for Auth operations as needed; never use the secret key in browser code.
- Verify admin session and allowlist membership for every admin API action.
- Validate all customer lookup inputs server-side.
- Use generic customer lookup errors to reduce order enumeration.
- Normalize order numbers and emails before comparison.
- Limit payment-proof uploads to approved MIME types and 5 MB.
- Randomize storage paths and never trust customer filenames as paths.
- Validate status transitions and payment-review actions server-side.
- Never include internal admin notes in customer responses.
- Never return raw database/storage errors to customers.

## Launch Polish

The storefront receives launch-focused improvements without redesigning the approved visual direction.

Changes include:

- real customer order tracker replacing static next-step copy
- payment-proof upload states
- clear loading, success, failure, expired, cancelled, and sold-out states
- mobile/desktop responsive cleanup around forms and timeline
- metadata/title/description and social preview defaults
- sitemap/robots support as appropriate for the deployed site
- Vercel Analytics integration
- footer links to dedicated Privacy, Terms/Preorder Terms, and Safety/Independence pages
- consistent disclosure that Brick Buddy is independent and not affiliated with, authorized by, or endorsed by the LEGO Group
- clear small-parts warning and age guidance

The build will not invent final shipping fees, refund promises, or delivery guarantees that the business has not defined.

## Privacy and Legal Content

The Privacy page explains that customer name, email, mobile number, order/payment metadata, and uploaded payment proof are used to process the preorder and communicate order progress.

The Terms/Preorder Terms page covers the current ₱449 total, ₱200 reservation, ₱249 balance, 24-hour unpaid hold, small-batch nature, fulfillment method, payment-review requirement, and the fact that submitted proof is subject to verification.

The Safety/Independence content states that the product contains small parts, is not suitable for children under 3, recommends adult supervision, and clearly separates Brick Buddy from the LEGO Group.

These pages are operational product disclosures, not a substitute for jurisdiction-specific legal advice.

## Error Handling and Resilience

Customer-facing APIs return stable generic messages for authentication/lookup failures and sanitized messages for validation errors.

File upload failure does not create a completed payment record.

Payment review and order-status transition logic must be transactional where multiple database rows change together.

Notification delivery failure never rolls back an already-valid order/payment transition.

Admin pages display actionable internal errors without exposing secrets.

## Environment Variables

Existing:

- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`

New:

- `SUPABASE_PUBLISHABLE_KEY` — server-side Auth client key
- `RESEND_API_KEY` — optional until transactional email is enabled
- `ORDER_EMAIL_FROM` — optional sender identity used when Resend is enabled

No customer-facing feature may require the Supabase secret key in browser code.

## Admin Bootstrap

The code can be completed and Preview-tested before the final admin identity is known.

Before production admin use:

1. Create the chosen admin user in Supabase Auth.
2. Insert that user ID/email into `admin_users` with `is_active=true`.
3. Verify login and admin authorization in Preview.

No default admin password is committed to GitHub or stored in source code.

## Testing Strategy

### Database tests

Verify:

- Phase 1 reservation capacity still cannot oversell.
- All active fulfillment statuses continue to consume capacity.
- Expired/cancelled orders do not consume capacity.
- Payment proof records obey valid kind/status constraints.
- Reservation approval transitions an eligible order to `reserved`.
- Invalid duplicate/illegal payment actions are rejected.
- Status transitions follow the allowed state machine.
- Each successful status transition creates an event.
- RLS/direct anonymous writes remain blocked.

### Application unit/API tests

Cover:

- customer lookup normalization and generic failure responses
- customer-safe response mapping
- upload MIME/size validation
- payment proof submission rules
- admin-auth guard behavior
- payment approval/rejection behavior
- status transition validation
- notification enqueue/failure behavior
- no internal notes/storage paths in customer responses

### End-to-end Preview verification

Use test-only customer/admin data to verify:

1. Create a real preorder.
2. Look it up with correct order number/email.
3. Confirm incorrect email gets a generic failure.
4. Upload reservation proof.
5. Admin signs in and sees the pending proof.
6. Admin reviews/approves it.
7. Confirm order becomes `reserved` and timeline updates.
8. Advance the order through production states.
9. Submit and approve balance proof.
10. Continue to ready/shipped/completed.
11. Verify customer tracking reflects every customer-visible step.
12. Verify proof files remain private.
13. Verify notification outbox behavior with email configured and/or intentionally unavailable.
14. Remove all test orders/files/events/payments and restore launch capacity/sequence as needed before merge.

## CI and Rollout

1. Write tests before each implementation slice where practical.
2. Apply database/storage migrations in a controlled order.
3. Build admin authentication and authorization.
4. Build customer tracking/payment-proof APIs.
5. Build payment review and status-transition admin APIs.
6. Build customer/admin UI.
7. Add notification outbox/provider adapter.
8. Add legal/SEO/analytics launch polish.
9. Run full automated tests and production build.
10. Deploy Preview from `feature/launch-ready`.
11. Run the complete end-to-end Preview scenario.
12. Clean test data and files.
13. Open/update the Launch Ready pull request with verification evidence.
14. Merge to `main` only after all checks are green.
15. Verify the production availability endpoint and admin/customer flows after deployment.

## Explicit Non-Goals

The following are intentionally not part of Phases 2–4 launch scope:

- customer accounts
- social login
- SMS notifications
- automated payment-gateway charging
- shipping-carrier API integration
- advanced inventory/material purchasing management
- loyalty/rewards system
- multi-store/multi-branch support
- arbitrary admin database editing

These can be added later without changing the core launch architecture.
