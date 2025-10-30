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
        // Run categories - simple ranges, no overlap
        '3K': { min: 3001, max: 3999, prefix: '' },
        '5K': { min: 5001, max: 6999, prefix: '' },
        '10K': { min: 10001, max: 11500, prefix: '' },
        
        // Ride categories - distance-specific with overlap management
        // Physical bibs C401-C550 have "3-5K" graphic (shared stack)
        // Physical bibs C001-C500 have "10K" graphic (separate stack)
        'Ride-3K': { 
            min: 401, 
            max: 550, 
            prefix: 'C',
            sharedWith: ['Ride-5K'],  // Shares physical bibs with 5K
            physicalStack: '3K-5K stack (C401-C550 with "3-5K" graphic)'
        },
        'Ride-5K': { 
            min: 401, 
            max: 550, 
            prefix: 'C',
            sharedWith: ['Ride-3K'],  // Shares physical bibs with 3K
            physicalStack: '3K-5K stack (C401-C550 with "3-5K" graphic)'
        },
        'Ride-10K': { 
            min: 1, 
            max: 500, 
            prefix: 'C',
            sharedWith: [],  // Independent stack
            physicalStack: '10K stack (C001-C500 with "10K" graphic)'
        }
    },
    
    // ═══════════════════════════════════════════════════════════
    // COLUMN MAPPING (adjust if your sheet has different columns)
    // ═══════════════════════════════════════════════════════════
    
    COLUMNS: {
        // ═══════════════════════════════════════════════════════════
        // MASTER DATA COLUMNS (A-M) - DO NOT MODIFY!
        // These contain the original registration data
        // ═══════════════════════════════════════════════════════════
        SR_NO: 0,           // Column A (0-indexed)
        NAME: 1,            // Column B
        GENDER: 2,          // Column C
        AGE: 3,             // Column D
        ACTIVITY_TYPE: 4,   // Column E (Run/Ride)
        DISTANCE: 5,        // Column F (3K/5K/10K)
        DISTANCE_RAN: 6,    // Column G
        BIB_NUMBER: 7,      // Column H - Main bib number field (we update this)
        TSHIRT_SIZE: 8,     // Column I - Main t-shirt size field (we update this)
        REG_DATE: 9,        // Column J
        STATUS: 10,         // Column K
        PHONE: 11,          // Column L
        EMAIL: 12,          // Column M
        
        // NOTE: Columns N-AA (13-26) contain OTHER master data - DO NOT TOUCH!
        // Master data ends at Column AA (index 26)
        // Logging columns start at Column AB (index 27) onwards
        
        // ═══════════════════════════════════════════════════════════
        // LOGGING COLUMNS (AB onwards) - SAFE ZONE, NO MASTER DATA
        // ═══════════════════════════════════════════════════════════
        
        // Initial Bib Registration Log
        BIB_INIT_DATETIME: 27,   // Column AB (27) - Date & time of initial bib assignment
        BIB_INIT_VENUE: 28,      // Column AC (28) - Venue where bib was first assigned
        BIB_INIT_DESK: 29,       // Column AD (29) - Desk number for initial assignment
        BIB_INIT_VOLUNTEER: 30,  // Column AE (30) - Volunteer who assigned initially
        
        // Bib Number Change Log (for edits/replacements)
        BIB_CHANGE_DATETIME: 31, // Column AF (31) - Date & time of bib change
        BIB_CHANGE_VENUE: 32,    // Column AG (32) - Venue where bib was changed
        BIB_CHANGE_DESK: 33,     // Column AH (33) - Desk number for change
        BIB_CHANGE_VOLUNTEER: 34,// Column AI (34) - Volunteer who made the change
        BIB_CHANGE_OLD: 35,      // Column AJ (35) - Old bib number (before change)
        BIB_CHANGE_NEW: 36,      // Column AK (36) - New bib number (after change)
        
        // T-Shirt Size Change Log
        TSHIRT_CHANGE_DATETIME: 37, // Column AL (37) - Date & time of t-shirt change
        TSHIRT_CHANGE_VENUE: 38,    // Column AM (38) - Venue where t-shirt was changed
        TSHIRT_CHANGE_DESK: 39,     // Column AN (39) - Desk number for t-shirt change
        TSHIRT_CHANGE_VOLUNTEER: 40,// Column AO (40) - Volunteer who changed t-shirt
        TSHIRT_CHANGE_OLD: 41,      // Column AP (41) - Old t-shirt size
        TSHIRT_CHANGE_NEW: 42       // Column AQ (42) - New t-shirt size
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
