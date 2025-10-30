# Unity Run & Ride - Complete System Documentation

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Setup Instructions](#setup-instructions)
4. [User Roles & Apps](#user-roles--apps)
5. [Column Structure](#column-structure)
6. [Logging System](#logging-system)
7. [Workflows](#workflows)
8. [Troubleshooting](#troubleshooting)
9. [Development Notes](#development-notes)

---

## 🎯 System Overview

**Event:** Unity Run & Ride
**Total Participants:** 3,949
**Purpose:** Real-time bib number assignment and T-shirt size management

### Key Features
- ✅ Real-time bib assignment with duplicate detection
- ✅ T-shirt size replacement desk
- ✅ Complete audit trail (who, what, when, where)
- ✅ Offline support with sync
- ✅ OAuth session persistence
- ✅ Modern card-based UI
- ✅ Separate logging columns (master data protected)

---

## 🏗️ Architecture

### Technology Stack
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Google Sheets API v4
- **Authentication:** Google OAuth 2.0
- **Storage:** LocalStorage (settings, offline queue)
- **Hosting:** GitHub Pages

### Files Structure
```
webapp/
├── app.html                  # Main bib assignment interface
├── tshirt-app.html          # T-shirt replacement interface
├── dashboard.html           # Admin statistics dashboard
├── add-headers.html         # One-time column headers utility
│
├── css/
│   └── styles.css           # Card-based modern design
│
├── js/
│   ├── app.js               # Bib assignment logic
│   ├── tshirt-app.js        # T-shirt replacement logic
│   ├── sheets-api.js        # Google Sheets API wrapper
│   └── offline.js           # Offline queue management
│
├── config.js                # Configuration & column mapping
├── manifest.json            # PWA manifest
└── README.md               # Quick reference
```

---

## 🚀 Setup Instructions

### Prerequisites
1. Google Cloud Project with Sheets API enabled
2. OAuth 2.0 credentials configured
3. Google Sheet with participant data
4. GitHub account (for hosting)

### Step-by-Step Setup

#### 1. Google Cloud Setup
```
1. Go to: https://console.cloud.google.com
2. Create new project: "Unity Run Bib Management"
3. Enable Google Sheets API
4. Create OAuth 2.0 credentials (Web application)
5. Authorized JavaScript origins:
   - https://[your-username].github.io
6. Authorized redirect URIs:
   - https://[your-username].github.io/[repo-name]/
7. Copy Client ID and API Key
```

#### 2. Configure Application
Edit `config.js`:
```javascript
CLIENT_ID: 'your-client-id-here',
API_KEY: 'your-api-key-here',
SHEET_ID: 'your-google-sheet-id',
SHEET_NAME: 'Your Sheet Tab Name'
```

#### 3. Deploy to GitHub Pages
```bash
# Create repo and push
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/username/repo.git
git push -u origin main

# Enable GitHub Pages
Settings → Pages → Source: main branch → Save
```

#### 4. Add Column Headers
```
1. Wait 2-3 minutes for GitHub Pages to build
2. Go to: https://[your-github-pages-url]/add-headers.html
3. Sign in with Google
4. Click "Add Headers to Sheet"
5. Verify headers added to columns AB-AQ
```

#### 5. Train Staff
- Bib desk staff: Use `app.html`
- T-shirt desk staff: Use `tshirt-app.html`
- Admin/coordinators: Use `dashboard.html`

---

## 👥 User Roles & Apps

### 1. Bib Assignment Desk (app.html)
**Users:** Registration desk staff
**Desks:** 1-4 per venue
**Venues:** Prabhadevi, Andheri

**Functions:**
- Search participants (mobile, email, name, Sr. No)
- Assign bib numbers
- Edit existing bib numbers
- View session info (venue, desk, volunteer name)

**Access:**
```
URL: https://[github-pages-url]/app.html
```

### 2. T-Shirt Replacement Desk (tshirt-app.html)
**Users:** T-shirt replacement desk staff
**Desks:** 1-3 per venue
**Venues:** Prabhadevi, Andheri

**Functions:**
- Search participants (mobile, email, name, bib number)
- Change T-shirt sizes
- View size change history
- Separate session tracking

**Access:**
```
URL: https://[github-pages-url]/tshirt-app.html
```

### 3. Admin Dashboard (dashboard.html)
**Users:** Event coordinators, admin
**Functions:**
- View real-time statistics
- Monitor venue/desk performance
- See recent assignments
- Track completion rates

**Access:**
```
URL: https://[github-pages-url]/dashboard.html
```

---

## 📊 Column Structure

### Master Data Columns (A-AA) - READ ONLY
**CRITICAL:** These columns contain original registration data. The app ONLY updates columns H and I.

| Column | Index | Field | App Access |
|--------|-------|-------|------------|
| A | 0 | Sr. No | Read Only |
| B | 1 | Name | Read Only |
| C | 2 | Gender | Read Only |
| D | 3 | Age | Read Only |
| E | 4 | Activity Type (Run/Ride) | Read Only |
| F | 5 | Distance (3K/5K/10K) | Read Only |
| G | 6 | Distance Ran | Read Only |
| **H** | **7** | **Bib Number** | **✏️ Updated by Bib App** |
| **I** | **8** | **T-Shirt Size** | **✏️ Updated by T-Shirt App** |
| J | 9 | Registration Date | Read Only |
| K | 10 | Status | Read Only |
| L | 11 | Phone | Read Only |
| M | 12 | Email | Read Only |
| N-AA | 13-26 | Other Master Data | Read Only |

### Logging Columns (AB-AQ) - APPEND ONLY
**Purpose:** Track all changes with full audit trail

#### Initial Bib Assignment Log (AB-AE)
| Column | Index | Field | When Written |
|--------|-------|-------|--------------|
| AB | 27 | Bib Initial DateTime | First bib assignment |
| AC | 28 | Bib Initial Venue | First bib assignment |
| AD | 29 | Bib Initial Desk | First bib assignment |
| AE | 30 | Bib Initial Volunteer | First bib assignment |

#### Bib Number Change Log (AF-AK)
| Column | Index | Field | When Written |
|--------|-------|-------|--------------|
| AF | 31 | Bib Change DateTime | When bib is edited |
| AG | 32 | Bib Change Venue | When bib is edited |
| AH | 33 | Bib Change Desk | When bib is edited |
| AI | 34 | Bib Change Volunteer | When bib is edited |
| AJ | 35 | Bib Change Old Number | When bib is edited |
| AK | 36 | Bib Change New Number | When bib is edited |

#### T-Shirt Size Change Log (AL-AQ)
| Column | Index | Field | When Written |
|--------|-------|-------|--------------|
| AL | 37 | TShirt Change DateTime | When size is changed |
| AM | 38 | TShirt Change Venue | When size is changed |
| AN | 39 | TShirt Change Desk | When size is changed |
| AO | 40 | TShirt Change Volunteer | When size is changed |
| AP | 41 | TShirt Change Old Size | When size is changed |
| AQ | 42 | TShirt Change New Size | When size is changed |

---

## 📝 Logging System

### How It Works

#### Bib Assignment Logging
```
First Assignment (Row 100):
  ↓
Updates Column H with bib number
  +
Logs to AB-AE (initial assignment)
  =
Full record: who, when, where

Edit Existing Bib (Row 100):
  ↓
Updates Column H with new bib number
  +
Logs to AF-AK (change log with old → new)
  =
Complete change history
```

#### T-Shirt Change Logging
```
Size Change (Row 200):
  ↓
Updates Column I with new size
  +
Logs to AL-AQ (change log with old → new)
  =
Full replacement audit trail
```

### Timestamp Format
All timestamps are in **IST (Asia/Kolkata)** format:
```
DD/MM/YYYY, HH:MM:SS
Example: 30/10/2025, 14:30:45
```

### Data Retention
- **All logs are permanent** - never deleted
- Master data (A-AA) is never modified (except H and I)
- Logging columns (AB-AQ) are append-only
- Complete audit trail for compliance

---

## 🔄 Workflows

### Workflow 1: Initial Bib Assignment

```
Staff Member (Desk 2, Prabhadevi, "Rajesh")
  ↓
1. Opens app.html
2. Signs in with Google
3. Configures settings (saves to localStorage)
  ↓
4. Participant arrives
5. Staff searches: "9876543210"
  ↓
6. Card appears (orange border - no bib)
7. Clicks "Assign Bib"
8. Card expands inline
  ↓
9. Enters bib: "50123"
10. Live validation: ✓ Valid
11. Presses Enter
  ↓
12. System updates:
    - Column H: 50123
    - Column AB: 30/10/2025, 14:30:45
    - Column AC: Prabhadevi
    - Column AD: 2
    - Column AE: Rajesh
  ↓
Success! Bib assigned with full audit trail
```

### Workflow 2: Edit Existing Bib

```
Staff Member (Desk 3, Andheri, "Priya")
  ↓
1. Searches participant who has bib 50123
2. Card appears (green border - has bib)
  ↓
3. Clicks "Edit Bib"
4. Card expands, pre-filled with 50123
5. Warning: "⚠️ Editing existing bib assignment"
  ↓
6. Changes to: "50456"
7. Presses Enter
  ↓
8. System updates:
    - Column H: 50456 (overwrites old)
    - Column AF: 30/10/2025, 15:45:20
    - Column AG: Andheri
    - Column AH: 3
    - Column AI: Priya
    - Column AJ: 50123 (old bib)
    - Column AK: 50456 (new bib)
  ↓
Success! Change logged with complete history
```

### Workflow 3: T-Shirt Size Replacement

```
Staff Member (T-Shirt Desk 2, Prabhadevi, "Amit")
  ↓
1. Opens tshirt-app.html
2. Signs in with Google
3. Configures T-shirt desk settings
  ↓
4. Participant requests size change
5. Staff searches: "50123" (by bib number)
  ↓
6. Card appears showing current size: M
7. Clicks "Change Size"
8. Dropdown shows: XS, S, M, L, XL, XXL, 3XL
  ↓
9. Selects: L
10. Confirms: "Change M → L?"
  ↓
11. System updates:
    - Column I: L
    - Column AL: 30/10/2025, 16:20:30
    - Column AM: Prabhadevi
    - Column AN: 2
    - Column AO: Amit
    - Column AP: M (old)
    - Column AQ: L (new)
  ↓
Success! Size changed with full audit trail
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. OAuth Session Lost on Refresh
**Problem:** User has to sign in again after refresh
**Solution:** Already fixed! Token saved to localStorage with expiry
**Expiry:** 1 hour (then needs re-authentication)

#### 2. Dashboard Not Loading
**Problem:** CSS not applied, broken layout
**Solution:** Dashboard styles added to main CSS file
**Verify:** Hard refresh (Ctrl + Shift + R)

#### 3. Columns Overwriting Master Data
**Problem:** Logging columns overwrote existing data
**Solution:** Logging moved to AB-AQ (after all master data)
**Safe:** Columns A-AA are read-only (except H, I)

#### 4. Search Not Working
**Problem:** Auto-search not triggering
**Solution:** Type at least 3 characters, 300ms debounce
**Alternative:** Press Enter after typing

#### 5. Offline Queue Not Syncing
**Problem:** Items stuck in queue
**Solution:** 
- Check connection status (top right)
- Manual sync: Click "🔄 Sync" button
- Clear stuck items: Click "🗑️ Clear Queue"

#### 6. Bib Format Validation Errors
**Problem:** "Invalid bib format" error
**Expected Ranges:**
- 3K: 30001-39999
- 5K: 50001-59999
- 10K: 100001-199999
- Ride: C001-C9999

#### 7. Settings Not Persisting
**Problem:** Settings reset after closing app
**Solution:** 
- Click "✓ Save Settings" button
- Check browser localStorage enabled
- Don't use incognito/private mode

---

## 🛡️ Security & Data Protection

### Authentication
- OAuth 2.0 with Google Sign-In
- Token refresh every hour
- Secure token storage in localStorage
- Automatic sign-out on token expiry

### Data Access
- Read access: All participant data
- Write access: Only columns H, I, and AB-AQ
- No delete permissions
- All changes logged with user identity

### Audit Trail
Every action records:
- WHO: Volunteer name from settings
- WHAT: Bib number or T-shirt size change
- WHEN: DateTime in IST with seconds
- WHERE: Venue and desk number

### Data Backup
- Google Sheets auto-saves every change
- Version history available: File → Version history
- Export backup: File → Download → Excel
- Logging columns preserve all changes

---

## 📱 Browser Compatibility

### Supported Browsers
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ Safari 14+

### Required Features
- JavaScript enabled
- Cookies enabled
- LocalStorage enabled
- Internet connection (with offline fallback)

### Device Recommendations
- **Desktop/Laptop:** Optimal (1024px+ screen)
- **Tablet:** Supported (iPad, Android tablets)
- **Mobile:** Limited (shows warning below 1024px)

---

## 🎨 UI/UX Design Principles

### Card-Based Interface
- Clean, scannable participant cards
- Color-coded states (green/orange/blue)
- Inline editing (no navigation away)
- Progressive disclosure (show what's needed)

### Visual Hierarchy
- Name: 18px Bold (most prominent)
- Details: 14px Regular
- Actions: Clear buttons on right
- T-Shirt size: Large colored badge

### Keyboard Shortcuts
- `/` - Focus search
- `Enter` - Submit form
- `Esc` - Cancel/close
- `Tab` - Navigate fields

### Performance
- Auto-search debounce: 300ms
- Batch API updates for speed
- Offline queue for poor connectivity
- LocalStorage caching

---

## 📊 Statistics & Reporting

### Real-Time Dashboard Metrics
- Total participants: 3,949
- Total assigned bibs
- Pending assignments
- Venue breakdown
- Desk performance
- Recent assignments (last 20)

### Venue Statistics
- Prabhadevi assigned count
- Andheri assigned count
- Per-desk breakdown

### Category Breakdown
- 3K Run: total and assigned
- 5K Run: total and assigned
- 10K Run: total and assigned
- Ride: total and assigned

### Export Reports
From Google Sheets:
- File → Download → Excel (.xlsx)
- Filter by venue, desk, volunteer
- Pivot tables for analysis
- Charts and graphs

---

## 🔄 Maintenance & Updates

### Regular Maintenance
- Check Google Cloud quota usage
- Monitor OAuth token expiry
- Review error logs in console
- Backup Google Sheet weekly

### Updating Configuration
Edit `config.js` for:
- Sheet ID changes
- Column mapping adjustments
- Bib number ranges
- Venue/desk options

### Code Updates
```bash
# Local development
git pull origin main
# Make changes
git add .
git commit -m "Description"
git push origin main
# Wait 2-3 min for GitHub Pages rebuild
```

### Clearing Cache
If users see old version:
1. Hard refresh: Ctrl + Shift + R
2. Clear cache: Ctrl + Shift + Delete
3. Or add version query: ?v=2

---

## 🐛 Development Notes

### Key Implementation Decisions

#### 1. OAuth Persistence
**Problem:** Users logged out on refresh
**Solution:** Token saved to localStorage with expiry
**File:** `js/sheets-api.js` - `restoreSession()`, `saveSession()`

#### 2. Column Safety
**Problem:** Risk of overwriting master data
**Solution:** Logging columns at end (AB+)
**File:** `config.js` - COLUMNS mapping

#### 3. Offline Support
**Problem:** Unreliable internet at venue
**Solution:** IndexedDB queue with auto-sync
**File:** `js/offline.js`

#### 4. UI Responsiveness
**Problem:** Previous UI was "all over the place"
**Solution:** Card-based single-column layout
**File:** `css/styles.css`, `app.html`

#### 5. Session Display
**Problem:** Users forget which desk they're on
**Solution:** Persistent session info in header
**File:** `app.html` - session-info div

### Code Structure

#### Modular Design
- `sheets-api.js` - Pure API wrapper (reusable)
- `app.js` - Bib assignment logic
- `tshirt-app.js` - T-shirt replacement logic
- `offline.js` - Queue management
- Separate apps share same backend

#### Naming Conventions
- Functions: camelCase (`assignBibNumber`)
- Constants: UPPER_SNAKE_CASE (`BIB_RANGES`)
- Files: kebab-case (`sheets-api.js`)
- CSS classes: kebab-case (`participant-card`)

#### Error Handling
- Try-catch on all API calls
- User-friendly error messages
- Console logging for debugging
- Graceful degradation

---

## 📞 Support & Contact

### Getting Help

#### During Event
1. Check this documentation first
2. Look at browser console (F12)
3. Check connection status indicator
4. Try hard refresh (Ctrl + Shift + R)
5. Contact tech support

#### Common Solutions
- Sign out and sign in again
- Clear browser cache
- Check internet connection
- Verify settings are saved
- Try different browser

### Tech Support Checklist
When reporting issues:
- [ ] Browser and version
- [ ] URL accessed
- [ ] Error message (exact text)
- [ ] Screenshot if possible
- [ ] Time of occurrence
- [ ] Participant Sr. No (if applicable)

---

## ✅ Pre-Event Checklist

### 1 Week Before
- [ ] System deployed and tested
- [ ] Column headers added (run add-headers.html)
- [ ] Staff training scheduled
- [ ] Devices prepared (tablets/laptops)
- [ ] URLs bookmarked on all devices
- [ ] Backup internet arranged
- [ ] Test OAuth on all devices

### 1 Day Before
- [ ] All staff trained on both apps
- [ ] Final end-to-end test
- [ ] Google Sheet backed up
- [ ] Devices charged + backup batteries
- [ ] Emergency contact list ready
- [ ] Print this documentation

### Event Morning
- [ ] All devices powered on and signed in
- [ ] Internet connection verified
- [ ] Test bib assignment (1 participant)
- [ ] Test T-shirt change (1 participant)
- [ ] Dashboard open for monitoring
- [ ] All desk settings configured

---

## 📈 Success Metrics

### Target Goals
- ✅ 100% participants assigned bibs
- ✅ Zero duplicate bib assignments
- ✅ < 60 seconds per participant
- ✅ Complete audit trail
- ✅ Zero data loss

### Actual Performance
- Total participants: 3,949
- Bib desks: 2 venues × 4 desks = 8 concurrent
- T-shirt desks: 2 venues × 3 desks = 6 concurrent
- Expected throughput: 300-400 per hour
- Session persistence: 1 hour per login

---

## 🎓 Training Resources

### Staff Training Guide

#### For Bib Assignment Desk
1. Open app.html
2. Sign in with Google
3. Configure settings ONCE
4. Search → Assign → Done (3 steps)
5. Average time: 30-45 seconds

#### For T-Shirt Replacement Desk
1. Open tshirt-app.html
2. Sign in with Google
3. Configure T-shirt desk settings
4. Search → Change → Done (3 steps)
5. Average time: 20-30 seconds

#### Quick Tips
- Press `/` to search quickly
- Use auto-search (no button needed)
- Cards show all info inline
- Green = has bib, Orange = needs bib
- Session info always visible at top

---

## 🔐 License & Credits

### License
MIT License - Free to use and modify

### Built With
- Google Sheets API
- Google OAuth 2.0
- Vanilla JavaScript
- Modern CSS3
- GitHub Pages

### Credits
- Developed for Unity Run & Ride event
- Designed for efficient bib management
- Built with performance and UX in mind

---

## 📝 Version History

### v2.0.0 (Current) - October 30, 2025
- ✅ Card-based UI redesign
- ✅ OAuth session persistence
- ✅ T-shirt replacement desk
- ✅ Comprehensive logging system (AB-AQ)
- ✅ Session info display
- ✅ Column headers utility
- ✅ Separate bib and T-shirt apps
- ✅ Complete documentation

### v1.0.0 - October 29, 2025
- ✅ Basic bib assignment
- ✅ Google Sheets integration
- ✅ Offline support
- ✅ Dashboard

---

## 🚀 Future Enhancements

### Potential Features
- [ ] Barcode/QR code scanner integration
- [ ] Photo upload for participant verification
- [ ] SMS notification on bib assignment
- [ ] Print bib labels directly
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Mobile app version
- [ ] Real-time collaboration notifications

### Known Limitations
- Requires internet for initial sign-in
- OAuth token expires after 1 hour
- Desktop/laptop optimized (1024px+)
- Single Google account per device
- Manual header setup required

---

## 📚 Additional Resources

### Links
- GitHub Repository: https://github.com/arvind-iy/unity-run-app
- GitHub Pages: https://arvind-iy.github.io/unity-run-app/
- Google Sheet: https://docs.google.com/spreadsheets/d/13VSXGsgQ9IZvx0pgwA9clERKqTDP7uGomoYRZNeo0bs/
- Google Cloud Console: https://console.cloud.google.com

### Documentation Files
- `README.md` - Quick start guide
- `COMPLETE_DOCUMENTATION.md` - This file
- `config.js` - Configuration reference
- Comments in code files

---

## 🎯 Summary

The Unity Run & Ride Bib Management System is a complete solution for:
- **Real-time bib assignment** with duplicate detection
- **T-shirt size management** with separate replacement desk
- **Complete audit trail** of all changes
- **Offline support** for unreliable connectivity
- **Modern UI** with card-based interface
- **Protected master data** with separate logging columns

**Master data (A-AA) is completely safe.**
**All changes logged to columns AB-AQ.**
**Two separate apps for different desk types.**
**Full OAuth session persistence.**
**Professional, intuitive user experience.**

---

**System Status:** ✅ Production Ready
**Last Updated:** October 30, 2025
**Version:** 2.0.0

