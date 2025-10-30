/**
 * Card-Based UI Logic - Unity Run & Ride
 * Clean, modern, desktop-optimized bib assignment interface
 */

let currentParticipant = null;
let venue = '';
let desk = '';
let staffName = '';
let isApiOnline = false;
let searchDebounce = null;
let expandedCardId = null;

// ═══════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Card-based UI initializing...');
    
    // Load saved settings
    loadSettings();
    
    // Setup event listeners
    setupEventListeners();
    
    // Setup keyboard shortcuts
    setupKeyboardShortcuts();
    
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
        updateConnectionStatus(false);
    } catch (error) {
        hideLoading();
        showError('Failed to initialize: ' + error.message);
    }
});

// ═══════════════════════════════════════════════════════════
// SETTINGS MANAGEMENT
// ═══════════════════════════════════════════════════════════

function loadSettings() {
    venue = localStorage.getItem('venue') || '';
    desk = localStorage.getItem('desk') || '';
    staffName = localStorage.getItem('staffName') || '';
    
    // Pre-fill settings panel if values exist
    if (venue) {
        const venueRadio = document.querySelector(`input[name="venue"][value="${venue}"]`);
        if (venueRadio) venueRadio.checked = true;
    }
    if (desk) {
        const deskBtn = document.querySelector(`.desk-btn[data-desk="${desk}"]`);
        if (deskBtn) deskBtn.classList.add('active');
    }
    if (staffName) {
        document.getElementById('staffNameInput').value = staffName;
    }
    
    // Update session info display
    updateSessionDisplay();
}

function saveSettings() {
    // Get selected venue
    const venueRadio = document.querySelector('input[name="venue"]:checked');
    venue = venueRadio ? venueRadio.value : '';
    
    // Get selected desk
    const activeDeskBtn = document.querySelector('.desk-btn.active');
    desk = activeDeskBtn ? activeDeskBtn.dataset.desk : '';
    
    // Get staff name
    staffName = document.getElementById('staffNameInput').value.trim();
    
    // Save to localStorage
    localStorage.setItem('venue', venue);
    localStorage.setItem('desk', desk);
    localStorage.setItem('staffName', staffName);
    
    // Update session info display
    updateSessionDisplay();
    
    console.log('Settings saved:', { venue, desk, staffName });
    return { venue, desk, staffName };
}

function updateSessionDisplay() {
    const sessionInfo = document.getElementById('sessionInfo');
    const sessionVenue = document.getElementById('sessionVenue');
    const sessionDesk = document.getElementById('sessionDesk');
    const sessionVolunteer = document.getElementById('sessionVolunteer');
    
    if (venue && desk && staffName) {
        sessionVenue.textContent = venue;
        sessionDesk.textContent = desk;
        sessionVolunteer.textContent = staffName;
        sessionInfo.style.display = 'flex';
    } else {
        sessionInfo.style.display = 'none';
    }
}

// ═══════════════════════════════════════════════════════════
// EVENT LISTENERS
// ═══════════════════════════════════════════════════════════

function setupEventListeners() {
    // Auth buttons
    document.getElementById('signInBtn').addEventListener('click', signIn);
    document.getElementById('signOutBtn').addEventListener('click', signOut);
    
    // Search with auto-search (debounced)
    document.getElementById('searchInput').addEventListener('input', handleSearchInput);
    document.getElementById('clearSearchBtn').addEventListener('click', clearSearch);
    
    // Settings panel
    document.getElementById('settingsBtn').addEventListener('click', openSettings);
    document.getElementById('closeSettingsBtn').addEventListener('click', closeSettings);
    document.querySelector('.settings-overlay').addEventListener('click', closeSettings);
    
    // Settings - Desk buttons
    document.querySelectorAll('.desk-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.desk-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        });
    });
    
    // Save settings button
    document.getElementById('saveSettingsBtn').addEventListener('click', () => {
        const settings = saveSettings();
        if (settings.venue && settings.desk && settings.staffName) {
            showSuccess('Settings saved successfully!');
            closeSettings();
        } else {
            showError('Please fill in all settings');
        }
    });
    
    // Dashboard button
    document.getElementById('dashboardBtn').addEventListener('click', () => {
        window.location.href = 'dashboard.html';
    });
    
    // View stats button
    document.getElementById('viewStatsBtn').addEventListener('click', () => {
        closeSettings();
        window.location.href = 'dashboard.html';
    });
    
    // Offline queue
    document.getElementById('syncBtn').addEventListener('click', syncOfflineQueue);
    document.getElementById('clearQueueBtn').addEventListener('click', clearOfflineQueue);
}

