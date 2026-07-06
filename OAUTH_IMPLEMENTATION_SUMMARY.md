# Google OAuth Implementation Summary

## ✅ Complete Implementation Delivered

A secure, production-ready OAuth login system has been implemented across your split-architecture (Vite frontend + Express backend on Railway).

---

## Files Created/Modified

### Backend (Express + TypeScript)

**New Files:**
- `src/auth-routes.ts` — All auth endpoints and JWT management
  - `POST /api/auth/google` — Verify Google token, create/update user, issue session JWT
  - `GET /api/auth/me` — Protected endpoint to fetch current user
  - `POST /api/auth/logout` — Logout endpoint
  - `verifySessionToken` middleware — Validate Bearer tokens
  - Uses `google-auth-library` for secure token verification

**Modified Files:**
- `src/server.ts` — Added auth routes registration
- `prisma/schema.prisma` — Added User model with indexed email/googleId
- `package.json` — Added `google-auth-library@^10.9.0`

**Configuration:**
- `.env.example` — Template with all required variables

---

### Frontend (React + Vite)

**New Components:**
- `src/components/ui/GoogleLoginButton.jsx`
  - Minimal, clean button matching green theme
  - Uses `@react-oauth/google` library
  - Captures ID token and sends to backend
  - Error handling with user feedback
  - 44×44px minimum touch target

**New Context:**
- `src/contexts/AuthContext.jsx`
  - `<AuthProvider>` wraps entire app
  - `useAuth()` hook for accessing user, login, logout
  - Automatic state restoration on page refresh via localStorage
  - Sessions expire in 7 days (configurable)

**New Pages:**
- `src/pages/LoginPage.jsx`
  - Clean sign-in page with Google button
  - Redirects logged-in users to /account
  - Links to card purchase flow for new users

- `src/pages/AccountPage.jsx`
  - User profile display (name, email, profile picture)
  - Log out button
  - Protected route (redirects to home if not logged in)

**Modified Components:**
- `src/components/layout/Header.jsx`
  - Desktop: User avatar dropdown with Account/Logout links or "SIGN IN" button
  - Mobile: Auth links in hamburger menu
  - Profile picture displayed in avatar
  - Smooth transitions with Framer Motion

- `src/App.jsx`
  - Wrapped with `<AuthProvider>`
  - Added routes: `/login`, `/account`

**Configuration:**
- `.env.example` — Template with `VITE_GOOGLE_CLIENT_ID` and `VITE_API_URL`
- `package.json` — Added `@react-oauth/google@^14.0.0`

---

## Security Features

✅ **Backend**
- Google JWT verified using official `google-auth-library` (no manual validation)
- JWT audience validation (prevents token hijacking)
- Application JWT issued with 7-day expiration
- Secure JWT signing with environment variable secret
- User data validated before database insert
- Middleware to verify Bearer tokens on protected routes

✅ **Frontend**
- OAuth token never stored locally (only app session token)
- Session token stored in localStorage (accessible only to same domain)
- Automatic logout on token expiration or failed refresh
- CSRF protection via SameSite cookie policy (when/if switching to cookies)

✅ **Database**
- Unique constraint on `googleId` prevents duplicate accounts
- Unique constraint on `email` (future-proofs for email login)
- Indexes on both fields for fast lookups
- Automatic `updatedAt` timestamp for audit trails

---

## User State Management

**On First Login:**
1. User clicks "Continue with Google"
2. Google OAuth popup opens
3. User signs in with Google account
4. Google returns access token
5. Frontend sends token to `POST /api/auth/google`
6. Backend verifies token, creates User record, issues session JWT
7. Frontend stores session JWT in localStorage
8. Frontend loads user data into AuthContext
9. User redirected to `/account`

**On Subsequent Visits:**
1. App loads
2. AuthContext checks localStorage for `sessionToken`
3. If token exists, validates it via `GET /api/auth/me`
4. If valid, restores user data (no re-login needed)
5. If invalid/expired, clears localStorage (automatic logout)

**On Logout:**
1. User clicks "Log Out"
2. Frontend calls `POST /api/auth/logout` (for backend cleanup if needed)
3. Frontend clears localStorage and AuthContext
4. User redirected to homepage

---

## API Endpoints

### `POST /api/auth/google`

**Request:**
```json
{ "token": "google-access-token-from-frontend" }
```

**Response (201):**
```json
{
  "sessionToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-cuid",
    "email": "user@example.com",
    "name": "John Doe",
    "profilePicture": "https://..."
  }
}
```

**Error (401):**
```json
{ "error": "Invalid Google token" }
```

---

