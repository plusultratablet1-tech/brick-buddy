# Brick Buddy Phase 1 Preorder System Design

## Goal

Turn the current Brick Buddy preorder form into a real guest preorder system backed by the separate Supabase project in `sample's projects`, while preserving the existing storefront and Vercel auto-deploy flow.

## Scope

Phase 1 includes:

- Guest preorder with no customer account/login.
- Season 2 launch batch with a hard capacity of 15 units.
- Quantities of 1 to 3 units per preorder.
- Real order numbers in the form `BB-S2-001`.
- Pricing fixed at ₱449 total per unit, with ₱200 reservation and ₱249 remaining balance per unit.
- 24-hour temporary slot hold while payment is pending.
- Real database persistence in Supabase.
- Server-side preorder creation through Next.js rather than trusting the browser to write directly to database tables.
- A live remaining-slot count for the preorder UI.
- Clear sold-out and validation errors.

Phase 1 does not include payment-proof upload, admin approval UI, shipping tracking management, email/SMS sending, or customer authentication. Those belong to later phases.

## Existing System

The Brick Buddy site is a Next.js 16 application in `plusultratablet1-tech/brick-buddy`, deployed automatically to Vercel from `main`.

The existing preorder component only simulates success in the browser. It currently collects:

- Parent / guardian name
- Email
- Mobile number
- Quantity
- Fulfillment method

The selected Supabase project is `dyevdriqotjliumnistw` under the `sample's projects` organization. Inspection showed no public application tables, no application migrations, no Edge Functions, no storage buckets, and zero auth users, so it can be safely repurposed for Brick Buddy without deleting user data.

## Architecture

The browser submits preorder data to a Next.js route handler at `POST /api/preorders`.

The route validates the request and calls Supabase server-side. Slot allocation and order-number generation happen atomically inside Postgres so concurrent requests cannot oversell the 15-unit batch.

The browser never receives a privileged Supabase key. Database tables remain protected with Row Level Security and no direct anonymous table write policy.

A read-only endpoint `GET /api/preorders/availability` returns the number of currently available units for the active launch batch.

## Data Model

### `launch_batches`

One row represents the Season 2 launch batch.

Fields:

- `id uuid primary key`
- `code text unique not null` — `S2`
- `name text not null` — `Season 2 Launch`
- `capacity integer not null` — `15`
- `unit_price integer not null` — `449`
- `reservation_amount integer not null` — `200`
- `balance_amount integer not null` — `249`
- `hold_hours integer not null` — `24`
- `is_active boolean not null default true`
- `created_at timestamptz not null default now()`

### `orders`

Fields:

- `id uuid primary key`
- `order_number text unique not null`
- `batch_id uuid not null references launch_batches(id)`
- `customer_name text not null`
- `email text not null`
- `mobile text not null`
- `quantity integer not null check quantity between 1 and 3`
- `fulfillment text not null check fulfillment in ('shipping','meetup')`
- `unit_price integer not null`
- `reservation_amount integer not null`
- `balance_amount integer not null`
- `total_amount integer not null`
- `reservation_total integer not null`
- `balance_total integer not null`
- `status text not null default 'awaiting_payment'`
- `hold_expires_at timestamptz not null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Allowed Phase 1 statuses:

- `awaiting_payment`
- `reserved`
- `expired`
- `cancelled`

Only orders in `awaiting_payment` with an unexpired hold, plus `reserved` orders, consume batch capacity.

## Atomic Order Creation

Postgres function `create_preorder(...)` will:

1. Lock the active batch row.
2. Mark stale `awaiting_payment` orders as `expired` when their hold has elapsed.
3. Calculate currently consumed units.
4. Reject the request if requested quantity exceeds remaining capacity.
5. Generate the next sequential order number using a database sequence, formatted as `BB-S2-001`.
6. Copy pricing from the active batch into the order so historical orders remain correct even if future pricing changes.
7. Set `hold_expires_at = now() + 24 hours`.
8. Insert and return the new order.

The client cannot choose its own price, status, order number, batch, or hold duration.

## API Contract

### `POST /api/preorders`

Request body:

```json
{
  "name": "Juan Dela Cruz",
  "email": "juan@example.com",
  "mobile": "09171234567",
  "quantity": 1,
  "fulfillment": "shipping"
}
```

Success response: HTTP 201

```json
{
  "order": {
    "orderNumber": "BB-S2-001",
    "quantity": 1,
    "totalAmount": 449,
    "reservationTotal": 200,
    "balanceTotal": 249,
    "status": "awaiting_payment",
    "holdExpiresAt": "..."
  },
  "remainingSlots": 14
}
```

Validation failure: HTTP 400.

Sold out / insufficient slots: HTTP 409.

Unexpected server/database failure: HTTP 500 with a generic message; raw database errors are not sent to customers.

### `GET /api/preorders/availability`

Success response:

```json
{
  "capacity": 15,
  "remainingSlots": 15,
  "soldOut": false
}
```

## Frontend Behavior

The existing preorder card remains visually consistent with the storefront.

Changes:

- Remove the `V1 demo` disclaimer.
- Show `X of 15 slots remaining`.
- Disable quantity choices that exceed remaining capacity.
- Disable submission while request is in progress.
- Show useful validation/server errors inline.
- On success, show the real order number prominently.
- Show the exact reservation total based on quantity.
- Tell the customer their slots are held for 24 hours pending the ₱200-per-unit reservation payment.
- Do not claim payment has been received in Phase 1.

## Security

- RLS enabled on `launch_batches` and `orders`.
- No anonymous direct insert/update/delete policy on `orders`.
- Privileged Supabase credentials are server-only and never prefixed with `NEXT_PUBLIC_`.
- The API recalculates all monetary values and capacity server-side.
- Inputs are normalized and length-limited before database execution.
- Email and mobile values are stored only for fulfilling the preorder and later order communication.

## Environment

Vercel needs server-side Supabase configuration for the Brick Buddy project:

- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`

If the connected Vercel management tool cannot write environment variables, deployment of the feature can be prepared and verified in CI first, then the two variables must be added to the Brick Buddy Vercel project before merging to production.

## Testing

Database verification:

- Create one 1-unit preorder and verify remaining capacity falls from 15 to 14.
- Create a multi-unit preorder and verify capacity decreases by quantity.
- Verify sequential order numbers.
- Verify a request exceeding remaining capacity is rejected.
- Verify expired awaiting-payment holds no longer consume capacity.
- Verify direct anonymous table writes are blocked.

Application verification:

- Unit-test request validation and response mapping.
- Production-build the Next.js app.
- Deploy a preview/feature branch and submit a real test preorder against the Brick Buddy Supabase project.
- Clean up test order data before launch, leaving the active Season 2 batch at 15 available units.

## Rollout

1. Apply database migration and seed the Season 2 launch batch.
2. Add server-side Supabase configuration.
3. Add the Next.js API routes.
4. Update the preorder form.
5. Run automated and database tests.
6. Run a real preview preorder.
7. Remove test orders/reset launch availability.
8. Merge to `main` only after verification passes.
