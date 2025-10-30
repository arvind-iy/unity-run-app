/**
 * Google Sheets API Wrapper
 * Handles all interactions with Google Sheets
 */

class SheetsAPI {
    constructor() {
        this.isSignedIn = false;
        this.userEmail = null;
        this.tokenClient = null;
        this.accessToken = null;
        this.tokenExpiry = null;
        
        // Try to restore session from localStorage
        this.restoreSession();
    }
    
    /**
     * Restore session from localStorage
     */
    restoreSession() {
        const savedToken = localStorage.getItem('gapi_token');
        const savedExpiry = localStorage.getItem('gapi_token_expiry');
        
        if (savedToken && savedExpiry) {
            const expiryTime = parseInt(savedExpiry);
            if (Date.now() < expiryTime) {
                this.accessToken = savedToken;
                this.tokenExpiry = expiryTime;
                console.log('✓ Restored valid session from localStorage');
            } else {
                console.log('Session expired, clearing...');
                this.clearSession();
            }
        }
    }
    
    /**
     * Save session to localStorage
     */
    saveSession(token, expiresIn = 3600) {
        this.accessToken = token;
        this.tokenExpiry = Date.now() + (expiresIn * 1000);
        localStorage.setItem('gapi_token', token);
        localStorage.setItem('gapi_token_expiry', this.tokenExpiry.toString());
        console.log('✓ Session saved to localStorage');
    }
    
    /**
     * Clear session from localStorage
     */
    clearSession() {
        this.accessToken = null;
        this.tokenExpiry = null;
        localStorage.removeItem('gapi_token');
        localStorage.removeItem('gapi_token_expiry');
        console.log('✓ Session cleared');
    }

    /**
     * Initialize Google API client
     */
    async init() {
        try {
            // Load GAPI client
            await new Promise((resolve, reject) => {
                gapi.load('client', { callback: resolve, onerror: reject });
            });

            // Initialize GAPI client
            await gapi.client.init({
                apiKey: CONFIG.API_KEY,
                discoveryDocs: CONFIG.DISCOVERY_DOCS,
            });

            // Initialize Google Identity Services
            this.tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: CONFIG.CLIENT_ID,
                scope: CONFIG.SCOPES,
                callback: (response) => {
                    if (response.error !== undefined) {
                        throw response;
                    }
                    // Save token to localStorage with expiry
                    const expiresIn = response.expires_in || 3600;
                    this.saveSession(response.access_token, expiresIn);
                    
                    // Set access token for gapi
                    gapi.client.setToken({ access_token: response.access_token });
                    
                    this.isSignedIn = true;
                    this.onSignInChange(true);
                },
            });

            // If we restored a valid session, set it and trigger sign-in
            if (this.accessToken) {
                gapi.client.setToken({ access_token: this.accessToken });
                this.isSignedIn = true;
                setTimeout(() => {
                    this.onSignInChange(true);
                }, 100);
            }

