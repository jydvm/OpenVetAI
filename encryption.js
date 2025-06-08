/**
 * VetScribe - Client-Side Encryption Module
 * Professional-grade encryption for veterinary patient data protection
 * Ensures HIPAA-level security for sensitive medical information
 */

const Encryption = {
    // Encryption configuration
    config: {
        algorithm: 'AES-GCM',
        keyLength: 256,
        ivLength: 12,
        tagLength: 16,
        iterations: 100000, // PBKDF2 iterations
        saltLength: 16,
        keyDerivation: 'PBKDF2'
    },
    
    // Encryption state
    state: {
        masterKey: null,
        isInitialized: false,
        encryptionEnabled: true,
        keyVersion: 1
    },
    
    // Error messages
    errors: {
        NOT_INITIALIZED: 'Encryption system not initialized',
        INVALID_KEY: 'Invalid encryption key',
        DECRYPTION_FAILED: 'Failed to decrypt data',
        ENCRYPTION_FAILED: 'Failed to encrypt data',
        BROWSER_NOT_SUPPORTED: 'Browser does not support required encryption features'
    },

    /**
     * Initialize encryption system
     */
    async init(userPassword = null) {
        try {
            console.log('🔐 Initializing encryption system...');
            
            // Check browser support
            if (!this.checkBrowserSupport()) {
                throw new Error(this.errors.BROWSER_NOT_SUPPORTED);
            }
            
            // Initialize or derive master key
            if (userPassword) {
                await this.initializeWithPassword(userPassword);
            } else {
                await this.initializeWithGeneratedKey();
            }
            
            this.state.isInitialized = true;
            console.log('✅ Encryption system initialized successfully');
            
            return true;
            
        } catch (error) {
            console.error('❌ Failed to initialize encryption:', error);
            this.state.isInitialized = false;
            throw error;
        }
    },

    /**
     * Check if browser supports required encryption features
     */
    checkBrowserSupport() {
        return (
            typeof crypto !== 'undefined' &&
            typeof crypto.subtle !== 'undefined' &&
            typeof crypto.getRandomValues !== 'undefined'
        );
    },

    /**
     * Initialize encryption with user-provided password
     */
    async initializeWithPassword(password) {
        console.log('🔑 Initializing with user password...');
        
        // Check if we have a stored salt
        let salt = this.getStoredSalt();
        if (!salt) {
            salt = crypto.getRandomValues(new Uint8Array(this.config.saltLength));
            this.storeSalt(salt);
        }
        
        // Derive key from password
        this.state.masterKey = await this.deriveKeyFromPassword(password, salt);
        
        console.log('✅ Master key derived from password');
    },

    /**
     * Initialize encryption with generated key (for automatic encryption)
     */
    async initializeWithGeneratedKey() {
        console.log('🔑 Initializing with generated key...');
        
        // Check if we have a stored key
        let storedKey = this.getStoredKey();
        if (storedKey) {
            this.state.masterKey = await this.importKey(storedKey);
        } else {
            // Generate new key
            this.state.masterKey = await this.generateKey();
            await this.storeKey(this.state.masterKey);
        }
        
        console.log('✅ Master key initialized');
    },

    /**
     * Generate a new encryption key
     */
    async generateKey() {
        return await crypto.subtle.generateKey(
            {
                name: this.config.algorithm,
                length: this.config.keyLength
            },
            true, // extractable
            ['encrypt', 'decrypt']
        );
    },

    /**
     * Derive key from password using PBKDF2
     */
    async deriveKeyFromPassword(password, salt) {
        // Import password as key material
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            new TextEncoder().encode(password),
            'PBKDF2',
            false,
            ['deriveBits', 'deriveKey']
        );
        
        // Derive key
        return await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: this.config.iterations,
                hash: 'SHA-256'
            },
            keyMaterial,
            {
                name: this.config.algorithm,
                length: this.config.keyLength
            },
            true,
            ['encrypt', 'decrypt']
        );
    },

    /**
     * Encrypt data
     */
    async encrypt(data) {
        try {
            if (!this.state.isInitialized || !this.state.masterKey) {
                throw new Error(this.errors.NOT_INITIALIZED);
            }
            
            if (!this.state.encryptionEnabled) {
                return { encrypted: false, data: data };
            }
            
            // Convert data to string if necessary
            const plaintext = typeof data === 'string' ? data : JSON.stringify(data);
            const plaintextBytes = new TextEncoder().encode(plaintext);
            
            // Generate random IV
            const iv = crypto.getRandomValues(new Uint8Array(this.config.ivLength));
            
            // Encrypt data
            const encryptedBuffer = await crypto.subtle.encrypt(
                {
                    name: this.config.algorithm,
                    iv: iv
                },
                this.state.masterKey,
                plaintextBytes
            );
            
            // Combine IV and encrypted data
            const encryptedData = new Uint8Array(iv.length + encryptedBuffer.byteLength);
            encryptedData.set(iv);
            encryptedData.set(new Uint8Array(encryptedBuffer), iv.length);
            
            // Convert to base64 for storage
            const base64Data = this.arrayBufferToBase64(encryptedData);
            
            return {
                encrypted: true,
                data: base64Data,
                version: this.state.keyVersion,
                algorithm: this.config.algorithm,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('❌ Encryption failed:', error);
            throw new Error(this.errors.ENCRYPTION_FAILED + ': ' + error.message);
        }
    },

    /**
     * Decrypt data
     */
    async decrypt(encryptedData) {
        try {
            if (!this.state.isInitialized || !this.state.masterKey) {
                throw new Error(this.errors.NOT_INITIALIZED);
            }
            
            // Handle unencrypted data
            if (typeof encryptedData === 'string' || !encryptedData.encrypted) {
                return encryptedData.data || encryptedData;
            }
            
            // Convert from base64
            const encryptedBytes = this.base64ToArrayBuffer(encryptedData.data);
            
            // Extract IV and encrypted data
            const iv = encryptedBytes.slice(0, this.config.ivLength);
            const ciphertext = encryptedBytes.slice(this.config.ivLength);
            
            // Decrypt data
            const decryptedBuffer = await crypto.subtle.decrypt(
                {
                    name: this.config.algorithm,
                    iv: iv
                },
                this.state.masterKey,
                ciphertext
            );
            
            // Convert back to string
            const decryptedText = new TextDecoder().decode(decryptedBuffer);
            
            // Try to parse as JSON, fallback to string
            try {
                return JSON.parse(decryptedText);
            } catch {
                return decryptedText;
            }
            
        } catch (error) {
            console.error('❌ Decryption failed:', error);
            throw new Error(this.errors.DECRYPTION_FAILED + ': ' + error.message);
        }
    },

    /**
     * Encrypt sensitive patient data
     */
    async encryptPatientData(patientData) {
        console.log('🔐 Encrypting patient data...');
        
        // Identify sensitive fields
        const sensitiveFields = [
            'name', 'owner', 'address', 'phone', 'email',
            'medicalHistory', 'notes', 'diagnosis'
        ];
        
        const encryptedData = { ...patientData };
        
        // Encrypt sensitive fields
        for (const field of sensitiveFields) {
            if (patientData[field]) {
                encryptedData[field] = await this.encrypt(patientData[field]);
            }
        }
        
        return encryptedData;
    },

    /**
     * Decrypt sensitive patient data
     */
    async decryptPatientData(encryptedPatientData) {
        console.log('🔓 Decrypting patient data...');
        
        const sensitiveFields = [
            'name', 'owner', 'address', 'phone', 'email',
            'medicalHistory', 'notes', 'diagnosis'
        ];
        
        const decryptedData = { ...encryptedPatientData };
        
        // Decrypt sensitive fields
        for (const field of sensitiveFields) {
            if (encryptedPatientData[field]) {
                decryptedData[field] = await this.decrypt(encryptedPatientData[field]);
            }
        }
        
        return decryptedData;
    },

    /**
     * Store encryption key securely
     */
    async storeKey(key) {
        try {
            const exportedKey = await crypto.subtle.exportKey('jwk', key);
            const keyData = {
                key: exportedKey,
                version: this.state.keyVersion,
                created: new Date().toISOString()
            };
            
            // Store in a separate, less accessible location
            sessionStorage.setItem('vetscribe-encryption-key', JSON.stringify(keyData));
            
        } catch (error) {
            console.error('❌ Failed to store key:', error);
        }
    },

    /**
     * Retrieve stored encryption key
     */
    getStoredKey() {
        try {
            const keyData = sessionStorage.getItem('vetscribe-encryption-key');
            return keyData ? JSON.parse(keyData) : null;
        } catch (error) {
            console.error('❌ Failed to retrieve stored key:', error);
            return null;
        }
    },

    /**
     * Import key from stored data
     */
    async importKey(keyData) {
        return await crypto.subtle.importKey(
            'jwk',
            keyData.key,
            {
                name: this.config.algorithm,
                length: this.config.keyLength
            },
            true,
            ['encrypt', 'decrypt']
        );
    },

    /**
     * Store salt for password-based encryption
     */
    storeSalt(salt) {
        const saltData = {
            salt: this.arrayBufferToBase64(salt),
            created: new Date().toISOString()
        };
        localStorage.setItem('vetscribe-encryption-salt', JSON.stringify(saltData));
    },

    /**
     * Retrieve stored salt
     */
    getStoredSalt() {
        try {
            const saltData = localStorage.getItem('vetscribe-encryption-salt');
            if (saltData) {
                const parsed = JSON.parse(saltData);
                return this.base64ToArrayBuffer(parsed.salt);
            }
            return null;
        } catch (error) {
            console.error('❌ Failed to retrieve salt:', error);
            return null;
        }
    },

    /**
     * Utility: Convert ArrayBuffer to Base64
     */
    arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    },

    /**
     * Utility: Convert Base64 to ArrayBuffer
     */
    base64ToArrayBuffer(base64) {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    },

    /**
     * Enable/disable encryption
     */
    setEncryptionEnabled(enabled) {
        this.state.encryptionEnabled = enabled;
        console.log(`🔐 Encryption ${enabled ? 'enabled' : 'disabled'}`);
    },

    /**
     * Check if encryption is enabled and initialized
     */
    isEncryptionReady() {
        return this.state.isInitialized && this.state.encryptionEnabled;
    },

    /**
     * Clear encryption keys (for logout/security)
     */
    clearKeys() {
        this.state.masterKey = null;
        this.state.isInitialized = false;
        sessionStorage.removeItem('vetscribe-encryption-key');
        console.log('🔐 Encryption keys cleared');
    },

    /**
     * Generate encryption status report
     */
    getEncryptionStatus() {
        return {
            initialized: this.state.isInitialized,
            enabled: this.state.encryptionEnabled,
            algorithm: this.config.algorithm,
            keyLength: this.config.keyLength,
            version: this.state.keyVersion,
            browserSupported: this.checkBrowserSupport()
        };
    }
};

// Make Encryption available globally
window.Encryption = Encryption;