// ═══════════════════════════════════════════════════════════
// KEYBOARD SHORTCUTS
// ═══════════════════════════════════════════════════════════

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // / to focus search
        if (e.key === '/' && !isInputFocused()) {
            e.preventDefault();
            document.getElementById('searchInput').focus();
        }
        
        // Escape to close expanded card or settings
        if (e.key === 'Escape') {
            if (document.getElementById('settingsPanel').classList.contains('open')) {
                closeSettings();
            } else if (expandedCardId) {
                collapseCard(expandedCardId);
            }
        }
    });
}

function isInputFocused() {
    const active = document.activeElement;
    return active.tagName === 'INPUT' || active.tagName === 'TEXTAREA';
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
        document.getElementById('dashboardBtn').style.display = 'block';
        document.getElementById('settingsBtn').style.display = 'block';
        hideLoading();
        
        // Check if settings are complete, if not show settings panel
        if (!venue || !desk || !staffName) {
            setTimeout(() => {
                openSettings();
                showError('Please configure your session settings first');
            }, 500);
        }
        
        // Check API connectivity after sign in
        setTimeout(async () => {
            console.log('Checking API connectivity...');
            const isOnline = await checkApiConnectivity();
            
            // Check and sync offline queue
            await updateQueueDisplay();
            const count = await offlineManager.getQueueCount();
            
            if (count > 0 && isOnline) {
                console.log(`Found ${count} pending items, auto-syncing...`);
                await syncOfflineQueue();
            }
        }, 1500);
    } else {
        document.getElementById('authSection').style.display = 'block';
        document.getElementById('mainApp').style.display = 'none';
        document.getElementById('signOutBtn').style.display = 'none';
        document.getElementById('dashboardBtn').style.display = 'none';
        document.getElementById('settingsBtn').style.display = 'none';
        updateConnectionStatus(false);
    }
}

// ═══════════════════════════════════════════════════════════
// SETTINGS PANEL
// ═══════════════════════════════════════════════════════════

function openSettings() {
    document.getElementById('settingsPanel').classList.add('open');
}

function closeSettings() {
    document.getElementById('settingsPanel').classList.remove('open');
}

// ═══════════════════════════════════════════════════════════
// SEARCH FUNCTIONALITY
// ═══════════════════════════════════════════════════════════

function handleSearchInput(e) {
    const searchTerm = e.target.value.trim();
    
    // Show/hide clear button
    document.getElementById('clearSearchBtn').style.display = searchTerm ? 'block' : 'none';
    
    // Clear previous debounce
    if (searchDebounce) {
        clearTimeout(searchDebounce);
    }
    
    // If empty, show empty state
    if (!searchTerm) {
        showEmptyState();
        return;
    }
    
    // Debounce search (300ms)
    if (searchTerm.length >= 3) {
        searchDebounce = setTimeout(() => {
            performSearch(searchTerm);
        }, 300);
    }
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    document.getElementById('clearSearchBtn').style.display = 'none';
    showEmptyState();
}

async function performSearch(searchTerm) {
    try {
        showLoading('Searching...');
        const result = await sheetsAPI.searchParticipant(searchTerm);
        hideLoading();
        
        if (!result.success) {
            showError('Search failed: ' + result.error);
            return;
        }
        
        displayResultsAsCards(result.results);
    } catch (error) {
        hideLoading();
        showError('Search failed: ' + error.message);
    }
}

function showEmptyState() {
    document.getElementById('emptyState').style.display = 'block';
    document.getElementById('cardsContainer').innerHTML = '';
    document.getElementById('statsBar').style.display = 'none';
}

function hideEmptyState() {
    document.getElementById('emptyState').style.display = 'none';
}

// ═══════════════════════════════════════════════════════════
// CARD RENDERING
// ═══════════════════════════════════════════════════════════

