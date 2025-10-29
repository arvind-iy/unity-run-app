/**
 * Staff App Logic
 * Handles bib assignment interface
 */

let currentParticipant = null;
let venue = '';
let desk = '';
let staffName = '';
let isApiOnline = false; // Cache API connectivity status

// ═══════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', async () => {
    console.log('App initializing...');
    
    // Load saved settings
    loadSettings();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize Sheets API
    try {
        showLoading('Initializing...');
        await sheetsAPI.init();
        
        // Override sign-in callback
        sheetsAPI.onSignInChange = handleSignInChange;
        
        // Start connectivity monitoring
        startConnectivityMonitoring();
        
        // Check offline queue on load
        setTimeout(() => {
            updateQueueDisplay();
        }, 1000);
        
        hideLoading();
        
        // Don't assume online - will be checked after sign in
        updateConnectionStatus(false);
    } catch (error) {
        hideLoading();
        showError('Failed to initialize: ' + error.message);
    }
});

// ═══════════════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════════════

function loadSettings() {
    venue = localStorage.getItem('venue') || '';
    desk = localStorage.getItem('desk') || '';
    staffName = localStorage.getItem('staffName') || '';
    
    if (venue) document.getElementById('venueSelect').value = venue;
    if (desk) document.getElementById('deskSelect').value = desk;
    if (staffName) document.getElementById('staffName').value = staffName;
}

function saveSettings() {
    venue = document.getElementById('venueSelect').value;
    desk = document.getElementById('deskSelect').value;
    staffName = document.getElementById('staffName').value;
    
    localStorage.setItem('venue', venue);
    localStorage.setItem('desk', desk);
    localStorage.setItem('staffName', staffName);
}

// ═══════════════════════════════════════════════════════════
// EVENT LISTENERS
// ═══════════════════════════════════════════════════════════

function setupEventListeners() {
    // Auth buttons
    document.getElementById('signInBtn').addEventListener('click', signIn);
    document.getElementById('signOutBtn').addEventListener('click', signOut);
    
    // Settings
    document.getElementById('venueSelect').addEventListener('change', saveSettings);
    document.getElementById('deskSelect').addEventListener('change', saveSettings);
    document.getElementById('staffName').addEventListener('input', saveSettings);
    
    // Search
    document.getElementById('searchBtn').addEventListener('click', search);
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') search();
    });
    
    // Assignment
    document.getElementById('assignBtn').addEventListener('click', assignBib);
    document.getElementById('cancelBtn').addEventListener('click', cancelAssignment);
    document.getElementById('bibInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') assignBib();
    });
    
    // Sync button
    document.getElementById('syncBtn').addEventListener('click', syncOfflineQueue);
}

// ═══════════════════════════════════════════════════════════
// AUTHENTICATION
// ═══════════════════════════════════════════════════════════

async function signIn() {
    try {
        showLoading('Signing in...');
        await sheetsAPI.signIn();
    } catch (error) {
        hideLoading();
        showError('Sign in failed: ' + error.message);
    }
}

function signOut() {
    if (confirm('Are you sure you want to sign out?')) {
        sheetsAPI.signOut();
        handleSignInChange(false);
    }
}

function handleSignInChange(isSignedIn) {
    if (isSignedIn) {
        document.getElementById('authSection').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        document.getElementById('signOutBtn').style.display = 'block';
        hideLoading();
        
        // Check API connectivity after sign in
        setTimeout(async () => {
            console.log('Checking API connectivity...');
            const isOnline = await checkApiConnectivity();
            
            // Check and sync offline queue
            await updateQueueDisplay();
            const count = await offlineManager.getQueueCount();
            
            if (count > 0 && isOnline) {
                // Auto-sync if there are pending items and API is reachable
                console.log(`Found ${count} pending items, auto-syncing...`);
                await syncOfflineQueue();
            }
        }, 1500);
    } else {
        document.getElementById('authSection').style.display = 'block';
        document.getElementById('mainApp').style.display = 'none';
        document.getElementById('signOutBtn').style.display = 'none';
        updateConnectionStatus(false);
    }
}

// ═══════════════════════════════════════════════════════════
// SEARCH
// ═══════════════════════════════════════════════════════════

