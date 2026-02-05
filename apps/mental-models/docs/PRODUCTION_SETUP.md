# Production Setup Guide

**Purpose:** Step-by-step guide for deploying HUMMBL to production with proper security configuration.

**Version:** 1.0  
**Last Updated:** 2025-10-19

---

## 🚀 **Pre-Deployment Checklist**

- [ ] All tests passing (`npm test`)
- [ ] Build successful (`npm run build`)
- [ ] Environment variables configured
- [ ] Secrets stored securely
- [ ] Admin password generated
- [ ] Analytics configured
- [ ] Staging tested
- [ ] Rollback plan ready

---

## 🔐 **Environment Variables Setup**

### **1. Copy Example Configuration**

```bash
cp .env.example .env.local
```

### **2. Generate Secure Admin Password**

```bash
# Generate a strong 32-character password
openssl rand -base64 32

# Example output:
# R7x9K2mN4pQ8sT1vW5yZ3aB6cD0eF4gH8iJ2kL5mN7oP
```

### **3. Configure .env.local**

```bash
# Analytics (Plausible)
VITE_PLAUSIBLE_DOMAIN=hummbl.io
VITE_PLAUSIBLE_API_KEY=your_actual_api_key

# Admin Authentication (use generated password)
VITE_ADMIN_PASSWORD=R7x9K2mN4pQ8sT1vW5yZ3aB6cD0eF4gH8iJ2kL5mN7oP
```

### **4. Add to .gitignore**

Verify `.env.local` is in `.gitignore`:

```bash
# .gitignore
.env.local
.env*.local
```

**⚠️ CRITICAL:** Never commit `.env.local` to git!

---

## 🔧 **Vercel Configuration**

### **1. Add Environment Variables**

Go to Vercel Dashboard → Project Settings → Environment Variables

Add these variables:

| Variable                 | Value                  | Environment |
| ------------------------ | ---------------------- | ----------- |
| `VITE_PLAUSIBLE_DOMAIN`  | `hummbl.io`            | Production  |
| `VITE_PLAUSIBLE_API_KEY` | `[your key]`           | Production  |
| `VITE_ADMIN_PASSWORD`    | `[generated password]` | Production  |

### **2. Separate Staging Variables**

For staging environment:

| Variable                 | Value                | Environment     |
| ------------------------ | -------------------- | --------------- |
| `VITE_PLAUSIBLE_DOMAIN`  | `staging-hummbl.io`  | Preview/Staging |
| `VITE_PLAUSIBLE_API_KEY` | `[staging key]`      | Preview/Staging |
| `VITE_ADMIN_PASSWORD`    | `[staging password]` | Preview/Staging |

---

## 🧪 **Session Validation Tests**

### **Test 1: Authentication Flow**

```bash
# Run auth tests
npm test -- auth.test.ts

# Expected output:
# ✓ authenticates with correct password
# ✓ rejects incorrect password
# ✓ creates session with correct role
# ✓ sets session expiration
```

### **Test 2: Manual Login Test**

1. Start development server: `npm run dev`
2. Navigate to: `http://localhost:5173/admin`
3. Enter admin password
4. Verify access granted
5. Check browser localStorage for session:
   ```javascript
   localStorage.getItem('hummbl_auth_session');
   ```
6. Verify session contains:
   - `userId: "admin"`
   - `role: "admin"`
   - `authenticated: true`
   - `expiresAt: [timestamp 24h in future]`

### **Test 3: Session Expiration**

1. Login as admin
2. Manually expire session in browser console:
   ```javascript
   const session = JSON.parse(localStorage.getItem('hummbl_auth_session'));
   session.expiresAt = Date.now() - 1000;
   localStorage.setItem('hummbl_auth_session', JSON.stringify(session));
   ```
3. Refresh page or navigate to protected route
4. Verify login prompt appears

### **Test 4: Role Hierarchy**

1. Login with admin role
2. Access `/admin` - Should succeed ✅
3. Access `/analytics` - Should succeed ✅
4. Logout
5. Login with analyst role
6. Access `/admin` - Should fail ❌
7. Access `/analytics` - Should succeed ✅

### **Test 5: Session Persistence**

1. Login as admin
2. Close browser tab
3. Reopen and navigate to protected route
4. Verify still authenticated (session persists)

---

## 📊 **Analytics Configuration**

### **Plausible Setup**

1. **Create Account:** https://plausible.io
2. **Add Site:** `hummbl.io`
3. **Get Embed Code:**
   ```html
   <script defer data-domain="hummbl.io" src="https://plausible.io/js/script.js"></script>
   ```
4. **Add to index.html:**

   ```html
   <!-- In public/index.html or index.html -->
   <head>
     <!-- ... other tags ... -->
     <script defer data-domain="hummbl.io" src="https://plausible.io/js/script.js"></script>
   </head>
   ```

5. **Verify Tracking:**
   - Open browser DevTools → Network tab
   - Navigate pages
   - Look for requests to `plausible.io/api/event`
   - Check Plausible dashboard for real-time events

### **Google Analytics 4 (Optional)**

