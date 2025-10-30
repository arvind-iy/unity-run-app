/**
 * T-Shirt Replacement App Logic
 * Allows staff to change T-shirt sizes only
 */

let currentParticipant = null;
let venue = '';
let desk = '';
let staffName = '';
let isApiOnline = false;
let searchDebounce = null;
let expandedCardId = null;

// T-shirt sizes available
const TSHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

// ═══════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', async () => {
    console.log('T-Shirt Replacement App initializing...');
    
    loadSettings();
    setupEventListeners();
    setupKeyboardShortcuts();
    
    try {
        showLoading('Initializing...');
        await sheetsAPI.init();
        sheetsAPI.onSignInChange = handleSignInChange;
        startConnectivityMonitoring();
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
    venue = localStorage.getItem('tshirt_venue') || '';
    desk = localStorage.getItem('tshirt_desk') || '';
    staffName = localStorage.getItem('tshirt_staffName') || '';
    
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
    
    updateSessionDisplay();
}

function saveSettings() {
    const venueRadio = document.querySelector('input[name="venue"]:checked');
    venue = venueRadio ? venueRadio.value : '';
    
    const activeDeskBtn = document.querySelector('.desk-btn.active');
    desk = activeDeskBtn ? activeDeskBtn.dataset.desk : '';
    
    staffName = document.getElementById('staffNameInput').value.trim();
    
    localStorage.setItem('tshirt_venue', venue);
    localStorage.setItem('tshirt_desk', desk);
    localStorage.setItem('tshirt_staffName', staffName);
    
    updateSessionDisplay();
    
    console.log('T-Shirt Desk Settings saved:', { venue, desk, staffName });
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
    document.getElementById('signInBtn').addEventListener('click', signIn);
    document.getElementById('signOutBtn').addEventListener('click', signOut);
    
    document.getElementById('searchInput').addEventListener('input', handleSearchInput);
    document.getElementById('clearSearchBtn').addEventListener('click', clearSearch);
    
    document.getElementById('settingsBtn').addEventListener('click', openSettings);
    document.getElementById('closeSettingsBtn').addEventListener('click', closeSettings);
    document.querySelector('.settings-overlay').addEventListener('click', closeSettings);
    
    document.querySelectorAll('.desk-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.desk-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        });
    });
    
    document.getElementById('saveSettingsBtn').addEventListener('click', () => {
        const settings = saveSettings();
        if (settings.venue && settings.desk && settings.staffName) {
            showSuccess('Settings saved successfully!');
            closeSettings();
        } else {
            showError('Please fill in all settings');
        }
    });
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (e.key === '/' && !isInputFocused()) {
            e.preventDefault();
            document.getElementById('searchInput').focus();
        }
        
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
    return active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.tagName === 'SELECT';
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
        document.getElementById('settingsBtn').style.display = 'block';
        hideLoading();
        
        if (!venue || !desk || !staffName) {
            setTimeout(() => {
                openSettings();
                showError('Please configure your T-shirt desk settings first');
            }, 500);
        }
        
        setTimeout(async () => {
            await checkApiConnectivity();
        }, 1500);
    } else {
        document.getElementById('authSection').style.display = 'block';
        document.getElementById('mainApp').style.display = 'none';
        document.getElementById('signOutBtn').style.display = 'none';
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
    
    document.getElementById('clearSearchBtn').style.display = searchTerm ? 'block' : 'none';
    
    if (searchDebounce) {
        clearTimeout(searchDebounce);
    }
    
    if (!searchTerm) {
        showEmptyState();
        return;
    }
    
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
    
    window.searchResults = results;
    container.innerHTML = results.map(participant => createTShirtCard(participant)).join('');
    
    showQuickStats(results);
}

function createTShirtCard(p) {
    const cardId = `card-${p.rowIndex}`;
    const currentSize = p.tshirtSize || 'Not Set';
    
    return `
        <div id="${cardId}" class="participant-card" data-row="${p.rowIndex}">
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
                        ${p.bibNumber ? `• 🎟️ Bib ${p.bibNumber}` : ''}
                    </div>
                </div>
            </div>
            <div class="card-status">
                <div class="card-tshirt">
                    <div class="tshirt-icon">${currentSize}</div>
                    <span>Current T-Shirt: <strong>${currentSize}</strong></span>
                </div>
                <div class="card-bib-status">
                    <button class="btn-action btn-assign" onclick="expandCardForTShirtChange('${cardId}', ${p.rowIndex})">
                        👕 Change Size
                    </button>
                </div>
            </div>
            <div class="card-expansion" id="${cardId}-expansion">
                <div class="expansion-content">
                    ${createTShirtChangeForm(p)}
                </div>
            </div>
        </div>
    `;
}

