/**
 * OpenVetAI - LLM Connector Module
 * Handles communication with Ollama API over Tailscale for SOAP note generation
 */

const LLMConnector = {
    // Connection state
    isInitialized: false,
    isConnected: false,
    currentEndpoint: null,
    connectionStatus: 'disconnected', // disconnected, connecting, connected, error, reconnecting
    lastConnectionTime: null,
    connectionAttempts: 0,
    lastError: null,
    
    // Configuration
    config: {
        defaultPort: 11434,
        timeout: 30000, // 30 seconds
        retryAttempts: 3,
        retryDelay: 2000, // 2 seconds
        maxTokens: 2048,
        temperature: 0.3, // Lower temperature for medical accuracy
        streamResponse: false,

        // Enhanced retry configuration
        retryConfig: {
            maxAttempts: 3,
            baseDelay: 1000, // 1 second
            maxDelay: 10000, // 10 seconds
            backoffMultiplier: 2,
            jitterMax: 500, // Random jitter up to 500ms
            retryableErrors: ['network', 'timeout', 'server_error', 'rate_limit'],
            nonRetryableErrors: ['authentication', 'not_found', 'bad_request']
        },

        // Connection monitoring
        monitoring: {
            healthCheckInterval: 30000, // 30 seconds
            connectionTimeout: 5000, // 5 seconds for health checks
            maxFailedHealthChecks: 3,
            reconnectDelay: 5000 // 5 seconds before reconnect attempt
        }
    },
    
    // Tailscale IP discovery
    tailscaleIPs: [],
    discoveredEndpoints: [],
    
    // Event callbacks
    onConnectionChange: null,
    onResponse: null,
    onError: null,
    onProgress: null,

    /**
     * Initialize the LLM connector with secure communication
     */
    async initialize() {
        try {
            console.log('🤖 Initializing LLM Connector...');

            // Initialize secure communication
            if (typeof SecureCommunication !== 'undefined') {
                try {
                    await SecureCommunication.init();
                    console.log('🔒 Secure communication initialized for LLM');
                } catch (error) {
                    console.warn('⚠️ Secure communication initialization failed:', error);
                }
            }

            // Load saved configuration
            this.loadConfiguration();

            // Discover Tailscale endpoints
            await this.discoverTailscaleEndpoints();

            // Test connection if endpoint is configured
            if (this.currentEndpoint) {
                await this.testConnection();
            }

            this.isInitialized = true;
            console.log('✅ LLM Connector initialized successfully');

            return true;

        } catch (error) {
            console.error('❌ Failed to initialize LLM Connector:', error);
            if (this.onError) {
                this.onError(error);
            }
            return false;
        }
    },

    /**
     * Load configuration from storage
     */
    loadConfiguration() {
        try {
            const saved = localStorage.getItem('openvetai-llm-config');
            if (saved) {
                const config = JSON.parse(saved);
                this.currentEndpoint = config.endpoint;
                this.config = { ...this.config, ...config.settings };
                console.log('⚙️ LLM configuration loaded:', this.currentEndpoint);
            }
        } catch (error) {
            console.warn('⚠️ Failed to load LLM configuration:', error);
        }
    },

    /**
     * Save configuration to storage
     */
    saveConfiguration() {
        try {
            const config = {
                endpoint: this.currentEndpoint,
                settings: this.config
            };
            localStorage.setItem('openvetai-llm-config', JSON.stringify(config));
            console.log('💾 LLM configuration saved');
        } catch (error) {
            console.warn('⚠️ Failed to save LLM configuration:', error);
        }
    },

    /**
     * Enhanced Tailscale endpoint discovery
     */
    async discoverTailscaleEndpoints() {
        console.log('🔍 Discovering Tailscale endpoints...');

        // Multiple discovery strategies
        const discoveryMethods = [
            this.discoverFromLocalStorage(),
            this.discoverFromCommonIPs(),
            this.discoverFromHostname(),
            this.discoverFromNetworkScan()
        ];

        // Combine all discovery results
        const allEndpoints = [];
        for (const method of discoveryMethods) {
            try {
                const endpoints = await method;
                allEndpoints.push(...endpoints);
            } catch (error) {
                console.warn('⚠️ Discovery method failed:', error.message);
            }
        }

        // Remove duplicates and store
        this.discoveredEndpoints = [...new Set(allEndpoints)];

        console.log('🔍 Discovered endpoints:', this.discoveredEndpoints);

        return this.discoveredEndpoints;
    },

    /**
     * Discover endpoints from local storage history
     */
    async discoverFromLocalStorage() {
        const endpoints = [];

        try {
            const history = localStorage.getItem('openvetai-endpoint-history');
            if (history) {
                const parsed = JSON.parse(history);
                endpoints.push(...parsed.filter(ep => ep.startsWith('http')));
                console.log('📚 Found endpoints from history:', endpoints);
            }
        } catch (error) {
            console.warn('⚠️ Failed to load endpoint history:', error);
        }

        return endpoints;
    },

    /**
     * Discover from common Tailscale IP ranges
     */
    async discoverFromCommonIPs() {
        console.log('🔍 Scanning common Tailscale IP ranges...');

        const endpoints = [];
        const commonPorts = [11434, 1234, 8080, 8000, 3000, 5000];

        // Common Tailscale IP patterns
        const ipPatterns = [
            // Standard Tailscale CGNAT range
            '100.64.0.1', '100.64.0.2', '100.64.0.3', '100.64.0.4', '100.64.0.5',
            '100.64.1.1', '100.64.1.2', '100.64.1.3', '100.64.1.4', '100.64.1.5',

            // Alternative common ranges
            '100.100.100.1', '100.100.100.2', '100.100.100.3',
            '100.101.101.1', '100.101.101.2', '100.101.101.3',

            // Local development
            '127.0.0.1', 'localhost'
        ];

        // Generate endpoint combinations
        ipPatterns.forEach(ip => {
            commonPorts.forEach(port => {
                endpoints.push(`http://${ip}:${port}`);
            });
        });

        console.log('🔍 Generated common IP endpoints:', endpoints.length);
        return endpoints;
    },

    /**
     * Discover from hostname patterns
     */
    async discoverFromHostname() {
        console.log('🔍 Discovering from hostname patterns...');

        const endpoints = [];
        const commonPorts = [11434, 1234, 8080, 8000];

        // Common hostname patterns for Tailscale
        const hostnames = [
            'lm-studio',
            'ai-server',
            'llm-server',
            'studio',
            'ai',
            'ml-server'
        ];

        // Try both .local and Tailscale domain patterns
        const domains = ['.local', '.tail-scale.ts.net', ''];

        hostnames.forEach(hostname => {
            domains.forEach(domain => {
                commonPorts.forEach(port => {
                    endpoints.push(`http://${hostname}${domain}:${port}`);
                });
            });
        });

        console.log('🔍 Generated hostname endpoints:', endpoints.length);
        return endpoints;
    },

    /**
     * Discover through network scanning (limited for security)
     */
    async discoverFromNetworkScan() {
        console.log('🔍 Limited network discovery...');

        // For security reasons, we can't do actual network scanning from browser
        // But we can try some intelligent guessing based on current IP
        const endpoints = [];

        try {
            // Try to get some network info from WebRTC if available
            if (window.RTCPeerConnection) {
                const pc = new RTCPeerConnection({
                    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
                });

                pc.createDataChannel('');
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);

                // This is a simplified approach - in practice, you'd need more complex logic
                console.log('🔍 Network discovery attempted via WebRTC');
                pc.close();
            }
        } catch (error) {
            console.warn('⚠️ Network discovery failed:', error);
        }

        return endpoints;
    },

    /**
     * Save successful endpoint to history
     */
    saveEndpointToHistory(endpoint) {
        try {
            const history = JSON.parse(localStorage.getItem('openvetai-endpoint-history') || '[]');

            // Add to front of history if not already there
            if (!history.includes(endpoint)) {
                history.unshift(endpoint);

                // Keep only last 10 endpoints
                history.splice(10);

                localStorage.setItem('openvetai-endpoint-history', JSON.stringify(history));
                console.log('📚 Saved endpoint to history:', endpoint);
            }
        } catch (error) {
            console.warn('⚠️ Failed to save endpoint history:', error);
        }
    },

    /**
     * Enhanced auto-discovery with parallel testing and progress reporting
     */
    async autoDiscoverEndpoint(options = {}) {
        console.log('🔍 Auto-discovering Ollama endpoint...');

        const {
            maxConcurrent = 5,
            quickTest = true,
            reportProgress = true
        } = options;

        // Ensure we have endpoints to test
        if (this.discoveredEndpoints.length === 0) {
            await this.discoverTailscaleEndpoints();
        }

        if (this.discoveredEndpoints.length === 0) {
            throw new Error('No endpoints to test - discovery failed');
        }

        console.log(`🧪 Testing ${this.discoveredEndpoints.length} endpoints...`);

        // Report progress
        if (reportProgress && this.onProgress) {
            this.onProgress({
                stage: 'discovery',
                total: this.discoveredEndpoints.length,
                current: 0,
                message: 'Starting endpoint discovery...'
            });
        }

        // Try quick test first (prioritize likely endpoints)
        if (quickTest) {
            const quickResult = await this.quickDiscovery();
            if (quickResult) {
                return quickResult;
            }
        }

        // Parallel testing with concurrency limit
        const result = await this.parallelEndpointTesting(maxConcurrent, reportProgress);

        if (result) {
            console.log(`✅ Found working endpoint: ${result}`);
            this.currentEndpoint = result;
            this.saveConfiguration();
            this.saveEndpointToHistory(result);
            return result;
        }

        throw new Error('No working Ollama endpoints found on network');
    },

    /**
     * Quick discovery - test most likely endpoints first
     */
    async quickDiscovery() {
        console.log('⚡ Quick discovery - testing priority endpoints...');

        // Priority order: history > localhost > common IPs
        const priorityEndpoints = [
            ...await this.discoverFromLocalStorage(),
            'http://localhost:11434/v1',
            'http://127.0.0.1:11434/v1',
            'http://100.64.0.1:11434/v1',
            'http://100.64.0.2:11434/v1',
            'http://localhost:1234',
            'http://127.0.0.1:1234'
        ];

        for (const endpoint of priorityEndpoints) {
            try {
                console.log(`⚡ Quick testing: ${endpoint}`);

                const isWorking = await this.testEndpoint(endpoint, 3000); // 3 second timeout
                if (isWorking) {
                    console.log(`✅ Quick discovery success: ${endpoint}`);
                    return endpoint;
                }
            } catch (error) {
                console.log(`❌ Quick test failed: ${endpoint}`);
            }
        }

        console.log('⚡ Quick discovery completed - no immediate results');
        return null;
    },

    /**
     * Parallel endpoint testing with concurrency control
     */
    async parallelEndpointTesting(maxConcurrent, reportProgress) {
        console.log(`🔄 Parallel testing with max ${maxConcurrent} concurrent requests...`);

        const endpoints = [...this.discoveredEndpoints];
        let tested = 0;
        let found = null;

        // Create batches for concurrent testing
        const batches = [];
        for (let i = 0; i < endpoints.length; i += maxConcurrent) {
            batches.push(endpoints.slice(i, i + maxConcurrent));
        }

        for (const batch of batches) {
            if (found) break; // Stop if we found a working endpoint

            console.log(`🧪 Testing batch of ${batch.length} endpoints...`);

            // Test batch concurrently
            const promises = batch.map(async (endpoint) => {
                try {
                    const isWorking = await this.testEndpoint(endpoint, 5000);
                    tested++;

                    // Report progress
                    if (reportProgress && this.onProgress) {
                        this.onProgress({
                            stage: 'testing',
                            total: endpoints.length,
                            current: tested,
                            message: `Tested ${tested}/${endpoints.length} endpoints...`
                        });
                    }

                    if (isWorking) {
                        console.log(`✅ Found working endpoint in batch: ${endpoint}`);
                        return endpoint;
                    }
                } catch (error) {
                    tested++;
                    console.log(`❌ Batch test failed: ${endpoint}`);
                }
                return null;
            });

            // Wait for batch to complete
            const results = await Promise.all(promises);

            // Check if any endpoint in batch worked
            const workingEndpoint = results.find(result => result !== null);
            if (workingEndpoint) {
                found = workingEndpoint;
                break;
            }
        }

        return found;
    },

    /**
     * Enhanced endpoint testing with detailed validation
     */
    async testEndpointDetailed(endpoint, timeout = 5000) {
        console.log(`🔍 Detailed testing: ${endpoint}`);

        const result = {
            endpoint,
            isWorking: false,
            responseTime: null,
            models: [],
            error: null,
            features: {
                chat: false,
                models: false,
                health: false
            }
        };

        const startTime = Date.now();

        try {
            // Test basic connectivity
            const healthResponse = await this.testEndpoint(endpoint, timeout);
            result.isWorking = healthResponse;
            result.responseTime = Date.now() - startTime;

            if (healthResponse) {
                // Test models endpoint
                try {
                    const models = await this.getModelsFromEndpoint(endpoint);
                    result.models = models;
                    result.features.models = true;
                    result.features.chat = models.length > 0;
                } catch (error) {
                    console.warn(`⚠️ Models test failed for ${endpoint}:`, error.message);
                }

                result.features.health = true;
            }

        } catch (error) {
            result.error = error.message;
            result.responseTime = Date.now() - startTime;
        }

        console.log(`🔍 Detailed test result for ${endpoint}:`, result);
        return result;
    },

    /**
     * Get models from specific endpoint
     */
    async getModelsFromEndpoint(endpoint) {
        // Try Ollama API first
        try {
            const response = await fetch(`${endpoint}/api/tags`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                const data = await response.json();
                // Convert Ollama format to OpenAI format
                return data.models || [];
            }
        } catch (error) {
            console.log('Ollama API failed, trying OpenAI format...');
        }

        // Fallback to OpenAI format (legacy LM Studio compatibility)
        const response = await fetch(`${endpoint}/v1/models`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        return data.data || [];
    },

    /**
     * Comprehensive network discovery report
     */
    async generateDiscoveryReport() {
        console.log('📊 Generating comprehensive discovery report...');

        await this.discoverTailscaleEndpoints();

        const report = {
            timestamp: new Date().toISOString(),
            totalEndpoints: this.discoveredEndpoints.length,
            testedEndpoints: [],
            workingEndpoints: [],
            summary: {
                working: 0,
                failed: 0,
                avgResponseTime: 0
            }
        };

        // Test all endpoints with detailed results
        for (const endpoint of this.discoveredEndpoints) {
            const result = await this.testEndpointDetailed(endpoint);
            report.testedEndpoints.push(result);

            if (result.isWorking) {
                report.workingEndpoints.push(result);
                report.summary.working++;
            } else {
                report.summary.failed++;
            }
        }

        // Calculate average response time
        const responseTimes = report.testedEndpoints
            .filter(r => r.responseTime !== null)
            .map(r => r.responseTime);

        if (responseTimes.length > 0) {
            report.summary.avgResponseTime = Math.round(
                responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
            );
        }

        console.log('📊 Discovery report generated:', report);
        return report;
    },

    /**
     * Enhanced connection monitoring with intelligent health checks
     */
    startConnectionMonitoring(customInterval = null) {
        const interval = customInterval || this.config.monitoring.healthCheckInterval;

        console.log('🔄 Starting enhanced connection monitoring...');

        // Clear existing monitor
        this.stopConnectionMonitoring();

        // Initialize monitoring state
        this.monitoringState = {
            consecutiveFailures: 0,
            lastHealthCheck: null,
            isRecovering: false,
            healthCheckHistory: []
        };

        this.connectionMonitor = setInterval(async () => {
            await this.performHealthCheck();
        }, interval);

        console.log(`✅ Enhanced connection monitoring started (${interval}ms interval)`);

        // Perform initial health check
        setTimeout(() => this.performHealthCheck(), 1000);
    },

    /**
     * Perform comprehensive health check
     */
    async performHealthCheck() {
        if (!this.currentEndpoint) {
            return;
        }

        const checkId = `health_${Date.now()}`;
        const startTime = Date.now();

        try {
            console.log(`🏥 [${checkId}] Performing health check...`);

            // Perform health check with timeout
            const isHealthy = await this.checkEndpointHealthDetailed();
            const duration = Date.now() - startTime;

            // Record health check result
            this.recordHealthCheck(isHealthy, duration, null);

            if (isHealthy) {
                await this.handleHealthyConnection(checkId, duration);
            } else {
                await this.handleUnhealthyConnection(checkId, duration);
            }

        } catch (error) {
            const duration = Date.now() - startTime;
            console.warn(`⚠️ [${checkId}] Health check error:`, error.message);

            // Record failed health check
            this.recordHealthCheck(false, duration, error);

            await this.handleUnhealthyConnection(checkId, duration, error);
        }
    },

    /**
     * Enhanced endpoint health check with detailed validation
     */
    async checkEndpointHealthDetailed() {
        if (!this.currentEndpoint) {
            return false;
        }

        const timeout = this.config.monitoring.connectionTimeout;

        try {
            // Test basic connectivity
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            // Try Ollama API first, then fallback to OpenAI format
            let response;
            try {
                response = await fetch(`${this.currentEndpoint}/api/tags`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    signal: controller.signal
                });
            } catch (error) {
                response = await fetch(`${this.currentEndpoint}/v1/models`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    signal: controller.signal
                });
            }

            clearTimeout(timeoutId);

            if (!response.ok) {
                return false;
            }

            // Validate response content
            const data = await response.json();

            // Check if models are available (support both Ollama and OpenAI formats)
            const hasModels = (data.models && Array.isArray(data.models) && data.models.length > 0) ||
                             (data.data && Array.isArray(data.data) && data.data.length > 0);

            return hasModels;

        } catch (error) {
            return false;
        }
    },

    /**
     * Record health check result
     */
    recordHealthCheck(isHealthy, duration, error) {
        const record = {
            timestamp: new Date().toISOString(),
            isHealthy,
            duration,
            error: error ? error.message : null
        };

        // Add to history (keep last 10 checks)
        this.monitoringState.healthCheckHistory.push(record);
        if (this.monitoringState.healthCheckHistory.length > 10) {
            this.monitoringState.healthCheckHistory.shift();
        }

        this.monitoringState.lastHealthCheck = record;
    },

    /**
     * Handle healthy connection
     */
    async handleHealthyConnection(checkId, duration) {
        console.log(`✅ [${checkId}] Health check passed (${duration}ms)`);

        // Reset failure counter
        this.monitoringState.consecutiveFailures = 0;

        // Update connection status if needed
        if (!this.isConnected || this.connectionStatus !== 'connected') {
            if (this.monitoringState.isRecovering) {
                console.log(`🎉 [${checkId}] Connection fully recovered!`);
                this.monitoringState.isRecovering = false;
            }

            this.updateConnectionStatus('connected', 'Health check passed');
        }
    },

    /**
     * Handle unhealthy connection
     */
    async handleUnhealthyConnection(checkId, duration, error = null) {
        this.monitoringState.consecutiveFailures++;

        console.warn(`❌ [${checkId}] Health check failed (${duration}ms), consecutive failures: ${this.monitoringState.consecutiveFailures}`);

        const maxFailures = this.config.monitoring.maxFailedHealthChecks;

        if (this.monitoringState.consecutiveFailures >= maxFailures) {
            // Connection is considered lost
            if (this.isConnected) {
                console.warn(`🔌 [${checkId}] Connection lost after ${maxFailures} failed health checks`);
                this.updateConnectionStatus('error', 'Connection lost - health checks failing');

                // Attempt automatic recovery
                this.scheduleConnectionRecovery();
            }
        } else {
            // Still within tolerance, but warn
            this.updateConnectionStatus('connecting', `Health check failed (${this.monitoringState.consecutiveFailures}/${maxFailures})`);
        }
    },

    /**
     * Schedule connection recovery attempt
     */
    scheduleConnectionRecovery() {
        if (this.monitoringState.isRecovering) {
            console.log('🔄 Recovery already in progress, skipping...');
            return;
        }

        this.monitoringState.isRecovering = true;
        const delay = this.config.monitoring.reconnectDelay;

        console.log(`🔄 Scheduling connection recovery in ${delay}ms...`);

        setTimeout(async () => {
            try {
                await this.attemptConnectionRecovery();
            } catch (error) {
                console.error('❌ Scheduled recovery failed:', error);
                this.monitoringState.isRecovering = false;
            }
        }, delay);
    },

    /**
     * Enhanced connection recovery with multiple strategies
     */
    async attemptConnectionRecovery() {
        console.log('🔄 Attempting enhanced connection recovery...');

        this.updateConnectionStatus('reconnecting', 'Attempting recovery...');

        const recoveryStrategies = [
            () => this.testCurrentEndpoint(),
            () => this.retryWithBackoff(),
            () => this.autoDiscoverAlternative(),
            () => this.fallbackToLastKnownGood()
        ];

        for (let i = 0; i < recoveryStrategies.length; i++) {
            const strategyName = ['current endpoint', 'retry with backoff', 'auto-discover', 'fallback'][i];

            try {
                console.log(`🔄 Recovery strategy ${i + 1}: ${strategyName}`);
                this.updateConnectionStatus('reconnecting', `Trying ${strategyName}...`);

                const success = await recoveryStrategies[i]();

                if (success) {
                    console.log(`✅ Recovery successful with strategy: ${strategyName}`);
                    this.updateConnectionStatus('connected', `Recovered via ${strategyName}`);
                    this.monitoringState.isRecovering = false;
                    return true;
                }

            } catch (error) {
                console.warn(`❌ Recovery strategy ${strategyName} failed:`, error.message);
            }
        }

        console.log('❌ All recovery strategies failed');
        this.updateConnectionStatus('error', 'Recovery failed - manual intervention required');
        this.monitoringState.isRecovering = false;

        return false;
    },

    /**
     * Test current endpoint for recovery
     */
    async testCurrentEndpoint() {
        if (!this.currentEndpoint) {
            return false;
        }

        return await this.testEndpoint(this.currentEndpoint, 5000);
    },

    /**
     * Retry with exponential backoff
     */
    async retryWithBackoff() {
        if (!this.currentEndpoint) {
            return false;
        }

        const maxAttempts = 3;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            const delay = 1000 * Math.pow(2, attempt - 1); // 1s, 2s, 4s

            if (attempt > 1) {
                console.log(`⏱️ Waiting ${delay}ms before retry attempt ${attempt}...`);
                await this.delay(delay);
            }

            const success = await this.testEndpoint(this.currentEndpoint, 3000);
            if (success) {
                return true;
            }
        }

        return false;
    },

    /**
     * Auto-discover alternative endpoint
     */
    async autoDiscoverAlternative() {
        try {
            const endpoint = await this.autoDiscoverEndpoint({
                maxConcurrent: 3,
                quickTest: true,
                reportProgress: false
            });

            return !!endpoint;
        } catch (error) {
            return false;
        }
    },

    /**
     * Fallback to last known good endpoint
     */
    async fallbackToLastKnownGood() {
        try {
            const history = await this.discoverFromLocalStorage();

            for (const endpoint of history) {
                if (endpoint !== this.currentEndpoint) {
                    const success = await this.testEndpoint(endpoint, 3000);
                    if (success) {
                        this.currentEndpoint = endpoint;
                        this.saveConfiguration();
                        return true;
                    }
                }
            }
        } catch (error) {
            console.warn('⚠️ Fallback to last known good failed:', error);
        }

        return false;
    },

    /**
     * Stop connection monitoring
     */
    stopConnectionMonitoring() {
        if (this.connectionMonitor) {
            clearInterval(this.connectionMonitor);
            this.connectionMonitor = null;
            console.log('⏹️ Connection monitoring stopped');
        }
    },

    /**
     * Check endpoint health
     */
    async checkEndpointHealth() {
        if (!this.currentEndpoint) {
            return false;
        }

        try {
            const response = await fetch(`${this.currentEndpoint}/v1/models`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(5000) // 5 second timeout
            });

            return response.ok;
        } catch (error) {
            console.warn('⚠️ Health check failed:', error.message);
            return false;
        }
    },

    /**
     * Attempt automatic connection recovery
     */
    async attemptConnectionRecovery() {
        console.log('🔄 Attempting connection recovery...');

        try {
            // First, try the current endpoint again
            if (this.currentEndpoint) {
                const isWorking = await this.testEndpoint(this.currentEndpoint, 3000);
                if (isWorking) {
                    console.log('✅ Current endpoint recovered');
                    this.isConnected = true;
                    return true;
                }
            }

            // If current endpoint fails, try auto-discovery
            console.log('🔍 Current endpoint failed, attempting auto-discovery...');
            const newEndpoint = await this.autoDiscoverEndpoint({
                maxConcurrent: 3,
                quickTest: true,
                reportProgress: false
            });

            if (newEndpoint) {
                console.log('✅ Recovery successful with new endpoint:', newEndpoint);
                this.isConnected = true;

                if (this.onConnectionChange) {
                    this.onConnectionChange(true, `Recovered with new endpoint: ${newEndpoint}`);
                }

                return true;
            }

        } catch (error) {
            console.error('❌ Connection recovery failed:', error);
        }

        console.log('❌ Connection recovery unsuccessful');
        return false;
    },

    /**
     * Get detailed connection diagnostics
     */
    async getConnectionDiagnostics() {
        console.log('🔍 Running connection diagnostics...');

        const diagnostics = {
            timestamp: new Date().toISOString(),
            currentEndpoint: this.currentEndpoint,
            isConnected: this.isConnected,
            config: this.config,
            tests: {
                currentEndpoint: null,
                discovery: null,
                models: null,
                chat: null
            },
            recommendations: []
        };

        // Test current endpoint
        if (this.currentEndpoint) {
            try {
                diagnostics.tests.currentEndpoint = await this.testEndpointDetailed(this.currentEndpoint);
            } catch (error) {
                diagnostics.tests.currentEndpoint = { error: error.message };
            }
        }

        // Test discovery
        try {
            const discoveryReport = await this.generateDiscoveryReport();
            diagnostics.tests.discovery = {
                totalFound: discoveryReport.totalEndpoints,
                working: discoveryReport.summary.working,
                avgResponseTime: discoveryReport.summary.avgResponseTime
            };
        } catch (error) {
            diagnostics.tests.discovery = { error: error.message };
        }

        // Test models endpoint
        if (this.currentEndpoint) {
            try {
                const models = await this.getAvailableModels();
                diagnostics.tests.models = {
                    count: models.length,
                    models: models.map(m => m.id || m.name)
                };
            } catch (error) {
                diagnostics.tests.models = { error: error.message };
            }
        }

        // Generate recommendations
        diagnostics.recommendations = this.generateDiagnosticRecommendations(diagnostics);

        console.log('🔍 Connection diagnostics complete:', diagnostics);
        return diagnostics;
    },

    /**
     * Generate diagnostic recommendations
     */
    generateDiagnosticRecommendations(diagnostics) {
        const recommendations = [];

        if (!diagnostics.currentEndpoint) {
            recommendations.push('No endpoint configured - run auto-discovery or set manually');
        }

        if (diagnostics.tests.currentEndpoint?.error) {
            recommendations.push('Current endpoint not responding - check Ollama is running');
        }

        if (diagnostics.tests.discovery?.working === 0) {
            recommendations.push('No working endpoints found - ensure Ollama is accessible on network');
        }

        if (diagnostics.tests.models?.count === 0) {
            recommendations.push('No models loaded in Ollama - download a model to generate SOAP notes');
        }

        if (diagnostics.tests.currentEndpoint?.responseTime > 5000) {
            recommendations.push('Slow response time - check network connection or Ollama performance');
        }

        if (recommendations.length === 0) {
            recommendations.push('All systems operational - ready for SOAP note generation');
        }

        return recommendations;
    },

    /**
     * Enhanced initialization with monitoring
     */
    async initialize() {
        try {
            console.log('🤖 Initializing LLM Connector...');

            // Load saved configuration
            this.loadConfiguration();

            // Discover Tailscale endpoints
            await this.discoverTailscaleEndpoints();

            // Test connection if endpoint is configured
            if (this.currentEndpoint) {
                await this.testConnection();
            } else {
                // Attempt auto-discovery if no endpoint configured
                try {
                    await this.autoDiscoverEndpoint({ quickTest: true });
                } catch (error) {
                    console.warn('⚠️ Auto-discovery failed during initialization:', error.message);
                }
            }

            // Start connection monitoring
            this.startConnectionMonitoring();

            this.isInitialized = true;
            console.log('✅ LLM Connector initialized successfully');

            return true;

        } catch (error) {
            console.error('❌ Failed to initialize LLM Connector:', error);
            if (this.onError) {
                this.onError(error);
            }
            return false;
        }
    },

    /**
     * Test a specific endpoint
     */
    async testEndpoint(endpoint, timeout = 5000) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);
            
            // Try Ollama API first, then fallback to OpenAI format
            let response;
            let isOllamaAPI = false;

            try {
                response = await fetch(`${endpoint}/api/tags`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    signal: controller.signal
                });

                if (response.ok) {
                    isOllamaAPI = true;
                } else {
                    throw new Error('Ollama API failed');
                }
            } catch (error) {
                // Fallback to OpenAI format (legacy LM Studio compatibility)
                try {
                    response = await fetch(`${endpoint}/v1/models`, {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' },
                        signal: controller.signal
                    });
                    isOllamaAPI = false;
                } catch (fallbackError) {
                    throw new Error(`Both Ollama and OpenAI API failed: ${error.message}, ${fallbackError.message}`);
                }
            }
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                const data = await response.json();
                const modelCount = data.models?.length || data.data?.length || 0;
                const apiType = isOllamaAPI ? 'Ollama' : 'OpenAI';
                console.log(`✅ Endpoint ${endpoint} is working (${apiType}), models:`, modelCount);
                return true;
            } else {
                console.log(`❌ Endpoint ${endpoint} returned status:`, response.status);
                return false;
            }
            
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log(`⏱️ Endpoint ${endpoint} timed out`);
            } else {
                console.log(`❌ Endpoint ${endpoint} error:`, error.message);
                console.log(`❌ Error details:`, {
                    name: error.name,
                    message: error.message,
                    stack: error.stack?.split('\n')[0]
                });
            }
            return false;
        }
    },

    /**
     * Test current connection
     */
    async testConnection() {
        try {
            if (!this.currentEndpoint) {
                throw new Error('No endpoint configured');
            }
            
            console.log('🧪 Testing Ollama connection...');
            
            const isWorking = await this.testEndpoint(this.currentEndpoint);
            
            if (isWorking) {
                this.isConnected = true;
                console.log('✅ Ollama connection successful');

                if (this.onConnectionChange) {
                    this.onConnectionChange(true, 'Connected to Ollama');
                }
                
                return true;
            } else {
                throw new Error('Connection test failed');
            }
            
        } catch (error) {
            this.isConnected = false;
            console.error('❌ Ollama connection failed:', error);
            
            if (this.onConnectionChange) {
                this.onConnectionChange(false, error.message);
            }
            
            throw error;
        }
    },

    /**
     * Set LLM endpoint manually
     */
    setEndpoint(endpoint) {
        this.currentEndpoint = endpoint;
        this.isConnected = false;
        this.saveConfiguration();
        console.log('🔗 LLM endpoint set to:', endpoint);
    },

    /**
     * Get available models from Ollama
     */
    async getAvailableModels() {
        try {
            if (!this.currentEndpoint) {
                throw new Error('No endpoint configured');
            }
            
            // Try Ollama API first
            let response, data, models;
            try {
                response = await fetch(`${this.currentEndpoint}/api/tags`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (response.ok) {
                    data = await response.json();
                    models = data.models || [];
                } else {
                    throw new Error('Ollama API failed');
                }
            } catch (error) {
                // Fallback to OpenAI format
                response = await fetch(`${this.currentEndpoint}/v1/models`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                data = await response.json();
                models = data.data || [];
            }
            
            console.log('📋 Available models:', models.map(m => m.id));
            
            return models;
            
        } catch (error) {
            console.error('❌ Failed to get models:', error);
            throw error;
        }
    },

    /**
     * Enhanced SOAP notes generation with template support
     */
    async generateSOAPNotes(transcript, options = {}) {
        try {
            if (!this.currentEndpoint) {
                throw new Error('No LLM endpoint configured');
            }

            if (!this.isConnected) {
                await this.testConnection();
            }

            console.log('🤖 Generating SOAP notes from transcript...');

            // Prepare the prompt using SOAP templates
            const prompt = this.createEnhancedVeterinaryPrompt(transcript, options);

            // Make the API request with retry support
            const response = await this.makeRequestWithRetry(
                () => this.makeCompletionRequest(prompt, options),
                { requestId: options.requestId }
            );

            // Validate and enhance the response
            const validatedResponse = this.validateAndEnhanceSOAPResponse(response, options);

            console.log('✅ SOAP notes generated successfully');

            if (this.onResponse) {
                this.onResponse(validatedResponse);
            }

            return validatedResponse;

        } catch (error) {
            console.error('❌ SOAP generation failed:', error);

            if (this.onError) {
                this.onError(error);
            }

            throw error;
        }
    },

    /**
     * Create enhanced veterinary prompt using SOAP templates
     */
    createEnhancedVeterinaryPrompt(transcript, options = {}) {
        const {
            templateType = 'standard',
            visitType = null,
            patientInfo = {},
            includeContext = true,
            customInstructions = ''
        } = options;

        // Use SOAPTemplates if available, otherwise fallback to basic prompt
        if (typeof SOAPTemplates !== 'undefined') {
            // Use specialized prompt if visit type is specified
            if (visitType && visitType !== 'standard') {
                return SOAPTemplates.generateSpecializedPrompt(transcript, visitType, options);
            }

            // Use enhanced prompt with patient context
            if (includeContext && Object.keys(patientInfo).length > 0) {
                return SOAPTemplates.generateEnhancedPrompt(transcript, patientInfo, templateType, options);
            }

            // Use standard template prompt
            return SOAPTemplates.generateSOAPPrompt(transcript, templateType, options);
        }

        // Fallback to basic prompt if SOAPTemplates not available
        return this.createBasicVeterinaryPrompt(transcript, options);
    },

    /**
     * Create basic veterinary prompt (fallback)
     */
    createBasicVeterinaryPrompt(transcript, options = {}) {
        const {
            patientInfo = {},
            customInstructions = ''
        } = options;

        let prompt = `You are a professional veterinary assistant specialized in creating accurate SOAP notes from consultation transcripts.

PROFESSIONAL STANDARDS:
- Use proper veterinary medical terminology and standard abbreviations
- Maintain professional, objective tone throughout
- Include relevant clinical details while remaining concise
- Follow standard SOAP format: Subjective, Objective, Assessment, Plan
- Ensure documentation supports clinical decision-making

FORMATTING REQUIREMENTS:
- Use clear section headers (SUBJECTIVE:, OBJECTIVE:, ASSESSMENT:, PLAN:)
- Include vital signs, measurements, and clinical findings
- Specify medications with dosages, routes, and frequencies when mentioned
- Note follow-up instructions and monitoring requirements clearly
- Use standard veterinary abbreviations (TPR, BID, SID, PO, SQ, etc.)`;

        // Add patient context if available
        if (Object.keys(patientInfo).length > 0) {
            prompt += '\n\nPATIENT CONTEXT:\n';
            if (patientInfo.species) prompt += `Species: ${patientInfo.species}\n`;
            if (patientInfo.breed) prompt += `Breed: ${patientInfo.breed}\n`;
            if (patientInfo.age) prompt += `Age: ${patientInfo.age}\n`;
            if (patientInfo.weight) prompt += `Weight: ${patientInfo.weight}\n`;
            if (patientInfo.sex) prompt += `Sex: ${patientInfo.sex}\n`;
        }

        // Add custom instructions if provided
        if (customInstructions) {
            prompt += `\n\nADDITIONAL INSTRUCTIONS:\n${customInstructions}`;
        }

        prompt += `\n\nCONSULTATION TRANSCRIPT:
${transcript}

Please generate professional SOAP notes in the following format:

SUBJECTIVE:
[Patient history, owner concerns, symptoms reported, behavioral observations]

OBJECTIVE:
[Physical examination findings, vital signs, diagnostic test results, clinical observations]

ASSESSMENT:
[Clinical diagnosis, differential diagnoses, clinical impression]

PLAN:
[Treatment plan, medications, diagnostic recommendations, follow-up instructions]

SOAP NOTES:`;

        return prompt;
    },

    /**
     * Validate and enhance SOAP response with professional formatting
     */
    validateAndEnhanceSOAPResponse(response, options = {}) {
        const enhancedResponse = { ...response };

        // Apply professional formatting if SOAPFormatter is available
        if (typeof SOAPFormatter !== 'undefined' && options.autoFormat !== false) {
            try {
                const formattingResult = SOAPFormatter.formatSOAPNotes(response.content, options);

                enhancedResponse.content = formattingResult.content;
                enhancedResponse.formattedSections = formattingResult.sections;
                enhancedResponse.validation = formattingResult.validation;
                enhancedResponse.metadata = formattingResult.metadata;
                enhancedResponse.isFormatted = true;

                console.log('✅ SOAP notes professionally formatted');

            } catch (error) {
                console.warn('⚠️ SOAP formatting failed, using original content:', error);
                enhancedResponse.validation = this.validateSOAPNotes(response.content);
                enhancedResponse.isFormatted = false;
            }
        } else {
            // Fallback to basic validation
            enhancedResponse.validation = this.validateSOAPNotes(response.content);
            enhancedResponse.isFormatted = false;
        }

        // Add template information
        if (options.templateType) {
            enhancedResponse.templateUsed = options.templateType;
        }

        if (options.visitType) {
            enhancedResponse.visitType = options.visitType;
        }

        // Add quality metrics
        enhancedResponse.qualityMetrics = this.calculateSOAPQuality(
            enhancedResponse.content,
            enhancedResponse.validation
        );

        // Add formatting suggestions if needed
        if (!enhancedResponse.validation.isValid) {
            enhancedResponse.suggestions = this.generateImprovementSuggestions(enhancedResponse.validation);
        }

        return enhancedResponse;
    },

    /**
     * Calculate SOAP quality metrics
     */
    calculateSOAPQuality(content, validation) {
        const metrics = {
            completeness: 0,
            professionalTerminology: 0,
            structure: 0,
            overall: 0
        };

        // Completeness score based on sections present
        const sectionsPresent = Object.values(validation.sections).filter(Boolean).length;
        metrics.completeness = (sectionsPresent / 4) * 100;

        // Professional terminology score
        const veterinaryTerms = [
            'examination', 'diagnosis', 'treatment', 'medication', 'vaccination',
            'TPR', 'BID', 'SID', 'QID', 'PO', 'SQ', 'IM', 'IV', 'WNL',
            'temperature', 'pulse', 'respiration', 'weight', 'BCS'
        ];

        const termCount = veterinaryTerms.filter(term =>
            content.toLowerCase().includes(term.toLowerCase())
        ).length;
        metrics.professionalTerminology = Math.min((termCount / 10) * 100, 100);

        // Structure score based on proper formatting
        const hasHeaders = /SUBJECTIVE:|OBJECTIVE:|ASSESSMENT:|PLAN:/gi.test(content);
        const hasProperSections = content.split(/SUBJECTIVE:|OBJECTIVE:|ASSESSMENT:|PLAN:/gi).length >= 4;
        metrics.structure = (hasHeaders && hasProperSections) ? 100 : 50;

        // Overall score (weighted average)
        metrics.overall = Math.round(
            (metrics.completeness * 0.4) +
            (metrics.professionalTerminology * 0.3) +
            (metrics.structure * 0.3)
        );

        return metrics;
    },

    /**
     * Generate improvement suggestions
     */
    generateImprovementSuggestions(validation) {
        const suggestions = [];

        if (!validation.sections.subjective) {
            suggestions.push('Add Subjective section with patient history and owner concerns');
        }

        if (!validation.sections.objective) {
            suggestions.push('Add Objective section with physical examination findings');
        }

        if (!validation.sections.assessment) {
            suggestions.push('Add Assessment section with clinical diagnosis');
        }

        if (!validation.sections.plan) {
            suggestions.push('Add Plan section with treatment recommendations');
        }

        if (validation.issues.includes('SOAP notes appear too short')) {
            suggestions.push('Provide more detailed clinical information in each section');
        }

        return suggestions;
    },

    /**
     * Enhanced completion request with comprehensive error handling
     */
    async makeCompletionRequest(prompt, options = {}) {
        const requestId = this.generateRequestId();
        const startTime = Date.now();

        console.log(`📤 [${requestId}] Starting completion request...`);

        // Prepare request with validation
        const requestBody = await this.prepareRequestBody(prompt, options);

        // Validate request before sending
        this.validateRequest(requestBody);

        // Set up request monitoring
        const requestMonitor = this.createRequestMonitor(requestId, options);

        try {
            // Make the request with enhanced error handling
            const response = await this.executeRequest(requestBody, requestMonitor);

            // Process and validate response
            const processedResponse = await this.processResponse(response, requestId, startTime);

            console.log(`✅ [${requestId}] Request completed successfully in ${Date.now() - startTime}ms`);

            return processedResponse;

        } catch (error) {
            const duration = Date.now() - startTime;
            console.error(`❌ [${requestId}] Request failed after ${duration}ms:`, error);

            // Enhanced error handling with recovery suggestions
            throw this.enhanceError(error, requestId, duration, options);

        } finally {
            // Cleanup request monitor
            this.cleanupRequestMonitor(requestMonitor);
        }
    },

    /**
     * Generate unique request ID for tracking
     */
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    /**
     * Get the correct model name for the request
     */
    async getModelName(requestedModel) {
        // If a specific model is requested, use it
        if (requestedModel) {
            return requestedModel;
        }

        // If we have a configured default model, use it
        if (this.config.defaultModel && this.config.defaultModel !== 'local-model' && this.config.defaultModel !== 'mistral:7b') {
            return this.config.defaultModel;
        }

        // Try to get the first available model from Ollama
        try {
            const models = await this.getAvailableModels();
            if (models && models.length > 0) {
                const modelName = models[0].name || models[0].id || models[0];
                console.log(`🤖 Using first available model: ${modelName}`);
                return modelName;
            }
        } catch (error) {
            console.warn('⚠️ Could not get available models:', error.message);
        }

        // Fallback to common Ollama model names (prefer faster model for better compatibility)
        return 'llama3.2:1b';
    },

    /**
     * Prepare and validate request body
     */
    async prepareRequestBody(prompt, options = {}) {
        const requestBody = {
            model: await this.getModelName(options.model),
            messages: this.prepareMessages(prompt, options),
            max_tokens: this.validateMaxTokens(options.maxTokens || this.config.maxTokens),
            temperature: this.validateTemperature(options.temperature || this.config.temperature),
            top_p: options.topP || this.config.topP || 0.9,
            frequency_penalty: options.frequencyPenalty || this.config.frequencyPenalty || 0,
            presence_penalty: options.presencePenalty || this.config.presencePenalty || 0,
            stream: options.stream || this.config.streamResponse || false
        };

        // Add veterinary-specific parameters
        if (options.veterinaryMode !== false) {
            requestBody.temperature = Math.min(requestBody.temperature, 0.3); // Lower for medical accuracy
            requestBody.top_p = Math.min(requestBody.top_p, 0.8); // More focused responses
        }

        return requestBody;
    },

    /**
     * Prepare messages array with system prompt
     */
    prepareMessages(prompt, options = {}) {
        const messages = [];

        // Add system prompt for veterinary context
        if (options.includeSystemPrompt !== false) {
            messages.push({
                role: 'system',
                content: this.getVeterinarySystemPrompt(options)
            });
        }

        // Add user prompt
        messages.push({
            role: 'user',
            content: prompt
        });

        return messages;
    },

    /**
     * Get veterinary-specific system prompt
     */
    getVeterinarySystemPrompt(options = {}) {
        return `You are a professional veterinary assistant specialized in creating accurate SOAP notes from consultation transcripts.

GUIDELINES:
- Use proper veterinary terminology and abbreviations
- Maintain professional medical documentation standards
- Be concise but comprehensive
- Focus on clinically relevant information
- Use standard SOAP format (Subjective, Objective, Assessment, Plan)
- Ensure accuracy and clarity for medical records

FORMATTING:
- Use clear section headers
- Include relevant vital signs and measurements
- Specify medications with dosages when mentioned
- Note follow-up instructions clearly

Remember: These notes will be used for patient care and medical records.`;
    },

    /**
     * Validate request parameters
     */
    validateRequest(requestBody) {
        if (!requestBody.messages || requestBody.messages.length === 0) {
            throw new Error('Request must include at least one message');
        }

        if (!requestBody.model) {
            throw new Error('Model must be specified');
        }

        if (requestBody.max_tokens < 1 || requestBody.max_tokens > 8192) {
            throw new Error('max_tokens must be between 1 and 8192');
        }

        if (requestBody.temperature < 0 || requestBody.temperature > 2) {
            throw new Error('temperature must be between 0 and 2');
        }
    },

    /**
     * Validate max tokens parameter
     */
    validateMaxTokens(maxTokens) {
        const tokens = parseInt(maxTokens);
        if (isNaN(tokens) || tokens < 1) return 2048;
        if (tokens > 8192) return 8192;
        return tokens;
    },

    /**
     * Validate temperature parameter
     */
    validateTemperature(temperature) {
        const temp = parseFloat(temperature);
        if (isNaN(temp) || temp < 0) return 0.3;
        if (temp > 2) return 2;
        return temp;
    },

    /**
     * Create request monitor for tracking and timeout
     */
    createRequestMonitor(requestId, options = {}) {
        const timeout = options.timeout || this.config.timeout;

        const monitor = {
            requestId,
            startTime: Date.now(),
            timeout,
            controller: new AbortController(),
            timeoutId: null,
            progressCallback: options.onProgress
        };

        // Set up timeout
        monitor.timeoutId = setTimeout(() => {
            console.warn(`⏱️ [${requestId}] Request timeout after ${timeout}ms`);
            monitor.controller.abort();
        }, timeout);

        // Report progress if callback provided
        if (monitor.progressCallback) {
            monitor.progressCallback({
                stage: 'request_started',
                requestId,
                message: 'Sending request to Ollama...'
            });
        }

        return monitor;
    },

    /**
     * Execute the HTTP request with monitoring
     */
    async executeRequest(requestBody, monitor) {
        const { requestId, controller, progressCallback } = monitor;

        // Report progress
        if (progressCallback) {
            progressCallback({
                stage: 'request_sending',
                requestId,
                message: 'Connecting to Ollama...'
            });
        }

        // Try Ollama API first, then fallback to OpenAI format
        let response;
        let isOllamaAPI = false;

        try {
            // Ollama native API format
            const ollamaBody = {
                model: requestBody.model,
                prompt: requestBody.messages[requestBody.messages.length - 1].content,
                stream: false
            };

            response = await fetch(`${this.currentEndpoint}/api/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'User-Agent': 'OpenVetAI/1.0'
                },
                body: JSON.stringify(ollamaBody),
                signal: controller.signal
            });

            if (response.ok) {
                isOllamaAPI = true;
            } else {
                throw new Error('Ollama API failed');
            }
        } catch (error) {
            // Fallback to OpenAI format (legacy LM Studio compatibility)
            response = await fetch(`${this.currentEndpoint}/v1/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'User-Agent': 'OpenVetAI/1.0'
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal
            });
            isOllamaAPI = false;
        }

        // Report progress
        if (progressCallback) {
            progressCallback({
                stage: 'response_received',
                requestId,
                status: response.status,
                message: 'Processing response...'
            });
        }

        return response;
    },

    /**
     * Process and validate response
     */
    async processResponse(response, requestId, startTime) {
        const duration = Date.now() - startTime;

        // Check response status
        if (!response.ok) {
            const errorText = await this.safeReadResponseText(response);
            throw this.createHTTPError(response.status, errorText, duration);
        }

        // Parse JSON response
        const data = await this.safeParseJSON(response);

        // Validate response structure
        this.validateResponseStructure(data);

        // Extract and validate content
        const content = this.extractContent(data);
        if (!content || content.trim().length === 0) {
            throw new Error('AI service returned empty response content');
        }

        // Create enhanced response object
        const processedResponse = {
            content: content.trim(),
            usage: this.extractUsage(data),
            model: data.model || 'unknown',
            requestId,
            duration,
            timestamp: new Date().toISOString(),
            metadata: {
                finishReason: data.choices?.[0]?.finish_reason,
                responseLength: content.length,
                tokensUsed: data.usage?.total_tokens || 0
            }
        };

        // Validate content quality
        this.validateContentQuality(processedResponse);

        console.log(`📥 [${requestId}] Response processed: ${content.length} chars, ${processedResponse.metadata.tokensUsed} tokens`);

        return processedResponse;
    },

    /**
     * Safely read response text
     */
    async safeReadResponseText(response) {
        try {
            return await response.text();
        } catch (error) {
            return `Failed to read response: ${error.message}`;
        }
    },

    /**
     * Safely parse JSON response
     */
    async safeParseJSON(response) {
        try {
            return await response.json();
        } catch (error) {
            throw new Error(`Invalid JSON response from AI service: ${error.message}`);
        }
    },

    /**
     * Validate response structure
     */
    validateResponseStructure(data) {
        if (!data) {
            throw new Error('Empty response from AI service');
        }

        // Handle Ollama response format
        if (data.response !== undefined) {
            if (typeof data.response !== 'string') {
                throw new Error('Invalid Ollama response: response field must be a string');
            }
            return; // Valid Ollama response
        }

        // Handle OpenAI/legacy LM Studio response format
        if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
            throw new Error('Invalid response structure: missing choices array');
        }

        if (!data.choices[0].message) {
            throw new Error('Invalid response structure: missing message in first choice');
        }
    },

    /**
     * Extract content from response
     */
    extractContent(data) {
        // Handle Ollama response format
        if (data.response) {
            return data.response;
        }

        // Handle OpenAI/legacy LM Studio response format
        if (data.choices && data.choices[0] && data.choices[0].message) {
            return data.choices[0].message.content;
        }

        throw new Error('Unknown response format');
    },

    /**
     * Extract usage information
     */
    extractUsage(data) {
        return {
            promptTokens: data.usage?.prompt_tokens || 0,
            completionTokens: data.usage?.completion_tokens || 0,
            totalTokens: data.usage?.total_tokens || 0
        };
    },

    /**
     * Validate content quality
     */
    validateContentQuality(response) {
        const { content } = response;

        // Check minimum length
        if (content.length < 50) {
            console.warn(`⚠️ [${response.requestId}] Short response: ${content.length} characters`);
        }

        // Check for common error patterns
        const errorPatterns = [
            /^error:/i,
            /^sorry,/i,
            /cannot (help|assist|generate)/i,
            /^i (can't|cannot)/i
        ];

        for (const pattern of errorPatterns) {
            if (pattern.test(content)) {
                throw new Error(`AI service declined to generate content: ${content.substring(0, 100)}...`);
            }
        }

        // Check for SOAP note structure (basic validation)
        const hasSOAPSections = /subjective|objective|assessment|plan/i.test(content);
        if (!hasSOAPSections) {
            console.warn(`⚠️ [${response.requestId}] Response may not contain proper SOAP sections`);
        }
    },

    /**
     * Create HTTP error with enhanced information
     */
    createHTTPError(status, errorText, duration) {
        let message = `HTTP ${status}`;
        let userAction = '';

        switch (status) {
            case 400:
                message = 'Bad request to AI service';
                userAction = 'Check your request parameters and try again.';
                break;
            case 401:
                message = 'Unauthorized access to AI service';
                userAction = 'Check if authentication is required.';
                break;
            case 404:
                message = 'AI service endpoint not found';
                userAction = 'Verify Ollama is running and the endpoint is correct.';
                break;
            case 429:
                message = 'Too many requests to AI service';
                userAction = 'Wait a moment and try again.';
                break;
            case 500:
                message = 'AI service server error';
                userAction = 'Check Ollama logs and ensure the model is loaded properly.';
                break;
            case 503:
                message = 'AI service unavailable';
                userAction = 'Ollama may be overloaded. Try again in a moment.';
                break;
            default:
                message = `AI service returned status ${status}`;
                userAction = 'Check Ollama status and try again.';
        }

        const error = new Error(`${message}: ${errorText}`);
        error.status = status;
        error.userAction = userAction;
        error.duration = duration;
        error.isHTTPError = true;

        return error;
    },

    /**
     * Enhance error with additional context and recovery suggestions
     */
    enhanceError(error, requestId, duration, options = {}) {
        // Add request context
        error.requestId = requestId;
        error.duration = duration;
        error.endpoint = this.currentEndpoint;

        // Determine error category and add recovery suggestions
        if (error.name === 'AbortError') {
            error.category = 'timeout';
            error.userAction = 'Request timed out. Try increasing timeout or check if Ollama is processing a large request.';
            error.recoverySuggestions = [
                'Increase timeout in settings',
                'Check Ollama performance',
                'Try a smaller/faster model (llama3.2:1b)',
                'Reduce max_tokens parameter'
            ];
        } else if (error.message.includes('fetch')) {
            error.category = 'network';
            error.userAction = 'Network connection failed. Check if Ollama is running and accessible.';
            error.recoverySuggestions = [
                'Verify Ollama is running: ollama serve',
                'Check network connectivity',
                'Test endpoint in browser',
                'Restart Ollama server'
            ];
        } else if (error.isHTTPError) {
            error.category = 'http';
            // userAction already set in createHTTPError
        } else if (error.message.includes('JSON')) {
            error.category = 'parsing';
            error.userAction = 'Invalid response format from AI service.';
            error.recoverySuggestions = [
                'Check Ollama model compatibility',
                'Verify API endpoint configuration',
                'Try restarting Ollama'
            ];
        } else {
            error.category = 'unknown';
            error.userAction = 'An unexpected error occurred. Check Ollama status.';
            error.recoverySuggestions = [
                'Check Ollama logs',
                'Verify model is loaded: ollama list',
                'Restart Ollama: ollama serve',
                'Check system resources'
            ];
        }

        // Add debugging information
        error.debugInfo = {
            requestId,
            duration,
            endpoint: this.currentEndpoint,
            timestamp: new Date().toISOString(),
            options: { ...options, onProgress: undefined } // Exclude callback
        };

        console.error(`❌ [${requestId}] Enhanced error:`, {
            category: error.category,
            message: error.message,
            userAction: error.userAction,
            suggestions: error.recoverySuggestions
        });

        return error;
    },

    /**
     * Cleanup request monitor
     */
    cleanupRequestMonitor(monitor) {
        if (monitor.timeoutId) {
            clearTimeout(monitor.timeoutId);
        }

        // Report completion if callback provided
        if (monitor.progressCallback) {
            monitor.progressCallback({
                stage: 'request_completed',
                requestId: monitor.requestId,
                duration: Date.now() - monitor.startTime,
                message: 'Request completed'
            });
        }
    },

    /**
     * Enhanced retry mechanism with exponential backoff and jitter
     */
    async makeRequestWithRetry(requestFn, options = {}) {
        const retryConfig = { ...this.config.retryConfig, ...options };
        const requestId = options.requestId || this.generateRequestId();

        let lastError = null;
        let attempt = 0;

        while (attempt < retryConfig.maxAttempts) {
            attempt++;

            try {
                console.log(`🔄 [${requestId}] Attempt ${attempt}/${retryConfig.maxAttempts}`);

                // Update connection status
                this.updateConnectionStatus('connecting', `Attempt ${attempt}/${retryConfig.maxAttempts}`);

                const result = await requestFn();

                console.log(`✅ [${requestId}] Request successful on attempt ${attempt}`);

                // Reset connection attempts counter on success
                this.connectionAttempts = 0;
                this.updateConnectionStatus('connected', 'Request completed successfully');

                return result;

            } catch (error) {
                lastError = error;
                console.warn(`❌ [${requestId}] Attempt ${attempt} failed:`, error.message);

                // Determine if error is retryable
                const isRetryable = this.isErrorRetryable(error);

                if (!isRetryable) {
                    console.log(`🚫 [${requestId}] Non-retryable error, stopping attempts`);
                    this.updateConnectionStatus('error', `Non-retryable error: ${error.message}`);
                    break;
                }

                // Check if we have more attempts
                if (attempt >= retryConfig.maxAttempts) {
                    console.log(`🚫 [${requestId}] Max attempts reached`);
                    this.updateConnectionStatus('error', `Max retry attempts exceeded`);
                    break;
                }

                // Calculate delay with exponential backoff and jitter
                const delay = this.calculateRetryDelay(attempt, retryConfig);

                console.log(`⏱️ [${requestId}] Waiting ${delay}ms before retry...`);
                this.updateConnectionStatus('reconnecting', `Retrying in ${Math.round(delay/1000)}s...`);

                await this.delay(delay);
            }
        }

        // All attempts failed
        this.connectionAttempts++;
        this.lastError = lastError;

        throw this.enhanceRetryError(lastError, attempt, requestId);
    },

    /**
     * Determine if an error is retryable
     */
    isErrorRetryable(error) {
        const { retryableErrors, nonRetryableErrors } = this.config.retryConfig;

        // Check for explicitly non-retryable errors
        if (error.category && nonRetryableErrors.includes(error.category)) {
            return false;
        }

        // Check for explicitly retryable errors
        if (error.category && retryableErrors.includes(error.category)) {
            return true;
        }

        // Check HTTP status codes
        if (error.status) {
            // Non-retryable HTTP errors
            if ([400, 401, 403, 404, 422].includes(error.status)) {
                return false;
            }

            // Retryable HTTP errors
            if ([429, 500, 502, 503, 504].includes(error.status)) {
                return true;
            }
        }

        // Check error types
        if (error.name === 'AbortError' || error.message.includes('timeout')) {
            return true; // Timeouts are retryable
        }

        if (error.message.includes('fetch') || error.message.includes('network')) {
            return true; // Network errors are retryable
        }

        // Default to non-retryable for unknown errors
        return false;
    },

    /**
     * Calculate retry delay with exponential backoff and jitter
     */
    calculateRetryDelay(attempt, retryConfig) {
        const { baseDelay, maxDelay, backoffMultiplier, jitterMax } = retryConfig;

        // Exponential backoff: baseDelay * (backoffMultiplier ^ (attempt - 1))
        let delay = baseDelay * Math.pow(backoffMultiplier, attempt - 1);

        // Cap at maximum delay
        delay = Math.min(delay, maxDelay);

        // Add random jitter to prevent thundering herd
        const jitter = Math.random() * jitterMax;
        delay += jitter;

        return Math.round(delay);
    },

    /**
     * Enhance retry error with additional context
     */
    enhanceRetryError(originalError, attempts, requestId) {
        const error = new Error(`Request failed after ${attempts} attempts: ${originalError.message}`);

        error.originalError = originalError;
        error.attempts = attempts;
        error.requestId = requestId;
        error.isRetryError = true;
        error.category = 'retry_exhausted';

        error.userAction = 'All retry attempts failed. Check Ollama connection and try again.';
        error.recoverySuggestions = [
            'Verify Ollama is running: ollama serve',
            'Check network connectivity',
            'Restart Ollama server',
            'Try manual connection test',
            'Check system resources and performance'
        ];

        return error;
    },

    /**
     * Update connection status with notifications
     */
    updateConnectionStatus(status, message = '') {
        const previousStatus = this.connectionStatus;
        this.connectionStatus = status;

        // Update connection state
        this.isConnected = (status === 'connected');

        if (status === 'connected') {
            this.lastConnectionTime = new Date().toISOString();
            this.lastError = null;
        } else if (status === 'error') {
            this.lastConnectionTime = null;
        }

        console.log(`🔗 Connection status: ${previousStatus} → ${status}${message ? ` (${message})` : ''}`);

        // Notify listeners if status changed
        if (previousStatus !== status && this.onConnectionChange) {
            this.onConnectionChange(this.isConnected, message, {
                status,
                previousStatus,
                attempts: this.connectionAttempts,
                lastError: this.lastError,
                timestamp: new Date().toISOString()
            });
        }
    },

    /**
     * Get detailed connection status
     */
    getDetailedConnectionStatus() {
        return {
            status: this.connectionStatus,
            isConnected: this.isConnected,
            endpoint: this.currentEndpoint,
            lastConnectionTime: this.lastConnectionTime,
            connectionAttempts: this.connectionAttempts,
            lastError: this.lastError ? {
                message: this.lastError.message,
                category: this.lastError.category,
                timestamp: this.lastError.timestamp
            } : null,
            monitoring: {
                healthCheckInterval: this.config.monitoring.healthCheckInterval,
                isMonitoring: !!this.connectionMonitor
            },
            retryConfig: this.config.retryConfig
        };
    },

    /**
     * Utility delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Get connection status
     */
    getConnectionStatus() {
        return {
            isInitialized: this.isInitialized,
            isConnected: this.isConnected,
            endpoint: this.currentEndpoint,
            discoveredEndpoints: this.discoveredEndpoints.length,
            config: this.config
        };
    },

    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.saveConfiguration();
        console.log('⚙️ LLM configuration updated:', newConfig);
    },

    /**
     * Reset connection
     */
    async resetConnection() {
        console.log('🔄 Resetting LLM connection...');

        this.isConnected = false;
        this.currentEndpoint = null;
        this.discoveredEndpoints = [];

        // Clear saved configuration
        localStorage.removeItem('openvetai-llm-config');

        // Re-discover endpoints
        await this.discoverTailscaleEndpoints();

        console.log('✅ LLM connection reset');
    },

    /**
     * Validate SOAP notes format
     */
    validateSOAPNotes(content) {
        const validation = {
            isValid: false,
            sections: {
                subjective: false,
                objective: false,
                assessment: false,
                plan: false
            },
            issues: [],
            suggestions: []
        };

        const upperContent = content.toUpperCase();

        // Check for SOAP sections
        validation.sections.subjective = upperContent.includes('SUBJECTIVE');
        validation.sections.objective = upperContent.includes('OBJECTIVE');
        validation.sections.assessment = upperContent.includes('ASSESSMENT');
        validation.sections.plan = upperContent.includes('PLAN');

        // Count valid sections
        const validSections = Object.values(validation.sections).filter(Boolean).length;
        validation.isValid = validSections >= 3; // At least 3 of 4 sections

        // Generate issues and suggestions
        if (!validation.sections.subjective) {
            validation.issues.push('Missing Subjective section');
            validation.suggestions.push('Add patient history and owner concerns');
        }

        if (!validation.sections.objective) {
            validation.issues.push('Missing Objective section');
            validation.suggestions.push('Add physical examination findings');
        }

        if (!validation.sections.assessment) {
            validation.issues.push('Missing Assessment section');
            validation.suggestions.push('Add clinical diagnosis');
        }

        if (!validation.sections.plan) {
            validation.issues.push('Missing Plan section');
            validation.suggestions.push('Add treatment plan and follow-up');
        }

        if (content.length < 100) {
            validation.issues.push('SOAP notes appear too short');
            validation.suggestions.push('Ensure comprehensive documentation');
        }

        console.log('📋 SOAP validation:', validation);
        return validation;
    },

    /**
     * Clean up resources
     */
    cleanup() {
        console.log('🧹 Cleaning up LLM Connector...');

        this.isInitialized = false;
        this.isConnected = false;

        // Clear callbacks
        this.onConnectionChange = null;
        this.onResponse = null;
        this.onError = null;
        this.onProgress = null;

        console.log('✅ LLM Connector cleanup complete');
    }
};

// Make LLMConnector available globally
window.LLMConnector = LLMConnector;
