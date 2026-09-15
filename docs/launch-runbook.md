# Brick Buddy Launch Runbook

## Before opening orders

- Confirm Vercel has `SUPABASE_URL` and `SUPABASE_SECRET_KEY` for Production and Preview. `SUPABASE_PUBLISHABLE_KEY` is recommended so the public Auth key can be rotated without a code change.
- Keep `RESEND_API_KEY` and `ORDER_EMAIL_FROM` optional until transactional email is ready.
- Confirm the active Season 2 batch reports 15/15 slots before real sales begin.
- Confirm the payment-proof bucket is private and limited to JPG, PNG, WebP, and PDF up to 5 MB.
- Confirm exactly the intended admin user is active in `public.admin_users`.

## Daily order operations

1. Open `/admin` and review orders awaiting payment and pending proof reviews.
2. Open the order detail page and inspect private payment proof using the temporary signed link.
3. Approve or reject the proof. Add a short note only when useful.
4. Reservation approval is the only normal action that moves `awaiting_payment` to `reserved`; the generic status control cannot bypass payment approval.
5. Move the order forward through `materials_secured` → `building_qc` → `balance_due`.
6. At `balance_due`, wait for balance proof and approve/reject it separately. The order cannot be marked `ready` until a balance payment is approved.
7. Move the paid order to `ready`, then `shipped` or directly `completed` for an appropriate meet-up flow.
8. Use the email outbox section to retry failed/skipped notifications after provider configuration is corrected.

## Customer support

Customers do not need an account. Ask them to use their order number and the same email used for preorder. Do not disclose an order based only on its order number. Never send internal admin notes, raw storage paths, or another customer's information.

## Payment proof rules

- Accepted: JPEG, PNG, WebP, PDF.
- Maximum: 5 MB.
- Uploading proof means `pending`, not paid/approved.
- Reservation and balance proofs are verified independently.
- A reservation proof submitted before the original hold expires keeps the launch slot reserved while the proof is waiting for admin review, even if the original deadline passes during review.
- If a reservation proof is rejected, the customer receives a fresh correction window using the batch hold duration so they can submit a replacement proof.
- Proof links shown to admin are temporary signed URLs; the underlying bucket remains private.

## Status meaning

- `awaiting_payment` — temporary launch-slot hold; an on-time pending reservation proof preserves the slot during review.
- `reserved` — reservation proof approved; unit remains committed to the customer.
- `materials_secured` — materials prepared for the order.
- `building_qc` — assembly/packing and quality check.
- `balance_due` — customer may submit remaining-balance proof; `ready` remains locked until balance approval.
- `ready` — order is fully paid and ready for fulfillment.
- `shipped` — marked shipped.
- `completed` — fulfillment complete.
- `expired` / `cancelled` — terminal and no longer consume launch capacity.

## Test-data cleanup before merge/launch

Only clean data that is clearly test data. If any real customer order exists, do not reset the order sequence.

For a fully test-only database state:

1. Remove test payment-proof storage objects.
2. Remove test notification outbox, order events, payments, and orders.
3. Confirm order count is zero.
4. Confirm availability returns 15/15.
5. Reset the order-number sequence only when there are no real orders and the goal is for the first real customer to receive `BB-S2-001`.

## Release gate

A release is ready only when:

- `npm test` passes.
- `npm run build` passes.
- Vercel Preview deploys successfully.
- Customer preorder → tracking → payment proof works in Preview/database integration checks.
- Admin authentication exists and protected admin APIs reject unauthenticated requests.
- Reservation approval and balance approval gates cannot be bypassed by ordinary status changes.
- Pending reservation proof preserves inventory while awaiting review.
- Wrong customer email receives a generic lookup failure.
- Proof files remain private.
- Test data is removed and launch inventory is restored.

After merge, verify the production deployment and availability endpoint without creating a production test order unless one is intentionally needed.