async function search() {
    const searchTerm = document.getElementById('searchInput').value.trim();
    
    if (searchTerm.length < 3) {
        showError('Please enter at least 3 characters');
        return;
    }
    
    try {
        showLoading('Searching...');
        const result = await sheetsAPI.searchParticipant(searchTerm);
        hideLoading();
        
        if (!result.success) {
            showError('Search failed: ' + result.error);
            return;
        }
        
        displayResults(result.results);
    } catch (error) {
        hideLoading();
        showError('Search failed: ' + error.message);
    }
}

function displayResults(results) {
    const container = document.getElementById('resultsContainer');
    const section = document.getElementById('resultsSection');
    
    if (results.length === 0) {
        container.innerHTML = '<div class="no-results">No participants found</div>';
        section.style.display = 'block';
        return;
    }
    
    container.innerHTML = results.map(p => `
        <div class="result-card" onclick="selectParticipant(${p.rowIndex})">
            <div class="result-header">
                <h4>${p.name}</h4>
                <span class="badge ${p.bibNumber ? 'badge-success' : 'badge-warning'}">
                    ${p.bibNumber || 'No Bib'}
                </span>
            </div>
            <div class="result-details">
                <div><strong>Sr. No:</strong> ${p.srNo}</div>
                <div><strong>Category:</strong> ${p.category}</div>
                <div><strong>Phone:</strong> ${p.phone}</div>
                <div><strong>Email:</strong> ${p.email}</div>
                ${p.bibNumber ? `<div><strong>Bib:</strong> ${p.bibNumber}</div>` : ''}
            </div>
            ${!p.bibNumber ? '<button class="btn btn-small">Assign Bib →</button>' : ''}
        </div>
    `).join('');
    
    section.style.display = 'block';
    
    // Store results for selection
    window.searchResults = results;
}

// ═══════════════════════════════════════════════════════════
// BIB ASSIGNMENT
// ═══════════════════════════════════════════════════════════

function selectParticipant(rowIndex) {
    currentParticipant = window.searchResults.find(p => p.rowIndex === rowIndex);
    
    if (!currentParticipant) {
        showError('Participant not found');
        return;
    }
    
    if (currentParticipant.bibNumber) {
        showError('Bib already assigned: ' + currentParticipant.bibNumber);
        return;
    }
    
    // Check if settings are complete
    if (!venue || !desk || !staffName) {
        showError('Please fill in Venue, Desk, and Your Name first');
        return;
    }
    
    // Display assignment form
    document.getElementById('participantInfo').innerHTML = `
        <div class="info-grid">
            <div><strong>Name:</strong> ${currentParticipant.name}</div>
            <div><strong>Sr. No:</strong> ${currentParticipant.srNo}</div>
            <div><strong>Category:</strong> ${currentParticipant.category}</div>
            <div><strong>Gender:</strong> ${currentParticipant.gender}</div>
            <div><strong>Age:</strong> ${currentParticipant.age}</div>
            <div><strong>T-Shirt:</strong> ${currentParticipant.tshirtSize}</div>
        </div>
    `;
    
    document.getElementById('bibHint').innerHTML = `
        Expected format: <strong>${currentParticipant.expectedBibFormat}</strong>
    `;
    
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('assignmentSection').style.display = 'block';
    document.getElementById('bibInput').value = '';
    document.getElementById('bibInput').focus();
}

