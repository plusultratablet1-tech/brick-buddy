# Brick Buddy

Season 2 storefront for Brick Buddy — a portable creative-play concept built around **BRING • BUILD • BOND**.

## Live site

https://brick-buddy-ten.vercel.app

## Phase 1 preorder system

The storefront uses a server-side Next.js API backed by Supabase for guest preorders. The Season 2 launch batch has 15 units, supports quantities of 1–3, generates order numbers such as `BB-S2-001`, and places new orders on a 24-hour `awaiting_payment` hold.

Required server-only environment variables:

```text
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SECRET_KEY=<server secret key>
```

`SUPABASE_SECRET_KEY` must never be prefixed with `NEXT_PUBLIC_` or committed to the repository.

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

Built with Next.js, Supabase, and Vercel.
