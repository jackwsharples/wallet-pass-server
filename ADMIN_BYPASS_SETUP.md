# Admin Bypass Feature — Testing Stripe Payments Without Charges

This feature allows admins to test the entire checkout and redemption flow **without actually charging Stripe**.

---

## Quick Overview

**What it does:**
- Admin users can click "Generate Test Code (No Stripe Charge)" on the cart purchase page
- System generates a real confirmation code immediately (no Stripe API call)
- Code can be used to download the wallet pass
- Database tracks these as test transactions with `adminBypass: true`

**When it's available:**
- ✅ **Development mode** (`NODE_ENV !== 'production'`) — always enabled
- ✅ **Production** — only if `ALLOW_ADMIN_BYPASS=true` is explicitly set
- ❌ Regular users — feature hidden from non-admin accounts

---

## Setup Instructions

### 1. Update Environment Variables

Add to your `.env` file:

```env
# Admin Features (only works in development or when explicitly enabled)
ALLOW_ADMIN_BYPASS="true"    # Set to "true" in dev; set to "false" in production
NODE_ENV="development"        # Or "production"
```

**Development**: Leave as is. Admin bypass automatically enabled.

**Production**: Must explicitly set `ALLOW_ADMIN_BYPASS="true"` to enable. Should only be true temporarily during testing.

### 2. Promote Your Account to Admin

You need admin privileges. Two ways to set this:

#### Option A: Direct Database Edit (Quickest)

```sql
UPDATE "User" SET role = 'admin' WHERE email = 'your-email@example.com';
```

#### Option B: Use Admin Promotion API

Once you have any admin account, you can promote others:

```bash
curl -X POST http://localhost:3000/api/admin/promote-user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{ "userId": "user-id-to-promote" }'
```

### 3. Log In and Test

1. Navigate to `http://localhost:5173/login`
2. Sign in with your Google account
3. Go to `/get-your-card`
4. For each region card, you should see:
   - Regular "Buy Now" button for customers
   - **"Admin Test Mode" section** (yellow box with ⚙️ icon)
5. Click "Generate Test Code (No Stripe Charge)"
6. Receive a real confirmation code instantly
7. Use the code to download the wallet pass

---

## How It Works

### Frontend Flow

**File**: `src/components/ui/AdminTestCheckout.jsx`

```jsx
// 1. User clicks "Generate Test Code" button
// 2. Component checks if user.role === 'admin'
// 3. Sends request to POST /api/admin/test-checkout
// 4. Shows generated code in UI
```

**File**: `src/pages/GetYourCard.jsx`

- Admin users see an expanded card when clicking "Buy Now"
- Shows yellow "Admin Test Mode" box below the button
- Only visible if user.role === 'admin'

### Backend Flow

**File**: `src/admin-routes.ts` → `POST /api/admin/test-checkout`

```typescript
// 1. Verify user is authenticated (Bearer token)
// 2. Check if user.role === 'admin'
// 3. Check if ALLOW_ADMIN_BYPASS is enabled
// 4. Generate confirmation code WITHOUT calling Stripe
// 5. Mark code with adminBypass: true metadata
// 6. Return code to frontend
```

**File**: `src/auth-routes.ts` → Middleware

```typescript
app.use('/api/admin', verifySessionToken);
// All /api/admin/* routes require valid session token
```

### Database Changes

**File**: `prisma/schema.prisma`

```prisma
enum UserRole {
  user
  admin
}

model User {
  id    String     @id
  role  UserRole   @default(user)   // ← Added this
  ...
}
```

When you generate a test code, the `ConfirmationCode` gets metadata:

```json
{
  "adminBypass": true,
  "adminId": "user-cuid",
  "testMode": true,
  "region": "Boone"
}
```

---

## API Endpoints

### `POST /api/admin/test-checkout`

**Headers:**
```
Authorization: Bearer <sessionToken>
Content-Type: application/json
```

**Body:**
```json
{
  "regionId": "boone",
  "metadata": {
    "region": "Boone",
    "testMode": true
  }
}
```

