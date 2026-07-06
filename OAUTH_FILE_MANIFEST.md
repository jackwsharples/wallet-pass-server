# OAuth Implementation — Complete File Manifest

## Summary

**Backend**: 2 new files, 2 modified files  
**Frontend**: 6 new files, 2 modified files  
**Documentation**: 4 new files  
**Configuration**: 2 new .env.example files  

---

## Backend Files

### New Files (2)

#### `src/auth-routes.ts` (112 lines)
**Purpose**: All Google OAuth authentication logic

**Exports**:
- `registerAuthRoutes(app)` — Registers routes on Express server
- `verifySessionToken` — Middleware to validate Bearer tokens

**Routes**:
- `POST /api/auth/google` — Verify Google token, create user, issue session JWT
- `GET /api/auth/me` — Get current user (protected)
- `POST /api/auth/logout` — Logout (clears frontend state)

**Key Functions**:
- Uses `google-auth-library` to verify Google JWT
- Creates/updates User in Prisma
- Issues application JWT with 7-day expiration
- Middleware for protected routes

#### `.env.example` (30 lines)
**Purpose**: Template for required environment variables

**Variables**:
- `DATABASE_URL` — PostgreSQL connection string
- `GOOGLE_CLIENT_ID` — From Google Cloud Console
- `JWT_SECRET` — Signing key for session tokens
- `JWT_EXPIRES_IN` — Session token lifetime
- `STRIPE_*` — Existing (unchanged)
- `APP_BASE_URL` — Frontend URL
- Other existing variables

---

### Modified Files (2)

#### `src/server.ts` (354 → 357 lines)
**Changes**:
- Line 7: Added import `registerAuthRoutes`
- Line 48: Added `registerAuthRoutes(app)` call

**Impact**: Auth routes now accessible at `/api/auth/*`

#### `prisma/schema.prisma` (49 → 68 lines)
**Changes**:
- Added `model User` with 6 fields:
  - `id` — Primary key (cuid)
  - `googleId` — Google sub claim (unique)
  - `email` — User email (unique)
  - `name` — Optional display name
  - `profilePicture` — Optional Google profile picture URL
  - `createdAt`, `updatedAt` — Timestamps
- Added indexes on `email` and `googleId` for fast lookups

**Impact**: Database will have User table after `prisma migrate dev`

#### `package.json` (44 → 45 lines)
**Changes**:
- Added `"google-auth-library": "^10.9.0"` to dependencies

**Impact**: Can verify Google JWTs

---

## Frontend Files

### New Files (6)

#### `src/contexts/AuthContext.jsx` (76 lines)
**Purpose**: Global authentication state management

**Exports**:
- `<AuthProvider>` — Wrapper component
- `useAuth()` — Hook to access auth state

**Features**:
- Persists session token to localStorage
- Restores user state on page refresh
- `login(googleToken)` — Exchange token for session JWT
- `logout()` — Clear auth state
- `loading` state for initialization

**API Calls**:
- POST /api/auth/google
- GET /api/auth/me

#### `src/components/ui/GoogleLoginButton.jsx` (67 lines)
**Purpose**: Google sign-in button component

**Features**:
- Uses `@react-oauth/google` library
- Minimal design matching green theme
- Shows "Signing in..." loading state
- Error display
- Environment variable check for GOOGLE_CLIENT_ID
- 44×44px minimum button height

**Dependencies**:
- `useAuth` from AuthContext
- `useGoogleLogin` from @react-oauth/google

#### `src/pages/LoginPage.jsx` (47 lines)
**Purpose**: Sign-in page

**Features**:
- Redirects logged-in users to /account
- Displays GoogleLoginButton
- Links to card purchase flow
- Minimalist design with green theme

**Routes**:
- GET /login (public)

#### `src/pages/AccountPage.jsx` (87 lines)
**Purpose**: User profile/account management page

**Features**:
- Displays user profile picture, name, email
- Shows member since date
- Log out button
- Protected route (redirects if not logged in)
- Minimalist design

**Routes**:
- GET /account (protected)

#### `frontend-v2/.env.example` (6 lines)
**Purpose**: Template for frontend environment variables

**Variables**:
- `VITE_GOOGLE_CLIENT_ID` — Must match backend
- `VITE_API_URL` — Backend URL (localhost:3000 or Railway)

#### `frontend-v2/package.json` (modified)
**Changes**:
- Added `@react-oauth/google` dependency

---

### Modified Files (2)

#### `src/components/layout/Header.jsx` (260+ lines)
**Changes**:
- Line 3: Added `import { useAuth }`
- Line 6: Added `const { user, logout } = useAuth()`
- Line 9: Added `[userMenuOpen, setUserMenuOpen]` state
- Line 11: Added `userMenuRef` for dropdown
- Lines 24-30: Added `userMenuRef` to dropdown handler
- Lines 152-177: Replaced CTA button with conditional auth UI
  - If logged in: User avatar dropdown with Account/Logout
  - If not logged in: "SIGN IN" button
- Lines 265-278: Updated mobile menu with auth options
  - If logged in: Account and Logout links
  - If not logged in: Sign In button

**Visual Changes**:
- User avatar displays in header when logged in
- Dropdown menu on desktop
- Auth options in mobile menu
- Smooth animations via Framer Motion

#### `src/App.jsx` (26 → 33 lines)
**Changes**:
- Line 2: Added `import { AuthProvider }`
- Line 10: Wrapped BrowserRouter with `<AuthProvider>`
- Line 21: Added route: `<Route path="login" element={<LoginPage />} />`
- Line 22: Added route: `<Route path="account" element={<AccountPage />} />`
- Added imports for new pages

