# Client Handoff — Beat For Trip

This file is a short, practical checklist for taking this project from "sources handed over" to "live in production." For technical detail on any item below, see `README.md` — it has dedicated sections for each of these topics.

## Already implemented

- Beat catalog with search, filters (genre, key, BPM range, price range, sort), and preview playback
- 9 locales (English default, plus Hungarian, Italian, Polish, French, Spanish, Romanian, Czech, German), all prices in EUR only
- Regular Beat purchase: browse → buy → checkout → payment → protected download link (7-day expiry, single-use-by-order)
- Exclusive Beat instant purchase (currently €30, server-priced, extensible to multiple tiers) → same checkout/payment flow → "Exclusive Beat ordered" confirmation (no download — the beat is produced after payment)
- Admin panel (`/admin`) — manage beats (including file uploads), view all orders (regular + Exclusive Beat) with payment and fulfillment status
- Protected downloads — full audio is never served except through a paid order's signed, expiring token
- Payment provider abstraction with a fully working Mock Payment provider (used for this demo) and a Tribute provider **stub** ready for real credentials
- SEO — per-locale metadata, canonical URLs, hreflang alternates on every page

## What works right now (Mock Payment)

Every purchase — regular Beat and Exclusive Beat — currently completes through the built-in **Mock Payment provider**: a simulated gateway with "Pay Now" / "Simulate Failed Payment" buttons, used because no real payment credentials are configured yet. This exercises the entire flow end to end (order creation, payment confirmation, webhook processing, download issuance) exactly as it will work with a real provider — only the actual money movement is simulated. **No real payments can be taken until Tribute is connected.**

## What you need to do

1. **Production database** — provision Postgres (recommended) or a persisted SQLite file, set `DATABASE_URL`, run `npx prisma migrate deploy`. See README → Database Setup.
2. **Production storage** — provision persistent storage for beat audio/cover files (a persistent volume, or S3/R2/Supabase Storage via the `StorageProvider` interface). See README → Storage.
3. **Admin credentials** — set your own `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and a freshly generated `ADMIN_SESSION_SECRET`. Do not reuse any values from this demo.
4. **`NEXT_PUBLIC_APP_URL`** — set to your real production domain (used in SEO metadata and payment redirect/callback URLs).
5. **Tribute credentials** — once issued, set `TRIBUTE_API_KEY` and `TRIBUTE_WEBHOOK_SECRET`; the app switches off Mock Payment automatically. You (or your developer) will still need to fill in the three `TODO(tribute)` methods in `lib/payments/tribute-provider.ts` against Tribute's actual API — this project only ships the integration point, not a working Tribute client, since Tribute's real API contract wasn't available while building this. See README → Tribute Integration for exactly what's needed.
6. **Tribute webhook** — point it at `POST {your domain}/api/payment/webhook`, and update the signature header name in `app/api/payment/webhook/route.ts` to match whatever Tribute actually sends (it currently reads a placeholder `x-signature` header).
7. **Production deployment** — deploy the app (any Node.js host works; see README → Production Deployment), run migrations, then upload your real beats through `/admin/beats`.

## Important: real beat audio files are not included

The 5 demo beats' actual MP3 files were **intentionally not committed to Git** (only their metadata, via `prisma/seed-demo.ts`, is) — real audio belongs in persistent storage, not source control. After you've set up production storage (step 2 above), upload each real beat's cover image, preview clip, and full audio file through `/admin/beats` → add/edit a beat. There is no bulk-import script.
