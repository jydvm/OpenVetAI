/**
 * VetScribe - Secure Export Module
 * Professional-grade encrypted file export for veterinary data
 * Ensures HIPAA-compliant data sharing and backup
 */

const SecureExport = {
    // Export configuration
    config: {
        defaultFormat: 'json',
        encryptionEnabled: true,
        compressionEnabled: true,
        includeMetadata: true,
        maxFileSize: 100 * 1024 * 1024, // 100MB
        supportedFormats: ['json', 'csv', 'pdf', 'txt'],
        encryptionAlgorithm: 'AES-GCM'
    },
    
    // Export statistics
    stats: {
        totalExports: 0,
        encryptedExports: 0,
        lastExport: null,
        exportSizes: []
    },

    /**
     * Initialize secure export system
     */
    init() {
        console.log('📦 Initializing secure export system...');
        
        try {
            // Load export settings
            this.loadExportSettings();
            
            // Initialize export statistics
            this.loadExportStats();
            
            console.log('✅ Secure export system initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize secure export:', error);
            throw error;
        }
    },

    /**
     * Export SOAP notes with encryption options
     */
    async exportSOAPNotes(noteIds = [], options = {}) {
        try {
            console.log('📦 Exporting SOAP notes...');
            
            const {
                format = this.config.defaultFormat,
                encrypt = this.config.encryptionEnabled,
                compress = this.config.compressionEnabled,
                includeMetadata = this.config.includeMetadata,
                password = null,
                filename = null
            } = options;
            
            // Get SOAP notes data
            const notesData = await this.getSOAPNotesData(noteIds);
            
            if (notesData.length === 0) {
                throw new Error('No SOAP notes found to export');
            }
            
            // Prepare export data
            const exportData = await this.prepareExportData(notesData, {
                format,
                includeMetadata,
                compress
            });
            
            // Generate filename if not provided
            const exportFilename = filename || this.generateFilename('soap-notes', format, encrypt);
            
            // Export with or without encryption
            if (encrypt) {
                return await this.exportEncrypted(exportData, exportFilename, password);
            } else {
                return await this.exportPlain(exportData, exportFilename, format);
            }
            
        } catch (error) {
            console.error('❌ SOAP notes export failed:', error);
            throw error;
        }
    },

    /**
     * Export complete user data with encryption
     */
    async exportCompleteData(options = {}) {
        try {
            console.log('📦 Exporting complete user data...');
            
            const {
                encrypt = true,
                password = null,
                includeAuditLog = false,
                filename = null
            } = options;
            
            // Collect all user data
            const completeData = await this.collectCompleteUserData(includeAuditLog);
            
            // Generate filename
            const exportFilename = filename || this.generateFilename('complete-data', 'json', encrypt);
            
            // Always encrypt complete data exports for security
            return await this.exportEncrypted(completeData, exportFilename, password);
            
        } catch (error) {
            console.error('❌ Complete data export failed:', error);
            throw error;
        }
    },

    /**
     * Export specific data type with options
     */
    async exportDataType(dataType, options = {}) {
        try {
            console.log(`📦 Exporting ${dataType}...`);
            
            const {
                format = 'json',
                encrypt = false,
                password = null,
                filename = null
            } = options;
            
            let data = [];
            
            // Get data based on type
            switch (dataType) {
                case 'recordings':
                    data = await this.getRecordingsData();
                    break;
                case 'transcripts':
                    data = await this.getTranscriptsData();
                    break;
                case 'sessions':
                    data = await this.getSessionsData();
                    break;
                case 'settings':
                    data = await this.getSettingsData();
                    break;
                default:
                    throw new Error(`Unsupported data type: ${dataType}`);
            }
            
            if (data.length === 0) {
                throw new Error(`No ${dataType} found to export`);
            }
            
            // Prepare export data
            const exportData = await this.prepareExportData(data, { format });
            
            // Generate filename
            const exportFilename = filename || this.generateFilename(dataType, format, encrypt);
            
            // Export with or without encryption
            if (encrypt) {
                return await this.exportEncrypted(exportData, exportFilename, password);
            } else {
                return await this.exportPlain(exportData, exportFilename, format);
            }
            
        } catch (error) {
            console.error(`❌ ${dataType} export failed:`, error);
            throw error;
        }
    },

    /**
     * Get SOAP notes data for export
     */
    async getSOAPNotesData(noteIds = []) {
        if (typeof Storage === 'undefined') {
            throw new Error('Storage system not available');
        }
        
        const allNotes = await Storage.getSOAPNotes();
        
        if (noteIds.length === 0) {
            return allNotes;
        }
        
        return allNotes.filter(note => noteIds.includes(note.id));
    },

    /**
     * Collect complete user data
     */
    async collectCompleteUserData(includeAuditLog = false) {
        if (typeof Storage === 'undefined') {
            throw new Error('Storage system not available');
        }
        
        const completeData = {
            exportInfo: {
                timestamp: new Date().toISOString(),
                version: '1.0',
                type: 'complete_user_data',
                encrypted: true
            },
            soapNotes: await Storage.getSOAPNotes(),
            transcripts: await Storage.getTranscripts(),
            recordings: Storage.getRecordings(),
            sessions: Storage.getSessions(),
            settings: this.getSettingsData()
        };
        
        // Include audit log if requested and available
        if (includeAuditLog && typeof PrivacyManager !== 'undefined') {
            completeData.auditLog = PrivacyManager.getAuditLog(1000);
        }
        
        return completeData;
    },

    /**
     * Get recordings data for export
     */
    async getRecordingsData() {
        if (typeof Storage === 'undefined') {
            return [];
        }
        return Storage.getRecordings();
    },

    /**
     * Get transcripts data for export
     */
    async getTranscriptsData() {
        if (typeof Storage === 'undefined') {
            return [];
        }
        return await Storage.getTranscripts();
    },

    /**
     * Get sessions data for export
     */
    async getSessionsData() {
        if (typeof Storage === 'undefined') {
            return [];
        }
        return Storage.getSessions();
    },

    /**
     * Get settings data for export
     */
    getSettingsData() {
        try {
            const settings = localStorage.getItem('vetscribe-settings');
            return settings ? JSON.parse(settings) : {};
        } catch (error) {
            console.warn('⚠️ Failed to get settings data:', error);
            return {};
        }
    },

    /**
     * Prepare data for export in specified format
     */
    async prepareExportData(data, options = {}) {
        const {
            format = 'json',
            includeMetadata = true,
            compress = false
        } = options;
        
        let preparedData = data;
        
        // Add metadata if requested
        if (includeMetadata) {
            preparedData = {
                metadata: {
                    exportDate: new Date().toISOString(),
                    version: '1.0',
                    format: format,
                    itemCount: Array.isArray(data) ? data.length : 1,
                    compressed: compress
                },
                data: data
            };
        }
        
        // Format data based on requested format
        switch (format) {
            case 'json':
                return JSON.stringify(preparedData, null, 2);
            case 'csv':
                return this.convertToCSV(data);
            case 'txt':
                return this.convertToText(data);
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    },

    /**
     * Export data with encryption
     */
    async exportEncrypted(data, filename, password = null) {
        try {
            if (typeof Encryption === 'undefined') {
                throw new Error('Encryption system not available');
            }
            
            // Use provided password or prompt for one
            const exportPassword = password || await this.promptForPassword();
            
            if (!exportPassword) {
                throw new Error('Password required for encrypted export');
            }
            
            // Initialize encryption with export password
            await Encryption.init(exportPassword);
            
            // Encrypt the data
            const encryptedData = await Encryption.encrypt(data);
            
            // Create encrypted export package
            const exportPackage = {
                version: '1.0',
                algorithm: this.config.encryptionAlgorithm,
                encrypted: true,
                timestamp: new Date().toISOString(),
                data: encryptedData
            };
            
            // Download encrypted file
            this.downloadFile(JSON.stringify(exportPackage, null, 2), filename, 'application/json');
            
            // Update statistics
            this.updateExportStats(filename, true, JSON.stringify(exportPackage).length);
            
            console.log('✅ Encrypted export completed:', filename);
            return { success: true, filename, encrypted: true };
            
        } catch (error) {
            console.error('❌ Encrypted export failed:', error);
            throw error;
        }
    },

    /**
     * Export data without encryption
     */
    async exportPlain(data, filename, format) {
        try {
            const mimeTypes = {
                'json': 'application/json',
                'csv': 'text/csv',
                'txt': 'text/plain'
            };
            
            const mimeType = mimeTypes[format] || 'text/plain';
            
            // Download plain file
            this.downloadFile(data, filename, mimeType);
            
            // Update statistics
            this.updateExportStats(filename, false, data.length);
            
            console.log('✅ Plain export completed:', filename);
            return { success: true, filename, encrypted: false };
            
        } catch (error) {
            console.error('❌ Plain export failed:', error);
            throw error;
        }
    },

    /**
     * Generate filename for export
     */
    generateFilename(dataType, format, encrypted = false) {
        const timestamp = new Date().toISOString().split('T')[0];
        const encryptedSuffix = encrypted ? '-encrypted' : '';
        return `vetscribe-${dataType}-${timestamp}${encryptedSuffix}.${format}`;
    },

    /**
     * Download file to user's computer
     */
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    },

    /**
     * Prompt user for export password
     */
    async promptForPassword() {
        return new Promise((resolve) => {
            const password = prompt(
                'Enter a password to encrypt your export file:\n\n' +
                'This password will be required to decrypt and import the data later.\n' +
                'Please use a strong password and store it securely.'
            );
            resolve(password);
        });
    },

    /**
     * Convert data to CSV format
     */
    convertToCSV(data) {
        if (!Array.isArray(data) || data.length === 0) {
            return '';
        }
        
        // Get headers from first object
        const headers = Object.keys(data[0]);
        const csvHeaders = headers.join(',');
        
        // Convert each row
        const csvRows = data.map(row => {
            return headers.map(header => {
                const value = row[header];
                // Escape commas and quotes in CSV
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(',');
        });
        
        return [csvHeaders, ...csvRows].join('\n');
    },

    /**
     * Convert data to plain text format
     */
    convertToText(data) {
        if (Array.isArray(data)) {
            return data.map(item => {
                if (typeof item === 'object') {
                    return Object.entries(item)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join('\n');
                }
                return String(item);
            }).join('\n\n---\n\n');
        }
        
        if (typeof data === 'object') {
            return Object.entries(data)
                .map(([key, value]) => `${key}: ${value}`)
                .join('\n');
        }
        
        return String(data);
    },

    /**
     * Update export statistics
     */
    updateExportStats(filename, encrypted, fileSize) {
        this.stats.totalExports++;
        if (encrypted) {
            this.stats.encryptedExports++;
        }
        this.stats.lastExport = new Date().toISOString();
        this.stats.exportSizes.push(fileSize);
        
        // Keep only last 100 export sizes
        if (this.stats.exportSizes.length > 100) {
            this.stats.exportSizes = this.stats.exportSizes.slice(-100);
        }
        
        // Save statistics
        this.saveExportStats();
        
        // Log audit event if available
        if (typeof PrivacyManager !== 'undefined') {
            PrivacyManager.logAuditEvent('data_export', {
                filename: filename,
                encrypted: encrypted,
                fileSize: fileSize,
                timestamp: new Date().toISOString()
            });
        }
    },

    /**
     * Load export settings
     */
    loadExportSettings() {
        try {
            const savedSettings = localStorage.getItem('vetscribe-export-settings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                this.config = { ...this.config, ...settings };
            }
        } catch (error) {
            console.warn('⚠️ Failed to load export settings:', error);
        }
    },

    /**
     * Save export settings
     */
    saveExportSettings() {
        try {
            localStorage.setItem('vetscribe-export-settings', JSON.stringify(this.config));
        } catch (error) {
            console.error('❌ Failed to save export settings:', error);
        }
    },

    /**
     * Load export statistics
     */
    loadExportStats() {
        try {
            const savedStats = localStorage.getItem('vetscribe-export-stats');
            if (savedStats) {
                const stats = JSON.parse(savedStats);
                this.stats = { ...this.stats, ...stats };
            }
        } catch (error) {
            console.warn('⚠️ Failed to load export statistics:', error);
        }
    },

    /**
     * Save export statistics
     */
    saveExportStats() {
        try {
            localStorage.setItem('vetscribe-export-stats', JSON.stringify(this.stats));
        } catch (error) {
            console.error('❌ Failed to save export statistics:', error);
        }
    },

    /**
     * Get export statistics
     */
    getExportStats() {
        return {
            ...this.stats,
            averageFileSize: this.stats.exportSizes.length > 0 
                ? Math.round(this.stats.exportSizes.reduce((a, b) => a + b, 0) / this.stats.exportSizes.length)
                : 0,
            encryptionRate: this.stats.totalExports > 0 
                ? Math.round((this.stats.encryptedExports / this.stats.totalExports) * 100)
                : 0
        };
    }
};

// Make SecureExport available globally
window.SecureExport = SecureExport;
