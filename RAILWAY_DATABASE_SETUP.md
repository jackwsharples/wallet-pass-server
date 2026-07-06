# Railway Database Setup Guide

## Overview

You're using **ONE PostgreSQL database on Railway** for both:
- ✅ Confirmation codes (discount card access codes)
- ✅ User accounts (OAuth profile data)
- ✅ Discount codes (future feature)

All managed by Prisma migrations. This is the standard, optimal approach.

---

## Step 1: Create Railway Account & Project

1. Go to https://railway.app
2. Sign up with GitHub (recommended)
3. Create new project
4. Add PostgreSQL plugin

---

## Step 2: Get Your Database URL

1. In Railway dashboard, click on your PostgreSQL plugin
2. Go to the "Connect" tab
3. Copy the **PostgreSQL connection string**
   - Format: `postgresql://user:password@host.railway.internal:5432/railway`
4. Copy the full URL

---

## Step 3: Update Your .env File

1. Open `.env` in `wallet-pass-server/`
2. Replace this line:
   ```env
   DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/wallet_pass_server"
   ```
   
   With your Railway URL:
   ```env
   DATABASE_URL="postgresql://user:password@host.railway.internal:5432/railway"
   ```

3. Save the file

---

## Step 4: Run Database Migrations

This creates **all tables** in your ONE Railway database:

```bash
cd wallet-pass-server
npx prisma migrate deploy
```

**What this does:**
- Creates `_prisma_migrations` table (tracks migrations)
- Creates `ConfirmationCode` table (existing - for discount codes)
- Creates `DiscountCode` table (existing - for discount tracking)
- Creates `User` table (NEW - for OAuth accounts)

All in the same database. ✅

---

## Step 5: Verify Database Structure

Check that all tables exist:

```bash
npx prisma db push
```

Or view in Railway dashboard:
1. Click PostgreSQL plugin
2. Click "Data" tab
3. You should see tables:
   - `User` ← NEW
   - `ConfirmationCode` ← Existing
   - `DiscountCode` ← Existing
   - `_prisma_migrations`

---

## Current Database Schema

### User Table (NEW - OAuth Accounts)
```sql
CREATE TABLE "User" (
  id              TEXT PRIMARY KEY,
  googleId        TEXT UNIQUE NOT NULL,      -- Google account ID
  email           TEXT UNIQUE NOT NULL,      -- User email
  name            TEXT,                       -- Display name
  profilePicture  TEXT,                       -- Google profile pic
  role            ENUM('user', 'admin'),     -- Role for admin bypass
  createdAt       TIMESTAMP DEFAULT now(),
  updatedAt       TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_user_googleId ON "User"(googleId);
```

### ConfirmationCode Table (EXISTING - Discount Codes)
```sql
CREATE TABLE "ConfirmationCode" (
  id              TEXT PRIMARY KEY,
  code            TEXT UNIQUE NOT NULL,      -- Unique code
  status          ENUM('UNUSED', 'USED', 'VOID'),
  customerEmail   TEXT,                       -- Buyer email
  stripePaymentId TEXT UNIQUE,               -- Stripe payment ID
  stripeSessionId TEXT,                       -- Stripe session ID
  expiresAt       TIMESTAMP,
  usedAt          TIMESTAMP,
  createdAt       TIMESTAMP DEFAULT now(),
  metadata        JSON,                       -- Extra data
  redeemAuditIp   TEXT,
  redeemAuditUa   TEXT
);
```

### DiscountCode Table (EXISTING - Discount Tracking)
```sql
CREATE TABLE "DiscountCode" (
  id              TEXT PRIMARY KEY,
  code            TEXT UNIQUE NOT NULL,
  stripeSessionId TEXT UNIQUE NOT NULL,
  email           TEXT,
  status          ENUM('UNUSED', 'USED'),
  createdAt       TIMESTAMP DEFAULT now(),
  usedAt          TIMESTAMP
);
```

---

## Environment Variables Set ✅

Your `.env` file now has:

| Variable | Value | Purpose |
|----------|-------|---------|
| DATABASE_URL | Placeholder (update after Railway) | PostgreSQL connection |
| GOOGLE_CLIENT_ID | Your OAuth ID | Google sign-in |
| JWT_SECRET | `d5f2b8721f0f4898b1f80...` | Session tokens |
| JWT_EXPIRES_IN | `7d` | Token lifetime |
| STRIPE_SECRET_KEY | Placeholder (from Stripe) | Stripe payments |
| STRIPE_WEBHOOK_SECRET | Placeholder (from Stripe) | Stripe webhooks |
| NODE_ENV | `development` | Environment |
| ALLOW_ADMIN_BYPASS | `true` | Admin test mode |

---

## How Everything Connects

```
┌─────────────────────────────────────────┐
│     ONE Railway PostgreSQL Database     │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────────────────────────┐  │
│  │ User Table (NEW - OAuth)         │  │
│  │ - id, googleId, email, role      │  │
│  │ - Stores: logged-in user data    │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │ ConfirmationCode (EXISTING)      │  │
│  │ - code, status, stripePaymentId  │  │
│  │ - Stores: discount card codes    │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │ DiscountCode (EXISTING)          │  │
│  │ - code, email, status            │  │
│  │ - Stores: discount tracking      │  │
│  └──────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
         ↑         ↑         ↑
    Prisma Client manages all tables
```

---

## Next Steps

1. **Create Railway account** (takes 2 minutes)
2. **Get DATABASE_URL** from Railway
3. **Update .env** with your Railway URL
4. **Run migration**: `npx prisma migrate deploy`
5. **Test locally**: `npm run dev` (backend and frontend)

---

## Quick Reference: Railway URL Format

Your Railway URL looks like:
```
postgresql://postgres:randompassword@hostname.railway.internal:5432/railway
```

Breaking it down:
- `postgres` = default username
- `randompassword` = Railway-generated password
- `hostname.railway.internal` = Railway hostname
- `railway` = database name

Copy the **full URL** from Railway and paste it into `.env`.

---

## Verify Migration Works

After updating `.env` with your Railway URL:

```bash
cd wallet-pass-server

# Test connection
npx prisma db push

# Expected output:
# ✔ Your database is now in sync with your Prisma schema.
```

If you see ✔ you're good to go!

---

## Files Generated for You

| File | Purpose |
|------|---------|
| `.env` | Backend environment (backend folder) |
| `frontend-v2/.env.local` | Frontend environment |
| `prisma/schema.prisma` | Database schema (includes User table) |

All ready to use. Just update `DATABASE_URL` after Railway setup.

---

## Support

- **Can I use the same database for User + ConfirmationCode?** ✅ YES (this is optimal)
- **Do I need multiple databases?** ❌ NO
- **Will migrations work on Railway?** ✅ YES (automated at deploy)
- **Can I test locally first?** ✅ YES (use local Postgres or SQLite temporarily)

---

**Next action**: Set up Railway and get your DATABASE_URL ready! 🚀