function cancelAssignment() {
    currentParticipant = null;
    document.getElementById('assignmentSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
}

async function assignBib() {
    const bibNumber = document.getElementById('bibInput').value.trim();
    
    if (!bibNumber) {
        showError('Please enter a bib number');
        return;
    }
    
    if (!currentParticipant) {
        showError('No participant selected');
        return;
    }
    
    // Validate settings
    saveSettings();
    if (!venue || !desk || !staffName) {
        showError('Please fill in Venue, Desk, and Your Name');
        return;
    }
    
    try {
        showLoading('Assigning bib...');
        
        // Use cached connectivity status (checked every 30s in background)
        // Don't make an extra API call here - it's slow!
        if (!isApiOnline || !sheetsAPI.isSignedIn) {
            // Add to offline queue
            await addToOfflineQueue({
                srNo: currentParticipant.srNo,
                bibNumber: bibNumber,
                venue: venue,
                desk: desk,
                staffName: staffName,
                participant: currentParticipant
            });
            
            hideLoading();
            showSuccess('API currently unavailable. Added to offline queue. Will sync when connection restored.');
            clearAssignment();
            return;
        }
        
        // Try to assign directly to API
        console.log('Attempting direct API assignment...');
        const result = await sheetsAPI.assignBibNumber(
            currentParticipant.srNo,
            bibNumber,
            venue,
            desk,
            staffName
        );
        
        hideLoading();
        
        console.log('Assignment result:', result);
        
        if (!result.success) {
            // Show the actual error to user
            showError(`Assignment failed: ${result.error}\n\nPlease check:\n1. You're signed in\n2. Config has correct SHEET_ID\n3. Sheet exists and is accessible`);
            return;
        }
        
        showSuccess(`Bib ${bibNumber} assigned successfully!`);
        clearAssignment();
        
    } catch (error) {
        hideLoading();
        console.error('Assignment error:', error);
        showError('Unexpected error: ' + error.message);
    }
}

function clearAssignment() {
    currentParticipant = null;
    document.getElementById('assignmentSection').style.display = 'none';
    document.getElementById('searchInput').value = '';
    document.getElementById('resultsSection').style.display = 'none';
}

// ═══════════════════════════════════════════════════════════
// OFFLINE SUPPORT
// ═══════════════════════════════════════════════════════════

async function addToOfflineQueue(assignment) {
    if (typeof offlineManager !== 'undefined') {
        await offlineManager.addToQueue(assignment);
        updateQueueDisplay();
    }
}

async function syncOfflineQueue() {
    if (typeof offlineManager !== 'undefined') {
        showLoading('Syncing...');
        await offlineManager.syncQueue();
        hideLoading();
        updateQueueDisplay();
    }
}

async function updateQueueDisplay() {
    if (typeof offlineManager !== 'undefined') {
        const count = await offlineManager.getQueueCount();
        const queueDiv = document.getElementById('offlineQueue');
        const queueCount = document.getElementById('queueCount');
        
        if (count > 0) {
            queueDiv.style.display = 'block';
            queueCount.textContent = `${count} pending assignment${count > 1 ? 's' : ''}`;
        } else {
            queueDiv.style.display = 'none';
        }
    }
}

// ═══════════════════════════════════════════════════════════
// CONNECTION CHECKING
// ═══════════════════════════════════════════════════════════

async function checkApiConnectivity() {
    // Check actual API connectivity by making a lightweight API call
    try {
        if (!sheetsAPI.isSignedIn) {
            // Not signed in, assume offline for API purposes
            isApiOnline = false;
            updateConnectionStatus(false);
            return false;
        }
        
        // Try to get just 1 row to test connectivity
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: CONFIG.SHEET_ID,
            range: `${CONFIG.SHEET_NAME}!A1:A1`,
        });
        
        // If we got here, API is reachable
        isApiOnline = true;
        updateConnectionStatus(true);
        return true;
    } catch (error) {
        console.warn('API connectivity check failed:', error);
        isApiOnline = false;
        updateConnectionStatus(false);
        return false;
    }
}

function startConnectivityMonitoring() {
    // Check API connectivity every 30 seconds
    setInterval(async () => {
        if (sheetsAPI.isSignedIn) {
            await checkApiConnectivity();
        }
    }, 30000); // 30 seconds
    
    // Also check when browser thinks we're back online
    window.addEventListener('online', async () => {
        console.log('Browser detected online, checking API...');
        setTimeout(async () => {
            const isOnline = await checkApiConnectivity();
            if (isOnline) {
                await syncOfflineQueue();
            }
        }, 2000);
    });
    
    // Update status when browser detects offline
    window.addEventListener('offline', () => {
        console.log('Browser detected offline');
        updateConnectionStatus(false);
    });
}

// ═══════════════════════════════════════════════════════════
// UI HELPERS
// ═══════════════════════════════════════════════════════════

function updateConnectionStatus(isOnline) {
    const statusBadge = document.getElementById('connectionStatus');
    const statusText = document.getElementById('statusText');
    
    if (isOnline) {
        statusBadge.classList.remove('offline');
        statusBadge.classList.add('online');
        statusText.textContent = 'Online';
    } else {
        statusBadge.classList.remove('online');
        statusBadge.classList.add('offline');
        statusText.textContent = 'Offline';
    }
}

function showLoading(message = 'Loading...') {
    document.getElementById('loadingText').textContent = message;
    document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

function showError(message) {
    alert('❌ ' + message);
}

function showSuccess(message) {
    alert('✅ ' + message);
}
