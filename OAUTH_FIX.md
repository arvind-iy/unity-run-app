# 🔧 FIX: OAuth redirect_uri_mismatch Error

## ❌ Error You're Seeing

```
Error 400: redirect_uri_mismatch
Access blocked: arvind-iy.github.io's request is invalid
```

## ✅ Solution: Add Redirect URIs to Google Cloud

---

## 📋 Step-by-Step Fix (5 minutes)

### **Step 1: Go to Google Cloud Console**

1. Open: https://console.cloud.google.com
2. Make sure your project is selected (top left dropdown)
3. Go to: **APIs & Services → Credentials**

---

### **Step 2: Edit OAuth Client ID**

1. Find your OAuth 2.0 Client ID (should be named something like "Unity Bib Web Client")
2. Click the **pencil icon** ✏️ to edit it

---

### **Step 3: Add Authorized JavaScript Origins**

In the **"Authorized JavaScript origins"** section, click **"+ ADD URI"** and add these **TWO** URLs:

```
http://localhost:8000
```

```
https://arvind-iy.github.io
```

**Important:** 
- No trailing slash!
- `http://` for localhost
- `https://` for GitHub Pages

---

### **Step 4: Add Authorized Redirect URIs**

In the **"Authorized redirect URIs"** section, click **"+ ADD URI"** and add these **FOUR** URLs:

```
http://localhost:8000/
```

```
http://localhost:8000/app.html
```

```
https://arvind-iy.github.io/unity-run-app/
```

```
https://arvind-iy.github.io/unity-run-app/app.html
```

**Important:** 
- Include the trailing slash for base URLs!
- Include `/unity-run-app/` in the path for GitHub Pages

---

### **Step 5: Save**

1. Click **"SAVE"** at the bottom
2. You should see: "OAuth client updated"

---

### **Step 6: Wait 5 Minutes**

⏰ Google needs time to propagate the changes.

**While waiting, let's check your config.js...**

---

## 🔍 Verify Your config.js

Make sure `config.js` has your **ACTUAL** values:

```javascript
const CONFIG = {
    // Replace with YOUR actual Client ID from Google Cloud
    CLIENT_ID: '123456789-abcdefg.apps.googleusercontent.com',  // ← Your real one!
    
    // Replace with YOUR actual API Key
    API_KEY: 'AIzaSyAbc123...',  // ← Your real one!
    
    // Replace with YOUR actual Sheet ID
    SHEET_ID: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',  // ← Your real one!
    
    // Rest is fine...
}
```

### **How to get these values:**

#### **CLIENT_ID:**
1. Google Cloud Console → APIs & Services → Credentials
2. Look under "OAuth 2.0 Client IDs"
3. Copy the Client ID (looks like: `123456789-xxxxx.apps.googleusercontent.com`)

#### **API_KEY:**
1. Same page, look under "API Keys"
2. Click "Show Key"
3. Copy it

#### **SHEET_ID:**
1. Open your Google Sheet
2. Look at the URL:
   ```
   https://docs.google.com/spreadsheets/d/[COPY_THIS_PART]/edit
   ```
3. Copy the long ID between `/d/` and `/edit`

---

## 📝 After Editing config.js

**Commit and push the changes:**

```bash
cd "D:\droid\unity run\webapp"
git add config.js
git commit -m "Add Google Cloud credentials to config"
git push
```

---

## 🧪 Test After 5 Minutes

1. **Wait 5 minutes** after saving OAuth settings
2. **Clear browser cache** or use Incognito mode
3. **Go to:** https://arvind-iy.github.io/unity-run-app/
4. **Click:** "Staff Login"
5. **Click:** "Sign in with Google"
6. **Should work now!** ✅

---

## 📸 Visual Guide

### **What your OAuth settings should look like:**

**Authorized JavaScript origins:**
```
✅ http://localhost:8000
✅ https://arvind-iy.github.io
```

**Authorized redirect URIs:**
```
✅ http://localhost:8000/
✅ http://localhost:8000/app.html
✅ https://arvind-iy.github.io/unity-run-app/
✅ https://arvind-iy.github.io/unity-run-app/app.html
```

---

## ⚠️ Common Mistakes

### ❌ **Wrong:**
```
https://arvind-iy.github.io/unity-run-app    (missing slash)
http://arvind-iy.github.io                    (wrong protocol)
https://arvind-iy.github.io/                  (missing /unity-run-app/)
```

### ✅ **Correct:**
```
https://arvind-iy.github.io/unity-run-app/   (with slash!)
```

---

## 🔍 Still Not Working?

### **Error: "Invalid client"**
- Check CLIENT_ID in config.js matches Google Cloud
- Make sure you copied the entire Client ID
- No extra spaces or quotes

### **Error: "Access denied"**
- You need to add yourself as a test user
- Google Cloud → APIs & Services → OAuth consent screen
- Under "Test users", click "+ ADD USERS"
- Add your email: `arvindv95@gmail.com`
- Save

### **Error: "App not verified"**
This is normal for testing! 
1. Click "Advanced"
2. Click "Go to [app name] (unsafe)"
3. Click "Allow"
4. This is fine for internal use!

---

## 📋 Complete Checklist

- [ ] Google Cloud Console opened
- [ ] APIs & Services → Credentials
- [ ] OAuth Client ID edited
- [ ] Added JavaScript origins (2 URLs)
- [ ] Added redirect URIs (4 URLs)
- [ ] Clicked Save
- [ ] Waited 5 minutes
- [ ] config.js has real CLIENT_ID
- [ ] config.js has real API_KEY
- [ ] config.js has real SHEET_ID
- [ ] Committed and pushed config.js
- [ ] Waited 2 minutes for GitHub Pages
- [ ] Cleared browser cache
- [ ] Tested sign-in
- [ ] ✅ Works!

---

## 🎯 Quick Reference

**Your URLs to add:**

```
JavaScript Origins:
- http://localhost:8000
- https://arvind-iy.github.io

Redirect URIs:
- http://localhost:8000/
- http://localhost:8000/app.html
- https://arvind-iy.github.io/unity-run-app/
- https://arvind-iy.github.io/unity-run-app/app.html
```

**Copy-paste these exactly!**

---

## 🚀 After It Works

Once sign-in works:

1. ✅ Select venue and desk
2. ✅ Enter your name
3. ✅ Search for a participant (phone/email/name)
4. ✅ Assign a bib
5. ✅ Check your Google Sheet - it should appear!

---

## 💡 Pro Tip

If you ever change your GitHub username or repo name, you'll need to update these OAuth settings again!

---

**The fix is simple: Just add those 6 URLs to OAuth settings!** ✨

**After that, wait 5 minutes, and you're golden!** 🎉