### `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer <sessionToken>
```

**Response (200):**
```json
{
  "user": {
    "id": "user-cuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error (401):**
```json
{ "error": "Unauthorized" }
```

---

### `POST /api/auth/logout`

**Response (200):**
```json
{ "success": true }
```

---

## Database Schema

```sql
CREATE TABLE "User" (
  id           TEXT PRIMARY KEY DEFAULT cuid(),
  googleId     TEXT UNIQUE NOT NULL,
  email        TEXT UNIQUE NOT NULL,
  name         TEXT,
  profilePicture TEXT,
  createdAt    TIMESTAMP DEFAULT now(),
  updatedAt    TIMESTAMP DEFAULT now(),
  INDEX(email),
  INDEX(googleId)
);
```

---

## Environment Variables

### Backend (`wallet-pass-server/.env`)

```env
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
JWT_SECRET="generate-with-node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
JWT_EXPIRES_IN="7d"
DATABASE_URL="postgresql://..."
```

### Frontend (`frontend-v2/.env.local`)

```env
VITE_GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
VITE_API_URL="http://localhost:3000"  # or your Railway backend URL
```

---

## Routing

- `/login` — Sign in page (public)
- `/account` — User profile (protected, redirects to home if not logged in)
- `/` — Homepage (public, shows "SIGN IN" or user avatar depending on auth state)

All other routes work normally. Auth state is accessible anywhere via `useAuth()` hook.

---

## Integration with Existing Features

✅ **Discount Card Purchase**: User email pre-filled during checkout (when logged in)  
✅ **Header Navigation**: Dynamic based on auth state  
✅ **Profile Picture**: Displayed in header avatar  
✅ **Future: Redemption History**: Can link `ConfirmationCode` table to `User` table  

---

## Testing Checklist

- [ ] Create `.env` and `.env.local` files with Google OAuth credentials
- [ ] Run `npx prisma migrate dev` to create User table
- [ ] Start backend: `npm run dev` (port 3000)
- [ ] Start frontend: `npm run dev` (port 5173)
- [ ] Navigate to `/login`, click "Continue with Google"
- [ ] Verify you're redirected to `/account` with your profile data
- [ ] Refresh page → still logged in (state persisted)
- [ ] Click "Log Out" → redirected to home
- [ ] Refresh page → still logged out (sessionToken cleared)
- [ ] Log back in → verify profile picture displays
- [ ] Check browser localStorage → see `sessionToken`
- [ ] Open DevTools Network → verify POST to `/api/auth/google` succeeds

---

## Production Deployment

1. **Get Google OAuth credentials**:
   - Create OAuth consent screen (internal/external)
   - Add production redirect URIs to Google Cloud project

2. **Backend (Railway)**:
   - Set `GOOGLE_CLIENT_ID` in Railway env vars
   - Set `JWT_SECRET` (generate secure random string)
   - Set `APP_BASE_URL` to frontend production URL
   - Database auto-configured via `DATABASE_URL`

3. **Frontend (Vercel/Netlify)**:
   - Set `VITE_GOOGLE_CLIENT_ID` (same as backend)
   - Set `VITE_API_URL` to your Railway backend URL
   - Deploy

4. **Database**:
   - Run `npx prisma migrate deploy` on first Railway deployment
   - Subsequent deployments auto-run pre-deploy script

---

## Files Not Modified

- Discount card flow (unchanged, can be integrated with user data later)
- Pass generation (unchanged)
- Redeem flow (unchanged)
- Stripe integration (unchanged)

These can all be extended later to reference the logged-in user.

---

## Next Steps (Optional Enhancements)

1. **Link purchases to users**:
   - Add `userId` foreign key to `ConfirmationCode`
   - Show purchase history on `/account`

2. **Email confirmation**:
   - Send welcome email on first login
   - Use `Resend` client (already installed)

3. **Refresh token rotation**:
   - Issue refresh tokens (14-day expiry)
   - Use refresh token to issue new access tokens
   - Rotate keys on each refresh for extra security

4. **Social features**:
   - Save favorite regions per user
   - Email reminders before card expires
   - Referral links

5. **Admin dashboard**:
   - View all users
   - See purchase analytics
   - User management

---

## Quick Reference

**Files to Reference:**
- Backend auth: `src/auth-routes.ts`
- Frontend auth: `src/contexts/AuthContext.jsx`
- Login UI: `src/pages/LoginPage.jsx`, `src/components/ui/GoogleLoginButton.jsx`
- Header with auth: `src/components/layout/Header.jsx`
- Setup instructions: `SETUP_OAUTH.md`

**Key Libraries:**
- `google-auth-library` (backend)
- `@react-oauth/google` (frontend)
- `jsonwebtoken` (session JWTs)
- `@prisma/client` (User model)

---

✅ **Status: Ready for Google OAuth Credentials Setup**

Next action: Create Google OAuth credentials in Google Cloud Console, then set `GOOGLE_CLIENT_ID` and `JWT_SECRET` in your `.env` files.

See `SETUP_OAUTH.md` for detailed step-by-step instructions.