If using GA4 instead of or alongside Plausible:

1. Create GA4 property
2. Get Measurement ID (format: `G-XXXXXXXXXX`)
3. Add to `.env.local`:
   ```bash
   VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
   ```
4. Add tracking code to index.html

---

## 🔒 **Security Hardening**

### **1. Password Storage**

**Use a Password Manager:**

- 1Password
- LastPass
- Bitwarden
- KeePass

**Store:**

- Admin password
- Plausible API key
- Vercel tokens
- GitHub tokens

**Never:**

- ❌ Store in plain text files
- ❌ Share via email/Slack
- ❌ Commit to git
- ❌ Include in screenshots

### **2. HTTPS Enforcement**

Vercel automatically enforces HTTPS. Verify:

```bash
curl -I http://hummbl.io
# Should redirect to https://hummbl.io
```

### **3. Security Headers**

Verify in Vercel settings or `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### **4. Rate Limiting**

Consider adding rate limiting for admin endpoints:

- Cloudflare (if using)
- Vercel Edge Functions
- Backend API rate limiting

---

## 🧪 **Production Verification**

### **Smoke Tests**

After deployment, verify:

- [ ] Site loads: `https://hummbl.io`
- [ ] No console errors
- [ ] Mental models load
- [ ] Narratives load
- [ ] Search works
- [ ] Bookmarks work
- [ ] Analytics firing (check DevTools)
- [ ] Admin login works
- [ ] Protected routes require auth
- [ ] Session persists across page loads

### **Performance Tests**

```bash
# Run Lighthouse audit
npm install -g lighthouse

lighthouse https://hummbl.io --view

# Expected scores:
# Performance: 90+
# Accessibility: 100
# Best Practices: 100
# SEO: 100
```

### **Security Tests**

1. **Check HTTPS:**

   ```bash
   curl -I https://hummbl.io | grep "strict-transport-security"
   ```

2. **Check Headers:**

   ```bash
   curl -I https://hummbl.io | grep "x-content-type-options"
   curl -I https://hummbl.io | grep "x-frame-options"
   ```

3. **Check No Secrets in Client:**
   - View page source
   - Search for "secret", "key", "password"
   - Verify no secrets exposed

---

## 📈 **Monitoring Setup**

### **1. Uptime Monitoring**

Use UptimeRobot or similar:

- Monitor `https://hummbl.io` every 5 minutes
- Alert on downtime
- Check from multiple locations

### **2. Error Tracking**

Consider adding Sentry:

```bash
npm install @sentry/react
```

```typescript
// src/main.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
});
```

### **3. Analytics Dashboard**

- Plausible: https://plausible.io/hummbl.io
- Admin Analytics: https://hummbl.io/analytics (requires login)

---

## 🚨 **Incident Response**

### **If Site Goes Down**

1. **Check Vercel Status:** https://www.vercel-status.com
2. **Check Recent Deployments:** Vercel dashboard
3. **Rollback if needed:**
   ```bash
   ./scripts/rollback.sh [deployment-id]
   ```
4. **Check Error Logs:** Vercel function logs
5. **Notify Team:** Slack/Discord/Email

### **If Admin Access Locked Out**

1. Access Vercel dashboard
2. Update `VITE_ADMIN_PASSWORD` environment variable
3. Redeploy or trigger rebuild
4. Wait for deployment (< 2 minutes)
5. Try new password

### **If Analytics Not Working**

1. Check Plausible dashboard for site status
2. Verify script tag in HTML
3. Check browser console for errors
4. Check Network tab for blocked requests
5. Verify API key in environment variables

---

## ✅ **Post-Deployment**

### **Week 1 Checklist**

- [ ] Monitor uptime (target: 99.9%)
- [ ] Check error rates (target: < 1%)
- [ ] Review analytics data
- [ ] Test all critical paths
- [ ] Collect user feedback
- [ ] Review performance metrics
- [ ] Check backup system working

### **Week 2-4 Checklist**

- [ ] Review user behavior patterns
- [ ] Analyze top content
- [ ] Check search queries
- [ ] Test NPS survey trigger
- [ ] Conduct user interviews (5-10)
- [ ] Review feedback submissions
- [ ] Optimize based on data

---

## 📞 **Support Contacts**

**Platform Issues:**

- Vercel Support: support@vercel.com
- Vercel Status: https://www.vercel-status.com

**Analytics Issues:**

- Plausible Support: support@plausible.io
- Documentation: https://plausible.io/docs

**Development Team:**

- Primary: Chief Engineer (Reuben)
- Repository: github.com/hummbl-dev/hummbl-io

---

## 🔄 **Maintenance Schedule**

**Daily:**

- Monitor uptime and errors
- Check analytics for anomalies

**Weekly:**

- Review user feedback
- Check backup system
- Review performance metrics

**Monthly:**

- Dependency updates
- Security audit
- Performance optimization
- Content updates

**Quarterly:**

- Major feature releases
- Security review
- Infrastructure audit
- User research synthesis

---

**Status:** Ready for Production  
**Last Reviewed:** 2025-10-19  
**Next Review:** 2025-11-19
