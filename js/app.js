/**
 * Staff App Logic
 * Handles bib assignment interface
 */

let currentParticipant = null;
let venue = '';
let desk = '';
let staffName = '';

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
        
        // Check offline queue on load
        setTimeout(() => {
            updateQueueDisplay();
        }, 1000);
        
        hideLoading();
        updateConnectionStatus(true);
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
    
    // Online/offline detection
    window.addEventListener('online', () => {
        updateConnectionStatus(true);
        syncOfflineQueue();
    });
    window.addEventListener('offline', () => updateConnectionStatus(false));
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
        
        // Check and sync offline queue after sign in
        setTimeout(async () => {
            await updateQueueDisplay();
            const count = await offlineManager.getQueueCount();
            if (count > 0 && navigator.onLine) {
                // Auto-sync if there are pending items and we're online
                console.log(`Found ${count} pending items, auto-syncing...`);
                await syncOfflineQueue();
            }
        }, 1500);
    } else {
        document.getElementById('authSection').style.display = 'block';
        document.getElementById('mainApp').style.display = 'none';
        document.getElementById('signOutBtn').style.display = 'none';
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
        
        // Check if online
        if (!navigator.onLine) {
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
            showSuccess('Added to offline queue. Will sync when online.');
            clearAssignment();
            return;
        }
        
        // Assign online
        const result = await sheetsAPI.assignBibNumber(
            currentParticipant.srNo,
            bibNumber,
            venue,
            desk,
            staffName
        );
        
        hideLoading();
        
        if (!result.success) {
            showError(result.error);
            return;
        }
        
        showSuccess(`Bib ${bibNumber} assigned successfully!`);
        clearAssignment();
        
    } catch (error) {
        hideLoading();
        showError('Assignment failed: ' + error.message);
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
