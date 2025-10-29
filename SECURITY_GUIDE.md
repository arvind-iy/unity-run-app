# 🔒 Security Guide: Protecting Your API Keys

## ⚠️ Important: Client-Side vs Server-Side Security

---

## 📖 Understanding the Architecture

### **This is a Client-Side App**

Your Unity Run app is a **client-side only** application:
- No backend server
- Code runs in browser
- All JavaScript is visible to users

**This means:**
- ❌ You CANNOT hide the API keys completely
- ✅ But you CAN restrict them properly
- ✅ This is actually NORMAL and SAFE for this type of app

---

## 🎯 The Right Way to Secure (What We're Using)

### **1. API Key Restrictions (Already Implemented)**

Your API Key should be **restricted** in Google Cloud Console:

#### **Steps:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. APIs & Services → Credentials
3. Click on your API Key
4. Under "API restrictions":
   - Select **"Restrict key"**
   - Check only: **"Google Sheets API"**
5. Under "Application restrictions":
   - Select **"HTTP referrers (web sites)"**
   - Add these referrers:
     ```
     https://arvind-iy.github.io/*
     http://localhost:8000/*
     ```
6. Click **Save**

**Result:** 
- ✅ Key only works from your domains
- ✅ Key only works with Sheets API
- ✅ Someone stealing the key can't use it elsewhere

---

### **2. OAuth Client ID (Public by Design)**

**Client ID is MEANT to be public!**

From Google's documentation:
> "The client ID is not a secret and can be exposed in the client-side code."

**Why it's safe:**
- OAuth flow requires user consent
- User must sign in with their Google account
- User explicitly grants permissions
- You control who can access the sheet (Google Sheet permissions)

---

### **3. Google Sheet Permissions (Most Important!)**

**This is your main security layer:**

1. Open your Google Sheet
2. Click **Share** button
3. **Restricted access:**
   - Only people you invite can access
   - Only those people can read/write data
4. Add only:
   - Your email
   - Staff emails
   - Dashboard users

**Result:**
- ✅ Even with API access, random users can't read your data
- ✅ Sheet acts as authorization layer
- ✅ Google handles authentication

---

## 🔐 Additional Security Measures

### **Option 1: Environment-Based Config (Recommended)**

Split your config into public and private parts.

#### **Create config.public.js:**
```javascript
const CONFIG = {
    // Public settings
    SHEET_NAME: 'Registration_9.30 am _26th Oct',
    
    BIB_RANGES: {
        '3K': { min: 30001, max: 39999, prefix: '' },
        '5K': { min: 50001, max: 59999, prefix: '' },
        '10K': { min: 100001, max: 199999, prefix: '' },
        'Ride': { min: 1, max: 9999, prefix: 'C' }
    },
    
    COLUMNS: { /* ... */ },
    VERSION: '2.0.0',
    DASHBOARD_REFRESH_INTERVAL: 30000,
    SYNC_RETRY_INTERVAL: 5000,
    MAX_OFFLINE_QUEUE: 100,
    DEBUG: false
};
```

#### **Create config.private.js (NOT committed to git):**
```javascript
// Add these to your config
CONFIG.CLIENT_ID = '123456789-abc.apps.googleusercontent.com';
CONFIG.API_KEY = 'AIzaSyAbc123...';
CONFIG.SHEET_ID = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms';
```

#### **Update .gitignore:**
```
# Private configuration
config.private.js
```

#### **Update HTML files to load both:**
```html
<script src="config.public.js"></script>
<script src="config.private.js"></script>
```