**Response (200):**
```json
{
  "code": "ABC123XYZ",
  "message": "Admin test mode: Code generated without Stripe charge",
  "isTestMode": true
}
```

**Error (403):**
```json
{ "error": "Admin access required" }
```

---

### `POST /api/admin/promote-user`

**Headers:**
```
Authorization: Bearer <sessionToken>
```

**Body:**
```json
{ "userId": "cuid-of-user-to-promote" }
```

**Response:**
```json
{
  "message": "User promoted to admin",
  "user": {
    "id": "user-cuid",
    "email": "user@example.com",
    "role": "admin"
  }
}
```

---

### `POST /api/admin/demote-user`

**Headers:**
```
Authorization: Bearer <sessionToken>
```

**Body:**
```json
{ "userId": "cuid-of-user-to-demote" }
```

**Response:**
```json
{
  "message": "User demoted to regular user",
  "user": {
    "id": "user-cuid",
    "email": "user@example.com",
    "role": "user"
  }
}
```

---

## Security Features

✅ **Requires Authentication**
- Must be logged in via Google OAuth
- Session token is validated on every request

✅ **Role-Based Access Control (RBAC)**
- Only `role: 'admin'` users can access `/api/admin/*`
- Regular users see no admin UI

✅ **Environment-Gated**
- In production (`NODE_ENV === 'production'`), admin bypass requires explicit `ALLOW_ADMIN_BYPASS=true`
- Prevents accidental enablement on production

✅ **Auditable**
- Test codes marked with `adminBypass: true`
- Admin ID recorded in metadata
- Separate from real Stripe transactions

✅ **Cannot Self-Demote Protection**
- Demote endpoint rejects self-demotion
- Prevents accidental loss of admin access

---

## Testing Workflow

### Step 1: Verify Admin Status

Navigate to `/account` and confirm you see "admin" in browser console:

```javascript
// In DevTools console:
const token = localStorage.getItem('sessionToken');
const response = await fetch('/api/auth/me', {
  headers: { Authorization: `Bearer ${token}` }
});
const data = await response.json();
console.log('User role:', data.user.role);  // Should show "admin"
```

### Step 2: Test Code Generation

1. Go to `/get-your-card`
2. Click "Buy Now" on any region
3. Scroll down to "Admin Test Mode" section
4. Click "Generate Test Code (No Stripe Charge)"
5. Receive code instantly (no Stripe popup)

### Step 3: Redeem Test Code

1. Go to the success page or use `/redeem`
2. Enter the test code
3. Download the wallet pass
4. Verify the pass contains your name from the Google account

### Step 4: Inspect Database

```sql
-- Find your test transaction
SELECT code, status, metadata, createdAt 
FROM "ConfirmationCode" 
WHERE metadata->>'adminBypass' = 'true'
ORDER BY createdAt DESC 
LIMIT 5;
```

---

## Troubleshooting

### Admin Test Mode Button Not Showing

**Problem**: You don't see the yellow "Admin Test Mode" box

**Solution**:
1. Verify `user.role === 'admin'` in DevTools
2. Confirm `NODE_ENV` is "development" or `ALLOW_ADMIN_BYPASS=true`
3. Log out and log back in (refreshes role from server)

### "Admin access required" Error

**Problem**: Getting 403 when trying to generate test code

**Solution**:
1. Verify you're logged in: Check `localStorage.getItem('sessionToken')`
2. Verify your role is admin:
   ```javascript
   const token = localStorage.getItem('sessionToken');
   fetch('/api/auth/me', {
     headers: { Authorization: `Bearer ${token}` }
   }).then(r => r.json()).then(d => console.log(d.user.role));
   ```
3. If role is "user", use promote endpoint or database to set to "admin"

### "Admin bypass not enabled" Error

**Problem**: Backend rejects admin bypass

**Solution**:
1. Check `NODE_ENV`: Should be "development" or explicitly set env var
2. In `.env`, verify: `ALLOW_ADMIN_BYPASS="true"` or `NODE_ENV="development"`
3. Restart backend server after changing .env

### Code Generation Fails

**Problem**: Getting "Failed to create test code" error