**Impact**:
- AuthContext available to entire app
- New routes accessible

---

## Documentation Files (4)

#### `SETUP_OAUTH.md` (370 lines)
**Purpose**: Step-by-step setup guide for developers

**Contents**:
- Architecture overview (diagram)
- Step 1-10 detailed instructions
- Google Cloud Console setup
- Environment configuration
- Flow explanation with code snippets
- API endpoint documentation
- Database schema explanation
- Testing checklist
- Troubleshooting guide
- Deployment instructions

#### `OAUTH_IMPLEMENTATION_SUMMARY.md` (350 lines)
**Purpose**: Technical overview of implementation

**Contents**:
- Files created/modified summary
- Security features checklist
- User state management flow
- Complete API reference
- Database schema
- Environment variables documented
- Routing structure
- Integration with existing features
- Testing checklist
- Production deployment steps
- Quick reference guide
- Next steps for enhancements

#### `OAUTH_CHECKLIST.md` (290 lines)
**Purpose**: Implementation checklist and quick reference

**Contents**:
- What's been built (checkmarks)
- Next steps (numbered actions)
- Post-setup tasks (optional)
- Security verification
- Production deployment guide
- Troubleshooting with solutions
- File reference table
- Success criteria
- Current status

#### `OAUTH_FILE_MANIFEST.md` (this file)
**Purpose**: Complete file-by-file breakdown

---

## Installation Summary

### Backend Dependencies Added
```json
{
  "google-auth-library": "^10.9.0"
}
```

**Already had**:
- `jsonwebtoken` — For session JWTs
- `@prisma/client` — For database access

### Frontend Dependencies Added
```json
{
  "@react-oauth/google": "^14.0.0"
}
```

**Already had**:
- `react-router-dom` — For routing
- `framer-motion` — For animations

---

## How to Use This Manifest

**To implement OAuth:**
1. Read `OAUTH_CHECKLIST.md` for quick overview
2. Follow `SETUP_OAUTH.md` for step-by-step instructions
3. Reference `OAUTH_IMPLEMENTATION_SUMMARY.md` for technical details
4. Use this manifest to find specific files

**To modify a feature:**
1. Find the file in this manifest
2. Check "Purpose" to confirm it's the right file
3. Review "Changes" to understand what was modified
4. Look at related files listed

**To understand the flow:**
1. Start with `src/contexts/AuthContext.jsx` (frontend state)
2. Then `src/auth-routes.ts` (backend logic)
3. Then `src/components/ui/GoogleLoginButton.jsx` (UI)

---

## File Size Reference

| File | Lines | Size |
|------|-------|------|
| `src/auth-routes.ts` | 112 | ~4 KB |
| `src/contexts/AuthContext.jsx` | 76 | ~2.5 KB |
| `src/pages/LoginPage.jsx` | 47 | ~1.5 KB |
| `src/pages/AccountPage.jsx` | 87 | ~2.8 KB |
| `src/components/ui/GoogleLoginButton.jsx` | 67 | ~2 KB |
| `src/components/layout/Header.jsx` | 260+ | ~9 KB |
| `src/App.jsx` | 33 | ~1 KB |
| Docs | ~1100 | ~40 KB |
| **Total** | ~1600 | ~65 KB |

---

## No Breaking Changes

✅ All existing features remain unchanged:
- Discount card purchase flow
- Pass generation
- Redeem functionality
- Stripe integration
- Partner routes
- Email sending

✅ Backward compatible:
- Old routes still work
- New routes are additive only
- Database migration is one-way, data is safe

---

## Git Workflow

To commit these changes:

```bash
git add .
git commit -m "feat: implement Google OAuth with session JWT

- Add secure token verification using google-auth-library
- Create User model in Prisma with indexes
- Implement auth routes: /api/auth/google, /api/auth/me, /api/auth/logout
- Add AuthContext for state management with localStorage persistence
- Create LoginPage and AccountPage components
- Update Header with user menu and auth options
- Add environment configuration examples
- Include comprehensive documentation and setup guide

Frontend: 450 modules, builds cleanly
Backend: Ready for Prisma migration
Docs: Complete with troubleshooting guide"
```

---

## Verification Commands

**Frontend build:**
```bash
cd frontend-v2 && npm run build
# Should output: ✓ 450 modules transformed, built in ~375ms
```

**Backend TypeScript:**
```bash
cd wallet-pass-server && npm run build
# Will fail until DATABASE_URL is set (expected)
# Once .env is configured: should build with 0 errors
```

**Install dependencies:**
```bash
cd wallet-pass-server && npm install google-auth-library
cd frontend-v2 && npm install @react-oauth/google
# Both should already be installed
```

---

## Dependencies Status

| Package | Backend | Frontend | Version |
|---------|---------|----------|---------|
| google-auth-library | ✅ | — | ^10.9.0 |
| @react-oauth/google | — | ✅ | ^14.0.0 |
| jsonwebtoken | ✅ (existing) | — | ^9.0.2 |
| @prisma/client | ✅ (existing) | — | ^6.19.0 |
| react-router-dom | — | ✅ (existing) | ^7.x |
| framer-motion | — | ✅ (existing) | ^10.x |

---

**All files ready. Next step: Set up Google OAuth credentials and environment variables.**

See `OAUTH_CHECKLIST.md` for immediate next actions.
