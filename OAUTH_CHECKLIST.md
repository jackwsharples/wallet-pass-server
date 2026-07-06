# Complete OAuth & Admin Setup Checklist

## ✅ Phase 1: OAuth Setup (Google Credentials)

- [x] **Client ID obtained**: `1076779454322-o7f78rtqdn4jg6jnp1dmfjj0rm5gau60.apps.googleusercontent.com`
- [x] **Client ID added to `.env.example`** (backend)
- [x] **Client ID added to `frontend-v2/.env.example`** (frontend)

---

## 🔧 Phase 2: Environment Configuration

### Backend Setup

- [ ] **Create `.env` file** in `wallet-pass-server/` folder
  - Copy from `.env.example`
  - Fill in all required variables:
    - `DATABASE_URL` — PostgreSQL connection
    - `GOOGLE_CLIENT_ID` — `1076779454322-o7f78rtqdn4jg6jnp1dmfjj0rm5gau60.apps.googleusercontent.com`
    - `JWT_SECRET` — Run: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
    - `STRIPE_SECRET_KEY` — From Stripe dashboard
    - `STRIPE_WEBHOOK_SECRET` — From Stripe dashboard
    - `ALLOW_ADMIN_BYPASS` — Set to `"true"` for development

- [ ] **Create Prisma migration** to add User table
  ```bash
  cd wallet-pass-server
  npx prisma migrate dev --name add_user_model
  ```

### Frontend Setup

- [ ] **Create `.env.local`** in `frontend-v2/` folder
  - Copy from `.env.example`
  - Fill in:
    - `VITE_GOOGLE_CLIENT_ID` — `1076779454322-o7f78rtqdn4jg6jnp1dmfjj0rm5gau60.apps.googleusercontent.com`
    - `VITE_API_URL` — `http://localhost:3000` (dev) or your Railway URL (prod)

---

## 🔐 Phase 3: OAuth Testing

### Local Testing (Localhost)

- [ ] **Start backend**: `cd wallet-pass-server && npm run dev` (port 3000)
- [ ] **Start frontend**: `cd frontend-v2 && npm run dev` (port 5173)
- [ ] **Test OAuth flow**:
  - [ ] Navigate to `http://localhost:5173/login`
  - [ ] Click "Continue with Google"
  - [ ] Sign in with Google account
  - [ ] Redirected to `/account`
  - [ ] See profile picture, name, email
  - [ ] Refresh page → stay logged in (state persisted)
  - [ ] Click Log Out
  - [ ] Refresh page → stay logged out (sessionToken cleared)

### Session & Token Verification

- [ ] **Verify session token** stored in localStorage
  - Open DevTools (F12) → Application → Local Storage
  - See `sessionToken` key with JWT value
  
- [ ] **Verify user role** in token
  ```javascript
  // In DevTools console:
  const token = localStorage.getItem('sessionToken');
  fetch('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` }
  }).then(r => r.json()).then(d => console.log(d.user));
  // Should show: { id, email, name, profilePicture, role: "user" }
  ```

---

## 👤 Phase 4: Admin Setup & Testing

### Make Yourself Admin

- [ ] **Promote account to admin** (choose one method):

  **Option A: Direct SQL** (fastest)
  ```sql
  UPDATE "User" SET role = 'admin' WHERE email = 'your-email@gmail.com';
  ```

  **Option B: Admin API** (requires existing admin)
  ```bash
  curl -X POST http://localhost:3000/api/admin/promote-user \
    -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
    -d '{ "userId": "user-id-to-promote" }'
  ```

### Admin Test Mode Features

- [ ] **Test admin bypass**:
  - [ ] Log in as admin account
  - [ ] Navigate to `/get-your-card`
  - [ ] Click "Buy Now" on any region
  - [ ] Yellow "Admin Test Mode" box expands
  - [ ] Click "Generate Test Code (No Stripe Charge)"
  - [ ] Receive code instantly (no Stripe popup)
  - [ ] Code marked as `adminBypass: true` in database

- [ ] **Test code redemption**:
  - [ ] Use generated code at `/redeem`
  - [ ] Download wallet pass
  - [ ] Verify pass contains your name

- [ ] **Verify admin features are hidden from regular users**:
  - [ ] Log out as admin
  - [ ] Log in with regular user account
  - [ ] Navigate to `/get-your-card`
  - [ ] Yellow "Admin Test Mode" box does NOT appear

### Admin User Management

- [ ] **Promote another user to admin** (via API):
  ```bash
  curl -X POST http://localhost:3000/api/admin/promote-user \
    -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{ "userId": "user-id" }'
  ```

- [ ] **Demote admin back to user** (via API):
  ```bash
  curl -X POST http://localhost:3000/api/admin/demote-user \
    -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{ "userId": "user-id" }'
  ```

---

## 🔒 Phase 5: Security Verification

### Environment Safety

- [ ] **Verify `ALLOW_ADMIN_BYPASS` handling**:
  - [ ] In dev (`NODE_ENV=development`): Admin bypass enabled by default
  - [ ] In production (`NODE_ENV=production`): Admin bypass disabled unless `ALLOW_ADMIN_BYPASS=true`
  - [ ] Never commit `ALLOW_ADMIN_BYPASS=true` to production branch

### Database Audit

- [ ] **Query test transactions** to verify audit trail:
  ```sql
  SELECT code, email, metadata->>'adminBypass' as isTest, createdAt
  FROM "ConfirmationCode"
  WHERE metadata->>'adminBypass' = 'true'
  ORDER BY createdAt DESC;
  ```

- [ ] **Verify User roles** are correct:
  ```sql
  SELECT email, role, createdAt FROM "User" ORDER BY createdAt DESC;
  ```

### API Security

- [ ] **Test unauthenticated access** (should fail):
  ```bash
  curl http://localhost:3000/api/admin/test-checkout
  # Should return: 401 Unauthorized
  ```

- [ ] **Test non-admin access** (should fail):
  ```bash
  curl -X POST http://localhost:3000/api/admin/test-checkout \
    -H "Authorization: Bearer REGULAR_USER_TOKEN" \
    -d '{ "regionId": "boone" }'
  # Should return: 403 Forbidden (Admin access required)
  ```

---

## 🚀 Phase 6: Production Deployment

### Pre-Deployment Checks

- [ ] **All secrets configured** in environment:
  - [ ] `DATABASE_URL` set to production PostgreSQL
  - [ ] `GOOGLE_CLIENT_ID` verified
  - [ ] `JWT_SECRET` is strong (32+ random bytes)
  - [ ] `ALLOW_ADMIN_BYPASS` set to `"false"`
  - [ ] `NODE_ENV` set to `"production"`

- [ ] **Google OAuth updated** in Google Cloud Console:
  - [ ] Production redirect URIs added:
    - [ ] `https://your-frontend-url.com`
    - [ ] `https://your-frontend-url.com/login`

