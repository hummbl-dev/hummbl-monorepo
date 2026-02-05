# Deployment Guide

**Purpose:** Complete guide for deploying HUMMBL to production and staging environments.

**Version:** 1.0  
**Last Updated:** 2025-10-19

---

## 🚀 **Deployment Environments**

### **Production**

- **URL:** https://hummbl.io
- **Branch:** `main`
- **Auto-deploy:** ✅ Yes (on push to main)
- **Environment:** Vercel Production

### **Staging**

- **URL:** https://staging-hummbl.vercel.app
- **Branch:** `staging`
- **Auto-deploy:** ✅ Yes (on push to staging)
- **Environment:** Vercel Staging

### **Preview**

- **URL:** Auto-generated per PR
- **Branch:** Any feature branch
- **Auto-deploy:** ✅ Yes (on PR creation)
- **Environment:** Vercel Preview

---

## 📋 **Deployment Checklist**

### **Before Every Deployment**

- [ ] All tests passing locally (`npm test`)
- [ ] Build succeeds locally (`npm run build`)
- [ ] No console errors in development
- [ ] Code reviewed and approved
- [ ] CHANGELOG updated (if applicable)
- [ ] Environment variables verified

### **Production Deployment Only**

- [ ] Staging deployment tested and verified
- [ ] No known critical bugs
- [ ] Database migrations completed (if any)
- [ ] Rollback plan prepared
- [ ] Team notified of deployment
- [ ] Monitoring dashboard open

---

## 🔄 **Deployment Process**

### **Automatic Deployment (Recommended)**

**To Staging:**

```bash
# Merge your feature branch into staging
git checkout staging
git merge feature/your-feature
git push origin staging

# CI/CD automatically:
# 1. Runs tests
# 2. Builds application
# 3. Checks bundle size
# 4. Deploys to staging
```

**To Production:**

```bash
# After staging is verified, merge to main
git checkout main
git merge staging
git push origin main

# CI/CD automatically:
# 1. Runs all quality checks
# 2. Deploys to production
# 3. Notifies team
```

---

### **Manual Deployment (Emergency Only)**

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Deploy to staging
vercel --env=staging
```

---

## 🧪 **CI/CD Pipeline**

### **Quality Gates**

All deployments must pass:

1. **Tests** - All unit/integration tests (398+ tests)
2. **Build** - Application builds successfully
3. **Bundle Size** - Total < 500 KB
4. **Lighthouse** (PR only) - Performance audit
5. **Accessibility** (PR only) - axe-core checks

### **Pipeline Jobs**

```
test → build → bundle-size → deploy
           ↓
      lighthouse (PR only)
           ↓
    accessibility (PR only)
```

**Average pipeline time:** 3-5 minutes

---

## 🔙 **Rollback Procedure**

### **Quick Rollback (< 5 minutes)**

```bash
# 1. List recent deployments
./scripts/rollback.sh

# 2. Rollback to specific deployment
./scripts/rollback.sh dpl_abc123xyz

# 3. Verify rollback succeeded
curl -I https://hummbl.io
```

### **Manual Rollback via Vercel Dashboard**

1. Go to https://vercel.com/dashboard
2. Select HUMMBL project
3. Click "Deployments"
4. Find working deployment
5. Click "⋯" → "Promote to Production"
6. Confirm promotion

### **Post-Rollback**

- [ ] Verify site is working
- [ ] Check error monitoring (Sentry/Datadog)
- [ ] Notify team of rollback
- [ ] Create incident report
- [ ] Fix underlying issue
- [ ] Test fix in staging
- [ ] Re-deploy to production

---

## 🔐 **Environment Variables**

### **Required Secrets (GitHub)**

```bash
VERCEL                 # Vercel deployment token
FG_TOKEN              # GitHub token
VERCEL_ORG_ID         # Vercel organization ID
VERCEL_PROJECT_ID     # Vercel project ID
CODECOV_TOKEN         # Codecov upload token
```

### **Application Environment Variables**

```bash
# .env.local (local development)
VITE_PLAUSIBLE_DOMAIN=hummbl.io
VITE_PLAUSIBLE_API_KEY=your_api_key
VITE_ADMIN_PASSWORD=your_password

