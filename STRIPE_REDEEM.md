Stripe One-Time Code Redeem Flow
================================

Endpoints

- POST `/api/create-checkout-session` – Creates Stripe Checkout session; expects `{ priceId, email?, metadata? }`. Uses `APP_BASE_URL` for success/cancel URLs.
- POST `/webhooks/stripe` – Raw JSON webhook; verifies signature with `STRIPE_WEBHOOK_SECRET`.
  - `checkout.session.completed` → create an UNUSED code (unique per `payment_intent`), email buyer.
  - `charge.refunded` / `charge.refund.updated` → VOID any UNUSED codes for the `payment_intent`.
- GET `/success` – Minimal success page; prompts to check email.
- GET `/redeem` – Minimal HTML form to enter code + optional email.
- POST `/api/redeem` – Rate-limited; validates and consumes code; returns a short-lived download token.
- GET `/api/pass/download?token=...` – Validates token and streams `assets/current.pkpass`.

Environment

- `DATABASE_URL`, `APP_BASE_URL`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY` (preferred) OR SMTP: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `EMAIL_FROM`
- `REDEEM_RATE_LIMIT_PER_MINUTE` (default 20), `JWT_SECRET`

Database

- Prisma schema: `prisma/schema.prisma` (model `ConfirmationCode`).
- Deploy migrations: `npx prisma migrate deploy`.

Pass file

- Place a current pass at `assets/current.pkpass` in production. If missing, the server falls back to dynamic generation via your certificates.

