# Brick Buddy

Season 2 storefront and preorder operations system for Brick Buddy — a portable creative-play concept built around **BRING • BUILD • BOND**.

## Live site

https://brick-buddy-ten.vercel.app

## Launch Ready preorder system

Brick Buddy uses Next.js server routes backed by Supabase. Customers can preorder without an account, track an order using the order number plus matching email, and upload reservation/balance payment proof. Admins use a private Supabase Auth login to review proofs, manage order status, configure customer-facing payment instructions, and see the complete event timeline.

Season 2 uses a 15-unit launch batch, quantities of 1–3, sequential order numbers such as `BB-S2-001`, a ₱449 total price per unit, ₱200 reservation, ₱249 balance, and a 24-hour unpaid reservation hold.

## Environment variables

Required for the preorder system:

```text
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SECRET_KEY=<server secret key>
SUPABASE_PUBLISHABLE_KEY=<Supabase publishable key>
```

Optional transactional email configuration:

```text
RESEND_API_KEY=<Resend API key>
ORDER_EMAIL_FROM=Brick Buddy <orders@your-verified-domain.example>
```

If Resend is not configured, order/payment actions still succeed. Notification attempts are safely recorded as skipped/failed rather than blocking the business workflow.

`SUPABASE_SECRET_KEY`, `RESEND_API_KEY`, and passwords must never be prefixed with `NEXT_PUBLIC_`, committed to the repository, or pasted into public logs.

## Admin bootstrap

1. Create the Brick Buddy owner/admin as a Supabase Auth email/password user in the Brick Buddy Supabase project.
2. Copy that Auth user's UUID and email into `public.admin_users` with `is_active = true`.
3. Configure `SUPABASE_PUBLISHABLE_KEY` for Preview and Production in Vercel.
4. Verify `/admin/login` in Preview before production use.
5. Never commit or share the admin password in source code.

## Payment settings

Customer-facing payment details are stored in the locked-down singleton `public.payment_settings` record and are managed from the authenticated Brick Buddy admin dashboard. The owner can set the payment method, customer-visible account name and number, optional instructions, and an Active switch without editing source code or redeploying.

Payment settings are safe by default: the canonical record starts inactive, and customers receive no account details until the owner explicitly activates a complete configuration. When active, the preorder confirmation shows the exact reservation amount and account details; the order tracker shows the same instructions only while a reservation or balance payment is actually due. If settings are inactive or temporarily unavailable, the order still exists and tracking still works, but the site does not invent or fall back to a dummy payment account.

Only server-side service-role code reads or updates the table. `anon` and generic `authenticated` roles have no direct table privileges. Real account details should be entered only through the authenticated admin interface; they should not be committed to GitHub or pasted into logs.

## Customer flow

1. Customer creates a preorder and receives `BB-S2-###`.
2. The requested units are held for 24 hours while reservation payment is pending.
3. If payment settings are active, the customer receives the current payment instructions and exact reservation amount.
4. Customer tracks the order with order number + matching email and uploads private payment proof.
5. Admin reviews the proof; approved reservation payment moves the order to `reserved`.
6. Admin advances the order through materials secured, building/QC, balance due, ready, shipped, and completed.
7. When balance is due, the tracker shows the current active payment instructions and the customer submits balance proof.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Verification

```bash
npm test
npm run build
```

Launch Ready changes are verified in Vercel Preview from the current feature branch before merge.

## Production

```bash
npm run build
npm start
```

Built with Next.js, Supabase, Vercel, and optional Resend transactional email.