# Production (set in Vercel dashboard)
VITE_PLAUSIBLE_DOMAIN=hummbl.io
VITE_PLAUSIBLE_API_KEY=<production_key>
VITE_ADMIN_PASSWORD=<secure_password>
```

**Never commit `.env.local` or `.env` files!**

---

## 🎯 **Deployment Strategies**

### **Standard Deployment**

- Merge to `staging` first
- Test thoroughly
- Merge to `main` for production
- **Use for:** Normal feature releases

### **Hotfix Deployment**

- Create `hotfix/` branch from `main`
- Fix critical bug
- Test locally
- Merge directly to `main` (bypass staging)
- **Use for:** Critical production bugs only

### **Feature Flag Deployment**

- Deploy code with feature disabled
- Enable feature via config/flag
- Gradually roll out to users
- **Use for:** High-risk features

---

## 📊 **Post-Deployment Verification**

### **Immediate Checks (< 5 minutes)**

```bash
# 1. Site is accessible
curl -I https://hummbl.io
# Expected: HTTP 200

# 2. Assets loading
curl -I https://hummbl.io/assets/index.js
# Expected: HTTP 200

# 3. Search works
# Manual: Visit site, test search

# 4. Analytics tracking
# Check: Browser console for analytics events
```

### **Monitor for 30 Minutes**

- [ ] Error rate (should be < 1%)
- [ ] Response time (should be < 2s)
- [ ] User traffic (no sudden drops)
- [ ] Analytics events firing
- [ ] No console errors reported

### **Monitor for 24 Hours**

- [ ] User engagement metrics stable
- [ ] No increase in support requests
- [ ] Performance metrics within norms
- [ ] No data loss reports

---

## 🚨 **Emergency Contacts**

### **Deployment Issues**

- **Primary:** Chief Engineer (Reuben)
- **Secondary:** DevOps Team
- **Platform:** Vercel Support (support@vercel.com)

### **When to Escalate**

- Site completely down (> 5 minutes)
- Data loss detected
- Security breach suspected
- > 50% error rate
- Unable to rollback

---

## 📈 **Monitoring & Alerts**

### **What to Monitor**

- **Uptime:** https://uptimerobot.com or similar
- **Errors:** Sentry, Datadog, or console
- **Performance:** Lighthouse CI, Web Vitals
- **Analytics:** Plausible dashboard
- **Logs:** Vercel deployment logs

### **Alert Thresholds**

- Uptime < 99.5% → Alert immediately
- Error rate > 5% → Alert immediately
- Response time > 5s → Warning
- Bundle size > 500 KB → Block deployment

---

## 🔧 **Troubleshooting**

### **Deployment Fails**

**Problem:** "Build failed"

- Check: `npm run build` works locally
- Check: All dependencies installed
- Check: No TypeScript errors

**Problem:** "Tests failed"

- Run: `npm test` locally
- Fix: Failing tests before pushing

**Problem:** "Bundle size too large"

- Analyze: Run `npm run build` and check dist/
- Solution: Code split, lazy load, remove unused code

### **Site Down After Deployment**

1. **Immediately rollback** (< 2 minutes)
2. Investigate issue in rollback version
3. Fix and test in staging
4. Re-deploy to production

### **Slow Performance After Deployment**

1. Check Lighthouse scores
2. Check bundle size (should be <500 KB)
3. Check for network issues
4. Check for memory leaks
5. Consider rollback if severe

---

## 📝 **Deployment Log Template**

```markdown
## Deployment: YYYY-MM-DD HH:MM

**Version:** v1.2.3
**Branch:** main
**Deployer:** [Your Name]
**Environment:** Production

### Changes

- Feature: New analytics dashboard
- Fix: Search bug on mobile
- Update: Dependencies updated

### Verification

- [x] Tests passed
- [x] Bundle size: 238 KB (within limits)
- [x] Staging tested
- [x] Rollback plan ready

### Post-Deployment

- [x] Site accessible (HTTP 200)
- [x] No console errors
- [x] Analytics working
- [x] Performance normal

### Issues

None

### Rollback (if needed)

Deployment ID: dpl_abc123xyz
```

---

## 🎓 **Best Practices**

### **DO:**

✅ Deploy during low-traffic hours
✅ Test in staging first
✅ Have rollback plan ready
✅ Monitor for 30 minutes post-deploy
✅ Keep deployments small and frequent
✅ Document deployment changes
✅ Communicate with team

### **DON'T:**

❌ Deploy on Fridays (unless critical)
❌ Deploy without testing
❌ Deploy multiple features at once
❌ Skip staging environment
❌ Ignore failed quality checks
❌ Deploy and leave (monitor!)
❌ Panic - follow rollback procedure

---

## 📚 **Additional Resources**

- **Vercel Docs:** https://vercel.com/docs
- **GitHub Actions:** https://docs.github.com/en/actions
- **Rollback Script:** `/scripts/rollback.sh`
- **CI/CD Config:** `/.github/workflows/ci.yml`
- **Analytics Baseline:** `/docs/ANALYTICS_BASELINE.md`

---

**Last Deployment:** TBD  
**Next Scheduled Deployment:** TBD  
**On-Call:** TBD