- [ ] **Database migrations applied**:
  ```bash
  npx prisma migrate deploy
  ```

### Backend Deployment (Railway)

- [ ] **Push code to GitHub**
- [ ] **Connect Railway to repository**
- [ ] **Set environment variables** in Railway dashboard:
  - [ ] `DATABASE_URL` (auto-configured if using Railway Postgres)
  - [ ] `GOOGLE_CLIENT_ID`
  - [ ] `JWT_SECRET`
  - [ ] `ALLOW_ADMIN_BYPASS=false`
  - [ ] `NODE_ENV=production`
  - [ ] All Stripe variables
  - [ ] `APP_BASE_URL` (your frontend URL)
- [ ] **Deploy** and verify health check: `https://your-backend.railway.app/health`

### Frontend Deployment (Vercel/Netlify)

- [ ] **Set environment variables**:
  - [ ] `VITE_GOOGLE_CLIENT_ID` (same as backend)
  - [ ] `VITE_API_URL` (your Railway backend URL)
- [ ] **Deploy** and test login flow on production
- [ ] **Verify** redirect URIs match in Google Cloud Console

---

## 📋 Phase 7: Post-Deployment Testing

### Production Smoke Tests

- [ ] **OAuth flow on production**:
  - [ ] Navigate to production login page
  - [ ] Sign in with Google
  - [ ] See profile on account page
  - [ ] Refresh page → still logged in

- [ ] **Admin bypass on production**:
  - [ ] Promote a test admin account
  - [ ] Navigate to `/get-your-card`
  - [ ] Verify "Admin Test Mode" appears
  - [ ] Generate test code (verify it works)
  - [ ] Redeem test code → verify pass downloads

- [ ] **Regular user flow**:
  - [ ] Non-admin sees no admin UI
  - [ ] Can still purchase via Stripe (regular flow)
  - [ ] Can redeem codes normally

### Monitoring

- [ ] **Set up error tracking** (e.g., Sentry)
- [ ] **Monitor auth errors** in logs
- [ ] **Check database** for new users after launch

---

## 🎯 Quick Status Check

### What's Done ✅
- [x] OAuth backend routes created
- [x] OAuth frontend components created
- [x] Admin bypass backend routes created
- [x] Admin bypass frontend UI created
- [x] User model with role field added to Prisma
- [x] Documentation complete
- [x] Google Client ID obtained
- [x] Color consistency fixed
- [x] Card sizing fixed

### What Needs Doing
- [ ] Create `.env` with `DATABASE_URL`, `JWT_SECRET`, etc.
- [ ] Create `.env.local` in frontend
- [ ] Run Prisma migration
- [ ] Test locally (phases 3-4)
- [ ] Deploy to production (phase 6)
- [ ] Test on production (phase 7)

---

## 📞 Troubleshooting Quick Links

**OAuth Issues?** → See `SETUP_OAUTH.md`  
**Admin Bypass Issues?** → See `ADMIN_BYPASS_SETUP.md`  
**Color/UI Issues?** → Already fixed ✅  
**Card Sizing Issues?** → Already fixed ✅  

---

## 🔗 Reference Files

| File | Purpose |
|------|---------|
| `SETUP_OAUTH.md` | OAuth setup guide |
| `OAUTH_IMPLEMENTATION_SUMMARY.md` | OAuth technical details |
| `OAUTH_FILE_MANIFEST.md` | OAuth files breakdown |
| `ADMIN_BYPASS_SETUP.md` | Admin bypass setup guide |
| `ADMIN_BYPASS_SUMMARY.md` | Admin bypass technical details |
| `src/auth-routes.ts` | OAuth routes |
| `src/admin-routes.ts` | Admin bypass routes |
| `prisma/schema.prisma` | User model with role |

---

## ✨ Success Criteria

You'll know everything is working when:

1. ✅ You can log in with Google OAuth
2. ✅ Your profile appears after login
3. ✅ Session persists across page refreshes
4. ✅ Admin account shows "Admin Test Mode" button
5. ✅ Admin can generate test codes without Stripe charges
6. ✅ Regular users see no admin UI
7. ✅ Test codes can be redeemed normally
8. ✅ All works on production deployment

---

**Current Status**: Ready to configure `.env` files and run migrations! 🚀

Your Google Client ID is ready to go:
```
1076779454322-o7f78rtqdn4jg6jnp1dmfjj0rm5gau60.apps.googleusercontent.com
```

Copy this to both `.env` and `.env.local` files in the respective directories.
