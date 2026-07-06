# Google OAuth Setup Guide

This document walks through the secure Google OAuth implementation across your split-architecture setup.

## Architecture Overview

```
Frontend (Vite + React)
    ↓ Google OAuth popup
    ↓ Captures ID token
    ↓ POST /api/auth/google
    ↓
Express Backend (Railway)
    ↓ Verifies Google JWT using google-auth-library
    ↓ Creates/updates User in PostgreSQL
    ↓ Generates app JWT session token
    ↓ Returns session token + user data
    ↓
Frontend stores session token in localStorage
    ↓ Uses token in Authorization header for protected requests
    ↓ AuthContext maintains logged-in state across page refreshes
```

---

## Step 1: Set Up Google Cloud Project

1. **Go to Google Cloud Console**: https://console.cloud.google.com/

2. **Create a new project**:
   - Click "Select a Project" → "NEW PROJECT"
   - Name: "Local Discount Card"
   - Create

3. **Enable Google+ API**:
   - Search for "Google+ API"
   - Click "Enable"

4. **Create OAuth 2.0 Credentials**:
   - Go to "Credentials" in the left menu
   - Click "Create Credentials" → "OAuth Client ID"
   - Choose "Web application"
   - Name: "Frontend"
   - Add authorized redirect URIs:
     - `http://localhost:5173` (local dev)
     - `http://localhost:3000` (backend redirect)
     - `https://your-frontend-domain.com` (production)
   - Copy your **Client ID** — you'll need this

---

## Step 2: Configure Backend Environment

1. **Create `.env` file in project root**:

```bash
# Backend/.env
DATABASE_URL="postgresql://user:password@localhost:5432/wallet_pass_server"
GOOGLE_CLIENT_ID="YOUR_CLIENT_ID_FROM_GOOGLE_CLOUD.apps.googleusercontent.com"
JWT_SECRET="generate-a-secure-random-string-here"
JWT_EXPIRES_IN="7d"

# Other required vars
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
APP_BASE_URL="http://localhost:5173"
RESEND_API_KEY="re_..."
```

2. **Generate a secure JWT secret**:
```bash
# Run this in your terminal to generate a random string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

3. **Run Prisma migration to create User table**:
```bash
cd wallet-pass-server
npx prisma migrate dev --name add_user_model
```

4. **Verify auth routes are registered**:
   - Open `src/server.ts`
   - Confirm `registerAuthRoutes(app)` is called after Discount routes

---

## Step 3: Configure Frontend Environment

1. **Create `.env.local` in `frontend-v2` folder**:

```bash
# frontend-v2/.env.local
VITE_GOOGLE_CLIENT_ID="YOUR_CLIENT_ID_FROM_GOOGLE_CLOUD.apps.googleusercontent.com"
VITE_API_URL="http://localhost:3000"
```

**For production**, update `VITE_API_URL` to your backend URL on Railway.

---

## Step 4: Understanding the Auth Flow

### 1. Frontend Login Flow

**File**: `frontend-v2/src/pages/LoginPage.jsx`

```jsx
<GoogleLoginButton />  // User clicks → Google popup
```

**File**: `frontend-v2/src/components/ui/GoogleLoginButton.jsx`

- Uses `@react-oauth/google` library
- On success, captures Google `access_token` (implicit flow)
- Sends token to backend: `POST /api/auth/google`
- Backend returns `sessionToken` + user data
- `AuthContext` stores `sessionToken` in localStorage

### 2. Backend Verification

**File**: `src/auth-routes.ts` → `POST /api/auth/google`

```typescript
// 1. Receive Google access token from frontend
const { token } = req.body

// 2. Verify token using google-auth-library
const ticket = await googleClient.verifyIdToken({
  idToken: token,
  audience: GOOGLE_CLIENT_ID,
})

// 3. Extract email, name, profile picture
const payload = ticket.getPayload()
const { sub: googleId, email, name, picture } = payload

// 4. Create or update User in database
let user = await prisma.user.findUnique({ where: { googleId } })
if (!user) {
  user = await prisma.user.create({ data: { googleId, email, name, profilePicture: picture } })
}

// 5. Generate app JWT session token (expires in 7 days)
const sessionToken = jwt.sign(
  { userId: user.id, email, name },
  JWT_SECRET,
  { expiresIn: JWT_EXPIRES_IN }
)