            console.log('✓ Sheets API initialized');
            return true;
        } catch (error) {
            console.error('Failed to initialize Sheets API:', error);
            throw error;
        }
    }

    /**
     * Sign in to Google
     */
    async signIn() {
        try {
            // Check if already have valid token
            if (this.accessToken && !this.isTokenExpired()) {
                this.isSignedIn = true;
                this.onSignInChange(true);
                return true;
            }

            // Request new token
            this.tokenClient.requestAccessToken();
            return true;
        } catch (error) {
            console.error('Sign in failed:', error);
            throw error;
        }
    }

    /**
     * Sign out
     */
    signOut() {
        if (this.accessToken) {
            google.accounts.oauth2.revoke(this.accessToken);
        }
        // Clear session from localStorage
        this.clearSession();
        
        // Clear gapi token
        if (gapi.client) {
            gapi.client.setToken(null);
        }
        
        this.isSignedIn = false;
        this.userEmail = null;
        this.onSignInChange(false);
    }

    /**
     * Check if token is expired
     */
    isTokenExpired() {
        if (!this.tokenExpiry) return true;
        return Date.now() >= this.tokenExpiry;
    }

    /**
     * Callback when sign-in status changes
     */
    onSignInChange(isSignedIn) {
        // Override this in your app
        console.log('Sign-in status changed:', isSignedIn);
    }

    /**
     * Get all rows from sheet
     */
    async getAllRows() {
        try {
            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: CONFIG.SHEET_ID,
                range: `${CONFIG.SHEET_NAME}!A:AF`,
            });

            return response.result.values || [];
        } catch (error) {
            console.error('Failed to get rows:', error);
            throw error;
        }
    }

    /**
     * Search for participants
     */
    async searchParticipant(searchTerm) {
        try {
            const rows = await this.getAllRows();
            const searchLower = searchTerm.toLowerCase().trim();
            const results = [];

            // Skip header row
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                const phone = String(row[CONFIG.COLUMNS.PHONE] || '').toLowerCase();
                const email = String(row[CONFIG.COLUMNS.EMAIL] || '').toLowerCase();
                const name = String(row[CONFIG.COLUMNS.NAME] || '').toLowerCase();
                const srNo = String(row[CONFIG.COLUMNS.SR_NO] || '');

                if (phone.includes(searchLower) || 
                    email.includes(searchLower) || 
                    name.includes(searchLower) ||
                    srNo === searchLower) {
                    
                    const activityType = row[CONFIG.COLUMNS.ACTIVITY_TYPE] || '';
                    const distance = row[CONFIG.COLUMNS.DISTANCE] || '';
                    const category = activityType === 'Ride' ? 'Ride' : distance;

                    results.push({
                        rowIndex: i + 1, // 1-based for Google Sheets
                        srNo: row[CONFIG.COLUMNS.SR_NO],
                        name: row[CONFIG.COLUMNS.NAME],
                        gender: row[CONFIG.COLUMNS.GENDER],
                        age: row[CONFIG.COLUMNS.AGE],
                        activityType: activityType,
                        distance: distance,
                        category: category,
                        bibNumber: row[CONFIG.COLUMNS.BIB_NUMBER] || '',
                        tshirtSize: row[CONFIG.COLUMNS.TSHIRT_SIZE],
                        phone: row[CONFIG.COLUMNS.PHONE],
                        email: row[CONFIG.COLUMNS.EMAIL],
                        status: row[CONFIG.COLUMNS.STATUS],
                        expectedBibFormat: this.getExpectedBibFormat(category)
                    });
                }
            }

            return { success: true, results: results };
        } catch (error) {
            console.error('Search failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get expected bib format for category
     */
    getExpectedBibFormat(category) {
        const range = CONFIG.BIB_RANGES[category];
        if (!range) return 'Unknown';
        
        if (range.prefix) {
            return `${range.prefix}${String(range.min).padStart(3, '0')}-${range.prefix}${range.max}`;
        }
        return `${range.min}-${range.max}`;
    }

    /**
     * Validate bib format
     */
    validateBibFormat(bibNumber, category) {
        const bibStr = String(bibNumber).trim().toUpperCase();
        const range = CONFIG.BIB_RANGES[category];
        
        if (!range) return { valid: false, error: `Unknown category: ${category}` };
        
        if (category === 'Ride') {
            if (!bibStr.startsWith('C')) {
                return { valid: false, error: `Ride bibs must start with 'C' (e.g., C001)\nExpected: C001-C9999` };
            }
            const numPart = bibStr.substring(1);
            if (!/^\d+$/.test(numPart)) {
                return { valid: false, error: `Invalid format. Ride bibs: C001-C9999` };
            }
            const bibNum = parseInt(numPart);
            if (bibNum < range.min || bibNum > range.max) {
                return { valid: false, error: `Ride bib out of range.\nExpected: C001-C9999` };
            }
            return { valid: true };
        }
        
        if (!/^\d+$/.test(bibStr)) {
            return { valid: false, error: `${category} bibs must be numeric.\nExpected: ${range.min}-${range.max}` };
        }
        
        const bibNum = parseInt(bibStr);
        if (bibNum < range.min || bibNum > range.max) {
            return { valid: false, error: `Bib ${bibNumber} doesn't match ${category}.\nExpected: ${range.min}-${range.max}` };
        }
        
        return { valid: true };
    }

    /**
     * Check for duplicate bib
     */
    async checkDuplicateBib(bibNumber, excludeRowIndex = null) {
        try {
            const rows = await this.getAllRows();
            const bibStr = String(bibNumber).trim().toUpperCase();

            for (let i = 1; i < rows.length; i++) {
                const rowIndex = i + 1;
                if (excludeRowIndex && rowIndex === excludeRowIndex) continue;

                const existingBib = String(rows[i][CONFIG.COLUMNS.BIB_NUMBER] || '').trim().toUpperCase();
                
                if (existingBib === bibStr) {
                    return {
                        isDuplicate: true,
                        row: rowIndex,
                        name: rows[i][CONFIG.COLUMNS.NAME],
                        venue: rows[i][CONFIG.COLUMNS.BIB_VENUE] || 'Unknown',
                        desk: rows[i][CONFIG.COLUMNS.BIB_DESK] || 'Unknown'
                    };
                }
            }

            return { isDuplicate: false };
        } catch (error) {
            console.error('Duplicate check failed:', error);
            throw error;
        }
    }

    /**
     * Assign bib number
     */
    async assignBibNumber(srNo, bibNumber, venue, deskNumber, staffName) {
        try {
            // Find participant row
            const rows = await this.getAllRows();
            let targetRowIndex = null;

            for (let i = 1; i < rows.length; i++) {
                if (rows[i][CONFIG.COLUMNS.SR_NO] == srNo) {
                    targetRowIndex = i + 1; // 1-based
                    break;
                }
            }

            if (!targetRowIndex) {
                return { success: false, error: 'Participant not found' };
            }

            const row = rows[targetRowIndex - 1];
            
            // Allow editing - log if we're overwriting
            const existingBib = row[CONFIG.COLUMNS.BIB_NUMBER];
            if (existingBib) {
                console.log(`Editing bib assignment: ${existingBib} → ${bibNumber}`);
            }

            // Get category
            const activityType = row[CONFIG.COLUMNS.ACTIVITY_TYPE];
            const distance = row[CONFIG.COLUMNS.DISTANCE];
            const category = activityType === 'Ride' ? 'Ride' : distance;

            // Validate format
            const formatValidation = this.validateBibFormat(bibNumber, category);
            if (!formatValidation.valid) {
                return { success: false, error: formatValidation.error };
            }

            // Check duplicates (exclude current row if editing)
            const duplicateCheck = await this.checkDuplicateBib(bibNumber, targetRowIndex);
            if (duplicateCheck.isDuplicate) {
                return { 
                    success: false, 
                    error: `Bib ${bibNumber} already assigned to ${duplicateCheck.name} (Row ${duplicateCheck.row})`
                };
            }

            // Prepare timestamp in readable format
            const now = new Date();
            const timestamp = now.toLocaleString('en-IN', { 
                timeZone: 'Asia/Kolkata',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
            
            // Helper to convert column index to letter
            const getColumnLetter = (index) => {
                let letter = '';
                while (index >= 0) {
                    letter = String.fromCharCode(65 + (index % 26)) + letter;
                    index = Math.floor(index / 26) - 1;
                }
                return letter;
            };
            
            // Prepare updates array
            const updates = [
                // Always update the main bib number field
                {
                    range: `${CONFIG.SHEET_NAME}!${getColumnLetter(CONFIG.COLUMNS.BIB_NUMBER)}${targetRowIndex}`,
                    values: [[bibNumber]]
                }
            ];
            
            // Determine if this is initial assignment or a change
            const isInitialAssignment = !existingBib;
            
            if (isInitialAssignment) {
                // Log initial bib registration (columns N-Q)
                updates.push(
                    {
                        range: `${CONFIG.SHEET_NAME}!${getColumnLetter(CONFIG.COLUMNS.BIB_INIT_DATETIME)}${targetRowIndex}`,
                        values: [[timestamp]]
                    },
                    {
                        range: `${CONFIG.SHEET_NAME}!${getColumnLetter(CONFIG.COLUMNS.BIB_INIT_VENUE)}${targetRowIndex}`,
                        values: [[venue]]
                    },
                    {
                        range: `${CONFIG.SHEET_NAME}!${getColumnLetter(CONFIG.COLUMNS.BIB_INIT_DESK)}${targetRowIndex}`,
                        values: [[deskNumber]]
                    },
                    {
                        range: `${CONFIG.SHEET_NAME}!${getColumnLetter(CONFIG.COLUMNS.BIB_INIT_VOLUNTEER)}${targetRowIndex}`,
                        values: [[staffName]]
                    }
                );
                console.log(`Initial bib assignment: ${bibNumber} at ${venue} Desk ${deskNumber} by ${staffName}`);
            } else {
                // Log bib number change (columns R-W)
                updates.push(
                    {
                        range: `${CONFIG.SHEET_NAME}!${getColumnLetter(CONFIG.COLUMNS.BIB_CHANGE_DATETIME)}${targetRowIndex}`,
                        values: [[timestamp]]
                    },
                    {
                        range: `${CONFIG.SHEET_NAME}!${getColumnLetter(CONFIG.COLUMNS.BIB_CHANGE_VENUE)}${targetRowIndex}`,
                        values: [[venue]]
                    },
                    {
                        range: `${CONFIG.SHEET_NAME}!${getColumnLetter(CONFIG.COLUMNS.BIB_CHANGE_DESK)}${targetRowIndex}`,
                        values: [[deskNumber]]
                    },
                    {
                        range: `${CONFIG.SHEET_NAME}!${getColumnLetter(CONFIG.COLUMNS.BIB_CHANGE_VOLUNTEER)}${targetRowIndex}`,
                        values: [[staffName]]
                    },
                    {
                        range: `${CONFIG.SHEET_NAME}!${getColumnLetter(CONFIG.COLUMNS.BIB_CHANGE_OLD)}${targetRowIndex}`,
                        values: [[existingBib]]
                    },
                    {
                        range: `${CONFIG.SHEET_NAME}!${getColumnLetter(CONFIG.COLUMNS.BIB_CHANGE_NEW)}${targetRowIndex}`,
                        values: [[bibNumber]]
                    }
                );
                console.log(`Bib changed: ${existingBib} → ${bibNumber} at ${venue} Desk ${deskNumber} by ${staffName}`);
            }
            
            console.log(`Updating ${updates.length} columns with logging...`);

            // Batch update
            await gapi.client.sheets.spreadsheets.values.batchUpdate({
                spreadsheetId: CONFIG.SHEET_ID,
                resource: {
                    valueInputOption: 'RAW',
                    data: updates
                }
            });

            return { 
                success: true, 
                message: `Bib ${bibNumber} assigned successfully!`,
                timestamp: timestamp
            };

        } catch (error) {
            console.error('Assign bib failed:', error);
            console.error('Error details:', error.result ? error.result.error : error);
            
            // Extract meaningful error message
            let errorMessage = 'Unknown error';
            if (error.result && error.result.error) {
                errorMessage = error.result.error.message || error.result.error.code || 'API Error';
            } else if (error.message) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }
            
            return { success: false, error: errorMessage };
        }
    }

    /**
     * Change T-shirt size
     */
    async changeTShirtSize(srNo, oldSize, newSize, venue, deskNumber, staffName) {
        try {
            // Find participant row
            const rows = await this.getAllRows();
            let targetRowIndex = null;

            for (let i = 1; i < rows.length; i++) {
                if (rows[i][CONFIG.COLUMNS.SR_NO] == srNo) {
                    targetRowIndex = i + 1; // 1-based
                    break;
                }
            }

            if (!targetRowIndex) {
                return { success: false, error: 'Participant not found' };
            }

            // Prepare timestamp in IST
            const now = new Date();
            const timestamp = now.toLocaleString('en-IN', { 
                timeZone: 'Asia/Kolkata',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
            
            // Helper to convert column index to letter
            const getColumnLetter = (index) => {
                let letter = '';
                while (index >= 0) {
                    letter = String.fromCharCode(65 + (index % 26)) + letter;
                    index = Math.floor(index / 26) - 1;
                }
                return letter;
            };
            
            // Prepare updates
            const updates = [
                // Update main T-shirt size field
                {
                    range: `${CONFIG.SHEET_NAME}!${getColumnLetter(CONFIG.COLUMNS.TSHIRT_SIZE)}${targetRowIndex}`,
                    values: [[newSize]]
                },
                // Log T-shirt change (columns AL-AQ)
                {
                    range: `${CONFIG.SHEET_NAME}!${getColumnLetter(CONFIG.COLUMNS.TSHIRT_CHANGE_DATETIME)}${targetRowIndex}`,
                    values: [[timestamp]]
                },
                {
                    range: `${CONFIG.SHEET_NAME}!${getColumnLetter(CONFIG.COLUMNS.TSHIRT_CHANGE_VENUE)}${targetRowIndex}`,
                    values: [[venue]]
                },
                {
                    range: `${CONFIG.SHEET_NAME}!${getColumnLetter(CONFIG.COLUMNS.TSHIRT_CHANGE_DESK)}${targetRowIndex}`,
                    values: [[deskNumber]]
                },
                {
                    range: `${CONFIG.SHEET_NAME}!${getColumnLetter(CONFIG.COLUMNS.TSHIRT_CHANGE_VOLUNTEER)}${targetRowIndex}`,
                    values: [[staffName]]
                },
                {
                    range: `${CONFIG.SHEET_NAME}!${getColumnLetter(CONFIG.COLUMNS.TSHIRT_CHANGE_OLD)}${targetRowIndex}`,
                    values: [[oldSize]]
                },
                {
                    range: `${CONFIG.SHEET_NAME}!${getColumnLetter(CONFIG.COLUMNS.TSHIRT_CHANGE_NEW)}${targetRowIndex}`,
                    values: [[newSize]]
                }
            ];
            
            console.log(`T-shirt changed: ${oldSize} → ${newSize} at ${venue} Desk ${deskNumber} by ${staffName}`);
            console.log(`Updating ${updates.length} columns with T-shirt change logging...`);

            // Batch update
            await gapi.client.sheets.spreadsheets.values.batchUpdate({
                spreadsheetId: CONFIG.SHEET_ID,
                resource: {
                    valueInputOption: 'RAW',
                    data: updates
                }
            });

            return { 
                success: true, 
                message: `T-shirt size changed from ${oldSize} to ${newSize}`,
                timestamp: timestamp
            };

        } catch (error) {
            console.error('Change T-shirt failed:', error);
            console.error('Error details:', error.result ? error.result.error : error);
            
            let errorMessage = 'Unknown error';
            if (error.result && error.result.error) {
                errorMessage = error.result.error.message || error.result.error.code || 'API Error';
            } else if (error.message) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }
            
            return { success: false, error: errorMessage };
        }
    }

    /**
     * Get dashboard statistics
     */
    async getDashboardStats() {
        try {
            const rows = await this.getAllRows();
            
            const stats = {
                totalRegistrants: rows.length - 1, // Exclude header
                totalAssigned: 0,
                totalPending: 0,
                venueStats: {},
                deskStats: {},
                categoryStats: {
                    '3K': { total: 0, assigned: 0 },
                    '5K': { total: 0, assigned: 0 },
                    '10K': { total: 0, assigned: 0 },
                    'Ride': { total: 0, assigned: 0 }
                },
                recentAssignments: []
            };

            // Process rows (skip header)
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                const bibNumber = row[CONFIG.COLUMNS.BIB_NUMBER];
                const activityType = row[CONFIG.COLUMNS.ACTIVITY_TYPE];
                const distance = row[CONFIG.COLUMNS.DISTANCE];
                const category = activityType === 'Ride' ? 'Ride' : distance;

                // Count by category
                if (stats.categoryStats[category]) {
                    stats.categoryStats[category].total++;
                    if (bibNumber) {
                        stats.categoryStats[category].assigned++;
                    }
                }

                // Count assigned vs pending
                if (bibNumber) {
                    stats.totalAssigned++;

                    // Use initial assignment venue/desk for stats (columns O, P)
                    const venue = row[CONFIG.COLUMNS.BIB_INIT_VENUE];
                    const desk = row[CONFIG.COLUMNS.BIB_INIT_DESK];
                    const timestamp = row[CONFIG.COLUMNS.BIB_INIT_DATETIME];

                    // Venue stats
                    if (venue) {
                        stats.venueStats[venue] = (stats.venueStats[venue] || 0) + 1;
                    }

                    // Desk stats
                    if (venue && desk) {
                        const deskKey = `${venue} - Desk ${desk}`;
                        stats.deskStats[deskKey] = (stats.deskStats[deskKey] || 0) + 1;
                    }

                    // Recent assignments
                    if (stats.recentAssignments.length < 20) {
                        stats.recentAssignments.push({
                            name: row[CONFIG.COLUMNS.NAME],
                            bibNumber: bibNumber,
                            venue: venue,
                            desk: desk,
                            timestamp: timestamp
                        });
                    }
                } else {
                    stats.totalPending++;
                }
            }

            // Reverse recent assignments (newest first)
            stats.recentAssignments.reverse();

            return { success: true, stats: stats };
        } catch (error) {
            console.error('Get stats failed:', error);
            return { success: false, error: error.message };
        }
    }
}

// Create global instance
const sheetsAPI = new SheetsAPI();