**Downside:** You have to manually update config.private.js on server (can't use git)

---

### **Option 2: Environment Variables (Advanced)**

Use a build tool to inject secrets at build time.

#### **Install Vite (build tool):**
```bash
npm init -y
npm install vite
```

#### **Create .env file (NOT committed):**
```
VITE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
VITE_API_KEY=AIzaSyAbc123...
VITE_SHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
```

#### **Update .gitignore:**
```
.env
.env.local
.env.production
node_modules/
dist/
```

#### **Update config.js:**
```javascript
const CONFIG = {
    CLIENT_ID: import.meta.env.VITE_CLIENT_ID,
    API_KEY: import.meta.env.VITE_API_KEY,
    SHEET_ID: import.meta.env.VITE_SHEET_ID,
    // ... rest of config
};
```

#### **Update package.json:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  }
}
```

#### **Build and deploy:**
```bash
npm run build
# Upload dist/ folder to GitHub Pages
```

**Downside:** More complex setup, requires build step

---

### **Option 3: Keep As-Is BUT Restrict Properly (Easiest)**

**For most use cases, this is sufficient:**

1. ✅ **API Key restricted** to your domains + Sheets API only
2. ✅ **OAuth requires** user sign-in
3. ✅ **Sheet permissions** control data access
4. ✅ **Application restrictions** on OAuth client

**Why this works:**
- Someone can see your keys in browser DevTools
- But they can't use them:
  - API Key only works from your domains
  - OAuth requires them to be authorized users
  - Sheet permissions block unauthorized access

**This is how most client-side apps work!**

Examples:
- Firebase apps (API key visible)
- Supabase apps (anon key visible)
- Many Google API apps (Client ID visible)

---

## 🚫 What NOT to Do

### ❌ **Don't use Service Account keys in client-side code**

Service Account keys are private keys that bypass user auth. 

**NEVER put these in browser code:**
```json
{
  "type": "service_account",
  "project_id": "...",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",
  ...
}
```

**Our app doesn't use this - we use OAuth, which is correct!** ✅

---

## 🔒 Current Security Status

### **Your Current Setup:**

| Layer | Status | Security Level |
|-------|--------|----------------|
| API Key in code | ⚠️ Visible | OK if restricted |
| Client ID in code | ✅ Public | Safe (by design) |
| OAuth flow | ✅ Implemented | Secure |
| Sheet permissions | ✅ User controlled | Your main security |
| API Key restrictions | ⚠️ Need to set | **DO THIS!** |
| HTTP referrer restrictions | ⚠️ Need to set | **DO THIS!** |

---

## ✅ Action Plan (Priority Order)

### **High Priority (Do Now):**

#### **1. Restrict API Key**
```
Google Cloud → Credentials → API Key → Edit
- API restrictions: "Restrict key" → Check "Google Sheets API"
- Application restrictions: "HTTP referrers"
  - https://arvind-iy.github.io/*
  - http://localhost:8000/*
```

#### **2. Restrict OAuth Client**
```
Google Cloud → Credentials → OAuth Client → Edit
- Authorized JavaScript origins:
  - https://arvind-iy.github.io
  - http://localhost:8000
- Authorized redirect URIs: (already done)
```

#### **3. Lock Down Sheet Permissions**
```
Google Sheet → Share
- Restricted access
- Only add emails of actual users
- Don't make it "Anyone with link"
```

---

### **Medium Priority (Optional but Good):**

#### **4. Add to .gitignore (prevent future leaks)**
Create a template config:

**config.template.js:**
```javascript
const CONFIG = {
    CLIENT_ID: 'YOUR_CLIENT_ID_HERE.apps.googleusercontent.com',
    API_KEY: 'YOUR_API_KEY_HERE',
    SHEET_ID: 'YOUR_SHEET_ID_HERE',
    // ... rest of actual config
};
```

**.gitignore:**
```
# Don't track actual config
config.js

