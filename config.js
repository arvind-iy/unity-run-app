/**
 * Configuration for Unity Run & Ride Bib Management System
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create Google Cloud Project: https://console.cloud.google.com
 * 2. Enable Google Sheets API
 * 3. Create OAuth 2.0 credentials (Web application)
 * 4. Add authorized JavaScript origins and redirect URIs
 * 5. Copy your credentials below
 */

const CONFIG = {
    // ═══════════════════════════════════════════════════════════
    // GOOGLE SHEETS API CONFIGURATION
    // ═══════════════════════════════════════════════════════════
    
    // Your Google Cloud OAuth 2.0 Client ID
    // Get this from: https://console.cloud.google.com/apis/credentials
    CLIENT_ID: '1077063988603-950m5134tl3g7nsqbd8pm1aaeui23bis.apps.googleusercontent.com',
    
    // API Key (optional, but recommended for read operations)
    API_KEY: 'AIzaSyCMhaMw6NbUMnpL2PPqu7YBiOpNWUR5yO8',
    
    // Your Google Sheet ID (from the URL)
    // https://docs.google.com/spreadsheets/d/[THIS_IS_YOUR_SHEET_ID]/edit
    SHEET_ID: '13VSXGsgQ9IZvx0pgwA9clERKqTDP7uGomoYRZNeo0bs',
    
    // Sheet name (the tab name in your Google Sheet)
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
        // Bib tracking columns - using existing columns for now
        BIB_TIMESTAMP: 13,  // Column N (or add new columns to your sheet)
        BIB_VENUE: 14,      // Column O
        BIB_DESK: 15,       // Column P
        BIB_STAFF: 16,      // Column Q
        DUPLICATE_ALERT: 17,// Column R
        FORMAT_VALIDATION: 18 // Column S
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
    DEBUG: true
};

// Freeze config to prevent modifications
Object.freeze(CONFIG);
Object.freeze(CONFIG.BIB_RANGES);
Object.freeze(CONFIG.COLUMNS);
