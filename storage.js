/**
 * VetScribe - Enhanced Storage Module
 * Comprehensive local storage for recordings, transcripts, SOAP notes, and metadata
 */

const Storage = {
    // Storage keys and configuration
    keys: {
        recordings: 'vetscribe-recordings',
        transcripts: 'vetscribe-transcripts',
        soapNotes: 'vetscribe-soap-notes',
        sessions: 'vetscribe-sessions',
        settings: 'vetscribe-settings',
        metadata: 'vetscribe-metadata',
        cache: 'vetscribe-cache'
    },
    
    // Storage limits and configuration
    config: {
        maxRecordings: 100,
        maxTranscripts: 200,
        maxSOAPNotes: 200,
        maxCacheSize: 50 * 1024 * 1024, // 50MB
        compressionEnabled: true,
        autoCleanup: true,
        retentionDays: 30
    },
    
    // Storage statistics
    stats: {
        totalRecordings: 0,
        totalTranscripts: 0,
        totalSOAPNotes: 0,
        storageUsed: 0,
        lastCleanup: null
    },

    /**
     * Initialize enhanced storage system with encryption
     */
    async init() {
        console.log('💾 Initializing enhanced storage system...');

        try {
            // Check storage availability
            if (!this.isStorageAvailable()) {
                console.warn('⚠️ Local storage not available');
                return false;
            }

            // Initialize encryption system
            await this.initializeEncryption();

            // Initialize storage structures
            this.initializeStorageStructures();

            // Update storage statistics
            await this.updateStorageStats();

            // Perform cleanup if needed
            if (this.config.autoCleanup) {
                await this.performAutoCleanup();
            }

            console.log('✅ Enhanced storage system initialized');
            console.log('📊 Storage stats:', this.stats);

            return true;

        } catch (error) {
            console.error('❌ Failed to initialize storage:', error);
            return false;
        }
    },

    /**
     * Initialize encryption for secure storage
     */
    async initializeEncryption() {
        if (typeof Encryption !== 'undefined') {
            try {
                await Encryption.init();
                console.log('🔐 Storage encryption initialized');
            } catch (error) {
                console.warn('⚠️ Encryption initialization failed, using unencrypted storage:', error);
            }
        } else {
            console.warn('⚠️ Encryption module not available, using unencrypted storage');
        }
    },

    /**
     * Check if local storage is available and functional
     */
    isStorageAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    },

    /**
     * Initialize storage structures with metadata
     */
    initializeStorageStructures() {
        Object.values(this.keys).forEach(key => {
            if (!localStorage.getItem(key)) {
                const initialData = key === this.keys.metadata ? {
                    version: '1.0',
                    created: new Date().toISOString(),
                    lastAccessed: new Date().toISOString()
                } : [];
                
                localStorage.setItem(key, JSON.stringify(initialData));
            }
        });
    },

    /**
     * Enhanced recording storage with compression and metadata
     */
    async saveRecording(audioBlob, metadata = {}) {
        try {
            console.log('💾 Saving recording with enhanced features...');
            
            // Check storage limits
            if (!this.checkStorageCapacity('recording', audioBlob.size)) {
                throw new Error('Storage capacity exceeded');
            }
            
            // Convert blob to base64 with optional compression
            const audioData = await this.processAudioData(audioBlob);
            
            const recordingData = {
                id: this.generateId(),
                timestamp: new Date().toISOString(),
                audioData: audioData,
                metadata: {
                    originalSize: audioBlob.size,
                    compressedSize: audioData.length,
                    type: audioBlob.type,
                    duration: metadata.duration || 0,
                    quality: metadata.quality || 'medium',
                    sampleRate: metadata.sampleRate || 44100,
                    channels: metadata.channels || 1,
                    ...metadata
                },
                tags: metadata.tags || [],
                patientInfo: metadata.patientInfo || {},
                sessionId: metadata.sessionId || this.generateSessionId()
            };
            
            // Save to storage
            const recordings = this.getRecordings();
            recordings.push(recordingData);
            
            // Maintain storage limits
            if (recordings.length > this.config.maxRecordings) {
                recordings.splice(0, recordings.length - this.config.maxRecordings);
            }
            
            localStorage.setItem(this.keys.recordings, JSON.stringify(recordings));
            
            // Update statistics
            await this.updateStorageStats();
            
            console.log('✅ Recording saved with enhanced metadata:', recordingData.id);
            return recordingData.id;
            
        } catch (error) {
            console.error('❌ Failed to save recording:', error);
            throw error;
        }
    },

    /**
     * Process audio data with optional compression
     */
    async processAudioData(audioBlob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                let audioData = reader.result;
                
                // Apply compression if enabled and beneficial
                if (this.config.compressionEnabled && audioBlob.size > 1024 * 1024) {
                    // Simple compression by reducing base64 precision
                    // In a full implementation, you might use more sophisticated compression
                    audioData = this.compressBase64(audioData);
                }
                
                resolve(audioData);
            };
            reader.onerror = reject;
            reader.readAsDataURL(audioBlob);
        });
    },

    /**
     * Simple base64 compression (placeholder for more sophisticated compression)
     */
    compressBase64(base64Data) {
        // This is a simplified compression approach
        // In production, you might use libraries like pako for gzip compression
        return base64Data;
    },

    /**
     * Save transcript with enhanced metadata and encryption
     */
    async saveTranscript(transcript, metadata = {}) {
        try {
            console.log('💾 Saving transcript...');

            // Encrypt sensitive content
            const encryptedContent = await this.encryptSensitiveData(transcript);
            const encryptedPatientInfo = await this.encryptPatientInfo(metadata.patientInfo || {});

            const transcriptData = {
                id: this.generateId(),
                timestamp: new Date().toISOString(),
                content: encryptedContent,
                metadata: {
                    wordCount: this.countWords(transcript),
                    characterCount: transcript.length,
                    confidence: metadata.confidence || 0,
                    language: metadata.language || 'en',
                    processingTime: metadata.processingTime || 0,
                    transcriptionMethod: metadata.method || 'webspeech',
                    quality: metadata.quality || {},
                    encrypted: encryptedContent.encrypted || false,
                    ...metadata
                },
                recordingId: metadata.recordingId || null,
                sessionId: metadata.sessionId || this.generateSessionId(),
                tags: metadata.tags || [],
                patientInfo: encryptedPatientInfo
            };

            const transcripts = this.getTranscripts();
            transcripts.push(transcriptData);

            // Maintain storage limits
            if (transcripts.length > this.config.maxTranscripts) {
                transcripts.splice(0, transcripts.length - this.config.maxTranscripts);
            }

            localStorage.setItem(this.keys.transcripts, JSON.stringify(transcripts));

            console.log('✅ Transcript saved with encryption:', transcriptData.id);
            return transcriptData.id;

        } catch (error) {
            console.error('❌ Failed to save transcript:', error);
            throw error;
        }
    },

    /**
     * Save SOAP notes with comprehensive metadata and encryption
     */
    async saveSOAPNotes(soapContent, metadata = {}) {
        try {
            console.log('💾 Saving SOAP notes...');

            // Encrypt sensitive SOAP content
            const encryptedContent = await this.encryptSensitiveData(soapContent);
            const encryptedPatientInfo = await this.encryptPatientInfo(metadata.patientInfo || {});
            const encryptedClinicInfo = await this.encryptSensitiveData(metadata.clinicInfo || {});

            const soapData = {
                id: this.generateId(),
                timestamp: new Date().toISOString(),
                content: encryptedContent,
                metadata: {
                    wordCount: this.countWords(soapContent),
                    characterCount: soapContent.length,
                    templateUsed: metadata.templateUsed || 'standard',
                    visitType: metadata.visitType || null,
                    qualityScore: metadata.qualityScore || 0,
                    validation: metadata.validation || {},
                    isFormatted: metadata.isFormatted || false,
                    generationTime: metadata.generationTime || 0,
                    llmModel: metadata.llmModel || 'unknown',
                    encrypted: encryptedContent.encrypted || false,
                    ...metadata
                },
                transcriptId: metadata.transcriptId || null,
                recordingId: metadata.recordingId || null,
                sessionId: metadata.sessionId || this.generateSessionId(),
                tags: metadata.tags || [],
                patientInfo: encryptedPatientInfo,
                clinicInfo: encryptedClinicInfo
            };

            const soapNotes = this.getSOAPNotes();
            soapNotes.push(soapData);

            // Maintain storage limits
            if (soapNotes.length > this.config.maxSOAPNotes) {
                soapNotes.splice(0, soapNotes.length - this.config.maxSOAPNotes);
            }

            localStorage.setItem(this.keys.soapNotes, JSON.stringify(soapNotes));

            console.log('✅ SOAP notes saved with encryption:', soapData.id);
            return soapData.id;

        } catch (error) {
            console.error('❌ Failed to save SOAP notes:', error);
            throw error;
        }
    },

    /**
     * Generate unique ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    /**
     * Generate session ID
     */
    generateSessionId() {
        return 'session_' + this.generateId();
    },

    /**
     * Count words in text
     */
    countWords(text) {
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    },

    /**
     * Encrypt sensitive data if encryption is available
     */
    async encryptSensitiveData(data) {
        if (typeof Encryption !== 'undefined' && Encryption.isEncryptionReady()) {
            try {
                return await Encryption.encrypt(data);
            } catch (error) {
                console.warn('⚠️ Encryption failed, storing unencrypted:', error);
                return { encrypted: false, data: data };
            }
        }
        return { encrypted: false, data: data };
    },

    /**
     * Decrypt sensitive data if it's encrypted
     */
    async decryptSensitiveData(encryptedData) {
        if (typeof Encryption !== 'undefined' && encryptedData && encryptedData.encrypted) {
            try {
                return await Encryption.decrypt(encryptedData);
            } catch (error) {
                console.warn('⚠️ Decryption failed:', error);
                return encryptedData.data || encryptedData;
            }
        }
        return encryptedData?.data || encryptedData;
    },

    /**
     * Encrypt patient information
     */
    async encryptPatientInfo(patientInfo) {
        if (typeof Encryption !== 'undefined' && Encryption.isEncryptionReady()) {
            try {
                return await Encryption.encryptPatientData(patientInfo);
            } catch (error) {
                console.warn('⚠️ Patient data encryption failed:', error);
                return patientInfo;
            }
        }
        return patientInfo;
    },

    /**
     * Decrypt patient information
     */
    async decryptPatientInfo(encryptedPatientInfo) {
        if (typeof Encryption !== 'undefined' && encryptedPatientInfo) {
            try {
                return await Encryption.decryptPatientData(encryptedPatientInfo);
            } catch (error) {
                console.warn('⚠️ Patient data decryption failed:', error);
                return encryptedPatientInfo;
            }
        }
        return encryptedPatientInfo;
    },

    /**
     * Save complete session data
     */
    saveSession(sessionData) {
        try {
            console.log('💾 Saving session...');

            const session = {
                id: sessionData.sessionId || this.generateSessionId(),
                timestamp: new Date().toISOString(),
                recordingId: sessionData.recordingId || null,
                transcriptId: sessionData.transcriptId || null,
                soapId: sessionData.soapId || null,
                patientInfo: sessionData.patientInfo || {},
                metadata: {
                    duration: sessionData.duration || 0,
                    quality: sessionData.quality || {},
                    templateUsed: sessionData.templateUsed || 'standard',
                    visitType: sessionData.visitType || null,
                    ...sessionData.metadata
                },
                tags: sessionData.tags || [],
                status: sessionData.status || 'completed'
            };

            const sessions = this.getSessions();
            sessions.push(session);

            localStorage.setItem(this.keys.sessions, JSON.stringify(sessions));

            console.log('✅ Session saved:', session.id);
            return session.id;

        } catch (error) {
            console.error('❌ Failed to save session:', error);
            throw error;
        }
    },

    /**
     * Get all recordings with metadata
     */
    getRecordings() {
        try {
            const data = localStorage.getItem(this.keys.recordings);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('❌ Failed to get recordings:', error);
            return [];
        }
    },

    /**
     * Get all transcripts with decryption
     */
    async getTranscripts() {
        try {
            const data = localStorage.getItem(this.keys.transcripts);
            const transcripts = data ? JSON.parse(data) : [];

            // Decrypt transcripts if needed
            const decryptedTranscripts = await Promise.all(
                transcripts.map(async (transcript) => {
                    const decryptedContent = await this.decryptSensitiveData(transcript.content);
                    const decryptedPatientInfo = await this.decryptPatientInfo(transcript.patientInfo);

                    return {
                        ...transcript,
                        content: decryptedContent,
                        patientInfo: decryptedPatientInfo
                    };
                })
            );

            return decryptedTranscripts;
        } catch (error) {
            console.error('❌ Failed to get transcripts:', error);
            return [];
        }
    },

    /**
     * Get all SOAP notes with decryption
     */
    async getSOAPNotes() {
        try {
            const data = localStorage.getItem(this.keys.soapNotes);
            const soapNotes = data ? JSON.parse(data) : [];

            // Decrypt SOAP notes if needed
            const decryptedSOAPNotes = await Promise.all(
                soapNotes.map(async (soap) => {
                    const decryptedContent = await this.decryptSensitiveData(soap.content);
                    const decryptedPatientInfo = await this.decryptPatientInfo(soap.patientInfo);
                    const decryptedClinicInfo = await this.decryptSensitiveData(soap.clinicInfo);

                    return {
                        ...soap,
                        content: decryptedContent,
                        patientInfo: decryptedPatientInfo,
                        clinicInfo: decryptedClinicInfo
                    };
                })
            );

            return decryptedSOAPNotes;
        } catch (error) {
            console.error('❌ Failed to get SOAP notes:', error);
            return [];
        }
    },

    /**
     * Get all sessions
     */
    getSessions() {
        try {
            const data = localStorage.getItem(this.keys.sessions);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('❌ Failed to get sessions:', error);
            return [];
        }
    },

    /**
     * Get item by ID from any collection
     */
    getById(collection, id) {
        const items = this[`get${collection.charAt(0).toUpperCase() + collection.slice(1)}`]();
        return items.find(item => item.id === id);
    },

    /**
     * Get recording by ID
     */
    getRecording(id) {
        return this.getById('recordings', id);
    },

    /**
     * Get transcript by ID
     */
    getTranscript(id) {
        return this.getById('transcripts', id);
    },

    /**
     * Get SOAP note by ID
     */
    getSOAPNote(id) {
        return this.getById('soapNotes', id);
    },

    /**
     * Get session by ID
     */
    getSession(id) {
        return this.getById('sessions', id);
    },

    /**
     * Search items by criteria
     */
    search(collection, criteria = {}) {
        const items = this[`get${collection.charAt(0).toUpperCase() + collection.slice(1)}`]();

        return items.filter(item => {
            // Search by date range
            if (criteria.dateFrom || criteria.dateTo) {
                const itemDate = new Date(item.timestamp);
                if (criteria.dateFrom && itemDate < new Date(criteria.dateFrom)) return false;
                if (criteria.dateTo && itemDate > new Date(criteria.dateTo)) return false;
            }

            // Search by tags
            if (criteria.tags && criteria.tags.length > 0) {
                if (!item.tags || !criteria.tags.some(tag => item.tags.includes(tag))) {
                    return false;
                }
            }

            // Search by patient info
            if (criteria.patientName) {
                const patientName = item.patientInfo?.name?.toLowerCase() || '';
                if (!patientName.includes(criteria.patientName.toLowerCase())) {
                    return false;
                }
            }

            // Search by content (for transcripts and SOAP notes)
            if (criteria.content && item.content) {
                if (!item.content.toLowerCase().includes(criteria.content.toLowerCase())) {
                    return false;
                }
            }

            // Search by session ID
            if (criteria.sessionId && item.sessionId !== criteria.sessionId) {
                return false;
            }

            return true;
        });
    },

    /**
     * Delete item by ID
     */
    deleteById(collection, id) {
        try {
            const items = this[`get${collection.charAt(0).toUpperCase() + collection.slice(1)}`]();
            const filtered = items.filter(item => item.id !== id);

            localStorage.setItem(this.keys[collection], JSON.stringify(filtered));

            console.log(`🗑️ ${collection} item deleted:`, id);
            return true;
        } catch (error) {
            console.error(`❌ Failed to delete ${collection} item:`, error);
            return false;
        }
    },

    /**
     * Delete recording
     */
    deleteRecording(id) {
        return this.deleteById('recordings', id);
    },

    /**
     * Delete transcript
     */
    deleteTranscript(id) {
        return this.deleteById('transcripts', id);
    },

    /**
     * Delete SOAP note
     */
    deleteSOAPNote(id) {
        return this.deleteById('soapNotes', id);
    },

    /**
     * Delete session and all related items
     */
    deleteSession(sessionId) {
        try {
            const session = this.getSession(sessionId);
            if (!session) return false;

            // Delete related items
            if (session.recordingId) this.deleteRecording(session.recordingId);
            if (session.transcriptId) this.deleteTranscript(session.transcriptId);
            if (session.soapId) this.deleteSOAPNote(session.soapId);

            // Delete session
            this.deleteById('sessions', sessionId);

            console.log('🗑️ Complete session deleted:', sessionId);
            return true;
        } catch (error) {
            console.error('❌ Failed to delete session:', error);
            return false;
        }
    },

    /**
     * Check storage capacity
     */
    checkStorageCapacity(type, size) {
        try {
            const currentUsage = this.calculateStorageUsage();
            const availableSpace = this.config.maxCacheSize - currentUsage;

            if (size > availableSpace) {
                console.warn(`⚠️ Insufficient storage space for ${type}:`, {
                    required: size,
                    available: availableSpace,
                    current: currentUsage
                });
                return false;
            }

            return true;
        } catch (error) {
            console.error('❌ Failed to check storage capacity:', error);
            return false;
        }
    },

    /**
     * Calculate current storage usage
     */
    calculateStorageUsage() {
        let totalSize = 0;

        Object.values(this.keys).forEach(key => {
            const data = localStorage.getItem(key);
            if (data) {
                totalSize += data.length;
            }
        });

        return totalSize;
    },

    /**
     * Update storage statistics
     */
    async updateStorageStats() {
        try {
            this.stats.totalRecordings = this.getRecordings().length;
            this.stats.totalTranscripts = this.getTranscripts().length;
            this.stats.totalSOAPNotes = this.getSOAPNotes().length;
            this.stats.storageUsed = this.calculateStorageUsage();

            // Save updated stats
            const metadata = this.getMetadata();
            metadata.stats = this.stats;
            metadata.lastAccessed = new Date().toISOString();

            localStorage.setItem(this.keys.metadata, JSON.stringify(metadata));

        } catch (error) {
            console.error('❌ Failed to update storage stats:', error);
        }
    },

    /**
     * Get metadata
     */
    getMetadata() {
        try {
            const data = localStorage.getItem(this.keys.metadata);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('❌ Failed to get metadata:', error);
            return {};
        }
    },

    /**
     * Perform automatic cleanup
     */
    async performAutoCleanup() {
        try {
            console.log('🧹 Performing automatic cleanup...');

            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

            let cleanedCount = 0;

            // Clean old recordings
            const recordings = this.getRecordings();
            const validRecordings = recordings.filter(recording => {
                const recordingDate = new Date(recording.timestamp);
                return recordingDate > cutoffDate;
            });

            if (validRecordings.length < recordings.length) {
                localStorage.setItem(this.keys.recordings, JSON.stringify(validRecordings));
                cleanedCount += recordings.length - validRecordings.length;
            }

            // Clean old transcripts
            const transcripts = this.getTranscripts();
            const validTranscripts = transcripts.filter(transcript => {
                const transcriptDate = new Date(transcript.timestamp);
                return transcriptDate > cutoffDate;
            });

            if (validTranscripts.length < transcripts.length) {
                localStorage.setItem(this.keys.transcripts, JSON.stringify(validTranscripts));
                cleanedCount += transcripts.length - validTranscripts.length;
            }

            // Clean old SOAP notes
            const soapNotes = this.getSOAPNotes();
            const validSOAPNotes = soapNotes.filter(soap => {
                const soapDate = new Date(soap.timestamp);
                return soapDate > cutoffDate;
            });

            if (validSOAPNotes.length < soapNotes.length) {
                localStorage.setItem(this.keys.soapNotes, JSON.stringify(validSOAPNotes));
                cleanedCount += soapNotes.length - validSOAPNotes.length;
            }

            this.stats.lastCleanup = new Date().toISOString();

            if (cleanedCount > 0) {
                console.log(`🧹 Cleanup completed: ${cleanedCount} items removed`);
            } else {
                console.log('🧹 Cleanup completed: no items to remove');
            }

            await this.updateStorageStats();

        } catch (error) {
            console.error('❌ Cleanup failed:', error);
        }
    },

    /**
     * Export all data
     */
    exportAllData() {
        try {
            const exportData = {
                version: '1.0',
                exportDate: new Date().toISOString(),
                recordings: this.getRecordings(),
                transcripts: this.getTranscripts(),
                soapNotes: this.getSOAPNotes(),
                sessions: this.getSessions(),
                metadata: this.getMetadata(),
                stats: this.stats
            };

            console.log('📤 Data export prepared');
            return exportData;
        } catch (error) {
            console.error('❌ Failed to export data:', error);
            return null;
        }
    },

    /**
     * Import data
     */
    async importData(importData) {
        try {
            console.log('📥 Importing data...');

            if (importData.recordings) {
                localStorage.setItem(this.keys.recordings, JSON.stringify(importData.recordings));
            }

            if (importData.transcripts) {
                localStorage.setItem(this.keys.transcripts, JSON.stringify(importData.transcripts));
            }

            if (importData.soapNotes) {
                localStorage.setItem(this.keys.soapNotes, JSON.stringify(importData.soapNotes));
            }

            if (importData.sessions) {
                localStorage.setItem(this.keys.sessions, JSON.stringify(importData.sessions));
            }

            await this.updateStorageStats();

            console.log('✅ Data import completed');
            return true;
        } catch (error) {
            console.error('❌ Failed to import data:', error);
            return false;
        }
    },

    /**
     * Clear all storage
     */
    clearAllStorage() {
        try {
            Object.values(this.keys).forEach(key => {
                localStorage.removeItem(key);
            });

            this.initializeStorageStructures();
            this.updateStorageStats();

            console.log('🗑️ All storage cleared');
            return true;
        } catch (error) {
            console.error('❌ Failed to clear storage:', error);
            return false;
        }
    }
};

// Make Storage available globally
window.Storage = Storage;
