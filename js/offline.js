/**
 * Offline Support using IndexedDB
 * Queues bib assignments when offline, syncs when online
 */

class OfflineManager {
    constructor() {
        this.dbName = 'UnityRunOfflineDB';
        this.dbVersion = 1;
        this.storeName = 'offlineQueue';
        this.db = null;
    }

    /**
     * Initialize IndexedDB
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const objectStore = db.createObjectStore(this.storeName, { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    objectStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
        });
    }

    /**
     * Add assignment to offline queue
     */
    async addToQueue(assignment) {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const objectStore = transaction.objectStore(this.storeName);
            
            const item = {
                ...assignment,
                timestamp: new Date().toISOString(),
                status: 'pending'
            };

            const request = objectStore.add(item);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get all pending items from queue
     */
    async getQueue() {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const objectStore = transaction.objectStore(this.storeName);
            const request = objectStore.getAll();

            request.onsuccess = () => resolve(request.result.filter(item => item.status === 'pending'));
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get count of pending items
     */
    async getQueueCount() {
        const queue = await this.getQueue();
        return queue.length;
    }

    /**
     * Remove item from queue
     */
    async removeFromQueue(id) {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const objectStore = transaction.objectStore(this.storeName);
            const request = objectStore.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Sync all pending assignments
     */
    async syncQueue() {
        if (!navigator.onLine) {
            console.log('Cannot sync: offline');
            return { success: false, error: 'No internet connection' };
        }

        const queue = await this.getQueue();
        
        if (queue.length === 0) {
            return { success: true, synced: 0 };
        }

        let synced = 0;
        let failed = 0;

        for (const item of queue) {
            try {
                const result = await sheetsAPI.assignBibNumber(
                    item.srNo,
                    item.bibNumber,
                    item.venue,
                    item.desk,
                    item.staffName
                );

                if (result.success) {
                    await this.removeFromQueue(item.id);
                    synced++;
                    console.log(`✓ Synced: ${item.participant.name} - Bib ${item.bibNumber}`);
                } else {
                    failed++;
                    console.error(`✗ Failed to sync: ${item.participant.name}`, result.error);
                }
            } catch (error) {
                failed++;
                console.error(`✗ Error syncing: ${item.participant.name}`, error);
            }
        }

        return { 
            success: true, 
            synced: synced,
            failed: failed,
            total: queue.length
        };
    }

    /**
     * Clear all completed items
     */
    async clearCompleted() {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const objectStore = transaction.objectStore(this.storeName);
            const request = objectStore.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}

// Create global instance
const offlineManager = new OfflineManager();

// Initialize on load
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', async () => {
        try {
            await offlineManager.init();
            console.log('✓ Offline manager initialized');
            
            // Try to sync on load if online
            if (navigator.onLine) {
                setTimeout(async () => {
                    const result = await offlineManager.syncQueue();
                    if (result.synced > 0) {
                        console.log(`✓ Auto-synced ${result.synced} assignments`);
                        if (typeof updateQueueDisplay === 'function') {
                            updateQueueDisplay();
                        }
                    }
                }, 2000);
            }
        } catch (error) {
            console.error('Failed to initialize offline manager:', error);
        }
    });

    // Auto-sync when coming back online
    window.addEventListener('online', async () => {
        console.log('Connection restored, syncing...');
        setTimeout(async () => {
            const result = await offlineManager.syncQueue();
            if (result.synced > 0) {
                alert(`✓ Synced ${result.synced} offline assignment(s)`);
                if (typeof updateQueueDisplay === 'function') {
                    updateQueueDisplay();
                }
            }
        }, 1000);
    });
}
