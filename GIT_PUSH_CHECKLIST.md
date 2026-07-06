# Pre-Git Push Checklist

## ✅ What's Ready to Push

### Code & Infrastructure
- [x] OAuth backend routes implemented (`src/auth-routes.ts`)
- [x] OAuth frontend components implemented
- [x] Admin bypass routes implemented (`src/admin-routes.ts`)
- [x] Admin bypass frontend UI implemented
- [x] User model with role field added to Prisma
- [x] All environment templates created (`.env.example`, `.env.local.example`)
- [x] Color consistency fixed
- [x] Card sizing fixed
- [x] Frontend builds cleanly (451 modules)
- [x] Database migrations ready (`prisma/schema.prisma`)

### Documentation
- [x] SETUP_OAUTH.md — Complete OAuth guide
- [x] OAUTH_CHECKLIST.md — Step-by-step checklist
- [x] ADMIN_BYPASS_SETUP.md — Admin bypass guide
- [x] RAILWAY_DATABASE_SETUP.md — Database setup
- [x] GIT_PUSH_CHECKLIST.md — This file

---

## ⚠️ DO NOT COMMIT

### Secret Files (Add to .gitignore)
- [ ] ✅ `.env` — NEVER commit (contains secrets)
- [ ] ✅ `.env.local` — NEVER commit (contains secrets)
- [ ] Check `.gitignore` includes:
  ```
  .env
  .env.local
  .env.*.local
  ```

### Build Artifacts (Already in .gitignore)
- [ ] `node_modules/` — Should be ignored
- [ ] `dist/` — Build output
- [ ] `frontend-v2/dist/` — Frontend build
- [ ] `.DS_Store` — macOS files

---

## 🔑 Keys/Tokens Still Needed

### Stripe Keys (REQUIRED for payments)
- [ ] **STRIPE_SECRET_KEY** — From https://dashboard.stripe.com/apikeys
  - Starts with `sk_`
  - Add to your `.env` file (NOT committed)
  - Format: `STRIPE_SECRET_KEY="sk_test_..."`

- [ ] **STRIPE_WEBHOOK_SECRET** — From https://dashboard.stripe.com/webhooks
  - Starts with `whsec_`
  - Add to your `.env` file (NOT committed)
  - Format: `STRIPE_WEBHOOK_SECRET="whsec_..."`

### Google OAuth (READY ✅)
- [x] **GOOGLE_CLIENT_ID** — Already configured
  - `1076779454322-o7f78rtqdn4jg6jnp1dmfjj0rm5gau60.apps.googleusercontent.com`
  - Already in `.env` and `.env.local`

### JWT Secret (READY ✅)
- [x] **JWT_SECRET** — Already generated
  - `d5f2b8721f0f4898b1f80c9695bd3d8b62144942e1ee40becb5c5b457c10be0a`
  - Already in `.env`

### Database URL (READY ✅)
- [x] **DATABASE_URL** — Already configured
  - `postgresql://postgres:vccWXsCaVVJlidxielrRrheqBYwSOrVL@postgres.railway.internal:5432/railway`
  - Already in `.env`

### Email Service (OPTIONAL)
- [ ] **RESEND_API_KEY** — From https://resend.com/api-keys (optional)
  - Only needed if you want to send emails
  - Can be added later

---

## 👤 Admin Role System (User Database)

### ✅ YES - Roles ARE Built In!

Your User table has a `role` field that supports:
```prisma
enum UserRole {
  user   # Regular users (default)
  admin  # Admins (can test without Stripe)
}

model User {
  ...
  role UserRole @default(user)  # ← This field
  ...
}
```

### How to Assign Admin Role

**Option 1: Direct SQL** (Quickest)
```sql
UPDATE "User" SET role = 'admin' WHERE email = 'your-email@gmail.com';
```

**Option 2: Admin API** (Programmatic)
```bash
curl -X POST http://localhost:3000/api/admin/promote-user \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "userId": "user-id-to-promote" }'
```

**Option 3: Via Database UI** (Railway dashboard)
1. Go to Railway → PostgreSQL → Data tab
2. Click "User" table
3. Click the row for your user
4. Change `role` column from "user" to "admin"
5. Save

### Admin Capabilities
With `role: 'admin'`, users can:
- ✅ Access `/get-your-card` and see "Admin Test Mode" button
- ✅ Generate test confirmation codes WITHOUT Stripe charges
- ✅ Test the full redemption flow
- ✅ Access `/api/admin/*` endpoints
- ✅ Promote/demote other users

### Database Audit
Check who's an admin:
```sql
SELECT email, role, createdAt FROM "User" WHERE role = 'admin';
```

---

## 📋 Final Pre-Push Checklist

### Code Quality
- [ ] Run `npm run build` in frontend-v2 — should succeed
- [ ] Check TypeScript compiles: `npm run build` in wallet-pass-server
- [ ] No console errors or warnings
- [ ] All files formatted consistently

### Files to Commit
- [ ] All source code in `src/`
- [ ] All frontend code in `frontend-v2/src/`
- [ ] Prisma schema (`prisma/schema.prisma`)
- [ ] Documentation files (`.md`)
- [ ] `.env.example` and `.env.local.example` (templates)
- [ ] `.gitignore` updated

### Files to NOT Commit
- [ ] `.env` — Contains real secrets
- [ ] `.env.local` — Contains real secrets
- [ ] `node_modules/` — Auto-installed by npm
- [ ] `dist/` — Build artifacts
- [ ] `frontend-v2/dist/` — Frontend build

### Git Configuration
- [ ] `.gitignore` has `.env*` rules
- [ ] No large files (>100MB)
- [ ] No node_modules accidentally staged
- [ ] Git user configured: `git config user.name` and `git config user.email`

---

## 🚀 Ready to Push?

### Before you push, verify:

```bash
# 1. Check what will be committed
git status

# 2. Make sure .env files are NOT staged
git diff --cached | grep -i "DATABASE_URL\|JWT_SECRET\|stripe"
# Should return nothing!

# 3. Check .gitignore
cat .gitignore | grep ".env"
# Should show .env rules

# 4. Build frontend
cd frontend-v2
npm run build
# Should say "✓ built in Xms"

# 5. Check git log
git log --oneline -5
# Verify your recent commits
```

If all checks pass, you're good to push! 🎉

---

## Next Steps After Push

1. **Share your GitHub URL** with your team
2. **Set up Railway deployment** (auto-deploy from main branch)
3. **Add Stripe keys** to Railway environment
4. **Run migrations** on production
5. **Test OAuth flow** on deployed site
6. **Promote admins** for testing

---

## Summary of What's Needed

| Item | Status | Notes |
|------|--------|-------|
| Google OAuth | ✅ Complete | Client ID configured |
| JWT Secret | ✅ Complete | Generated & in .env |
| Database | ✅ Complete | Railway URL in .env |
| User roles/admin | ✅ Complete | Built into schema |
| Stripe Secret Key | ⏳ Still needed | Get from Stripe dashboard |
| Stripe Webhook | ⏳ Still needed | Get from Stripe dashboard |
| Email service | ⏳ Optional | Add later if needed |

**Only Stripe keys are still needed before full testing!**

---

## Command to Push

When ready:
```bash
cd wallet-pass-server
git add .
git commit -m "feat: implement OAuth, admin bypass, and user management

- Add Google OAuth with session JWT
- Add admin bypass for test checkout (no Stripe charges)
- Add User model with role-based access control
- Implement admin promote/demote endpoints
- Add comprehensive documentation
- Fix UI/color consistency and card sizing

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
git push origin main
```

---

✅ **You're ready to push to GitHub!**