function createTShirtChangeForm(p) {
    const currentSize = p.tshirtSize || 'Not Set';
    const sizeOptions = TSHIRT_SIZES.map(size => 
        `<option value="${size}" ${size === currentSize ? 'selected' : ''}>${size}</option>`
    ).join('');
    
    return `
        <div class="expansion-context" style="background: #fef3c7; color: #92400e;">
            👕 Changing T-shirt size for <strong>${p.name}</strong>
            <br>
            Current Size: <strong>${currentSize}</strong>
            <br>
            Activity: <strong>${p.activityType}</strong> • Distance: <strong>${p.distance}</strong>
            ${p.bibNumber ? `<br>Bib Number: <strong>${p.bibNumber}</strong>` : ''}
        </div>
        
        <div class="expansion-form">
            <label class="form-label">New T-Shirt Size</label>
            <div class="form-input-wrapper">
                <select id="tshirtInput-${p.rowIndex}" class="form-input" style="padding: 14px;">
                    ${sizeOptions}
                </select>
            </div>
            <div class="form-hint">Select the new T-shirt size for replacement</div>
            
            <div class="form-actions">
                <button class="btn-primary" onclick="submitTShirtChange(${p.rowIndex}, '${currentSize}')">
                    ✓ Change T-Shirt Size
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

function expandCardForTShirtChange(cardId, rowIndex) {
    if (expandedCardId && expandedCardId !== cardId) {
        collapseCard(expandedCardId);
    }
    
    if (!venue || !desk || !staffName) {
        showError('Please configure your T-shirt desk settings first');
        openSettings();
        return;
    }
    
    const card = document.getElementById(cardId);
    const expansion = document.getElementById(`${cardId}-expansion`);
    
    if (!card || !expansion) return;
    
    card.classList.add('editing');
    expansion.classList.add('expanded');
    expandedCardId = cardId;
    
    setTimeout(() => {
        const select = document.getElementById(`tshirtInput-${rowIndex}`);
        if (select) select.focus();
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
// T-SHIRT SIZE CHANGE
// ═══════════════════════════════════════════════════════════

async function submitTShirtChange(rowIndex, oldSize) {
    const select = document.getElementById(`tshirtInput-${rowIndex}`);
    const newSize = select.value;
    
    if (!newSize) {
        showError('Please select a T-shirt size');
        return;
    }
    
    if (newSize === oldSize) {
        showError('New size is the same as current size. No change needed.');
        return;
    }
    
    const participant = window.searchResults.find(p => p.rowIndex === rowIndex);
    if (!participant) {
        showError('Participant not found');
        return;
    }
    
    if (!venue || !desk || !staffName) {
        showError('Please fill in Venue, Desk, and Your Name first');
        openSettings();
        return;
    }
    
    if (!confirm(`Change T-shirt size from ${oldSize} to ${newSize} for ${participant.name}?`)) {
        return;
    }
    
    try {
        showLoading('Changing T-shirt size...');
        
        const result = await sheetsAPI.changeTShirtSize(
            participant.srNo,
            oldSize,
            newSize,
            venue,
            desk,
            staffName
        );
        
        hideLoading();
        
        if (!result.success) {
            showError(`Change failed: ${result.error}`);
            return;
        }
        
        showSuccess(`✓ T-shirt size changed from ${oldSize} to ${newSize}!`);
        collapseCard(`card-${rowIndex}`);
        
        // Refresh search results
        await performSearch(document.getElementById('searchInput').value.trim());
        
    } catch (error) {
        hideLoading();
        console.error('T-shirt change error:', error);
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
    statsText.textContent = `${total} participant${total !== 1 ? 's' : ''} found`;
    statsBar.style.display = 'block';
}

// ═══════════════════════════════════════════════════════════
// CONNECTION CHECKING
// ═══════════════════════════════════════════════════════════

async function checkApiConnectivity() {
    try {
        if (typeof gapi === 'undefined' || !gapi.client || !gapi.client.sheets) {
            isApiOnline = false;
            updateConnectionStatus(false);
            return false;
        }
        
        if (!sheetsAPI.isSignedIn) {
            isApiOnline = false;
            updateConnectionStatus(false);
            return false;
        }
        
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: CONFIG.SHEET_ID,
            range: `${CONFIG.SHEET_NAME}!A1:A1`,
        });
        
        isApiOnline = true;
        updateConnectionStatus(true);
        return true;
    } catch (error) {
        isApiOnline = false;
        updateConnectionStatus(false);
        return false;
    }
}

function startConnectivityMonitoring() {
    setInterval(async () => {
        if (sheetsAPI.isSignedIn) {
            await checkApiConnectivity();
        }
    }, 30000);
    
    window.addEventListener('online', async () => {
        setTimeout(async () => {
            await checkApiConnectivity();
        }, 2000);
    });
    
    window.addEventListener('offline', () => {
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
