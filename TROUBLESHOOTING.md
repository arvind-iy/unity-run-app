# 🔧 Troubleshooting Guide

## ✅ FIXED: 404 Errors for CSS/JS Files

**Problem:** Files not found on GitHub Pages
**Cause:** Files weren't pushed to GitHub
**Solution:** ✅ Fixed! Files have been pushed.

**What was done:**
```bash
git add .
git commit -m "Add all webapp files"
git push
```

---

## 🕐 Wait Time After Push

**GitHub Pages takes 1-2 minutes to rebuild after push.**

After pushing code:
1. Wait 2 minutes
2. Hard refresh browser: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
3. Or clear cache and reload

---

## 🔍 Common Issues & Fixes

### **1. Files Still Not Loading (404)**

**Check:**
```bash
cd "D:\droid\unity run\webapp"
git status
```

If you see "nothing to commit", files are pushed. ✅

**Fix:**
1. Wait 2-3 minutes
2. Hard refresh: `Ctrl + Shift + R`
3. Check GitHub repo: https://github.com/arvind-iy/unity-run-app
4. Verify files exist in repo
5. Check Settings → Pages shows green checkmark

---

### **2. Icon Errors (Fixed)**

**Error:** `icon-192.png 404 (Not Found)`
**Fix:** ✅ Icons removed from manifest.json

Icons are optional - app works fine without them!

To add icons later, see `ICONS_TODO.md`

---

### **3. Sign In Failed**

**Error:** "Sign in failed" or "Invalid client"

**Fixes:**
1. **Check config.js:**
   ```javascript
   CLIENT_ID: 'YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com'
   ```
   Make sure you replaced `YOUR_CLIENT_ID_HERE` with your real Client ID!

2. **Check Google Cloud Console:**
   - Go to APIs & Services → Credentials
   - Click on your OAuth Client ID
   - Under "Authorized JavaScript origins", add:
     ```
     https://arvind-iy.github.io
     ```
   - Save and wait 5 minutes

3. **Clear browser cache:**
   - Settings → Privacy → Clear browsing data
   - Check "Cached images and files"
   - Clear data
   - Reload page

---

### **4. "Failed to load data" or API Errors**

**Check config.js has correct values:**

```javascript
// Must be YOUR actual values, not placeholders!
CLIENT_ID: '123456789-abc.apps.googleusercontent.com',  // ← Replace this
API_KEY: 'AIzaSyAbc123...',                              // ← Replace this
SHEET_ID: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs...',       // ← Replace this
```

**Get your Sheet ID:**
1. Open your Google Sheet
2. Look at URL:
   ```
   https://docs.google.com/spreadsheets/d/[THIS_IS_YOUR_SHEET_ID]/edit
   ```
3. Copy the long ID between `/d/` and `/edit`

**Verify Google Sheets API is enabled:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. APIs & Services → Library
4. Search "Google Sheets API"
5. Should say "API enabled" ✅

---

### **5. Search Returns No Results**

**Check:**
1. Sheet name in config.js matches your actual sheet tab name:
   ```javascript
   SHEET_NAME: 'Registration_9.30 am _26th Oct',  // ← Must match exactly!
   ```

2. Your sheet has data in it

3. Try searching with:
   - Phone number (with or without +91)
   - Email address
   - Name
   - Sr. No

4. Must enter at least 3 characters

---

### **6. Offline Mode Not Working**

**Requirements:**
- Modern browser (Chrome, Edge, Firefox)
- IndexedDB enabled
- Service Worker supported

**Test:**
1. Assign a bib while online (verify it works)
2. Turn off WiFi
3. Assign another bib
4. Should see "Offline Queue" with count
5. Turn WiFi back on
6. Click "Sync Now"
7. Check Google Sheet - both bibs should appear

**If not working:**
- Check browser console (F12) for errors
- Try in Incognito mode (rules out extensions)
- Ensure HTTPS (localhost or GitHub Pages)

---

### **7. Dashboard Not Updating**

**Auto-refresh:** Every 30 seconds

**Manual refresh:** Click 🔄 button

**If stuck:**
1. Sign out and sign in again
2. Hard refresh page: `Ctrl + Shift + R`
3. Check config.js values
4. Verify internet connection

---

### **8. Duplicate Not Detected**

**This should work if:**
- API_KEY is correct in config.js
- Internet connection is working
- You're signed in
- Sheet has the duplicate bib

**Test manually:**
1. Assign bib `50001` to one participant
2. Try to assign `50001` to another participant
3. Should show red error: "Bib 50001 already assigned to [Name]"

**If not working:**
- Refresh the page
- Sign out and sign in
- Check browser console for errors

---

### **9. Format Validation Not Working**