function displayResultsAsCards(results) {
    const container = document.getElementById('cardsContainer');
    hideEmptyState();
    
    if (results.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="display: block;">
                <div class="empty-icon">🤷</div>
                <h3>No participants found</h3>
                <p>Try a different search term</p>
            </div>
        `;
        return;
    }
    
    // Store results globally for reference
    window.searchResults = results;
    
    // Render cards
    container.innerHTML = results.map(participant => createParticipantCard(participant)).join('');
    
    // Show quick stats
    showQuickStats(results);
}

function createParticipantCard(p) {
    const hasBib = !!p.bibNumber;
    const cardState = hasBib ? 'has-bib' : 'no-bib';
    const cardId = `card-${p.rowIndex}`;
    
    // T-Shirt icon (colored box)
    const tshirtIcon = `<div class="tshirt-icon">${p.tshirtSize || 'N/A'}</div>`;
    
    // Status info
    const bibStatus = hasBib 
        ? `<span class="bib-info assigned">✅ Bib: ${p.bibNumber}</span>`
        : `<span class="bib-info pending">⚠️ NO BIB ASSIGNED</span>`;
    
    // Action button
    const actionBtn = hasBib
        ? `<button class="btn-action btn-edit" onclick="expandCardForEdit('${cardId}', ${p.rowIndex})">✏️ Edit Bib</button>`
        : `<button class="btn-action btn-assign" onclick="expandCardForAssign('${cardId}', ${p.rowIndex})">+ Assign Bib</button>`;
    
    return `
        <div id="${cardId}" class="participant-card ${cardState}" data-row="${p.rowIndex}">
            <div class="card-header">
                <div class="card-identity">
                    <div class="card-name">${p.name}</div>
                    <div class="card-demographics">
                        <span>${p.gender}</span>
                        <span>${p.age}</span>
                        <span>${p.activityType} ${p.distance}</span>
                    </div>
                    <div class="card-contact">
                        ${p.phone ? `📱 ${p.phone}` : `📧 ${p.email}`}
                    </div>
                </div>
            </div>
            <div class="card-status">
                <div class="card-tshirt">
                    ${tshirtIcon}
                    <span>T-Shirt: ${p.tshirtSize || 'N/A'}</span>
                </div>
                <div class="card-bib-status">
                    ${bibStatus}
                    ${actionBtn}
                </div>
            </div>
            <div class="card-expansion" id="${cardId}-expansion">
                <div class="expansion-content">
                    ${createExpansionForm(p, hasBib)}
                </div>
            </div>
        </div>
    `;
}

function createExpansionForm(p, isEditing) {
    return `
        <div class="expansion-context">
            ${isEditing ? `✏️ Editing bib assignment for <strong>${p.name}</strong>` : `➕ Assigning new bib to <strong>${p.name}</strong>`}
            <br>
            ${isEditing ? `Current Bib: <strong>${p.bibNumber}</strong>` : ''}
            <br>
            Activity: <strong>${p.activityType}</strong> • Distance: <strong>${p.distance}</strong> • Category: <strong>${p.category}</strong>
            <br>
            Expected Bib Range: <strong>${p.expectedBibFormat}</strong>
        </div>
        
        <div class="expansion-form">
            <label class="form-label">Bib Number</label>
            <div class="form-input-wrapper">
                <input 
                    type="text" 
                    id="bibInput-${p.rowIndex}" 
                    class="form-input" 
                    placeholder="Enter bib number"
                    value="${isEditing ? p.bibNumber : ''}"
                    oninput="validateBibInput(${p.rowIndex}, '${p.expectedBibFormat}')"
                    autocomplete="off"
                >
                <span id="bibValidation-${p.rowIndex}" class="input-validation"></span>
            </div>
            <div class="form-hint">Expected format: ${p.expectedBibFormat}</div>
            
            <div class="form-actions">
                <button class="btn-primary" onclick="submitBibAssignment(${p.rowIndex}, ${isEditing})">
                    ✓ ${isEditing ? 'Update' : 'Assign'} Bib
                </button>
                <button class="btn-secondary" onclick="collapseCard('card-${p.rowIndex}')">
                    ✗ Cancel
                </button>
            </div>
        </div>
    `;
}

// ═══════════════════════════════════════════════════════════
// CARD EXPANSION / COLLAPSE
// ═══════════════════════════════════════════════════════════

function expandCardForEdit(cardId, rowIndex) {
    expandCard(cardId, rowIndex, true);
}

function expandCardForAssign(cardId, rowIndex) {
    expandCard(cardId, rowIndex, false);
}

function expandCard(cardId, rowIndex, isEditing) {
    // Collapse any other expanded card first
    if (expandedCardId && expandedCardId !== cardId) {
        collapseCard(expandedCardId);
    }
    
    // Check settings
    if (!venue || !desk || !staffName) {
        showError('Please configure your session settings first');
        openSettings();
        return;
    }
    
    const card = document.getElementById(cardId);
    const expansion = document.getElementById(`${cardId}-expansion`);
    
    if (!card || !expansion) return;
    
    // Add editing state
    card.classList.add('editing');
    expansion.classList.add('expanded');
    expandedCardId = cardId;
    
    // Focus on input
    setTimeout(() => {
        const input = document.getElementById(`bibInput-${rowIndex}`);
        if (input) {
            input.focus();
            if (isEditing) {
                input.select(); // Select existing text for easy editing
            }
        }
    }, 100);
}

function collapseCard(cardId) {
    const card = document.getElementById(cardId);
    const expansion = document.getElementById(`${cardId}-expansion`);
    
    if (!card || !expansion) return;
    
    card.classList.remove('editing');
    expansion.classList.remove('expanded');
    expandedCardId = null;
}

// ═══════════════════════════════════════════════════════════
// BIB INPUT VALIDATION
// ═══════════════════════════════════════════════════════════

function validateBibInput(rowIndex, expectedFormat) {
    const input = document.getElementById(`bibInput-${rowIndex}`);
    const validation = document.getElementById(`bibValidation-${rowIndex}`);
    const value = input.value.trim();
    
    if (!value) {
        input.classList.remove('valid', 'invalid');
        validation.textContent = '';
        return;
    }
    
    // Simple validation based on expected format
    // Format like "50001-59999" means 5K bib range
    const isValid = value.length >= 5 && /^\d+$/.test(value);
    
    if (isValid) {
        input.classList.add('valid');
        input.classList.remove('invalid');
        validation.textContent = '✓ Valid';
        validation.className = 'input-validation valid';
    } else {
        input.classList.add('invalid');
        input.classList.remove('valid');
        validation.textContent = '✗ Invalid';
        validation.className = 'input-validation invalid';
    }
}

// ═══════════════════════════════════════════════════════════
// BIB ASSIGNMENT
// ═══════════════════════════════════════════════════════════

async function submitBibAssignment(rowIndex, isEditing) {
    const bibInput = document.getElementById(`bibInput-${rowIndex}`);
    const bibNumber = bibInput.value.trim();
    
    if (!bibNumber) {
        showError('Please enter a bib number');
        return;
    }
    
    // Find participant from search results
    const participant = window.searchResults.find(p => p.rowIndex === rowIndex);
    if (!participant) {
        showError('Participant not found');
        return;
    }
    
    // Validate settings
    if (!venue || !desk || !staffName) {
        showError('Please fill in Venue, Desk, and Your Name first');
        openSettings();
        return;
    }
    
    try {
        showLoading(isEditing ? 'Updating bib...' : 'Assigning bib...');
        
        // Use cached connectivity status
        if (!isApiOnline || !sheetsAPI.isSignedIn) {
            // Add to offline queue
            await addToOfflineQueue({
                srNo: participant.srNo,
                bibNumber: bibNumber,
                venue: venue,
                desk: desk,
                staffName: staffName,
                participant: participant
            });
            
            hideLoading();
            showSuccess('API currently unavailable. Added to offline queue.');
            collapseCard(`card-${rowIndex}`);
            
            // Update card to show pending state
            await performSearch(document.getElementById('searchInput').value.trim());
            return;
        }
        
        // Try to assign directly to API
        console.log('Attempting direct API assignment...');
        const result = await sheetsAPI.assignBibNumber(
            participant.srNo,
            bibNumber,
            venue,
            desk,
            staffName
        );
        
        hideLoading();
        
        if (!result.success) {
            showError(`Assignment failed: ${result.error}`);
            return;
        }
        
        showSuccess(`Bib ${bibNumber} ${isEditing ? 'updated' : 'assigned'} successfully!`);
        collapseCard(`card-${rowIndex}`);
        
        // Refresh search results to show updated bib
        await performSearch(document.getElementById('searchInput').value.trim());
        
    } catch (error) {
        hideLoading();
        console.error('Assignment error:', error);
        showError('Unexpected error: ' + error.message);
    }
}

// ═══════════════════════════════════════════════════════════
// QUICK STATS
// ═══════════════════════════════════════════════════════════

function showQuickStats(results) {
    const statsBar = document.getElementById('statsBar');
    const statsText = document.getElementById('statsText');
    
    const total = results.length;
    const assigned = results.filter(p => p.bibNumber).length;
    const pending = total - assigned;
    
    statsText.textContent = `${total} found • ${assigned} assigned • ${pending} pending`;
    statsBar.style.display = 'block';
}

// ═══════════════════════════════════════════════════════════
// OFFLINE QUEUE
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
        const result = await offlineManager.syncQueue();
        hideLoading();
        
        if (result.synced > 0) {
            showSuccess(`✓ Synced ${result.synced} assignment(s) successfully!`);
        } else if (result.failed > 0) {
            showError(`Failed to sync ${result.failed} item(s). Check console for errors.`);
        } else {
            showSuccess('All items already synced!');
        }
        
        updateQueueDisplay();
    }
}

async function clearOfflineQueue() {
    if (typeof offlineManager !== 'undefined') {
        if (confirm('⚠️ Clear all pending assignments from queue?\n\nThis will DELETE all queued items permanently!')) {
            showLoading('Clearing queue...');
            await offlineManager.clearCompleted();
            hideLoading();
            showSuccess('✓ Queue cleared!');
            updateQueueDisplay();
        }
    }
}

async function updateQueueDisplay() {
    if (typeof offlineManager !== 'undefined') {
        const count = await offlineManager.getQueueCount();
        const queueBanner = document.getElementById('queueBanner');
        const queueText = document.getElementById('queueText');
        
        if (count > 0) {
            queueBanner.style.display = 'flex';
            queueText.textContent = `${count} pending assignment${count > 1 ? 's' : ''} in offline queue`;
        } else {
            queueBanner.style.display = 'none';
        }
    }
}

// ═══════════════════════════════════════════════════════════
// CONNECTION CHECKING
// ═══════════════════════════════════════════════════════════

async function checkApiConnectivity() {
    try {
        if (typeof gapi === 'undefined' || !gapi.client || !gapi.client.sheets) {
            console.warn('GAPI not loaded yet');
            isApiOnline = false;
            updateConnectionStatus(false);
            return false;
        }
        
        if (!sheetsAPI.isSignedIn) {
            console.log('Not signed in, marking offline');
            isApiOnline = false;
            updateConnectionStatus(false);
            return false;
        }
        
        console.log('Testing API connectivity...');
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: CONFIG.SHEET_ID,
            range: `${CONFIG.SHEET_NAME}!A1:A1`,
        });
        
        console.log('✓ API is online and working');
        isApiOnline = true;
        updateConnectionStatus(true);
        return true;
    } catch (error) {
        console.error('✗ API connectivity check failed:', error);
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
    }, 30000);
    
    // Check when browser thinks we're back online
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

function updateConnectionStatus(isOnline) {
    const statusIndicator = document.getElementById('connectionStatus');
    const statusText = document.getElementById('statusText');
    
    if (isOnline) {
        statusIndicator.classList.add('online');
        statusText.textContent = 'Online';
    } else {
        statusIndicator.classList.remove('online');
        statusText.textContent = 'Offline';
    }
}

// ═══════════════════════════════════════════════════════════
// UI FEEDBACK
// ═══════════════════════════════════════════════════════════

function showLoading(message = 'Loading...') {
    document.getElementById('loadingText').textContent = message;
    document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

function showSuccess(message) {
    alert('✓ ' + message);
}

function showError(message) {
    alert('✗ ' + message);
}
