/**
 * VetScribe - Privacy Manager Module
 * Professional privacy controls and data retention policies
 * Ensures HIPAA-level compliance for veterinary practices
 */

const PrivacyManager = {
    // Privacy configuration
    config: {
        defaultRetentionDays: 2555, // 7 years (veterinary standard)
        autoDeleteEnabled: false,
        dataMinimization: true,
        consentRequired: false, // For veterinary use, consent is implied
        auditLogging: true,
        anonymizationEnabled: false
    },
    
    // Data retention policies
    retentionPolicies: {
        recordings: {
            defaultDays: 90, // Keep recordings for 90 days
            maxDays: 365,
            autoDelete: true,
            userConfigurable: true
        },
        transcripts: {
            defaultDays: 2555, // 7 years
            maxDays: 3650, // 10 years max
            autoDelete: false,
            userConfigurable: true
        },
        soapNotes: {
            defaultDays: 2555, // 7 years (legal requirement)
            maxDays: 3650, // 10 years max
            autoDelete: false,
            userConfigurable: false // Legal requirement
        },
        sessions: {
            defaultDays: 365, // 1 year
            maxDays: 2555,
            autoDelete: true,
            userConfigurable: true
        },
        auditLogs: {
            defaultDays: 2555, // 7 years
            maxDays: 3650,
            autoDelete: false,
            userConfigurable: false
        }
    },
    
    // Privacy state
    state: {
        lastCleanup: null,
        totalItemsDeleted: 0,
        retentionWarningsShown: [],
        privacyNoticesAccepted: [],
        dataExportRequests: []
    },

    /**
     * Initialize privacy management system
     */
    init() {
        console.log('🔒 Initializing privacy management system...');
        
        try {
            // Load privacy settings
            this.loadPrivacySettings();
            
            // Set up automatic cleanup
            this.setupAutomaticCleanup();
            
            // Initialize audit logging
            this.initializeAuditLogging();
            
            // Check for overdue data
            this.checkDataRetention();
            
            console.log('✅ Privacy management system initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize privacy manager:', error);
            throw error;
        }
    },

    /**
     * Load privacy settings from storage
     */
    loadPrivacySettings() {
        try {
            const savedSettings = localStorage.getItem('vetscribe-privacy-settings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                this.config = { ...this.config, ...settings };
            }
            
            // Load retention policies
            const savedPolicies = localStorage.getItem('vetscribe-retention-policies');
            if (savedPolicies) {
                const policies = JSON.parse(savedPolicies);
                this.retentionPolicies = { ...this.retentionPolicies, ...policies };
            }
            
            console.log('🔒 Privacy settings loaded');
            
        } catch (error) {
            console.warn('⚠️ Failed to load privacy settings:', error);
        }
    },

    /**
     * Save privacy settings to storage
     */
    savePrivacySettings() {
        try {
            localStorage.setItem('vetscribe-privacy-settings', JSON.stringify(this.config));
            localStorage.setItem('vetscribe-retention-policies', JSON.stringify(this.retentionPolicies));
            
            console.log('🔒 Privacy settings saved');
            
        } catch (error) {
            console.error('❌ Failed to save privacy settings:', error);
        }
    },

    /**
     * Set up automatic cleanup based on retention policies
     */
    setupAutomaticCleanup() {
        // Run cleanup daily
        const cleanupInterval = 24 * 60 * 60 * 1000; // 24 hours
        
        setInterval(() => {
            this.performAutomaticCleanup();
        }, cleanupInterval);
        
        // Run initial cleanup if it's been more than a day
        const lastCleanup = localStorage.getItem('vetscribe-last-cleanup');
        if (!lastCleanup || Date.now() - parseInt(lastCleanup) > cleanupInterval) {
            setTimeout(() => this.performAutomaticCleanup(), 5000); // Delay 5 seconds after startup
        }
        
        console.log('🔒 Automatic cleanup scheduled');
    },

    /**
     * Perform automatic cleanup based on retention policies
     */
    async performAutomaticCleanup() {
        console.log('🧹 Starting automatic data cleanup...');
        
        try {
            let totalDeleted = 0;
            
            // Clean up each data type according to its retention policy
            for (const [dataType, policy] of Object.entries(this.retentionPolicies)) {
                if (policy.autoDelete) {
                    const deleted = await this.cleanupDataType(dataType, policy.defaultDays);
                    totalDeleted += deleted;
                }
            }
            
            // Update cleanup state
            this.state.lastCleanup = new Date().toISOString();
            this.state.totalItemsDeleted += totalDeleted;
            localStorage.setItem('vetscribe-last-cleanup', Date.now().toString());
            
            if (totalDeleted > 0) {
                console.log(`🧹 Cleanup complete: ${totalDeleted} items deleted`);
                this.logAuditEvent('automatic_cleanup', {
                    itemsDeleted: totalDeleted,
                    timestamp: new Date().toISOString()
                });
            }
            
        } catch (error) {
            console.error('❌ Automatic cleanup failed:', error);
        }
    },

    /**
     * Clean up specific data type based on retention days
     */
    async cleanupDataType(dataType, retentionDays) {
        if (typeof Storage === 'undefined') {
            console.warn('⚠️ Storage not available for cleanup');
            return 0;
        }
        
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
            
            let items = [];
            let deleteMethod = null;
            
            // Get items and delete method for each data type
            switch (dataType) {
                case 'recordings':
                    items = Storage.getRecordings();
                    deleteMethod = (id) => Storage.deleteRecording(id);
                    break;
                case 'transcripts':
                    items = await Storage.getTranscripts();
                    deleteMethod = (id) => Storage.deleteTranscript(id);
                    break;
                case 'soapNotes':
                    items = await Storage.getSOAPNotes();
                    deleteMethod = (id) => Storage.deleteSOAPNote(id);
                    break;
                case 'sessions':
                    items = Storage.getSessions();
                    deleteMethod = (id) => Storage.deleteSession(id);
                    break;
                default:
                    return 0;
            }
            
            // Find items older than retention period
            const itemsToDelete = items.filter(item => {
                const itemDate = new Date(item.timestamp);
                return itemDate < cutoffDate;
            });
            
            // Delete expired items
            let deletedCount = 0;
            for (const item of itemsToDelete) {
                try {
                    if (deleteMethod(item.id)) {
                        deletedCount++;
                    }
                } catch (error) {
                    console.warn(`⚠️ Failed to delete ${dataType} item ${item.id}:`, error);
                }
            }
            
            if (deletedCount > 0) {
                console.log(`🧹 Deleted ${deletedCount} expired ${dataType} items`);
            }
            
            return deletedCount;
            
        } catch (error) {
            console.error(`❌ Failed to cleanup ${dataType}:`, error);
            return 0;
        }
    },

    /**
     * Check data retention and warn about upcoming deletions
     */
    async checkDataRetention() {
        if (typeof Storage === 'undefined') {
            return;
        }
        
        try {
            const warnings = [];
            
            // Check each data type for items approaching retention limit
            for (const [dataType, policy] of Object.entries(this.retentionPolicies)) {
                if (policy.autoDelete) {
                    const warningDays = 7; // Warn 7 days before deletion
                    const warningDate = new Date();
                    warningDate.setDate(warningDate.getDate() - (policy.defaultDays - warningDays));
                    
                    let items = [];
                    switch (dataType) {
                        case 'recordings':
                            items = Storage.getRecordings();
                            break;
                        case 'transcripts':
                            items = await Storage.getTranscripts();
                            break;
                        case 'soapNotes':
                            items = await Storage.getSOAPNotes();
                            break;
                        case 'sessions':
                            items = Storage.getSessions();
                            break;
                    }
                    
                    const itemsNearExpiry = items.filter(item => {
                        const itemDate = new Date(item.timestamp);
                        return itemDate < warningDate;
                    });
                    
                    if (itemsNearExpiry.length > 0) {
                        warnings.push({
                            dataType: dataType,
                            count: itemsNearExpiry.length,
                            daysUntilDeletion: warningDays
                        });
                    }
                }
            }
            
            // Show warnings if any
            if (warnings.length > 0) {
                this.showRetentionWarnings(warnings);
            }
            
        } catch (error) {
            console.error('❌ Failed to check data retention:', error);
        }
    },

    /**
     * Show retention warnings to user
     */
    showRetentionWarnings(warnings) {
        const warningMessages = warnings.map(warning => 
            `${warning.count} ${warning.dataType} will be automatically deleted in ${warning.daysUntilDeletion} days`
        );
        
        if (typeof showWarning === 'function') {
            showWarning(
                'Data Retention Notice',
                warningMessages.concat([
                    'Export important data before automatic deletion',
                    'Adjust retention settings in Privacy Settings if needed'
                ])
            );
        }
        
        console.warn('⚠️ Data retention warnings:', warnings);
    },

    /**
     * Initialize audit logging
     */
    initializeAuditLogging() {
        if (!this.config.auditLogging) {
            return;
        }
        
        // Create audit log storage if it doesn't exist
        if (!localStorage.getItem('vetscribe-audit-log')) {
            localStorage.setItem('vetscribe-audit-log', JSON.stringify([]));
        }
        
        console.log('🔒 Audit logging initialized');
    },

    /**
     * Log audit event
     */
    logAuditEvent(eventType, details = {}) {
        if (!this.config.auditLogging) {
            return;
        }
        
        try {
            const auditLog = JSON.parse(localStorage.getItem('vetscribe-audit-log') || '[]');
            
            const auditEntry = {
                id: this.generateAuditId(),
                timestamp: new Date().toISOString(),
                eventType: eventType,
                details: details,
                userAgent: navigator.userAgent,
                sessionId: this.getCurrentSessionId()
            };
            
            auditLog.push(auditEntry);
            
            // Maintain audit log size (keep last 1000 entries)
            if (auditLog.length > 1000) {
                auditLog.splice(0, auditLog.length - 1000);
            }
            
            localStorage.setItem('vetscribe-audit-log', JSON.stringify(auditLog));
            
            console.log('📋 Audit event logged:', eventType);
            
        } catch (error) {
            console.error('❌ Failed to log audit event:', error);
        }
    },

    /**
     * Get audit log
     */
    getAuditLog(limit = 100) {
        try {
            const auditLog = JSON.parse(localStorage.getItem('vetscribe-audit-log') || '[]');
            return auditLog.slice(-limit).reverse(); // Return most recent first
        } catch (error) {
            console.error('❌ Failed to get audit log:', error);
            return [];
        }
    },

    /**
     * Export user data (GDPR-style data export)
     */
    async exportUserData() {
        try {
            console.log('📦 Exporting user data...');
            
            const exportData = {
                exportDate: new Date().toISOString(),
                version: '1.0',
                data: {}
            };
            
            // Export all data types if Storage is available
            if (typeof Storage !== 'undefined') {
                exportData.data.recordings = Storage.getRecordings();
                exportData.data.transcripts = await Storage.getTranscripts();
                exportData.data.soapNotes = await Storage.getSOAPNotes();
                exportData.data.sessions = Storage.getSessions();
            }
            
            // Export settings
            exportData.data.settings = JSON.parse(localStorage.getItem('vetscribe-settings') || '{}');
            exportData.data.privacySettings = this.config;
            exportData.data.retentionPolicies = this.retentionPolicies;
            
            // Export audit log
            if (this.config.auditLogging) {
                exportData.data.auditLog = this.getAuditLog(500); // Last 500 entries
            }
            
            // Log the export
            this.logAuditEvent('data_export', {
                recordingsCount: exportData.data.recordings?.length || 0,
                transcriptsCount: exportData.data.transcripts?.length || 0,
                soapNotesCount: exportData.data.soapNotes?.length || 0,
                sessionsCount: exportData.data.sessions?.length || 0
            });
            
            console.log('✅ User data export complete');
            return exportData;
            
        } catch (error) {
            console.error('❌ Failed to export user data:', error);
            throw error;
        }
    },

    /**
     * Delete all user data (right to be forgotten)
     */
    async deleteAllUserData() {
        try {
            console.log('🗑️ Deleting all user data...');
            
            // Log the deletion before deleting audit log
            this.logAuditEvent('complete_data_deletion', {
                timestamp: new Date().toISOString(),
                reason: 'user_request'
            });
            
            // Clear all localStorage data
            const keysToDelete = [
                'vetscribe-recordings',
                'vetscribe-transcripts',
                'vetscribe-soap-notes',
                'vetscribe-sessions',
                'vetscribe-settings',
                'vetscribe-metadata',
                'vetscribe-cache',
                'vetscribe-privacy-settings',
                'vetscribe-retention-policies',
                'vetscribe-audit-log',
                'vetscribe-last-cleanup'
            ];
            
            keysToDelete.forEach(key => {
                localStorage.removeItem(key);
            });
            
            // Reset privacy manager state
            this.state = {
                lastCleanup: null,
                totalItemsDeleted: 0,
                retentionWarningsShown: [],
                privacyNoticesAccepted: [],
                dataExportRequests: []
            };
            
            console.log('✅ All user data deleted');
            
            if (typeof showSuccess === 'function') {
                showSuccess('All user data has been permanently deleted.');
            }
            
        } catch (error) {
            console.error('❌ Failed to delete user data:', error);
            throw error;
        }
    },

    /**
     * Get privacy status report
     */
    getPrivacyStatus() {
        return {
            retentionPolicies: this.retentionPolicies,
            config: this.config,
            lastCleanup: this.state.lastCleanup,
            totalItemsDeleted: this.state.totalItemsDeleted,
            auditLogging: this.config.auditLogging,
            dataMinimization: this.config.dataMinimization
        };
    },

    /**
     * Update retention policy for a data type
     */
    updateRetentionPolicy(dataType, newPolicy) {
        if (this.retentionPolicies[dataType]) {
            // Don't allow changing non-configurable policies
            if (!this.retentionPolicies[dataType].userConfigurable) {
                console.warn(`⚠️ Cannot modify retention policy for ${dataType} - not user configurable`);
                return false;
            }
            
            this.retentionPolicies[dataType] = { ...this.retentionPolicies[dataType], ...newPolicy };
            this.savePrivacySettings();
            
            this.logAuditEvent('retention_policy_updated', {
                dataType: dataType,
                newPolicy: newPolicy
            });
            
            console.log(`🔒 Retention policy updated for ${dataType}`);
            return true;
        }
        
        return false;
    },

    /**
     * Helper functions
     */
    generateAuditId() {
        return 'audit_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    getCurrentSessionId() {
        // Try to get session ID from app state or generate one
        if (typeof AppState !== 'undefined' && AppState.currentSessionId) {
            return AppState.currentSessionId;
        }
        return 'session_' + Date.now().toString(36);
    }
};

// Make PrivacyManager available globally
window.PrivacyManager = PrivacyManager;
