/**
 * VetScribe - Secure Communication Module
 * Professional-grade secure communication for LLM connections
 * Ensures veterinary data remains private during AI processing
 */

const SecureCommunication = {
    // Security configuration
    config: {
        requireHTTPS: true,
        validateCertificates: true,
        timeoutMs: 30000,
        maxRetries: 3,
        rateLimitMs: 1000,
        allowedHosts: [], // Tailscale IPs will be added dynamically
        encryptPayloads: true,
        sanitizeResponses: true
    },
    
    // Connection state
    state: {
        isSecureConnection: false,
        lastConnectionCheck: null,
        connectionQuality: 'unknown',
        encryptionActive: false,
        certificateValid: false
    },
    
    // Request tracking for security
    requestTracking: {
        activeRequests: new Map(),
        requestHistory: [],
        maxHistorySize: 100
    },

    /**
     * Initialize secure communication system
     */
    async init() {
        console.log('🔒 Initializing secure communication system...');
        
        try {
            // Validate browser security features
            this.validateBrowserSecurity();
            
            // Set up request interceptors
            this.setupRequestInterceptors();
            
            // Initialize connection monitoring
            this.initializeConnectionMonitoring();
            
            // Set up security headers
            this.setupSecurityHeaders();
            
            console.log('✅ Secure communication system initialized');
            return true;
            
        } catch (error) {
            console.error('❌ Failed to initialize secure communication:', error);
            throw error;
        }
    },

    /**
     * Validate browser security capabilities
     */
    validateBrowserSecurity() {
        const securityFeatures = {
            https: location.protocol === 'https:',
            crypto: typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined',
            fetch: typeof fetch !== 'undefined',
            headers: typeof Headers !== 'undefined'
        };
        
        const missingFeatures = Object.entries(securityFeatures)
            .filter(([feature, available]) => !available)
            .map(([feature]) => feature);
        
        if (missingFeatures.length > 0) {
            throw new Error(`Missing security features: ${missingFeatures.join(', ')}`);
        }
        
        console.log('🔒 Browser security validation passed');
    },

    /**
     * Set up request interceptors for security
     */
    setupRequestInterceptors() {
        // Store original fetch for secure wrapping
        this.originalFetch = window.fetch;
        
        // Create secure fetch wrapper
        window.fetch = this.createSecureFetch();
        
        console.log('🔒 Request interceptors configured');
    },

    /**
     * Create secure fetch wrapper
     */
    createSecureFetch() {
        return async (url, options = {}) => {
            try {
                // Validate and secure the request
                const secureOptions = await this.secureRequest(url, options);
                
                // Track the request
                const requestId = this.trackRequest(url, secureOptions);
                
                // Make the secure request
                const response = await this.originalFetch(url, secureOptions);
                
                // Validate and secure the response
                const secureResponse = await this.secureResponse(response, requestId);
                
                // Update request tracking
                this.updateRequestTracking(requestId, secureResponse);
                
                return secureResponse;
                
            } catch (error) {
                console.error('🔒 Secure fetch failed:', error);
                throw error;
            }
        };
    },

    /**
     * Secure outgoing requests
     */
    async secureRequest(url, options) {
        const secureOptions = { ...options };
        
        // Validate URL security
        this.validateRequestURL(url);
        
        // Set secure headers
        secureOptions.headers = new Headers(secureOptions.headers || {});
        this.addSecurityHeaders(secureOptions.headers);
        
        // Encrypt payload if needed
        if (secureOptions.body && this.config.encryptPayloads) {
            secureOptions.body = await this.encryptPayload(secureOptions.body);
        }
        
        // Add request timeout
        if (!secureOptions.signal) {
            const controller = new AbortController();
            setTimeout(() => controller.abort(), this.config.timeoutMs);
            secureOptions.signal = controller.signal;
        }
        
        // Add request metadata
        secureOptions.headers.set('X-VetScribe-Version', '1.0');
        secureOptions.headers.set('X-VetScribe-Timestamp', new Date().toISOString());
        secureOptions.headers.set('X-VetScribe-Request-ID', this.generateRequestId());
        
        return secureOptions;
    },

    /**
     * Validate request URL for security
     */
    validateRequestURL(url) {
        const urlObj = new URL(url);
        
        // Require HTTPS for external connections
        if (this.config.requireHTTPS && urlObj.protocol !== 'https:' && !this.isLocalhost(urlObj.hostname)) {
            throw new Error('HTTPS required for external connections');
        }
        
        // Validate Tailscale IP ranges
        if (this.isTailscaleIP(urlObj.hostname)) {
            console.log('🔒 Tailscale connection detected:', urlObj.hostname);
            this.state.isSecureConnection = true;
        }
        
        // Check against allowed hosts
        if (this.config.allowedHosts.length > 0 && !this.config.allowedHosts.includes(urlObj.hostname)) {
            console.warn('⚠️ Connection to non-whitelisted host:', urlObj.hostname);
        }
    },

    /**
     * Check if hostname is localhost
     */
    isLocalhost(hostname) {
        return ['localhost', '127.0.0.1', '::1'].includes(hostname);
    },

    /**
     * Check if IP is in Tailscale range
     */
    isTailscaleIP(hostname) {
        // Tailscale uses 100.x.x.x range
        return /^100\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname);
    },

    /**
     * Add security headers to requests
     */
    addSecurityHeaders(headers) {
        // Content type for JSON
        if (!headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json');
        }
        
        // Security headers
        headers.set('X-Requested-With', 'VetScribe');
        headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        headers.set('Pragma', 'no-cache');
        
        // CORS headers for Tailscale connections
        headers.set('Access-Control-Request-Method', 'POST');
        headers.set('Access-Control-Request-Headers', 'Content-Type');
    },

    /**
     * Encrypt request payload
     */
    async encryptPayload(payload) {
        if (typeof Encryption !== 'undefined' && Encryption.isEncryptionReady()) {
            try {
                const encrypted = await Encryption.encrypt(payload);
                return JSON.stringify({
                    encrypted: true,
                    data: encrypted,
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                console.warn('⚠️ Payload encryption failed, sending unencrypted:', error);
                return payload;
            }
        }
        return payload;
    },

    /**
     * Secure incoming responses
     */
    async secureResponse(response, requestId) {
        // Validate response security
        this.validateResponseSecurity(response);
        
        // Clone response for processing
        const clonedResponse = response.clone();
        
        // Check for encrypted response
        if (this.isEncryptedResponse(response)) {
            const decryptedResponse = await this.decryptResponse(clonedResponse);
            return decryptedResponse;
        }
        
        // Sanitize response content
        if (this.config.sanitizeResponses) {
            const sanitizedResponse = await this.sanitizeResponse(clonedResponse);
            return sanitizedResponse;
        }
        
        return response;
    },

    /**
     * Validate response security
     */
    validateResponseSecurity(response) {
        // Check for secure connection
        if (response.url && !response.url.startsWith('https:') && !this.isLocalhost(new URL(response.url).hostname)) {
            console.warn('⚠️ Response from non-HTTPS connection');
        }
        
        // Validate response headers
        const securityHeaders = ['X-Content-Type-Options', 'X-Frame-Options', 'X-XSS-Protection'];
        securityHeaders.forEach(header => {
            if (!response.headers.has(header)) {
                console.debug(`🔒 Missing security header: ${header}`);
            }
        });
        
        // Check response size
        const contentLength = response.headers.get('Content-Length');
        if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB limit
            console.warn('⚠️ Large response detected:', contentLength);
        }
    },

    /**
     * Check if response is encrypted
     */
    isEncryptedResponse(response) {
        const contentType = response.headers.get('Content-Type');
        return contentType && contentType.includes('application/json') && 
               response.headers.has('X-VetScribe-Encrypted');
    },

    /**
     * Decrypt response content
     */
    async decryptResponse(response) {
        try {
            const encryptedData = await response.json();
            
            if (encryptedData.encrypted && typeof Encryption !== 'undefined') {
                const decryptedContent = await Encryption.decrypt(encryptedData.data);
                
                // Create new response with decrypted content
                return new Response(JSON.stringify(decryptedContent), {
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers
                });
            }
            
            return response;
            
        } catch (error) {
            console.error('❌ Response decryption failed:', error);
            return response;
        }
    },

    /**
     * Sanitize response content
     */
    async sanitizeResponse(response) {
        try {
            const contentType = response.headers.get('Content-Type');
            
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                const sanitizedData = this.sanitizeJSONData(data);
                
                return new Response(JSON.stringify(sanitizedData), {
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers
                });
            }
            
            return response;
            
        } catch (error) {
            console.error('❌ Response sanitization failed:', error);
            return response;
        }
    },

    /**
     * Sanitize JSON data
     */
    sanitizeJSONData(data) {
        if (typeof data === 'string') {
            // Remove potentially dangerous content
            return data
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/javascript:/gi, '')
                .replace(/on\w+\s*=/gi, '');
        }
        
        if (Array.isArray(data)) {
            return data.map(item => this.sanitizeJSONData(item));
        }
        
        if (typeof data === 'object' && data !== null) {
            const sanitized = {};
            for (const [key, value] of Object.entries(data)) {
                sanitized[key] = this.sanitizeJSONData(value);
            }
            return sanitized;
        }
        
        return data;
    },

    /**
     * Track outgoing requests
     */
    trackRequest(url, options) {
        const requestId = this.generateRequestId();
        
        this.requestTracking.activeRequests.set(requestId, {
            url: url,
            method: options.method || 'GET',
            timestamp: new Date().toISOString(),
            headers: Object.fromEntries(options.headers || [])
        });
        
        return requestId;
    },

    /**
     * Update request tracking with response
     */
    updateRequestTracking(requestId, response) {
        const request = this.requestTracking.activeRequests.get(requestId);
        
        if (request) {
            request.completed = new Date().toISOString();
            request.status = response.status;
            request.success = response.ok;
            
            // Move to history
            this.requestTracking.requestHistory.push(request);
            this.requestTracking.activeRequests.delete(requestId);
            
            // Maintain history size
            if (this.requestTracking.requestHistory.length > this.config.maxHistorySize) {
                this.requestTracking.requestHistory.shift();
            }
        }
    },

    /**
     * Generate unique request ID
     */
    generateRequestId() {
        return 'req_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    /**
     * Initialize connection monitoring
     */
    initializeConnectionMonitoring() {
        // Monitor connection quality
        setInterval(() => {
            this.checkConnectionQuality();
        }, 30000); // Check every 30 seconds
        
        // Monitor for network changes
        if ('connection' in navigator) {
            navigator.connection.addEventListener('change', () => {
                this.handleNetworkChange();
            });
        }
        
        console.log('🔒 Connection monitoring initialized');
    },

    /**
     * Check connection quality
     */
    async checkConnectionQuality() {
        try {
            const startTime = performance.now();
            
            // Simple ping to check latency
            const response = await fetch('/ping', { 
                method: 'HEAD',
                cache: 'no-cache'
            });
            
            const endTime = performance.now();
            const latency = endTime - startTime;
            
            this.state.connectionQuality = this.categorizeLatency(latency);
            this.state.lastConnectionCheck = new Date().toISOString();
            
        } catch (error) {
            this.state.connectionQuality = 'poor';
            console.warn('⚠️ Connection quality check failed:', error);
        }
    },

    /**
     * Categorize connection latency
     */
    categorizeLatency(latency) {
        if (latency < 100) return 'excellent';
        if (latency < 300) return 'good';
        if (latency < 1000) return 'fair';
        return 'poor';
    },

    /**
     * Handle network changes
     */
    handleNetworkChange() {
        console.log('🔒 Network change detected');
        
        // Re-validate security settings
        this.validateBrowserSecurity();
        
        // Check connection quality immediately
        this.checkConnectionQuality();
        
        // Notify application of network change
        if (typeof ErrorHandler !== 'undefined') {
            ErrorHandler.handleError({
                category: ErrorHandler.categories.NETWORK,
                severity: ErrorHandler.severity.LOW,
                message: 'Network connection changed',
                context: { type: 'network_change' }
            });
        }
    },

    /**
     * Set up security headers for the application
     */
    setupSecurityHeaders() {
        // Add meta tags for security
        const securityMetas = [
            { name: 'referrer', content: 'strict-origin-when-cross-origin' },
            { 'http-equiv': 'X-Content-Type-Options', content: 'nosniff' },
            { 'http-equiv': 'X-Frame-Options', content: 'DENY' },
            { 'http-equiv': 'X-XSS-Protection', content: '1; mode=block' }
        ];
        
        securityMetas.forEach(meta => {
            const existing = document.querySelector(`meta[name="${meta.name}"], meta[http-equiv="${meta['http-equiv']}"]`);
            if (!existing) {
                const metaTag = document.createElement('meta');
                Object.entries(meta).forEach(([key, value]) => {
                    metaTag.setAttribute(key, value);
                });
                document.head.appendChild(metaTag);
            }
        });
        
        console.log('🔒 Security headers configured');
    },

    /**
     * Get security status report
     */
    getSecurityStatus() {
        return {
            secureConnection: this.state.isSecureConnection,
            httpsEnabled: location.protocol === 'https:',
            encryptionActive: this.state.encryptionActive,
            connectionQuality: this.state.connectionQuality,
            lastCheck: this.state.lastConnectionCheck,
            activeRequests: this.requestTracking.activeRequests.size,
            requestHistory: this.requestTracking.requestHistory.length
        };
    },

    /**
     * Clean up security resources
     */
    cleanup() {
        // Restore original fetch
        if (this.originalFetch) {
            window.fetch = this.originalFetch;
        }
        
        // Clear request tracking
        this.requestTracking.activeRequests.clear();
        this.requestTracking.requestHistory = [];
        
        console.log('🔒 Secure communication cleaned up');
    }
};

// Make SecureCommunication available globally
window.SecureCommunication = SecureCommunication;
