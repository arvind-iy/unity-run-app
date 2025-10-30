# 🚀 Unity Run & Ride - Bib Management System v2.0

Modern web application for managing bib assignments at multi-venue events with smart validation for physical printed bibs.

**Live Demo**: https://arvind-iy.github.io/unity-run-app/

## ✨ Features

- ⚡ **Fast**: Direct Google Sheets API integration (~0.5s response time)
- 🔐 **Secure**: OAuth2 authentication with Google
- 📴 **Offline**: Full offline support with IndexedDB queue
- 🎯 **Real-time**: Instant duplicate detection with category-aware validation
- 📊 **Dashboard**: Live statistics with 6 category breakdown
- 🖥️ **Desktop-First**: Optimized for laptops/desktops (1024px+)
- 📱 **Mobile-Ready**: Fully functional responsive backup
- 🚀 **Modern**: Clean card-based interface with 60fps animations
- 🔄 **Smart Validation**: Handles shared physical bib stacks

---

## 📊 Bib Number Ranges

### Run Categories
| Category | Range | Format |
|----------|-------|--------|
| 3K Run | 3001-3999 | Numeric |
| 5K Run | 5001-6999 | Numeric |
| 10K Run | 10001-11500 | Numeric |

### Ride/Cycling Categories
| Category | Range | Physical Stack |
|----------|-------|----------------|
| Ride 3K | C401-C550 | Shared with 5K |
| Ride 5K | C401-C550 | Shared with 3K |
| Ride 10K | C001-C500 | Separate stack |

**⚠️ Important**: Ride 3K and 5K share physical bibs (C401-C550). Once C450 is used for 3K, it cannot be used for 5K. Ride 10K is separate - C450 can exist in both stacks.

📖 See `BIB_RANGES_UPDATE.md` for complete details.

---

## 🎯 Device Recommendations

**Primary (Recommended)**:
- 💻 Desktop/Laptop (1024px+) - Optimal experience for registration desks

**Backup (Fully Functional)**:
- 📱 Tablets (iPad, Surface) - Touch-friendly
- 📱 Mobile (iPhone, Android) - Full functionality, simplified layout

---

## 📋 Quick Start

### 1. Google Cloud Setup

1. Create project at [Google Cloud Console](https://console.cloud.google.com)
2. Enable **Google Sheets API**
3. Create **OAuth 2.0 Client ID** (Web application)
4. Add authorized origins:
   - `http://localhost:8000`
   - `https://your-username.github.io`
5. Create **API Key** and restrict to Sheets API

### 2. Configure Application

Edit `config.js`:
```javascript
CLIENT_ID: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
API_KEY: 'YOUR_API_KEY',
SHEET_ID: 'YOUR_SHEET_ID',
```

### 3. Local Testing

```bash
python -m http.server 8000
# Visit http://localhost:8000
```

### 4. Deploy to GitHub Pages

```bash
git init
git add .
git commit -m "Initial commit"
gh repo create unity-run-app --public
git push -u origin main
```

Enable Pages in repo **Settings → Pages** → Branch: main

---

## 📱 Mobile Support

**Desktop-First Design**: Optimized for registration desks, mobile is fully functional backup.

**Breakpoints**:
- Desktop (1024px+): Primary experience
- Tablet (768-1023px): 2-column, touch-enhanced
- Mobile (<768px): Single column, full-screen panels

**Mobile Features**:
- ✅ All desktop features
- ✅ 44px touch targets
- ✅ iOS zoom prevention
- ✅ 60fps performance

📖 See `MOBILE_RESPONSIVE.md` for details.

---

## 🎓 Training Staff (15 min)

1. Sign in with Google
2. Configure venue, desk, name
3. Search participant (auto-search)
4. Assign bib (validates and checks duplicates)
5. Test offline mode
6. View dashboard

---

## 📦 File Structure

```
webapp/
├── app.html           # Bib assignment
├── dashboard.html     # Admin dashboard
├── config.js          # Configuration
├── css/styles.css     # Responsive styles
└── js/
    ├── sheets-api.js  # API wrapper
    ├── app.js         # App logic
    └── offline.js     # Offline queue
```

---

## 🐛 Troubleshooting

**Sign in failed**: Check CLIENT_ID and authorized origins  
**Data load failed**: Check SHEET_ID and API_KEY  
**Mobile issues**: Hard refresh (Ctrl + Shift + R)  
**Offline not working**: Check IndexedDB in Dev Tools

---

## 💰 Cost

**$0.00** - Completely free!
- Google Sheets API: Free (500 req/100s)
- GitHub Pages: Free hosting
- No server costs

---

## 📈 Performance

- Initial load: <1s (cached)
- Search: ~0.5s
- Assign bib: ~0.3s
- 60fps animations

---

## 📖 Documentation

- `BIB_RANGES_UPDATE.md` - Physical bib handling
- `MOBILE_RESPONSIVE.md` - Mobile implementation
- `COMPLETE_DOCUMENTATION.md` - Full system docs

---

## ✅ Event Day Checklist

- [ ] Tested on desktop
- [ ] Tested on mobile (backup)
- [ ] Deployed to GitHub Pages
- [ ] OAuth configured
- [ ] Sheet shared with staff
- [ ] Staff trained
- [ ] Physical bibs organized
- [ ] Offline mode tested
- [ ] Go time! 🚀

---

**Version 2.0** | Built for Unity Run & Ride  
**Issues?** Check browser console (F12) or open GitHub issue
