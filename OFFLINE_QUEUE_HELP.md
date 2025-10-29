# 📦 Offline Queue - What It Is & How to Manage

## 🤔 What You're Seeing

```
📦 Offline Queue
2 pending assignments
🔄 Sync Now
```

This means you have **2 bib assignments** stored locally in your browser that haven't been synced to Google Sheets yet.

---

## 💡 Why This Happens

### **Scenario 1: You Were Offline**
- You assigned bibs while internet was down
- They were saved to IndexedDB (local storage)
- Now you're back online but they haven't synced yet

### **Scenario 2: Sync Failed**
- You were online but API call failed
- Assignment saved to queue as backup
- Retry needed

### **Scenario 3: Testing/Development**
- You tested the app while developing
- Test assignments got queued
- Now they're stuck in the queue

---

## ✅ How to Fix (3 Options)

### **Option 1: Click "Sync Now" Button** ⭐ **RECOMMENDED**

1. Make sure you're signed in
2. Make sure you're online
3. Click the **"🔄 Sync Now"** button
4. Wait for sync to complete
5. Check your Google Sheet - assignments should appear
6. Queue disappears automatically

---

### **Option 2: Let Auto-Sync Work**

The app now auto-syncs when:
- ✅ You sign in (checks queue automatically)
- ✅ You come back online (auto-syncs)
- ✅ Page loads (checks queue)

**Just wait 2-3 seconds after signing in!**

---

### **Option 3: Clear Queue Manually (If Stuck)**

If sync keeps failing or you want to clear test data:

#### **Using Browser Console:**

1. Press **F12** (open DevTools)
2. Go to **Console** tab
3. Paste this and press Enter:

```javascript
// Clear the entire offline queue
offlineManager.clearCompleted().then(() => {
    console.log('Queue cleared!');
    location.reload();
});
```

#### **Or Delete IndexedDB:**

1. Press **F12**
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Find **IndexedDB** → **UnityRunOfflineDB**
4. Right-click → **Delete database**
5. Refresh page

---

## 🔍 Inspect What's in the Queue

Want to see what those 2 assignments are?

```javascript
// Open Console (F12) and run:
offlineManager.getQueue().then(queue => {
    console.table(queue);
});
```

You'll see:
- Participant names
- Bib numbers
- Venue/desk
- Timestamp

---

## 🚀 Updated Behavior (Just Fixed!)

I've updated the app to:

### **1. Auto-Check on Load**
- App checks queue when page loads
- Shows count if there are pending items

### **2. Auto-Sync After Sign In**
- After you sign in with Google
- Waits 1.5 seconds
- Checks if queue has items
- Auto-syncs if online

### **3. Manual Sync Always Available**
- Click "Sync Now" button anytime
- Forces immediate sync

---

## 📊 How the Offline Queue Works

```
┌─────────────────────────────────────┐
│  You Assign Bib                     │
└────────────┬────────────────────────┘
             │
             ▼
     ┌───────────────┐
     │ Are you       │
     │ online?       │
     └───┬───────┬───┘
         │       │
       YES      NO
         │       │
         ▼       ▼
┌─────────────┐ ┌──────────────────┐
│ Direct to   │ │ Save to IndexedDB│
│ Google      │ │ (Offline Queue)  │
│ Sheets      │ └──────┬───────────┘
└─────────────┘        │
                       │
              ┌────────▼─────────┐
              │ Back online?     │
              │ Sign in?         │
              └────────┬─────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ Auto-sync or    │
              │ Click "Sync Now"│
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ Synced to Sheet │
              │ Queue cleared   │
              └─────────────────┘
```

---

## 🎯 What To Do Right Now

### **If you want those 2 assignments to go through:**

1. ✅ Make sure you're signed in
2. ✅ Make sure config.js has correct SHEET_ID
3. ✅ Click **"Sync Now"** button
4. ✅ Wait for success message
5. ✅ Check Google Sheet - 2 new bibs should appear
6. ✅ Queue disappears

### **If those were just tests:**

1. ✅ Open Console (F12)
2. ✅ Run: `offlineManager.clearCompleted()`
3. ✅ Or delete IndexedDB manually
4. ✅ Refresh page
5. ✅ Queue gone!

---

## ⚠️ Common Issues

### **"Sync keeps failing"**

**Possible causes:**
1. Not signed in with Google
2. config.js has wrong SHEET_ID
3. API key not working
4. Sheet permissions issue

**Fix:**
1. Sign out and sign in again
2. Verify config.js SHEET_ID
3. Check browser console for error messages

---

### **"Queue shows even when I'm online"**

**This is CORRECT behavior!**

The queue shows based on **pending items**, not connection status.

- ✅ Connection status: Top right (🟢 Online / 🔴 Offline)
- ✅ Queue status: Bottom section (shows if items pending)

**They're separate!**

You can be:
- Online with no queue ✅
- Online with pending queue ✅ (this is what you have!)
- Offline with no queue ✅
- Offline with pending queue ✅

---

## 💡 Pro Tip

The offline queue is a **safety feature**!

It ensures:
- ✅ No data loss when offline
- ✅ Assignments never disappear
- ✅ You can keep working during network issues
- ✅ Everything syncs when connection restored

**It's working as designed!** 🎉

---

## 🔧 For Developers

### **View Queue:**
```javascript
offlineManager.getQueue()
```

### **Get Count:**
```javascript
offlineManager.getQueueCount()
```

### **Clear Queue:**
```javascript
offlineManager.clearCompleted()
```

### **Manual Sync:**
```javascript
offlineManager.syncQueue()
```

### **Add to Queue (for testing):**
```javascript
offlineManager.addToQueue({
    srNo: 123,
    bibNumber: '50001',
    venue: 'Test Venue',
    desk: '1',
    staffName: 'Test Staff',
    participant: { name: 'Test User' }
})
```

---

## 📋 Summary

**Your current situation:**
- ✅ You have 2 assignments in queue
- ✅ You're online (connection is fine)
- ✅ Queue is showing correctly
- ⏳ Just need to sync them

**What to do:**
1. Click "🔄 Sync Now"
2. Done!

**After the update I just made:**
- ✅ Will auto-sync on sign in
- ✅ Will auto-check on page load
- ✅ Will show queue count always

**This is not a bug - it's a feature working correctly!** ✨

---

## 🎓 Teaching Moment

This demonstrates **offline-first architecture**:

1. **Local-first storage** (IndexedDB)
2. **Background sync** (when online)
3. **Queue management** (pending items)
4. **Conflict resolution** (duplicate detection)

This is how modern PWAs work! 🚀

---

**Just click "Sync Now" and you're good to go!** 🎉
