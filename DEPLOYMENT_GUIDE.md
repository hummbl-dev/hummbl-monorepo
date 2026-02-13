# Deployment Guide - Manual Steps Required

**Generated:** 2026-02-13  
**Status:** Dashboard built ✅ | Workers pending token refresh

---

## ✅ COMPLETED (Automated)

### 1. Dashboard Production Build
- **Location:** `apps/dashboard/dist/`
- **Size:** 2.6M (1.3M assets)
- **Status:** Production build successful
- **Files:**
  - `index.html` (entry point)
  - `assets/` (JS, CSS, fonts)
  - Optimized with code splitting

### 2. Deployment Package
- **Location:** `apps/dashboard/deploy/`
- **Ready for upload:** Yes
- **Bundle analysis:** `dist/bundle-analysis.html`

### 3. Local Development
- **Dashboard:** Running at http://localhost:5174 (Docker)
- **Workers:** Requires local `pnpm dev` (Docker has architecture limits)

---

## 🚀 MANUAL STEPS REQUIRED

### Option A: Cloudflare Pages (Recommended - Same Ecosystem)

#### Step 1: Create Pages Project
1. Go to https://dash.cloudflare.com/
2. Navigate to **Pages** → **Create a project**
3. Choose **Direct Upload** (fastest)

#### Step 2: Upload Build
```bash
# From your local machine
cd /Users/others/workspace/active/hummbl-monorepo/apps/dashboard
# Upload the 'deploy' folder contents to Cloudflare Pages
```

Or use Wrangler (if token permissions fixed):
```bash
npx wrangler pages deploy deploy --project-name=hummbl-dashboard
```

#### Step 3: Configure Build Settings (for Git integration)
- **Build command:** `pnpm build`
- **Build output directory:** `dist`
- **Root directory:** `apps/dashboard`

#### Step 4: Environment Variables
Add these in Cloudflare Pages dashboard:
- `NODE_ENV=production`
- `VITE_API_URL=https://api.hummbl.dev` (your workers URL)

---

### Option B: Workers Deployment (Requires Token Refresh)

#### Current Issue
Your Cloudflare API token has insufficient permissions for deployment.

#### Fix: Generate New Token
1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click **Create Token**
3. Use **Custom token** with these permissions:
   - **Account:** Cloudflare Workers:Edit
   - **Account:** Account:Read
   - **Zone:** (if using custom domain) Zone:Read
   - **Account:** Cloudflare Pages:Edit (for CDN)

4. Copy new token and update your environment:
   ```bash
   export CLOUDFLARE_API_TOKEN="your-new-token"
   ```

#### Deploy Workers
```bash
cd /Users/others/workspace/active/hummbl-monorepo/apps/workers
pnpm deploy:production
```

---

### Option C: Alternative CDN (Vercel - Easiest)

#### Deploy to Vercel
```bash
cd /Users/others/workspace/active/hummbl-monorepo/apps/dashboard
# Install Vercel CLI if needed
pnpm dlx vercel@latest --prod
```

Vercel will:
- Detect the build settings automatically
- Build the project
- Deploy to CDN

---

## 📊 DEPLOYMENT SUMMARY

| Component | Status | Action Required |
|-----------|--------|-----------------|
| Dashboard Build | ✅ Complete | Upload to CDN |
| Workers Code | ✅ Ready | Deploy with valid token |
| Database (D1) | ✅ Configured | Already in wrangler.toml |
| KV Cache | ✅ Configured | Already in wrangler.toml |
| Environment | ✅ Set | production, v1 |

---

## 🔧 QUICK DEPLOYMENT CHECKLIST

### For Cloudflare Pages (Dashboard)
- [ ] Go to dash.cloudflare.com/pages
- [ ] Create project "hummbl-dashboard"
- [ ] Upload `apps/dashboard/deploy/` folder
- [ ] Set environment variables
- [ ] Deploy

### For Workers API
- [ ] Generate new API token with Workers:Edit permission
- [ ] Export token: `export CLOUDFLARE_API_TOKEN="..."`
- [ ] Run: `cd apps/workers && pnpm deploy:production`

### For Custom Domain (Optional)
- [ ] Add domain in Cloudflare dashboard
- [ ] Configure DNS
- [ ] Set up SSL/TLS

---

## 📁 BUILD ARTIFACTS

All build artifacts are ready:

```
apps/dashboard/
├── dist/              # Full build with analysis
├── deploy/            # Clean deployment package
│   ├── index.html
│   └── assets/
└── bundle-analysis.html  # Size analysis
```

---

## 🎯 NEXT ACTIONS FOR YOU

**Immediate (5 minutes):**
1. Go to https://dash.cloudflare.com/pages
2. Create project and upload `apps/dashboard/deploy/`

**Short term (15 minutes):**
1. Generate new Cloudflare API token
2. Deploy Workers: `cd apps/workers && pnpm deploy:production`

**Verify deployment:**
- Dashboard: https://[your-pages-domain].pages.dev
- Workers: https://api.hummbl.dev/health

---

*All automated preparation complete. Manual deployment required due to token permissions.*
