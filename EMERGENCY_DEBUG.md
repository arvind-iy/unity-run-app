# 🚨 EMERGENCY DEBUG GUIDE

## Your Issues:

1. ❌ "Assignment failed: undefined"
2. ❌ Shows offline even though browser is connected
3. ❌ Laptop says "no internet" but browser works

---

## 🔧 IMMEDIATE FIX - Do This NOW:

### **Step 1: Open Browser Console**

1. Press **F12**
2. Click **Console** tab
3. Keep it open

### **Step 2: Refresh Page**

1. **Ctrl + Shift + R** (hard refresh)
2. Watch console for messages

### **Step 3: Look for These Messages**

You should see:
```
App initializing...
✓ Sheets API initialized
```

If you see errors, **copy them and tell me!**

---

## 🔍 DIAGNOSTIC CHECKLIST

### **Check 1: Is GAPI Loaded?**

In console, type:
```javascript
typeof gapi
```

**Should show:** `"object"`  
**If shows:** `"undefined"` → **GAPI not loaded!**

---

### **Check 2: Are You Actually Signed In?**

In console, type:
```javascript
sheetsAPI.isSignedIn
```

**Should show:** `true`  
**If shows:** `false` → **You're not signed in!**

---

### **Check 3: Can You Reach Google Sheets?**

In console, type:
```javascript
checkApiConnectivity().then(result => console.log('API Check:', result))
```

Watch for:
- `✓ API is online and working` → **Good!**
- `✗ API connectivity check failed` → **Problem!**

---

### **Check 4: Test Direct API Call**

In console, type:
```javascript
gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: CONFIG.SHEET_ID,
    range: 'Registration_9.30 am _26th Oct!A1:A1'
}).then(r => console.log('✓ API works:', r))
.catch(e => console.error('✗ API failed:', e))
```

**If this works** → API is fine, something else is broken  
**If this fails** → See error message for details

---

## 🎯 COMMON ISSUES & FIXES

### **Issue: "GAPI not loaded yet"**

**Cause:** Google API scripts not loading

**Fix:**
1. Check internet connection
2. Check if `https://apis.google.com` is reachable
3. Disable browser extensions (try Incognito mode)
4. Check firewall/antivirus

---

### **Issue: "Not signed in, marking offline"**

**Cause:** OAuth didn't complete

**Fix:**
1. Click "Sign in with Google" again
2. Check OAuth settings in Google Cloud Console
3. Make sure authorized origins include your domain
4. Clear cookies and try again

---

### **Issue: "API connectivity check failed: 404"**

**Cause:** Wrong SHEET_ID or SHEET_NAME

**Fix:**
1. Check `config.js` has correct values
2. Open your Google Sheet in browser
3. Copy the ID from URL (between `/d/` and `/edit`)
4. Check sheet tab name matches exactly

---

### **Issue: "API connectivity check failed: 403"**

**Cause:** Permission denied

**Fix:**
1. Check you're signed in with correct Google account
2. Check that account has access to the sheet
3. Try opening the sheet in a new tab
4. Share the sheet with your Google account

---

### **Issue: "Assignment failed: undefined"**

**Cause:** Error object has no message

**Fix (already pushed):**
- Latest code extracts error better
- Check console for detailed error
- Look for `Error details:` in console

---

## 🚀 FORCED CONNECTIVITY CHECK

Run this in console to force a check:

```javascript
// Force check API connectivity
checkApiConnectivity().then(isOnline => {
    console.log('API Online:', isOnline);
    console.log('Cached Status:', isApiOnline);
});
```

---

## 📊 FULL DIAGNOSTIC

Run this complete diagnostic:

```javascript
console.log('=== FULL DIAGNOSTIC ===');
console.log('1. GAPI loaded:', typeof gapi !== 'undefined');
console.log('2. GAPI client:', typeof gapi?.client !== 'undefined');
console.log('3. Sheets API:', typeof gapi?.client?.sheets !== 'undefined');
console.log('4. Signed in:', sheetsAPI?.isSignedIn);
console.log('5. Cached online status:', isApiOnline);
console.log('6. Config SHEET_ID:', CONFIG.SHEET_ID);
console.log('7. Config SHEET_NAME:', CONFIG.SHEET_NAME);
console.log('8. Config CLIENT_ID:', CONFIG.CLIENT_ID);
console.log('========================');
```

**Copy the output and share it with me!**

---

## 🔧 MANUAL FIX

### **If Nothing Works, Try This:**

```javascript
// 1. Clear offline queue
offlineManager.clearCompleted();

// 2. Force sign out
sheetsAPI.signOut();

// 3. Reload page
location.reload();

// 4. Sign in again
// 5. Try assigning bib
```

---

## ⚡ QUICK TESTS

### **Test 1: Can you search?**
1. Search for a participant
2. Does it return results?
3. **If YES:** API read works ✓
4. **If NO:** Check console error

### **Test 2: Check sheet directly**
1. Open Google Sheet in new tab
2. Can you see data?
3. **If YES:** Sheet exists ✓
4. **If NO:** Wrong SHEET_ID

### **Test 3: Manual API test**
1. Open: `https://sheets.googleapis.com/v4/spreadsheets/YOUR_SHEET_ID/values/Sheet1!A1?key=YOUR_API_KEY`
2. Replace YOUR_SHEET_ID and YOUR_API_KEY
3. Does it return data?
4. **If YES:** API works, auth issue ✓
5. **If NO:** API key problem

---

## 🆘 WHAT TO TELL ME

If still broken, give me:

1. **Console output** (all red errors)
2. **Diagnostic results** (from script above)
3. **What you clicked** (step by step)
4. **What you see** (exact error message)
5. **Browser** (Chrome? Firefox? Edge?)

---

## 💡 YOUR SPECIFIC ISSUES

### **"Laptop shows no internet but browser works"**

This is **Windows network status** bug:
- Windows thinks no internet
- But browser has connection
- This is normal Windows behavior
- **Ignore it** - browser works fine

### **"Web app shows offline"**

The app checks:
1. Are you signed in? (No → Offline)
2. Is GAPI loaded? (No → Offline)
3. Can API be reached? (No → Offline)

**Run diagnostic to see which one fails!**

### **"Assignment failed: undefined"**

Latest fix extracts better errors. After refresh:
- Will show actual error message
- Will log details to console
- Will tell you what's wrong

---

## 🎯 MOST LIKELY CAUSES

Based on your symptoms:

1. **80% chance:** Not actually signed in (OAuth didn't complete)
2. **15% chance:** GAPI scripts blocked/not loading
3. **5% chance:** Wrong config values

**Run the diagnostic script and you'll know immediately!**

---

## ⏰ AFTER LATEST PUSH

Wait 2 minutes, then:

1. **Hard refresh:** Ctrl + Shift + R
2. **Open console:** F12
3. **Sign in**
4. **Watch logs:**
   ```
   Checking API connectivity...
   Testing API connectivity with lightweight call...
   ✓ API is online and working
   ```
5. **Try assignment**
6. **Watch for:** "Attempting direct API assignment..."

**You'll see EXACTLY what's failing!**

---

## 📞 CONTACT ME WITH

1. Screenshot of console (with all red errors visible)
2. Output of full diagnostic script
3. What you see in the status badge (top right)
4. Whether search works or not

**Then I can fix it precisely!** 🎯

---

**The latest push adds extensive logging - you'll see exactly what's wrong now!** ✨