// 6. Return session token + user data
res.json({ sessionToken, user })
```

### 3. State Persistence

**File**: `frontend-v2/src/contexts/AuthContext.jsx`

```typescript
// On app load, check localStorage for existing token
const storedToken = localStorage.getItem('sessionToken')
if (storedToken) {
  // Verify token is still valid
  const response = await fetch('/api/auth/me', {
    headers: { Authorization: `Bearer ${storedToken}` }
  })
  // If valid, restore user state
}
```

### 4. Protected Requests

**File**: `src/auth-routes.ts` → Middleware `verifySessionToken`

```typescript
// All authenticated requests include Authorization header
// Authorization: Bearer <sessionToken>

// Middleware validates the JWT
const decoded = jwt.verify(token, JWT_SECRET)
req.user = { id: decoded.userId, email: decoded.email }
```

---

## Step 5: Test Locally

### Terminal 1: Start Backend

```bash
cd wallet-pass-server
npm run dev
# Server on http://localhost:3000
```

### Terminal 2: Start Frontend

```bash
cd frontend-v2
npm run dev
# Frontend on http://localhost:5173
```

### In Browser

1. Navigate to `http://localhost:5173/login`
2. Click "Continue with Google"
3. Sign in with your Google account
4. You should be redirected to `/account`
5. See your profile picture, name, and email
6. Click "Log Out" to test logout
7. Refresh page → you should stay logged out (sessionToken deleted)
8. Log back in → refresh page → you should stay logged in (sessionToken restored)

---

## Step 6: Database Schema

**File**: `prisma/schema.prisma`

```prisma
model User {
  id              String     @id @default(cuid())
  googleId        String     @unique           # Google sub claim
  email           String     @unique
  name            String?
  profilePicture  String?
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt

  @@index([email])
  @@index([googleId])
}
```

**Indexes ensure**:
- Fast email lookups (used for login conflict detection)
- Fast googleId lookups (finding returning users)

---

## Step 7: API Endpoints

### Public

- `POST /api/auth/google`
  - Body: `{ token: "google-access-token" }`
  - Returns: `{ sessionToken, user: { id, email, name, profilePicture } }`

### Authenticated (include `Authorization: Bearer <sessionToken>`)

- `GET /api/auth/me`
  - Returns: `{ user: { id, email, name } }`

- `POST /api/auth/logout`
  - Returns: `{ success: true }`
  - (Frontend clears localStorage)

---

## Step 8: Header/Navigation Updates

**File**: `frontend-v2/src/components/layout/Header.jsx`

The header now shows:
- **Not logged in**: "SIGN IN" button → navigates to `/login`
- **Logged in**: User avatar + name → dropdown with "My Account" and "Log Out"

Mobile menu also includes auth links.

---

## Step 9: Security Checklist

✅ **Token Verification**: Google JWT verified using official library  
✅ **Secure Storage**: Session token stored in localStorage (not cookies for XSS resistance)  
✅ **JWT Expiration**: 7-day expiration on session tokens  
✅ **HTTPS Ready**: Use `Secure` and `SameSite` flags in production  
✅ **CORS**: Configure backend to accept frontend origin  
✅ **Rate Limiting**: Add rate limits to `/api/auth/google` if needed  

---

## Step 10: Deploy to Railway

1. **Backend**:
   - Push code to Git
   - Connect Railway to your repo
   - Set environment variables in Railway dashboard:
     - `DATABASE_URL` (PostgreSQL connection string)
     - `GOOGLE_CLIENT_ID`
     - `JWT_SECRET`
     - `APP_BASE_URL` (your frontend URL)
   - Deploy

2. **Frontend**:
   - Deploy to Vercel/Netlify
   - Set environment variable: `VITE_API_URL=https://your-railway-backend.com`
   - Update Google OAuth redirect URIs with production URLs

---

## Troubleshooting

### "Google token verification failed"

- Verify `GOOGLE_CLIENT_ID` matches Google Cloud Console
- Check token isn't expired
- Verify correct audience claim

### "Token already used or invalid"

- Token might have been used already (they're single-use)
- Try logging in again

### User stays logged out after refresh

- Check localStorage for `sessionToken` in DevTools
- Verify backend is returning valid JWT

### CORS errors

Add to `src/server.ts`:

```typescript
app.use(cors({
  origin: process.env.APP_BASE_URL || 'http://localhost:5173',
  credentials: true
}))
```

---

## Next Steps

1. Integrate with your discount card purchase flow (link user to purchases)
2. Add user profile settings page
3. Send email confirmation on new login
4. Add logout endpoint to clear backend session if needed
5. Set up refresh token rotation for extra security

---

**Questions?** Review `auth-routes.ts` (backend) and `AuthContext.jsx` (frontend) for implementation details.
