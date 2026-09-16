# Admin-Managed Payment Settings Design

## Goal

Add one secure Brick Buddy payment-settings subsystem so the owner can configure customer-facing GCash instructions from the existing admin workspace without sending payment details through ChatGPT, editing source code, or redeploying for every account change.

## Scope

This feature manages customer-facing payment instructions only. It does not process payments, call GCash APIs, auto-approve payments, change the existing proof-review flow, or change preorder pricing.

The existing Season 2 commercial rules remain unchanged:
- Price: ₱449 per unit.
- Reservation: ₱200 per unit.
- Balance: ₱249 per unit.
- Unpaid preorder hold: 24 hours.
- Payment proof remains subject to admin review before approval.

## Data Model

Create a singleton table `public.payment_settings` with one canonical row keyed by a stable id such as `default`.

Fields:
- `id text primary key` — canonical value `default`.
- `method text not null default 'GCash'`.
- `account_name text not null default ''`.
- `account_number text not null default ''`.
- `instructions text not null default ''`.
- `is_active boolean not null default false`.
- `updated_at timestamptz not null default now()`.
- `updated_by uuid null references auth.users(id)`.

Validation constraints:
- `method` maximum 40 characters.
- `account_name` maximum 120 characters.
- `account_number` maximum 64 characters.
- `instructions` maximum 500 characters.
- `is_active=true` is allowed only when trimmed `account_name` and `account_number` are non-empty.

Security:
- Enable RLS on the table.
- Revoke direct access from `anon` and generic `authenticated` roles.
- Grant only `service_role` table access.
- Do not create a public read policy.
- Public/customer reads happen only through guarded server routes that return the explicitly allowed public fields.

## Server Model

Create a focused `src/lib/payment-settings.ts` module with these interfaces:

```ts
export type PublicPaymentSettings = {
  method: string;
  accountName: string;
  accountNumber: string;
  instructions: string;
};

export type AdminPaymentSettings = PublicPaymentSettings & {
  isActive: boolean;
  updatedAt: string | null;
};
```

Functions:
- `getPublicPaymentSettings()` returns `PublicPaymentSettings | null`; it returns `null` when the singleton is absent or inactive.
- `getAdminPaymentSettings()` returns the singleton state for the admin UI, using safe empty defaults if the row does not yet exist.
- `updatePaymentSettings(input, actorUserId)` validates lengths/activation requirements and upserts the canonical singleton row.

The public model must never expose `updated_by`, internal ids, or other database metadata.

## Admin API

Add a protected route at `/api/admin/payment-settings`.

`GET`:
- Requires existing `requireAdmin(request)` authentication/allowlist behavior.
- Returns `{ settings: AdminPaymentSettings }`.
- Returns 401 for unauthenticated/non-admin callers using the same conventions as existing admin APIs.

`PUT`:
- Requires admin authentication.
- Accepts JSON fields `method`, `accountName`, `accountNumber`, `instructions`, and `isActive`.
- Normalizes whitespace at boundaries.
- Rejects invalid lengths and rejects activation when name/number are blank.
- Upserts the singleton and records the authenticated admin UUID in `updated_by`.
- Returns the saved admin settings.

No public mutation route is added.

## Admin UI

Extend the existing `AdminDashboard` with a dedicated `Payment settings` card near the order tools.

The card shows:
- A clear status badge: `Active` or `Not configured` / `Inactive`.
- Method field, defaulting to `GCash`.
- Account name.
- Account number.
- Optional customer instructions.
- An `Active` toggle.
- A `Save payment settings` button.

UX rules:
- Saving inactive blank settings is allowed.
- Activating requires account name and number.
- The UI must show save success/error feedback without exposing server details.
- The admin password, Supabase secrets, and payment credentials beyond customer-display fields are never requested or stored.

## Customer Preorder Confirmation

The real preorder API remains responsible for creating the order. After successful creation, its response includes `paymentInstructions` only when active payment settings exist.

Response addition:

```ts
paymentInstructions: PublicPaymentSettings | null
```

The preorder success UI shows a payment card when `paymentInstructions` is non-null:
- Exact reservation amount due for the order.
- Payment method.
- Account name.
- Account number.
- Optional instructions.
- Reminder to keep the receipt and upload proof through the tracker.
- Reminder that upload is not approval.

When settings are inactive, the order still succeeds. The success UI instead says payment instructions are not currently published and the customer should use the tracker/check back for instructions. It must never fall back to dummy account details in production.

## Customer Tracker

Extend the authenticated customer lookup response with active `paymentInstructions` when either:
- reservation payment is due and eligible for proof upload, or
- balance payment is due and eligible for proof upload.

The tracker renders the same payment card directly above the proof-upload form, using the exact amount for the selected payment kind.

When payment settings are inactive, the tracker keeps the existing order/status information but does not invent an account number. The proof-upload form should not encourage payment to an unknown destination; instead display that payment instructions are temporarily unavailable.

Pending/approved payment states do not need to display the payment account because no new payment is being requested at that moment.

## Demo Preview

The existing PR #4 dummy-payment preview remains separate from this production subsystem and must not be merged as real payment configuration.

The production-ready feature must use database-managed settings, not hardcoded dummy GCash values. The preview branch may be closed after the production-ready payment-settings feature is validated.

## Error Handling

- Database read failure in an admin API returns the existing generic admin error convention.
- Database read failure while creating a preorder must not roll back or invalidate an already-created order solely because payment settings could not be loaded; return `paymentInstructions: null` and preserve the order.
- Customer lookup should likewise preserve valid order tracking even if payment settings cannot be loaded, returning no payment instructions rather than failing the entire lookup.
- Admin settings update failures return a generic save failure and do not partially update UI state.

## Testing

Use TDD for every behavior change.

Required coverage:
- Payment-settings validation and mapping.
- Inactive settings return no public instructions.
- Active settings return only public fields.
- Admin GET requires authentication and returns saved/default settings.
- Admin PUT requires authentication, rejects invalid activation, and saves normalized values.
- Preorder API returns active instructions and safely returns null when inactive/unavailable.
- Customer lookup exposes instructions only when a payment is currently due.
- Preorder UI renders active instructions and a safe unavailable state.
- Tracker renders active instructions beside proof upload and suppresses fake details when inactive.
- Existing order/payment/status tests remain green.

Release gate:
- Full test suite passes.
- Next.js production build passes.
- Vercel Preview is READY with no new runtime fatal/error logs.
- Supabase security advisor has no new direct-data-exposure findings caused by this feature.
- Database remains 0 real orders / 15 available slots during implementation and preview verification.
- Production is not merged until the feature branch is reviewed and explicitly approved for merge.
