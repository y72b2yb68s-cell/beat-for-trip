# Beat For Trip

A single-store catalog for selling ready-made beats: browse, preview, buy, and download — no user accounts, no marketplace, just one store's catalog. Also sells a one-off **Exclusive Beat** (currently €30) as an instant purchase through the same checkout/payment flow.

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS, Prisma + PostgreSQL (see [Database Setup](#database-setup)), zod for validation, next-intl for i18n.

## Languages & currency

The public site is available in 9 languages (English default at `/`, others prefixed: `/hu`, `/it`, `/pl`, `/fr`, `/es`, `/ro`, `/cs`, `/de`). Translations live in `messages/*.json`. All prices are always EUR — currency is not user- or admin-configurable; only number formatting (comma vs. period, symbol position) changes per locale (`lib/currency.ts`). The admin panel itself stays English-only.

## Installation

```bash
npm install
cp .env.example .env        # fill in the values described below (needs a Postgres DATABASE_URL)
npm run db:migrate          # applies all migrations to your Postgres database
npm run db:seed             # seeds 5 placeholder beats (no audio files yet)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Admin panel is at `/admin/login`.

## Environment Variables

See `.env.example` for the full list with placeholder values — copy it to `.env` and fill in real values. Nothing in `.env.example` is a real secret.

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | Prisma connection string, a `postgresql://` URL. Same provider locally and in production (Prisma Postgres). |
| `NEXT_PUBLIC_APP_URL` | yes | Public base URL — used in SEO metadata, absolute links, and payment redirect/callback URLs. |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | yes | Admin panel login (`/admin/login`). No default; the app refuses to authenticate without both set. |
| `ADMIN_SESSION_SECRET` | yes | Random secret (32+ bytes) signing the admin session cookie. Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. |
| `TRIBUTE_API_KEY`, `TRIBUTE_WEBHOOK_SECRET` | no | Leave both empty to keep using the built-in Mock Payment provider. Setting **both** switches the app to the Tribute provider automatically — see [Tribute Integration](#tribute-integration). |

There is no storage-specific environment variable — see [Storage](#storage).

## Database Setup

The schema (`prisma/schema.prisma`) and every migration (`prisma/migrations/`) are committed to Git. The database is PostgreSQL (Prisma Postgres in production, via Vercel) — point `DATABASE_URL` at a `postgresql://` connection string.

Older SQLite-era migrations (from before the move to Postgres) are kept for history in `prisma/migrations_sqlite_archive/` — they don't apply to Postgres and are not run by `prisma migrate deploy`.

**Local dev:** point `DATABASE_URL` at your own local/dev Postgres instance (not the production one), then run `npm run db:migrate` to apply all migrations.

**Production:** `DATABASE_URL` is set in Vercel to the Prisma Postgres connection string. Run `npx prisma migrate deploy` against it to apply every migration in `prisma/migrations/` in order — idempotent and safe to run on every deploy.

## Admin

`/admin/login` → sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD` (session cookie signed with `ADMIN_SESSION_SECRET`, no password is stored in the database). From there:

- **`/admin/beats`** — add/edit/delete beats, toggle published/unpublished, and upload each beat's cover image, preview audio, and full audio file via the file pickers on its edit page. A beat is only purchasable once a full audio file has been uploaded (its `fileKey` is set).
- **`/admin/orders`** — view every order (regular Beat and Exclusive Beat), including customer email/name, price, currency, payment status, and — for Exclusive Beat orders — a fulfillment status (`PAID` → `IN_PROGRESS` → `COMPLETED`/`CANCELLED`) you can update from the table.

## Storage

Storage is behind a provider abstraction (`lib/storage/types.ts` defines `StorageProvider`; `lib/storage/index.ts` exports the active instance). Only one implementation exists today: `LocalStorageProvider` (`lib/storage/local-storage.ts`), which writes:

- **Public files** (cover art, preview audio) to `public/covers/` and `public/previews/` — served directly by Next.js.
- **Protected files** (the full, purchasable beat audio) to `storage/beats/` — outside `public/`, never served directly. The only way to read one is `storage.readProtectedFile(key)`, called exclusively from `/api/download/[token]` **after** verifying the order was paid (see below).

Real audio files (`storage/beats/*`, `public/covers/*`, `public/previews/*`) are intentionally **not committed to Git** — `.gitignore` excludes them (only `.gitkeep` placeholders are tracked). This means a fresh checkout of this repo has zero beats with audio until you upload them.

**For production**, you need persistent storage — a plain container filesystem is wiped on every redeploy:
- **Single-server host with a persistent volume** (e.g. Railway): mount the volume somewhere (e.g. `/data`) and symlink `storage/beats`, `public/covers`, `public/previews` into it at boot, so `LocalStorageProvider`'s relative paths resolve onto the volume unmodified. `scripts/railway-start.sh` does exactly this and is a working reference.
- **Object storage (S3 / R2 / Supabase Storage, etc.)**: implement `StorageProvider` against it and swap the one export in `lib/storage/index.ts` — no other code changes needed anywhere in the app.

Once storage is set up, **upload the real beats through `/admin/beats`** (cover + preview + full audio per beat) — there is no bulk-import script, and the placeholder beats from `npm run db:seed` have no audio.

## Payments

All payments — regular Beat purchases and Exclusive Beat purchases alike — go through one abstraction, so there is exactly one place to plug in a real provider:

- **`lib/payments/types.ts`** — the `PaymentProvider` interface every provider implements: `createPayment()`, `verifyWebhookSignature()`, `parseWebhookEvent()`.
- **`lib/payments/index.ts`** — `getPaymentProvider()`, the single entry point the rest of the app calls. It returns the **Tribute** provider once both `TRIBUTE_API_KEY` and `TRIBUTE_WEBHOOK_SECRET` are set, otherwise the **Mock** provider. This switch is automatic; no code changes are needed to go live once credentials exist.
- **`lib/payments/mock-provider.ts`** — `MockPaymentProvider`, a fully working simulated gateway used for local dev and this demo. It creates a pending payment + a redirect to an in-app page (`/payment/mock/[paymentId]`) with "Pay Now" / "Simulate Failed Payment" buttons, and signs a mock webhook payload with an HMAC dev secret.
- **`lib/payments/tribute-provider.ts`** — `TributePaymentProvider`, **currently a stub**. Every method throws with a clear message; `getPaymentProvider()` only ever hands this out once both Tribute env vars are set, so in normal operation these throws should never surface. See [Tribute Integration](#tribute-integration) for what needs filling in.
- **`lib/payments/process-webhook.ts`** — `processPaymentWebhook()`, the single source of truth that turns a *verified* payment-provider event into an Order state change (marks it `paid`/`failed`, issues a download token for regular Beat orders, sends the confirmation email). Both the real webhook endpoint and the mock gateway's "Pay Now" button funnel through this function — an order is never marked paid just because the browser was redirected somewhere.
- **`app/api/payment/webhook/route.ts`** — the real webhook endpoint a live provider calls. It reads a `x-signature` header (a placeholder name — swap it for whatever header Tribute actually sends) and hands the raw body + signature to `processPaymentWebhook()`.
- **`app/api/payment/create/route.ts`** (regular Beat) and **`app/api/payment/exclusive-beat/route.ts`** (Exclusive Beat) both call `getPaymentProvider().createPayment()` the same way — price and currency always come from the server (the beat's DB row, or `lib/exclusive-beat.ts`'s tier config for Exclusive Beat), never from the client.

## Tribute Integration

Tribute is **not implemented yet** — `TributePaymentProvider` in `lib/payments/tribute-provider.ts` is a stub with `TODO(tribute)` comments marking exactly what to fill in once Tribute's API docs/credentials are available:

1. **`createPayment()`** — POST to Tribute's payment-creation endpoint with `amount`/`currency`/`description`/`customerEmail` plus a webhook + return URL, and return `{ paymentId, redirectUrl }` from its response.
2. **`verifyWebhookSignature()`** — verify using Tribute's documented webhook signature scheme (typically HMAC-SHA256 of the raw body).
3. **`parseWebhookEvent()`** — map Tribute's webhook payload shape to `{ paymentId, status: "paid" | "failed" }`.

To go live:
1. Set `TRIBUTE_API_KEY` and `TRIBUTE_WEBHOOK_SECRET` in your production environment. `getPaymentProvider()` (`lib/payments/index.ts`) switches to `TributePaymentProvider` automatically the moment both are present — no other code needs to change.
2. Fill in the three methods above against Tribute's real API docs.
3. Point Tribute's webhook configuration at `POST {NEXT_PUBLIC_APP_URL}/api/payment/webhook`, and update the `x-signature` header name in `app/api/payment/webhook/route.ts` if Tribute uses a different header.
4. Test with a real (or Tribute sandbox) payment end to end: create an order, confirm the webhook fires, confirm the order flips to `paid`, confirm a regular Beat order gets a working download link and an Exclusive Beat order gets the "Exclusive Beat ordered" confirmation.

Nothing else needs to change — the catalog, checkout forms, Exclusive Beat flow, admin, and download security are all provider-agnostic already.

## Development

```bash
npm run dev     # start dev server
npm run lint    # eslint
npm run build   # production build (also runs TypeScript checks)
npm run db:studio  # browse the local database
```

## Production Deployment

This app has been demoed on Railway (see `scripts/railway-start.sh`, `railway.json` for a working reference: persistent volume for SQLite + storage, `prisma migrate deploy` on boot, `next start`), but nothing is Railway-specific — it's a standard Next.js app and runs anywhere Node.js does. At minimum, production needs:

1. **Persistent database** — Postgres recommended (see [Database Setup](#database-setup)); SQLite-on-a-volume also works for small/single-server setups.
2. **Persistent storage** for beat audio/cover files (see [Storage](#storage)) — a container's local disk alone is wiped on every redeploy.
3. **All required env vars set** (see [Environment Variables](#environment-variables)) — most importantly a real `NEXT_PUBLIC_APP_URL`, unique `ADMIN_PASSWORD`/`ADMIN_SESSION_SECRET`, and either Tribute credentials or none (Mock provider stays active as a safe fallback until Tribute is configured).
4. **`npx prisma migrate deploy`** run against the production database before/at boot.
5. Real beats uploaded through `/admin/beats` after deploy (they're not in Git — see [Storage](#storage)).