**Solution**:
1. Check database connectivity
2. Verify you have correct database permissions
3. Check server logs for detailed error message
4. Try a few more times (rare collision issue)

---

## Production Safety

### Never Deploy with Bypass Enabled

In `railway.yml` or your deployment config:

```yaml
env:
  NODE_ENV: production
  ALLOW_ADMIN_BYPASS: "false"  # ← Always false in production
```

### Temporary Testing on Production

If you need to test on production:

```yaml
env:
  NODE_ENV: production
  ALLOW_ADMIN_BYPASS: "true"   # ← TEMPORARY
```

Then **revert immediately** after testing:

```yaml
env:
  NODE_ENV: production
  ALLOW_ADMIN_BYPASS: "false"  # ← Reverted
```

### Audit Production Codes

To find test codes in production:

```sql
SELECT code, email, metadata->>'adminBypass' as isTest, createdAt
FROM "ConfirmationCode"
WHERE metadata->>'adminBypass' = 'true'
ORDER BY createdAt DESC;
```

---

## Admin User Management

### List All Admins

```sql
SELECT id, email, name, role, createdAt
FROM "User"
WHERE role = 'admin'
ORDER BY createdAt DESC;
```

### Add Admin (SQL)

```sql
UPDATE "User" SET role = 'admin' 
WHERE email = 'admin@example.com';
```

### Remove Admin (SQL)

```sql
UPDATE "User" SET role = 'user' 
WHERE email = 'admin@example.com';
```

### Add Admin (API)

```bash
# From an existing admin account
curl -X POST http://localhost:3000/api/admin/promote-user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SESSION_TOKEN" \
  -d '{ "userId": "new-admin-user-id" }'
```

---

## Files Modified/Created

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Added `UserRole` enum, `role` field to User |
| `src/admin-routes.ts` | **NEW** — All admin endpoints |
| `src/auth-routes.ts` | Updated `/api/auth/me` to return user role |
| `src/server.ts` | Register admin routes, apply auth middleware |
| `frontend-v2/src/contexts/AuthContext.jsx` | Include `role` in user state |
| `frontend-v2/src/components/ui/AdminTestCheckout.jsx` | **NEW** — Admin test checkout button |
| `frontend-v2/src/pages/GetYourCard.jsx` | Integrate admin test checkout |
| `.env.example` | Add `ALLOW_ADMIN_BYPASS` variable |

---

## Architecture Diagram

```
┌─────────────────┐
│ Admin User      │
└────────┬────────┘
         │ "Generate Test Code"
         ▼
┌──────────────────────────────┐
│ AdminTestCheckout Component   │
│ (frontend)                    │
└────────┬─────────────────────┘
         │ POST /api/admin/test-checkout
         │ Authorization: Bearer token
         ▼
┌──────────────────────────────┐
│ verifySessionToken Middleware │
│ ✓ Checks Bearer token valid  │
└────────┬─────────────────────┘
         │ req.user.id = decoded JWT
         ▼
┌──────────────────────────────┐
│ POST /api/admin/test-checkout │
│ - Verify user is admin       │
│ - Check ALLOW_ADMIN_BYPASS   │
│ - Check NODE_ENV             │
└────────┬─────────────────────┘
         │ Bypass Stripe
         ▼
┌──────────────────────────────┐
│ Generate Confirmation Code   │
│ - Create code in Prisma      │
│ - Mark with adminBypass:true │
│ - Return code to frontend    │
└────────┬─────────────────────┘
         │ Show in UI
         ▼
┌──────────────────────────────┐
│ User Redeems Code            │
│ - Use normal /api/redeem     │
│ - Download wallet pass       │
└──────────────────────────────┘
```

---

## Summary

The admin bypass feature:
- ✅ Lets admins test purchases without Stripe charges
- ✅ Generates real confirmation codes for testing
- ✅ Only works in development or with explicit env var
- ✅ Auditable (marked in database)
- ✅ Role-based (requires admin account)
- ✅ Safe for production (can't accidentally enable)

**Use for**: Testing purchase flow, pass generation, redemption without triggering Stripe charges.

---

**Next**: Set up your admin account and test the flow! See troubleshooting above if you hit any issues.