**This always works (client-side validation)**

**Bib ranges:**
- 3K: 30001-39999 (numbers only)
- 5K: 50001-59999 (numbers only)
- 10K: 100001-199999 (numbers only)
- Ride: C001-C9999 (must start with 'C')

**Test:**
1. Search for a 3K participant
2. Try to assign bib `C001` (Ride bib)
3. Should show error immediately
4. Try correct bib `30001`
5. Should work ✅

---

### **10. Can't Deploy to GitHub Pages**

**Check repository settings:**
1. Go to your repo: https://github.com/arvind-iy/unity-run-app
2. Settings → Pages
3. Source should be: **Deploy from a branch**
4. Branch should be: **main** / **(root)**
5. Click Save

**Check files are in root:**
- index.html (must be in root!)
- app.html
- dashboard.html
- css/ folder
- js/ folder

**Verify at:**
```
https://github.com/arvind-iy/unity-run-app
```

All files should be visible there!

---

## 🧪 Testing Checklist

### **Local Testing (localhost:8000):**
- [ ] Landing page loads
- [ ] Can click Staff Login button
- [ ] Can click Dashboard button
- [ ] Sign in button appears

### **After Deploying:**
- [ ] https://arvind-iy.github.io/unity-run-app/ loads
- [ ] CSS loads (page looks styled)
- [ ] No 404 errors in console (F12)
- [ ] Can sign in with Google
- [ ] Can search participants
- [ ] Can assign bib
- [ ] Can view dashboard
- [ ] Offline mode works

---

## 🔍 Debug Commands

### **Check what's pushed to GitHub:**
```bash
cd "D:\droid\unity run\webapp"
git log --oneline -5
git remote -v
```

### **Force push (if needed):**
```bash
git add .
git commit -m "Force update all files"
git push --force
```

### **Check GitHub Pages build status:**
1. Go to: https://github.com/arvind-iy/unity-run-app/actions
2. See if builds are succeeding

---

## 📊 Verification URLs

**Your GitHub repo:**
https://github.com/arvind-iy/unity-run-app

**Your live site:**
https://arvind-iy.github.io/unity-run-app/

**Check files exist:**
- https://arvind-iy.github.io/unity-run-app/css/styles.css
- https://arvind-iy.github.io/unity-run-app/js/app.js
- https://arvind-iy.github.io/unity-run-app/js/sheets-api.js

**If any return 404:**
1. Wait 2 minutes (GitHub Pages rebuilding)
2. Hard refresh
3. Check files are in GitHub repo

---

## 🆘 Emergency Fix

If nothing works:

```bash
# 1. Delete local changes
cd "D:\droid\unity run\webapp"
git reset --hard HEAD

# 2. Pull fresh from GitHub
git pull

# 3. Make sure files exist locally
ls

# 4. Push everything again
git add .
git commit -m "Re-push all files"
git push --force

# 5. Wait 2 minutes and refresh browser
```

---

## ✅ Success Indicators

**You'll know it works when:**

1. **Landing page:**
   - Purple gradient background ✅
   - Two buttons visible ✅
   - No console errors ✅

2. **Staff app:**
   - Styled interface ✅
   - Sign in button works ✅
   - Search box appears ✅

3. **After sign in:**
   - Can search participants ✅
   - Can assign bibs ✅
   - Appears in Google Sheet ✅

---

## 📞 Still Having Issues?

1. **Check browser console:** Press F12 → Console tab → Look for red errors
2. **Copy the error message**
3. **Check config.js** - most issues are wrong Client ID or Sheet ID
4. **Wait 5 minutes** after changing OAuth settings in Google Cloud
5. **Clear browser cache** completely
6. **Try incognito mode** to rule out extensions

---

## 🎯 Common Config Mistakes

**❌ Wrong:**
```javascript
CLIENT_ID: 'YOUR_CLIENT_ID_HERE.apps.googleusercontent.com',
```

**✅ Correct:**
```javascript
CLIENT_ID: '123456789-abc123def456.apps.googleusercontent.com',
```

---

**❌ Wrong:**
```javascript
SHEET_ID: 'YOUR_SHEET_ID_HERE',
```

**✅ Correct:**
```javascript
SHEET_ID: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
```

---

## 🚀 After Fixing

After any fix:

```bash
# 1. Save the file
# 2. Commit and push
git add .
git commit -m "Fix: [describe what you fixed]"
git push

# 3. Wait 2 minutes
# 4. Hard refresh browser: Ctrl + Shift + R
# 5. Test again
```

---

**Most issues are:**
1. Wrong config.js values (80%)
2. GitHub Pages not rebuilt yet (15%)
3. Browser cache (5%)

**Fix those three and you're golden!** ✨