# But track the template
!config.template.js
```

Then users copy template → config.js → fill in their values.

---

### **Low Priority (Advanced Users):**

#### **5. Use environment variables with build tool**
See Option 2 above if you want this level of security.

#### **6. Implement backend proxy**
Add a simple serverless function to proxy API requests.
- Vercel Functions
- Netlify Functions
- Cloudflare Workers

This hides API key completely but adds complexity.

---

## 🎯 Recommended Approach for You

### **Best Balance: Option 3 (Keep current but restrict properly)**

**Why:**
1. ✅ Simple - no build tools needed
2. ✅ Secure - with proper restrictions
3. ✅ Fast - works immediately
4. ✅ Maintainable - easy to update
5. ✅ Industry standard - how most apps work

**What to do:**
1. **Restrict API Key** (5 minutes)
2. **Lock down Sheet permissions** (2 minutes)
3. **Done!** You're secure enough for production use

**Total time:** 7 minutes

---

## 📊 Security Comparison

| Approach | Security | Complexity | Time | Best For |
|----------|----------|------------|------|----------|
| Current (unrestricted) | ⚠️ Low | Simple | 0 min | Testing only |
| **Restricted keys** | ✅ Good | Simple | 7 min | **Production** ⭐ |
| Split config | ✅ Good | Medium | 20 min | Multiple environments |
| Build tool + .env | ✅ Better | High | 1 hour | Advanced users |
| Backend proxy | ✅ Best | Very High | 3 hours | Enterprise apps |

**For your use case: "Restricted keys" is perfect!** ✅

---

## 🔍 How to Check if You're Secure

### **Test 1: API Key Restrictions**
Try your API key from a different domain:
```javascript
// Open console on google.com and try:
fetch('https://sheets.googleapis.com/v4/spreadsheets/YOUR_SHEET_ID?key=YOUR_API_KEY')
```

**Should fail with:** "API key not valid. Please pass a valid API key."

---

### **Test 2: Sheet Permissions**
1. Open incognito mode
2. Try to access sheet URL directly
3. **Should say:** "You need permission"

---

### **Test 3: OAuth Flow**
1. Try signing in with unauthorized email
2. **Should say:** "Access denied" or prompt to request access

---

## 📝 Updated .gitignore

Add this to your `.gitignore`:

```
# Sensitive configuration
config.private.js
.env
.env.local
.env.production

# Build outputs
node_modules/
dist/
build/

# Icons (optional - can be generated)
icon-192.png
icon-512.png

# Editor
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
```

---

## 🚀 Immediate Action Items

**Right now (7 minutes):**

1. ✅ **Google Cloud Console** → Credentials
2. ✅ **Click API Key** → Edit
3. ✅ **API restrictions:** Restrict to Sheets API only
4. ✅ **Application restrictions:** Add referrers
5. ✅ **Save**
6. ✅ **Google Sheet** → Share → Lock down permissions
7. ✅ **Test:** Try accessing sheet without permission

**That's it!** You're now secure enough for production use.

---

## 💡 Key Takeaways

1. **Client-side apps CANNOT completely hide API keys** - this is by design
2. **Restrict API keys properly** - this is your main defense
3. **Sheet permissions** are your second layer of security
4. **OAuth flow** ensures only authorized users can sign in
5. **This pattern is industry-standard** - used by millions of apps
6. **Perfect security requires a backend** - but adds complexity you don't need

---

## 🆘 But What If Someone Gets My Keys?

**With proper restrictions:**

### **Someone steals your API Key:**
- ❌ Can't use it from their domain (referrer restriction)
- ❌ Can't use it with other APIs (API restriction)
- ❌ Can't read your sheet (sheet permissions)
- ✅ Worst case: They could make requests from your domain, but...
- ✅ Sheet permissions still block unauthorized access

### **Someone steals your Client ID:**
- ✅ That's fine! Client ID is public by design
- ✅ They still need to authenticate with Google
- ✅ They still need access to your sheet
- ✅ You control who has access

### **Someone steals your Sheet ID:**
- ✅ That's fine! Sheet ID is not secret
- ✅ They need to be authorized to access it
- ✅ Your sheet permissions block them

**Bottom line:** With restrictions in place, you're safe! ✅

---

## 📚 Further Reading

- [Google API Key Best Practices](https://cloud.google.com/docs/authentication/api-keys#securing)
- [OAuth 2.0 for Client-side Apps](https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow)
- [OWASP Top 10 - API Security](https://owasp.org/www-project-api-security/)

---

**TL;DR: Restrict your API key in Google Cloud Console and lock down Sheet permissions. That's enough! Don't overthink it.** ✨
