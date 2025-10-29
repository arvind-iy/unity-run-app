/**
 * Dashboard Logic
 * Real-time statistics and monitoring
 */

let refreshInterval = null;

// ═══════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Dashboard initializing...');
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize Sheets API
    try {
        showLoading('Initializing...');
        await sheetsAPI.init();
        
        // Override sign-in callback
        sheetsAPI.onSignInChange = handleSignInChange;
        
        hideLoading();
    } catch (error) {
        hideLoading();
        showError('Failed to initialize: ' + error.message);
    }
});

// ═══════════════════════════════════════════════════════════
// EVENT LISTENERS
// ═══════════════════════════════════════════════════════════

function setupEventListeners() {
    document.getElementById('signInBtn').addEventListener('click', signIn);
    document.getElementById('signOutBtn').addEventListener('click', signOut);
    document.getElementById('refreshBtn').addEventListener('click', refreshDashboard);
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
        
        // Stop auto-refresh
        if (refreshInterval) {
            clearInterval(refreshInterval);
            refreshInterval = null;
        }
    }
}

function handleSignInChange(isSignedIn) {
    if (isSignedIn) {
        document.getElementById('authSection').style.display = 'none';
        document.getElementById('mainDashboard').style.display = 'block';
        document.getElementById('signOutBtn').style.display = 'block';
        hideLoading();
        
        // Load dashboard data
        refreshDashboard();
        
        // Start auto-refresh
        refreshInterval = setInterval(refreshDashboard, CONFIG.DASHBOARD_REFRESH_INTERVAL);
        
    } else {
        document.getElementById('authSection').style.display = 'block';
        document.getElementById('mainDashboard').style.display = 'none';
        document.getElementById('signOutBtn').style.display = 'none';
    }
}

// ═══════════════════════════════════════════════════════════
// DASHBOARD DATA
// ═══════════════════════════════════════════════════════════

async function refreshDashboard() {
    try {
        const result = await sheetsAPI.getDashboardStats();
        
        if (!result.success) {
            console.error('Failed to load stats:', result.error);
            return;
        }
        
        updateDashboard(result.stats);
        updateLastUpdated();
        
    } catch (error) {
        console.error('Failed to refresh dashboard:', error);
    }
}

function updateDashboard(stats) {
    // Summary cards
    document.getElementById('totalRegistrants').textContent = stats.totalRegistrants;
    document.getElementById('totalAssigned').textContent = stats.totalAssigned;
    document.getElementById('totalPending').textContent = stats.totalPending;
    
    const completionRate = stats.totalRegistrants > 0 
        ? Math.round((stats.totalAssigned / stats.totalRegistrants) * 100)
        : 0;
    document.getElementById('completionRate').textContent = completionRate + '%';
    
    // Category breakdown
    updateCategoryStats(stats.categoryStats);
    
    // Venue stats
    updateVenueStats(stats.venueStats);
    
    // Desk stats
    updateDeskStats(stats.deskStats);
    
    // Recent assignments
    updateRecentAssignments(stats.recentAssignments);
}

function updateCategoryStats(categoryStats) {
    const container = document.getElementById('categoryStats');
    
    const html = Object.entries(categoryStats).map(([category, data]) => {
        const percentage = data.total > 0 
            ? Math.round((data.assigned / data.total) * 100)
            : 0;
        
        return `
            <div class="category-card">
                <div class="category-header">
                    <h3>${category}</h3>
                    <span class="category-count">${data.assigned} / ${data.total}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
                <div class="category-percentage">${percentage}% Complete</div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

function updateVenueStats(venueStats) {
    const container = document.getElementById('venueStats');
    
    if (Object.keys(venueStats).length === 0) {
        container.innerHTML = '<p class="no-data">No venue data yet</p>';
        return;
    }
    
    const html = Object.entries(venueStats)
        .sort((a, b) => b[1] - a[1])
        .map(([venue, count]) => `
            <div class="stat-item">
                <div class="stat-item-label">📍 ${venue}</div>
                <div class="stat-item-value">${count}</div>
            </div>
        `).join('');
    
    container.innerHTML = html;
}

function updateDeskStats(deskStats) {
    const container = document.getElementById('deskStats');
    
    if (Object.keys(deskStats).length === 0) {
        container.innerHTML = '<p class="no-data">No desk data yet</p>';
        return;
    }
    
    const html = Object.entries(deskStats)
        .sort((a, b) => b[1] - a[1])
        .map(([desk, count]) => `
            <div class="stat-item">
                <div class="stat-item-label">🖥️ ${desk}</div>
                <div class="stat-item-value">${count}</div>
            </div>
        `).join('');
    
    container.innerHTML = html;
}

function updateRecentAssignments(assignments) {
    const container = document.getElementById('recentAssignments');
    
    if (assignments.length === 0) {
        container.innerHTML = '<p class="no-data">No assignments yet</p>';
        return;
    }
    
    const html = assignments.slice(0, 20).map(a => {
        const timestamp = a.timestamp ? new Date(a.timestamp).toLocaleString() : 'Just now';
        return `
            <div class="assignment-item">
                <div class="assignment-icon">👤</div>
                <div class="assignment-details">
                    <div class="assignment-name">${a.name}</div>
                    <div class="assignment-meta">
                        Bib: <strong>${a.bibNumber}</strong> • 
                        ${a.venue || 'Unknown'} - Desk ${a.desk || '?'} • 
                        ${timestamp}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

function updateLastUpdated() {
    const now = new Date().toLocaleTimeString();
    document.getElementById('lastUpdate').textContent = `Last updated: ${now}`;
}

// ═══════════════════════════════════════════════════════════
// UI HELPERS
// ═══════════════════════════════════════════════════════════

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
