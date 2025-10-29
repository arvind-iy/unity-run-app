/**
 * Configuration Template for Unity Run & Ride Bib Management System
 * 
 * SETUP INSTRUCTIONS:
 * 
 * 1. Copy this file to 'config.js':
 *    cp config.template.js config.js
 * 
 * 2. Edit config.js and replace the placeholder values:
 *    - YOUR_CLIENT_ID_HERE
 *    - YOUR_API_KEY_HERE
 *    - YOUR_SHEET_ID_HERE
 * 
 * 3. Get your credentials from:
 *    - Client ID: Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client IDs
 *    - API Key: Same page → API Keys
 *    - Sheet ID: Your Google Sheet URL (the long ID between /d/ and /edit)
 * 
 * 4. IMPORTANT: Restrict your API Key!
 *    - Google Cloud Console → Credentials → Your API Key → Edit
 *    - API restrictions: Check "Google Sheets API" ONLY
 *    - Application restrictions: HTTP referrers:
 *      - https://YOUR_USERNAME.github.io/*
 *      - http://localhost:8000/*
 * 
 * 5. Never commit config.js to git!
 *    - It's in .gitignore
 *    - Only commit config.template.js
 */

const CONFIG = {
    // ═══════════════════════════════════════════════════════════
    // GOOGLE SHEETS API CONFIGURATION
    // ═══════════════════════════════════════════════════════════
    
    // Your Google Cloud OAuth 2.0 Client ID
    // Example: '123456789-abc123def456.apps.googleusercontent.com'
    CLIENT_ID: 'YOUR_CLIENT_ID_HERE.apps.googleusercontent.com',
    
    // API Key (optional, but recommended for read operations)
    // Example: 'AIzaSyAbc123def456...'
    API_KEY: 'YOUR_API_KEY_HERE',
    
    // Your Google Sheet ID (from the URL)
    // https://docs.google.com/spreadsheets/d/[THIS_IS_YOUR_SHEET_ID]/edit
    // Example: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'
    SHEET_ID: 'YOUR_SHEET_ID_HERE',
    
    // Sheet name (the tab name in your Google Sheet)
    // IMPORTANT: This must match your actual sheet tab name exactly!
    SHEET_NAME: 'Registration_9.30 am _26th Oct',
    
    // OAuth scopes
    SCOPES: 'https://www.googleapis.com/auth/spreadsheets',
    
    // Discovery docs
    DISCOVERY_DOCS: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
    
    // ═══════════════════════════════════════════════════════════
    // BIB NUMBER RANGES
    // ═══════════════════════════════════════════════════════════
    
    BIB_RANGES: {
        '3K': { min: 30001, max: 39999, prefix: '' },
        '5K': { min: 50001, max: 59999, prefix: '' },
        '10K': { min: 100001, max: 199999, prefix: '' },
        'Ride': { min: 1, max: 9999, prefix: 'C' }
    },
    
    // ═══════════════════════════════════════════════════════════
    // COLUMN MAPPING (adjust if your sheet has different columns)
    // ═══════════════════════════════════════════════════════════
    
    COLUMNS: {
        SR_NO: 0,           // Column A (0-indexed)
        NAME: 1,            // Column B
        GENDER: 2,          // Column C
        AGE: 3,             // Column D
        ACTIVITY_TYPE: 4,   // Column E (Run/Ride)
        DISTANCE: 5,        // Column F (3K/5K/10K)
        DISTANCE_RAN: 6,    // Column G
        BIB_NUMBER: 7,      // Column H
        TSHIRT_SIZE: 8,     // Column I
        REG_DATE: 9,        // Column J
        STATUS: 10,         // Column K
        PHONE: 11,          // Column L
        EMAIL: 12,          // Column M
        // New columns for bib tracking
        BIB_TIMESTAMP: 26,  // Column AA
        BIB_VENUE: 27,      // Column AB
        BIB_DESK: 28,       // Column AC
        BIB_STAFF: 29,      // Column AD
        DUPLICATE_ALERT: 30,// Column AE
        FORMAT_VALIDATION: 31 // Column AF
    },
    
    // ═══════════════════════════════════════════════════════════
    // APP SETTINGS
    // ═══════════════════════════════════════════════════════════
    
    VERSION: '2.0.0',
    
    // Dashboard refresh interval (milliseconds)
    DASHBOARD_REFRESH_INTERVAL: 30000, // 30 seconds
    
    // Offline sync retry interval (milliseconds)
    SYNC_RETRY_INTERVAL: 5000, // 5 seconds
    
    // Maximum offline queue size
    MAX_OFFLINE_QUEUE: 100,
    
    // Enable debug logging
    DEBUG: false
};

// Freeze config to prevent modifications
Object.freeze(CONFIG);
Object.freeze(CONFIG.BIB_RANGES);
Object.freeze(CONFIG.COLUMNS);
