# Brick Buddy

Season 2 storefront and preorder operations system for Brick Buddy — a portable creative-play concept built around **BRING • BUILD • BOND**.

## Live site

https://brick-buddy-ten.vercel.app

## Launch Ready preorder system

Brick Buddy uses Next.js server routes backed by Supabase. Customers can preorder without an account, track an order using the order number plus matching email, and upload reservation/balance payment proof. Admins use a private Supabase Auth login to review proofs, manage order status, and see the complete event timeline.

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

## Customer flow

1. Customer creates a preorder and receives `BB-S2-###`.
2. The requested units are held for 24 hours while reservation payment is pending.
3. Customer tracks the order with order number + matching email and uploads private payment proof.
4. Admin reviews the proof; approved reservation payment moves the order to `reserved`.
5. Admin advances the order through materials secured, building/QC, balance due, ready, shipped, and completed.
6. Customer submits balance proof when the order reaches balance due.

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

## Production

```bash
npm run build
npm start
```

Built with Next.js, Supabase, Vercel, and optional Resend transactional email.
