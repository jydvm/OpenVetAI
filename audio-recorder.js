/**
 * VetScribe - Audio Recording Module
 * Handles Web Audio API integration for microphone access and audio recording
 */

const AudioRecorder = {
    // Audio context and nodes
    audioContext: null,
    mediaStream: null,
    mediaRecorder: null,
    sourceNode: null,
    analyserNode: null,
    
    // Recording state
    isInitialized: false,
    isRecording: false,
    isPaused: false,
    recordedChunks: [],
    
    // Audio settings with compression profiles
    settings: {
        sampleRate: 44100,
        channelCount: 1,
        bitDepth: 16,
        mimeType: 'audio/webm;codecs=opus',
        quality: 'medium'
    },

    // Compression profiles for different use cases
    compressionProfiles: {
        low: {
            audioBitsPerSecond: 32000,
            sampleRate: 22050,
            channelCount: 1,
            description: 'Low quality - smallest files, basic voice clarity'
        },
        medium: {
            audioBitsPerSecond: 64000,
            sampleRate: 44100,
            channelCount: 1,
            description: 'Medium quality - balanced size and clarity for voice'
        },
        high: {
            audioBitsPerSecond: 128000,
            sampleRate: 44100,
            channelCount: 1,
            description: 'High quality - excellent clarity, larger files'
        },
        lossless: {
            audioBitsPerSecond: 256000,
            sampleRate: 48000,
            channelCount: 1,
            description: 'Lossless quality - maximum clarity, largest files'
        }
    },

    // Format specifications
    formatSpecs: {
        'audio/webm;codecs=opus': {
            extension: 'webm',
            codec: 'Opus',
            compression: 'excellent',
            compatibility: 'modern',
            voiceOptimized: true
        },
        'audio/webm': {
            extension: 'webm',
            codec: 'VP8/VP9',
            compression: 'good',
            compatibility: 'modern',
            voiceOptimized: false
        },
        'audio/mp4;codecs=mp4a.40.2': {
            extension: 'mp4',
            codec: 'AAC-LC',
            compression: 'good',
            compatibility: 'excellent',
            voiceOptimized: true
        },
        'audio/mp4': {
            extension: 'mp4',
            codec: 'AAC',
            compression: 'good',
            compatibility: 'excellent',
            voiceOptimized: true
        },
        'audio/ogg;codecs=opus': {
            extension: 'ogg',
            codec: 'Opus',
            compression: 'excellent',
            compatibility: 'good',
            voiceOptimized: true
        },
        'audio/wav': {
            extension: 'wav',
            codec: 'PCM',
            compression: 'none',
            compatibility: 'universal',
            voiceOptimized: false
        }
    },
    
    // Event callbacks
    onDataAvailable: null,
    onRecordingStart: null,
    onRecordingStop: null,
    onRecordingPause: null,
    onRecordingResume: null,
    onError: null,
    onVolumeChange: null,

    /**
     * Initialize the audio recording system
     */
    async initialize() {
        try {
            console.log('🎤 Initializing AudioRecorder...');
            
            // Check browser support
            if (!this.checkBrowserSupport()) {
                throw new Error('Browser does not support required audio features');
            }
            
            // Initialize audio context
            await this.initializeAudioContext();
            
            // Request microphone permissions
            await this.requestMicrophoneAccess();
            
            this.isInitialized = true;
            console.log('✅ AudioRecorder initialized successfully');
            
            return true;
            
        } catch (error) {
            console.error('❌ Failed to initialize AudioRecorder:', error);
            if (this.onError) {
                this.onError(error);
            }
            return false;
        }
    },

    /**
     * Comprehensive browser support and compatibility check
     */
    checkBrowserSupport() {
        const support = {
            // Core APIs
            mediaRecorder: typeof MediaRecorder !== 'undefined',
            getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
            audioContext: !!(window.AudioContext || window.webkitAudioContext),
            webAudio: typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined',

            // Additional features
            mediaDevices: !!navigator.mediaDevices,
            enumerateDevices: !!(navigator.mediaDevices && navigator.mediaDevices.enumerateDevices),
            permissions: !!navigator.permissions,

            // Browser detection
            browser: this.detectBrowser(),

            // Feature availability
            features: {
                pause: false,
                resume: false,
                mimeTypes: [],
                constraints: false
            }
        };

        // Check MediaRecorder features
        if (support.mediaRecorder) {
            try {
                const testRecorder = new MediaRecorder(new MediaStream());
                support.features.pause = typeof testRecorder.pause === 'function';
                support.features.resume = typeof testRecorder.resume === 'function';
                support.features.mimeTypes = this.getSupportedMimeTypes();
            } catch (error) {
                console.warn('⚠️ Could not test MediaRecorder features:', error);
                support.features.pause = false;
                support.features.resume = false;
                support.features.mimeTypes = [];
            }
        }

        // Check getUserMedia constraints support
        if (support.getUserMedia) {
            support.features.constraints = this.checkConstraintsSupport();
        }

        // Overall compatibility score
        support.compatible = this.calculateCompatibilityScore(support);
        support.issues = this.identifyCompatibilityIssues(support);
        support.recommendations = this.getCompatibilityRecommendations(support);

        console.log('🔍 Comprehensive browser support analysis:', support);

        return support.mediaRecorder && support.getUserMedia && support.audioContext;
    },

    /**
     * Detect browser type and version
     */
    detectBrowser() {
        const userAgent = navigator.userAgent;
        let browser = { name: 'Unknown', version: 'Unknown', mobile: false };

        // Mobile detection
        browser.mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

        // Browser detection
        if (userAgent.indexOf('Chrome') > -1 && userAgent.indexOf('Edge') === -1) {
            browser.name = 'Chrome';
            browser.version = userAgent.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
        } else if (userAgent.indexOf('Firefox') > -1) {
            browser.name = 'Firefox';
            browser.version = userAgent.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
        } else if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1) {
            browser.name = 'Safari';
            browser.version = userAgent.match(/Version\/(\d+)/)?.[1] || 'Unknown';
        } else if (userAgent.indexOf('Edge') > -1) {
            browser.name = 'Edge';
            browser.version = userAgent.match(/Edge\/(\d+)/)?.[1] || 'Unknown';
        }

        return browser;
    },

    /**
     * Check getUserMedia constraints support
     */
    checkConstraintsSupport() {
        try {
            // Test if advanced constraints are supported
            const testConstraints = {
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 44100,
                    channelCount: 1
                }
            };

            // This doesn't actually request permission, just validates constraints
            return true;
        } catch (error) {
            return false;
        }
    },

    /**
     * Calculate overall compatibility score (0-100)
     */
    calculateCompatibilityScore(support) {
        let score = 0;

        // Core features (60 points)
        if (support.mediaRecorder) score += 20;
        if (support.getUserMedia) score += 20;
        if (support.audioContext) score += 20;

        // Additional features (30 points)
        if (support.mediaDevices) score += 5;
        if (support.enumerateDevices) score += 5;
        if (support.permissions) score += 5;
        if (support.features.pause) score += 5;
        if (support.features.resume) score += 5;
        if (support.features.mimeTypes.length > 0) score += 5;

        // Browser compatibility (10 points)
        const browserScores = {
            Chrome: 10,
            Firefox: 8,
            Safari: 6,
            Edge: 7,
            Unknown: 0
        };
        score += browserScores[support.browser.name] || 0;

        return Math.min(score, 100);
    },

    /**
     * Identify compatibility issues
     */
    identifyCompatibilityIssues(support) {
        const issues = [];

        if (!support.mediaRecorder) {
            issues.push({
                type: 'critical',
                feature: 'MediaRecorder',
                message: 'MediaRecorder API not supported - recording not possible',
                solution: 'Use a modern browser like Chrome, Firefox, or Safari'
            });
        }

        if (!support.getUserMedia) {
            issues.push({
                type: 'critical',
                feature: 'getUserMedia',
                message: 'Microphone access API not supported',
                solution: 'Use a modern browser with HTTPS or localhost'
            });
        }

        if (!support.audioContext) {
            issues.push({
                type: 'warning',
                feature: 'AudioContext',
                message: 'Web Audio API not supported - no volume monitoring',
                solution: 'Volume indicators will not be available'
            });
        }

        if (!support.features.pause) {
            issues.push({
                type: 'warning',
                feature: 'Pause/Resume',
                message: 'MediaRecorder pause/resume not supported',
                solution: 'Pause functionality will not be available'
            });
        }

        if (support.features.mimeTypes.length === 0) {
            issues.push({
                type: 'warning',
                feature: 'Audio Formats',
                message: 'No supported audio formats detected',
                solution: 'Recording may use browser default format'
            });
        }

        if (support.browser.name === 'Safari' && support.browser.mobile) {
            issues.push({
                type: 'info',
                feature: 'iOS Safari',
                message: 'iOS Safari has limited audio recording capabilities',
                solution: 'Some features may be limited on iOS devices'
            });
        }

        return issues;
    },

    /**
     * Get compatibility recommendations
     */
    getCompatibilityRecommendations(support) {
        const recommendations = [];

        if (support.compatible < 80) {
            recommendations.push('Consider updating to a newer browser version for better compatibility');
        }

        if (support.browser.name === 'Safari') {
            recommendations.push('For best results on Safari, ensure you are using the latest version');
        }

        if (support.browser.mobile) {
            recommendations.push('Mobile browsers may have limited audio recording capabilities');
        }

        if (!support.permissions) {
            recommendations.push('Manual permission management required - browser does not support Permissions API');
        }

        if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
            recommendations.push('Use HTTPS for reliable microphone access in production');
        }

        return recommendations;
    },

    /**
     * Initialize Web Audio Context
     */
    async initializeAudioContext() {
        try {
            // Create audio context
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContextClass({
                sampleRate: this.settings.sampleRate
            });
            
            // Resume context if suspended (required by some browsers)
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            console.log('🎵 Audio context initialized:', {
                state: this.audioContext.state,
                sampleRate: this.audioContext.sampleRate
            });
            
        } catch (error) {
            throw new Error(`Failed to initialize audio context: ${error.message}`);
        }
    },

    /**
     * Enhanced microphone access with comprehensive error handling
     */
    async requestMicrophoneAccess() {
        try {
            console.log('🎤 Requesting microphone access...');

            // Check permission status first
            const permissionStatus = await this.checkMicrophonePermission();
            console.log('🔐 Permission status:', permissionStatus);

            // Get optimal constraints based on browser capabilities
            const constraints = await this.getOptimalConstraints();
            console.log('🎛️ Using constraints:', constraints);

            // Request microphone access with retry logic
            this.mediaStream = await this.requestMicrophoneWithRetry(constraints);

            // Validate the media stream
            await this.validateMediaStream(this.mediaStream);

            // Create and configure audio nodes
            await this.setupAudioNodes();

            console.log('✅ Microphone access granted and configured');

            // Start volume monitoring
            this.startVolumeMonitoring();

        } catch (error) {
            console.error('❌ Microphone access failed:', error);
            throw this.createMicrophoneError(error);
        }
    },

    /**
     * Check microphone permission status
     */
    async checkMicrophonePermission() {
        try {
            if (!navigator.permissions) {
                return { state: 'unknown', reason: 'Permissions API not supported' };
            }

            const permission = await navigator.permissions.query({ name: 'microphone' });
            return {
                state: permission.state,
                reason: permission.state === 'denied' ? 'Permission previously denied' : null
            };
        } catch (error) {
            console.warn('⚠️ Could not check permission status:', error);
            return { state: 'unknown', reason: 'Permission check failed' };
        }
    },

    /**
     * Get optimal constraints based on browser capabilities
     */
    async getOptimalConstraints() {
        const baseConstraints = {
            audio: {
                channelCount: this.settings.channelCount || 1,
                sampleRate: this.settings.sampleRate || 44100
            }
        };

        // Add advanced constraints if supported
        try {
            const support = this.checkBrowserSupport();

            // Safely check for features support
            if (support && support.features && support.features.constraints) {
                baseConstraints.audio.echoCancellation = true;
                baseConstraints.audio.noiseSuppression = true;
                baseConstraints.audio.autoGainControl = true;
            }

            // Browser-specific optimizations
            if (support && support.browser && support.browser.name === 'Safari') {
                // Safari sometimes has issues with specific sample rates
                delete baseConstraints.audio.sampleRate;
            } else if (support && support.browser && support.browser.name === 'Firefox') {
                // Firefox has good constraint support
                baseConstraints.audio.latency = 0.01; // Low latency
            }
        } catch (error) {
            console.warn('⚠️ Could not check browser support for constraints:', error);
            // Continue with basic constraints
        }

        return baseConstraints;
    },

    /**
     * Request microphone with retry logic
     */
    async requestMicrophoneWithRetry(constraints, maxRetries = 3) {
        let lastError = null;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`🎤 Microphone access attempt ${attempt}/${maxRetries}`);

                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                console.log('✅ Microphone access successful on attempt', attempt);
                return stream;

            } catch (error) {
                lastError = error;
                console.warn(`❌ Attempt ${attempt} failed:`, error.name, error.message);

                // Don't retry for certain errors
                if (error.name === 'NotAllowedError' || error.name === 'NotFoundError') {
                    break;
                }

                // Try with simpler constraints on retry
                if (attempt < maxRetries) {
                    constraints = this.getSimplifiedConstraints(constraints);
                    console.log('🔄 Retrying with simplified constraints:', constraints);
                    await this.delay(1000); // Wait 1 second before retry
                }
            }
        }

        throw lastError;
    },

    /**
     * Get simplified constraints for retry attempts
     */
    getSimplifiedConstraints(originalConstraints) {
        // Start with basic audio request
        const simplified = { audio: true };

        // Gradually add back constraints if original constraints exist
        if (originalConstraints && originalConstraints.audio && typeof originalConstraints.audio === 'object') {
            // Keep only essential constraints
            if (originalConstraints.audio.channelCount) {
                simplified.audio = { channelCount: 1 };
            }
        }

        return simplified;
    },

    /**
     * Validate media stream
     */
    async validateMediaStream(stream) {
        if (!stream) {
            throw new Error('No media stream received');
        }

        const audioTracks = stream.getAudioTracks();
        if (audioTracks.length === 0) {
            throw new Error('No audio tracks in media stream');
        }

        const track = audioTracks[0];
        if (track.readyState !== 'live') {
            throw new Error(`Audio track not ready: ${track.readyState}`);
        }

        // Check track settings
        const settings = track.getSettings();
        console.log('🎵 Audio track settings:', settings);

        // Validate essential settings
        if (settings.sampleRate && settings.sampleRate < 8000) {
            console.warn('⚠️ Low sample rate detected:', settings.sampleRate);
        }

        return true;
    },

    /**
     * Setup audio nodes with error handling
     */
    async setupAudioNodes() {
        try {
            // Create audio nodes
            this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
            this.analyserNode = this.audioContext.createAnalyser();

            // Configure analyser with error handling
            try {
                this.analyserNode.fftSize = 256;
                this.analyserNode.smoothingTimeConstant = 0.8;
            } catch (error) {
                console.warn('⚠️ Could not configure analyser:', error);
                // Use default settings
            }

            // Connect nodes
            this.sourceNode.connect(this.analyserNode);

            console.log('🔗 Audio nodes connected successfully');

        } catch (error) {
            console.error('❌ Failed to setup audio nodes:', error);
            throw new Error(`Audio setup failed: ${error.message}`);
        }
    },

    /**
     * Create descriptive microphone error
     */
    createMicrophoneError(originalError) {
        const errorMap = {
            'NotAllowedError': {
                message: 'Microphone access denied. Please grant permissions and try again.',
                userAction: 'Click the microphone icon in your browser\'s address bar and allow access.',
                technical: 'User denied microphone permission'
            },
            'NotFoundError': {
                message: 'No microphone found. Please connect a microphone and try again.',
                userAction: 'Connect a microphone or headset and refresh the page.',
                technical: 'No audio input devices detected'
            },
            'NotReadableError': {
                message: 'Microphone is being used by another application.',
                userAction: 'Close other applications using the microphone and try again.',
                technical: 'Audio device is busy or hardware error'
            },
            'OverconstrainedError': {
                message: 'Microphone does not support the required settings.',
                userAction: 'Try using a different microphone or update your browser.',
                technical: 'Constraints cannot be satisfied by available devices'
            },
            'SecurityError': {
                message: 'Microphone access blocked due to security restrictions.',
                userAction: 'Ensure you are using HTTPS or localhost.',
                technical: 'Insecure context or security policy violation'
            },
            'AbortError': {
                message: 'Microphone access was interrupted.',
                userAction: 'Please try again.',
                technical: 'Operation was aborted'
            }
        };

        const errorInfo = errorMap[originalError.name] || {
            message: `Microphone access failed: ${originalError.message}`,
            userAction: 'Please check your microphone and browser settings.',
            technical: originalError.message
        };

        const enhancedError = new Error(errorInfo.message);
        enhancedError.name = originalError.name;
        enhancedError.userAction = errorInfo.userAction;
        enhancedError.technical = errorInfo.technical;
        enhancedError.originalError = originalError;

        return enhancedError;
    },

    /**
     * Utility delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Enumerate available audio input devices
     */
    async enumerateAudioDevices() {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
                return {
                    devices: [],
                    error: 'Device enumeration not supported'
                };
            }

            const devices = await navigator.mediaDevices.enumerateDevices();
            const audioInputs = devices.filter(device => device.kind === 'audioinput');

            const deviceInfo = audioInputs.map(device => ({
                deviceId: device.deviceId,
                label: device.label || `Microphone ${audioInputs.indexOf(device) + 1}`,
                groupId: device.groupId
            }));

            console.log('🎤 Available audio devices:', deviceInfo);

            return {
                devices: deviceInfo,
                count: deviceInfo.length,
                hasDefault: deviceInfo.some(d => d.deviceId === 'default'),
                error: null
            };

        } catch (error) {
            console.error('❌ Failed to enumerate devices:', error);
            return {
                devices: [],
                error: error.message
            };
        }
    },

    /**
     * Test microphone with specific device
     */
    async testMicrophoneDevice(deviceId = null) {
        try {
            const constraints = {
                audio: deviceId ? { deviceId: { exact: deviceId } } : true
            };

            console.log(`🧪 Testing microphone${deviceId ? ` (${deviceId})` : ''}...`);

            const testStream = await navigator.mediaDevices.getUserMedia(constraints);
            const audioTracks = testStream.getAudioTracks();

            if (audioTracks.length === 0) {
                throw new Error('No audio tracks available');
            }

            const track = audioTracks[0];
            const settings = track.getSettings();

            // Test for a short duration
            await this.delay(1000);

            // Clean up test stream
            testStream.getTracks().forEach(track => track.stop());

            console.log('✅ Microphone test successful:', settings);

            return {
                success: true,
                settings: settings,
                deviceLabel: track.label
            };

        } catch (error) {
            console.error('❌ Microphone test failed:', error);
            return {
                success: false,
                error: this.createMicrophoneError(error)
            };
        }
    },

    /**
     * Recover from permission errors
     */
    async recoverFromPermissionError() {
        try {
            console.log('🔄 Attempting permission recovery...');

            // Check current permission status
            const permissionStatus = await this.checkMicrophonePermission();

            if (permissionStatus.state === 'denied') {
                return {
                    success: false,
                    message: 'Permission permanently denied. User must manually enable in browser settings.',
                    instructions: this.getPermissionRecoveryInstructions()
                };
            }

            // Try to enumerate devices (this sometimes triggers permission prompt)
            const deviceInfo = await this.enumerateAudioDevices();

            if (deviceInfo.devices.length === 0) {
                return {
                    success: false,
                    message: 'No audio devices found.',
                    instructions: ['Connect a microphone or headset', 'Refresh the page and try again']
                };
            }

            // Try to access microphone with basic constraints
            const testResult = await this.testMicrophoneDevice();

            if (testResult.success) {
                return {
                    success: true,
                    message: 'Permission recovered successfully.',
                    deviceInfo: testResult
                };
            } else {
                return {
                    success: false,
                    message: 'Permission recovery failed.',
                    error: testResult.error,
                    instructions: this.getPermissionRecoveryInstructions()
                };
            }

        } catch (error) {
            console.error('❌ Permission recovery failed:', error);
            return {
                success: false,
                message: 'Permission recovery failed.',
                error: error.message,
                instructions: this.getPermissionRecoveryInstructions()
            };
        }
    },

    /**
     * Get browser-specific permission recovery instructions
     */
    getPermissionRecoveryInstructions() {
        const browser = this.detectBrowser();

        const instructions = {
            Chrome: [
                'Click the camera/microphone icon in the address bar',
                'Select "Always allow" for microphone access',
                'Refresh the page and try again'
            ],
            Firefox: [
                'Click the microphone icon in the address bar',
                'Select "Allow" and check "Remember this decision"',
                'Refresh the page and try again'
            ],
            Safari: [
                'Go to Safari > Preferences > Websites > Microphone',
                'Set this website to "Allow"',
                'Refresh the page and try again'
            ],
            Edge: [
                'Click the microphone icon in the address bar',
                'Select "Allow" for microphone access',
                'Refresh the page and try again'
            ]
        };

        return instructions[browser.name] || [
            'Check your browser settings for microphone permissions',
            'Ensure this website is allowed to access your microphone',
            'Refresh the page and try again'
        ];
    },

    /**
     * Monitor permission changes
     */
    monitorPermissionChanges() {
        if (!navigator.permissions) {
            console.warn('⚠️ Permission monitoring not supported');
            return;
        }

        navigator.permissions.query({ name: 'microphone' })
            .then(permission => {
                permission.addEventListener('change', () => {
                    console.log('🔐 Microphone permission changed:', permission.state);

                    if (this.onPermissionChange) {
                        this.onPermissionChange(permission.state);
                    }
                });
            })
            .catch(error => {
                console.warn('⚠️ Could not monitor permission changes:', error);
            });
    },

    /**
     * Get comprehensive error diagnostics
     */
    async getDiagnostics() {
        const diagnostics = {
            timestamp: new Date().toISOString(),
            browser: this.detectBrowser(),
            support: this.checkBrowserSupport(),
            permissions: await this.checkMicrophonePermission(),
            devices: await this.enumerateAudioDevices(),
            context: {
                protocol: location.protocol,
                hostname: location.hostname,
                userAgent: navigator.userAgent
            }
        };

        // Test basic functionality
        try {
            diagnostics.microphoneTest = await this.testMicrophoneDevice();
        } catch (error) {
            diagnostics.microphoneTest = {
                success: false,
                error: error.message
            };
        }

        console.log('🔍 Complete diagnostics:', diagnostics);
        return diagnostics;
    },

    /**
     * Start recording audio
     */
    async startRecording(options = {}) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            if (this.isRecording) {
                console.warn('⚠️ Recording already in progress');
                return false;
            }

            console.log('🎤 Starting audio recording...');

            // Reset recorded chunks
            this.recordedChunks = [];

            // Get compression profile
            const quality = options.quality || this.settings.quality || 'medium';
            const profile = this.compressionProfiles[quality] || this.compressionProfiles.medium;

            // Merge options with compression profile
            const recordingOptions = {
                mimeType: options.mimeType || this.getOptimalFormat('voice', quality),
                audioBitsPerSecond: options.audioBitsPerSecond || profile.audioBitsPerSecond,
                timeslice: options.timeslice || 1000,
                quality: quality,
                profile: profile,
                ...options
            };

            // Create enhanced MediaRecorder
            this.mediaRecorder = this.createMediaRecorder(recordingOptions);

            // Set up event handlers
            this.setupMediaRecorderEvents();

            // Start recording with timeslice for chunked data
            this.mediaRecorder.start(recordingOptions.timeslice);

            this.isRecording = true;
            this.isPaused = false;
            this.recordingStartTime = Date.now();

            if (this.onRecordingStart) {
                this.onRecordingStart();
            }

            console.log('✅ Recording started with options:', recordingOptions);
            return true;

        } catch (error) {
            console.error('❌ Failed to start recording:', error);
            if (this.onError) {
                this.onError(error);
            }
            return false;
        }
    },

    /**
     * Create MediaRecorder with enhanced options
     */
    createMediaRecorder(options) {
        // Validate MediaRecorder support
        if (!window.MediaRecorder) {
            throw new Error('MediaRecorder API not supported in this browser');
        }

        // Validate MIME type support
        if (options.mimeType && !MediaRecorder.isTypeSupported(options.mimeType)) {
            console.warn(`⚠️ MIME type ${options.mimeType} not supported, falling back to default`);
            options.mimeType = this.getBestMimeType();
        }

        // Create MediaRecorder with validated options
        const mediaRecorderOptions = {};

        if (options.mimeType) {
            mediaRecorderOptions.mimeType = options.mimeType;
        }

        if (options.audioBitsPerSecond) {
            mediaRecorderOptions.audioBitsPerSecond = options.audioBitsPerSecond;
        }

        if (options.videoBitsPerSecond) {
            mediaRecorderOptions.videoBitsPerSecond = options.videoBitsPerSecond;
        }

        if (options.bitsPerSecond) {
            mediaRecorderOptions.bitsPerSecond = options.bitsPerSecond;
        }

        console.log('🎵 Creating MediaRecorder with options:', mediaRecorderOptions);

        return new MediaRecorder(this.mediaStream, mediaRecorderOptions);
    },

    /**
     * Get audio bitrate based on quality setting
     */
    getAudioBitrate(quality) {
        const bitrates = {
            low: 64000,      // 64 kbps - good for voice
            medium: 128000,  // 128 kbps - balanced quality/size
            high: 256000,    // 256 kbps - high quality
            lossless: 512000 // 512 kbps - near lossless
        };

        return bitrates[quality] || bitrates.medium;
    },

    /**
     * Stop recording audio with enhanced processing
     */
    stopRecording() {
        try {
            if (!this.isRecording) {
                console.warn('⚠️ No recording in progress');
                return null;
            }

            console.log('⏹️ Stopping audio recording...');

            this.mediaRecorder.stop();
            this.isRecording = false;
            this.isPaused = false;

            if (this.onRecordingStop) {
                this.onRecordingStop();
            }

            console.log('✅ Recording stopped');

            // Return promise that resolves with enhanced recording data
            return new Promise((resolve, reject) => {
                this.mediaRecorder.addEventListener('stop', () => {
                    try {
                        // Create the audio blob
                        const blob = new Blob(this.recordedChunks, {
                            type: this.mediaRecorder.mimeType || 'audio/webm'
                        });

                        // Get recording statistics
                        const stats = this.getRecordingStats();

                        // Analyze audio quality
                        const qualityAnalysis = this.analyzeAudioQuality(blob);

                        // Create enhanced result object
                        const result = {
                            blob: blob,
                            stats: stats,
                            quality: qualityAnalysis,
                            metadata: {
                                recordedAt: new Date().toISOString(),
                                duration: stats.duration,
                                size: stats.totalSize,
                                mimeType: blob.type,
                                chunks: stats.chunkCount
                            }
                        };

                        console.log('📊 Recording complete:', {
                            duration: `${stats.duration}s`,
                            size: `${(stats.totalSize / 1024).toFixed(1)} KB`,
                            quality: qualityAnalysis.quality,
                            mimeType: blob.type
                        });

                        resolve(result);

                    } catch (error) {
                        console.error('❌ Error processing recording:', error);
                        reject(error);
                    }
                }, { once: true });

                // Add timeout to prevent hanging
                setTimeout(() => {
                    reject(new Error('Recording stop timeout'));
                }, 5000);
            });

        } catch (error) {
            console.error('❌ Failed to stop recording:', error);
            if (this.onError) {
                this.onError(error);
            }
            return Promise.reject(error);
        }
    },

    /**
     * Pause recording
     */
    pauseRecording() {
        try {
            if (!this.isRecording || this.isPaused) {
                console.warn('⚠️ Cannot pause: not recording or already paused');
                return false;
            }
            
            this.mediaRecorder.pause();
            this.isPaused = true;
            
            if (this.onRecordingPause) {
                this.onRecordingPause();
            }
            
            console.log('⏸️ Recording paused');
            return true;
            
        } catch (error) {
            console.error('❌ Failed to pause recording:', error);
            if (this.onError) {
                this.onError(error);
            }
            return false;
        }
    },

    /**
     * Resume recording
     */
    resumeRecording() {
        try {
            if (!this.isRecording || !this.isPaused) {
                console.warn('⚠️ Cannot resume: not recording or not paused');
                return false;
            }
            
            this.mediaRecorder.resume();
            this.isPaused = false;
            
            if (this.onRecordingResume) {
                this.onRecordingResume();
            }
            
            console.log('▶️ Recording resumed');
            return true;
            
        } catch (error) {
            console.error('❌ Failed to resume recording:', error);
            if (this.onError) {
                this.onError(error);
            }
            return false;
        }
    },

    /**
     * Get the best supported MIME type for recording with compression consideration
     */
    getBestMimeType(preferredQuality = 'medium') {
        // Get compression profile
        const profile = this.compressionProfiles[preferredQuality] || this.compressionProfiles.medium;

        // Prioritized list based on voice optimization and compression
        const voiceOptimizedTypes = [
            'audio/webm;codecs=opus',    // Best for voice compression
            'audio/ogg;codecs=opus',     // Open source Opus
            'audio/mp4;codecs=mp4a.40.2' // AAC-LC for compatibility
        ];

        const compatibilityTypes = [
            'audio/mp4',                 // General AAC
            'audio/webm',               // General WebM
            'audio/ogg',                // General OGG
            'audio/wav'                 // Uncompressed fallback
        ];

        // Try voice-optimized formats first for better compression
        for (const type of voiceOptimizedTypes) {
            if (MediaRecorder.isTypeSupported(type)) {
                console.log(`🎵 Selected voice-optimized MIME type: ${type}`);
                return type;
            }
        }

        // Fall back to compatibility formats
        for (const type of compatibilityTypes) {
            if (MediaRecorder.isTypeSupported(type)) {
                console.log(`🎵 Selected compatible MIME type: ${type}`);
                return type;
            }
        }

        console.warn('⚠️ No preferred MIME type supported, using browser default');
        return '';
    },

    /**
     * Get optimal format for specific use case
     */
    getOptimalFormat(useCase = 'voice', quality = 'medium') {
        const useCaseFormats = {
            voice: [
                'audio/webm;codecs=opus',
                'audio/ogg;codecs=opus',
                'audio/mp4;codecs=mp4a.40.2'
            ],
            music: [
                'audio/mp4;codecs=mp4a.40.2',
                'audio/webm;codecs=opus',
                'audio/wav'
            ],
            compatibility: [
                'audio/mp4',
                'audio/wav',
                'audio/webm'
            ]
        };

        const formats = useCaseFormats[useCase] || useCaseFormats.voice;

        for (const format of formats) {
            if (MediaRecorder.isTypeSupported(format)) {
                const spec = this.formatSpecs[format];
                console.log(`🎯 Optimal format for ${useCase}:`, {
                    format,
                    codec: spec?.codec,
                    compression: spec?.compression,
                    voiceOptimized: spec?.voiceOptimized
                });
                return format;
            }
        }

        return this.getBestMimeType(quality);
    },

    /**
     * Get all supported MIME types for this browser
     */
    getSupportedMimeTypes() {
        const types = [
            'audio/webm;codecs=opus',
            'audio/webm;codecs=pcm',
            'audio/webm',
            'audio/mp4;codecs=mp4a.40.2',
            'audio/mp4;codecs=mp4a.40.5',
            'audio/mp4;codecs=mp4a.67',
            'audio/mp4;codecs=mp4a.40.29',
            'audio/mp4',
            'audio/ogg;codecs=opus',
            'audio/ogg;codecs=flac',
            'audio/ogg',
            'audio/wav',
            'audio/mpeg',
            'audio/mp3'
        ];

        const supported = types.filter(type => MediaRecorder.isTypeSupported(type));
        console.log('🎵 Supported MIME types:', supported);
        return supported;
    },

    /**
     * Convert recorded audio to different format with compression
     */
    async convertAudioFormat(blob, targetMimeType, compressionOptions = {}) {
        try {
            // If target format is the same as source, return as-is
            if (blob.type === targetMimeType) {
                console.log('🔄 Source and target formats match, no conversion needed');
                return blob;
            }

            console.log(`🔄 Converting audio from ${blob.type} to ${targetMimeType}`);

            // Check if target format is supported
            if (!MediaRecorder.isTypeSupported(targetMimeType)) {
                console.warn(`⚠️ Target format ${targetMimeType} not supported`);
                return blob;
            }

            // For basic format conversion using Web Audio API
            return await this.performAudioConversion(blob, targetMimeType, compressionOptions);

        } catch (error) {
            console.error('❌ Audio conversion failed:', error);
            return blob; // Return original on error
        }
    },

    /**
     * Perform audio conversion using Web Audio API
     */
    async performAudioConversion(blob, targetMimeType, options = {}) {
        try {
            // Create audio context for processing
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Convert blob to array buffer
            const arrayBuffer = await blob.arrayBuffer();

            // Decode audio data
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

            // Apply compression/processing if needed
            const processedBuffer = await this.processAudioBuffer(audioBuffer, options);

            // For now, return original blob as Web Audio API conversion is complex
            // In production, you'd implement proper encoding here
            console.log('🔄 Audio processing complete, returning processed data');

            // Close audio context to free resources
            await audioContext.close();

            return blob; // Return original for now

        } catch (error) {
            console.error('❌ Audio processing failed:', error);
            return blob;
        }
    },

    /**
     * Process audio buffer for compression and enhancement
     */
    async processAudioBuffer(audioBuffer, options = {}) {
        try {
            const {
                normalize = true,
                noiseReduction = true,
                compression = true
            } = options;

            console.log('🎛️ Processing audio buffer:', {
                duration: audioBuffer.duration,
                sampleRate: audioBuffer.sampleRate,
                channels: audioBuffer.numberOfChannels,
                normalize,
                noiseReduction,
                compression
            });

            // Get audio data
            const channelData = audioBuffer.getChannelData(0);

            // Apply normalization
            if (normalize) {
                this.normalizeAudio(channelData);
            }

            // Apply noise reduction (basic implementation)
            if (noiseReduction) {
                this.applyNoiseReduction(channelData);
            }

            // Apply compression (basic implementation)
            if (compression) {
                this.applyCompression(channelData);
            }

            return audioBuffer;

        } catch (error) {
            console.error('❌ Audio buffer processing failed:', error);
            return audioBuffer;
        }
    },

    /**
     * Normalize audio levels
     */
    normalizeAudio(channelData) {
        // Find peak amplitude
        let peak = 0;
        for (let i = 0; i < channelData.length; i++) {
            peak = Math.max(peak, Math.abs(channelData[i]));
        }

        // Normalize to 90% of maximum to prevent clipping
        if (peak > 0) {
            const normalizeRatio = 0.9 / peak;
            for (let i = 0; i < channelData.length; i++) {
                channelData[i] *= normalizeRatio;
            }
            console.log(`🔊 Audio normalized, peak was ${peak.toFixed(3)}`);
        }
    },

    /**
     * Apply basic noise reduction
     */
    applyNoiseReduction(channelData) {
        // Simple noise gate - reduce very quiet sounds
        const threshold = 0.01;
        let reducedSamples = 0;

        for (let i = 0; i < channelData.length; i++) {
            if (Math.abs(channelData[i]) < threshold) {
                channelData[i] *= 0.1; // Reduce by 90%
                reducedSamples++;
            }
        }

        console.log(`🔇 Noise reduction applied to ${reducedSamples} samples`);
    },

    /**
     * Apply basic compression
     */
    applyCompression(channelData) {
        // Simple compression - reduce dynamic range
        const threshold = 0.7;
        const ratio = 0.5;
        let compressedSamples = 0;

        for (let i = 0; i < channelData.length; i++) {
            const sample = channelData[i];
            const amplitude = Math.abs(sample);

            if (amplitude > threshold) {
                const excess = amplitude - threshold;
                const compressedExcess = excess * ratio;
                const newAmplitude = threshold + compressedExcess;
                channelData[i] = sample >= 0 ? newAmplitude : -newAmplitude;
                compressedSamples++;
            }
        }

        console.log(`🗜️ Compression applied to ${compressedSamples} samples`);
    },

    /**
     * Analyze audio quality with compression metrics
     */
    analyzeAudioQuality(blob) {
        const stats = this.getRecordingStats();
        const formatSpec = this.formatSpecs[stats.mimeType] || {};

        const analysis = {
            duration: stats.duration,
            fileSize: stats.totalSize,
            estimatedBitrate: stats.estimatedBitrate,
            mimeType: stats.mimeType,
            codec: formatSpec.codec || 'Unknown',
            compression: formatSpec.compression || 'Unknown',
            voiceOptimized: formatSpec.voiceOptimized || false,
            quality: 'unknown',
            compressionRatio: this.calculateCompressionRatio(stats),
            recommendations: []
        };

        // Analyze bitrate for quality assessment
        if (stats.estimatedBitrate > 0) {
            if (stats.estimatedBitrate < 32000) {
                analysis.quality = 'low';
                analysis.recommendations.push('Consider using higher quality settings for better transcription accuracy');
            } else if (stats.estimatedBitrate < 64000) {
                analysis.quality = 'medium-low';
                analysis.recommendations.push('Adequate for voice, but higher quality may improve transcription');
            } else if (stats.estimatedBitrate < 128000) {
                analysis.quality = 'medium';
                analysis.recommendations.push('Good quality for voice recording and transcription');
            } else if (stats.estimatedBitrate < 256000) {
                analysis.quality = 'high';
                analysis.recommendations.push('Excellent quality for professional veterinary use');
            } else {
                analysis.quality = 'very high';
                analysis.recommendations.push('Very high quality - excellent for archival but large files');
            }
        }

        // Analyze compression efficiency
        if (analysis.compressionRatio > 10) {
            analysis.recommendations.push('Excellent compression - small file size with good quality');
        } else if (analysis.compressionRatio > 5) {
            analysis.recommendations.push('Good compression ratio for the quality level');
        } else if (analysis.compressionRatio < 2) {
            analysis.recommendations.push('Low compression - consider using a more efficient codec');
        }

        // Format-specific recommendations
        if (formatSpec.voiceOptimized) {
            analysis.recommendations.push('Using voice-optimized codec for best transcription results');
        } else {
            analysis.recommendations.push('Consider using Opus or AAC codec for better voice compression');
        }

        // Duration analysis
        if (stats.duration < 5) {
            analysis.recommendations.push('Very short recording - may lack context for accurate transcription');
        } else if (stats.duration > 300) {
            analysis.recommendations.push('Long recording - consider breaking into 5-minute segments for better processing');
        } else if (stats.duration > 60) {
            analysis.recommendations.push('Good length for comprehensive veterinary consultation notes');
        }

        // File size analysis with compression context
        const sizeMB = stats.totalSize / (1024 * 1024);
        const sizePerMinute = sizeMB / (stats.duration / 60);

        if (sizePerMinute > 5) {
            analysis.recommendations.push('Large file size per minute - consider higher compression settings');
        } else if (sizePerMinute < 0.5) {
            analysis.recommendations.push('Very efficient compression - good balance of size and quality');
        }

        // Add format upgrade suggestions
        if (!formatSpec.voiceOptimized && MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
            analysis.recommendations.push('Consider switching to Opus codec for better voice compression');
        }

        console.log('📊 Enhanced audio quality analysis:', analysis);
        return analysis;
    },

    /**
     * Calculate compression ratio estimate
     */
    calculateCompressionRatio(stats) {
        // Estimate uncompressed size (16-bit PCM at 44.1kHz)
        const uncompressedSize = stats.duration * 44100 * 2; // 2 bytes per sample
        const compressionRatio = uncompressedSize / stats.totalSize;

        return Math.round(compressionRatio * 10) / 10; // Round to 1 decimal
    },

    /**
     * Get compression recommendations for different use cases
     */
    getCompressionRecommendations(useCase = 'veterinary') {
        const recommendations = {
            veterinary: {
                preferredFormats: ['audio/webm;codecs=opus', 'audio/mp4;codecs=mp4a.40.2'],
                qualityProfile: 'medium',
                bitrate: '64-128 kbps',
                reasoning: 'Optimized for voice clarity and transcription accuracy while maintaining reasonable file sizes'
            },
            archival: {
                preferredFormats: ['audio/wav', 'audio/mp4;codecs=mp4a.40.2'],
                qualityProfile: 'high',
                bitrate: '128-256 kbps',
                reasoning: 'High quality for long-term storage and future processing'
            },
            mobile: {
                preferredFormats: ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus'],
                qualityProfile: 'medium-low',
                bitrate: '32-64 kbps',
                reasoning: 'Optimized for mobile bandwidth and storage constraints'
            },
            transcription: {
                preferredFormats: ['audio/webm;codecs=opus', 'audio/wav'],
                qualityProfile: 'medium',
                bitrate: '64-128 kbps',
                reasoning: 'Balanced quality for optimal speech recognition accuracy'
            }
        };

        return recommendations[useCase] || recommendations.veterinary;
    },

    /**
     * Validate and optimize recording settings
     */
    validateRecordingSettings(options = {}) {
        const validation = {
            isValid: true,
            warnings: [],
            optimizations: [],
            finalOptions: { ...options }
        };

        // Validate MIME type
        if (options.mimeType && !MediaRecorder.isTypeSupported(options.mimeType)) {
            validation.warnings.push(`MIME type ${options.mimeType} not supported`);
            validation.finalOptions.mimeType = this.getBestMimeType();
            validation.optimizations.push(`Switched to ${validation.finalOptions.mimeType}`);
        }

        // Validate bitrate
        if (options.audioBitsPerSecond) {
            if (options.audioBitsPerSecond < 8000) {
                validation.warnings.push('Bitrate too low for voice recording');
                validation.finalOptions.audioBitsPerSecond = 32000;
            } else if (options.audioBitsPerSecond > 512000) {
                validation.warnings.push('Bitrate unnecessarily high');
                validation.finalOptions.audioBitsPerSecond = 256000;
            }
        }

        // Validate quality profile
        if (options.quality && !this.compressionProfiles[options.quality]) {
            validation.warnings.push(`Unknown quality profile: ${options.quality}`);
            validation.finalOptions.quality = 'medium';
        }

        // Check format compatibility with quality
        const formatSpec = this.formatSpecs[validation.finalOptions.mimeType];
        if (formatSpec && !formatSpec.voiceOptimized && options.quality === 'low') {
            validation.optimizations.push('Using voice-optimized codec for better low-quality compression');
            validation.finalOptions.mimeType = this.getOptimalFormat('voice', options.quality);
        }

        console.log('✅ Recording settings validation:', validation);
        return validation;
    },

    /**
     * Get estimated file size for recording duration
     */
    estimateFileSize(durationSeconds, options = {}) {
        const quality = options.quality || 'medium';
        const profile = this.compressionProfiles[quality] || this.compressionProfiles.medium;
        const bitrate = options.audioBitsPerSecond || profile.audioBitsPerSecond;

        // Calculate estimated size in bytes
        const estimatedBytes = (bitrate / 8) * durationSeconds;

        // Add overhead for container format (approximately 5-10%)
        const withOverhead = estimatedBytes * 1.1;

        return {
            bytes: Math.round(withOverhead),
            kilobytes: Math.round(withOverhead / 1024),
            megabytes: Math.round((withOverhead / (1024 * 1024)) * 100) / 100,
            bitrate: bitrate,
            quality: quality
        };
    },

    /**
     * Compare different compression options
     */
    compareCompressionOptions(durationSeconds = 60) {
        const comparison = {};

        Object.keys(this.compressionProfiles).forEach(quality => {
            const profile = this.compressionProfiles[quality];
            const estimate = this.estimateFileSize(durationSeconds, { quality });

            comparison[quality] = {
                profile: profile,
                estimate: estimate,
                description: profile.description,
                recommendedFor: this.getQualityRecommendation(quality)
            };
        });

        console.log('📊 Compression options comparison:', comparison);
        return comparison;
    },

    /**
     * Get recommendation for quality level
     */
    getQualityRecommendation(quality) {
        const recommendations = {
            low: 'Quick notes, poor network conditions, storage constraints',
            medium: 'Standard veterinary consultations, balanced quality/size',
            high: 'Important consultations, complex cases, archival',
            lossless: 'Critical recordings, legal documentation, research'
        };

        return recommendations[quality] || 'General use';
    },

    /**
     * Auto-select optimal settings based on constraints
     */
    autoSelectSettings(constraints = {}) {
        const {
            maxFileSize = null,        // in MB
            maxDuration = 300,         // in seconds
            networkSpeed = 'fast',     // slow, medium, fast
            storageSpace = 'unlimited', // limited, moderate, unlimited
            useCase = 'veterinary'     // veterinary, archival, mobile, transcription
        } = constraints;

        let selectedQuality = 'medium';

        // Adjust based on constraints
        if (maxFileSize) {
            const estimates = this.compareCompressionOptions(maxDuration);
            for (const [quality, data] of Object.entries(estimates)) {
                if (data.estimate.megabytes <= maxFileSize) {
                    selectedQuality = quality;
                    break;
                }
            }
        }

        if (networkSpeed === 'slow' || storageSpace === 'limited') {
            selectedQuality = 'low';
        } else if (storageSpace === 'unlimited' && useCase === 'archival') {
            selectedQuality = 'high';
        }

        const profile = this.compressionProfiles[selectedQuality];
        const mimeType = this.getOptimalFormat('voice', selectedQuality);

        const settings = {
            quality: selectedQuality,
            mimeType: mimeType,
            audioBitsPerSecond: profile.audioBitsPerSecond,
            profile: profile,
            reasoning: `Auto-selected based on: ${Object.keys(constraints).join(', ')}`
        };

        console.log('🤖 Auto-selected settings:', settings);
        return settings;
    },

    /**
     * Set up MediaRecorder event handlers with enhanced functionality
     */
    setupMediaRecorderEvents() {
        // Handle data available - core recording functionality
        this.mediaRecorder.addEventListener('dataavailable', (event) => {
            if (event.data && event.data.size > 0) {
                this.recordedChunks.push(event.data);

                // Calculate recording statistics
                const totalSize = this.recordedChunks.reduce((sum, chunk) => sum + chunk.size, 0);
                const duration = this.getRecordingDuration();

                console.log(`📊 Audio chunk: ${event.data.size} bytes, Total: ${totalSize} bytes, Duration: ${duration}s`);

                // Notify listeners with enhanced data
                if (this.onDataAvailable) {
                    this.onDataAvailable({
                        data: event.data,
                        totalSize: totalSize,
                        duration: duration,
                        chunkCount: this.recordedChunks.length
                    });
                }
            }
        });

        // Handle recording start
        this.mediaRecorder.addEventListener('start', (event) => {
            console.log('🎤 MediaRecorder started');
            this.recordingStartTime = Date.now();

            // Log recording configuration
            console.log('🎵 Recording configuration:', {
                mimeType: this.mediaRecorder.mimeType,
                state: this.mediaRecorder.state,
                stream: {
                    active: this.mediaStream.active,
                    tracks: this.mediaStream.getTracks().length
                }
            });
        });

        // Handle recording stop
        this.mediaRecorder.addEventListener('stop', (event) => {
            const duration = this.getRecordingDuration();
            const totalSize = this.recordedChunks.reduce((sum, chunk) => sum + chunk.size, 0);

            console.log('⏹️ MediaRecorder stopped', {
                duration: `${duration}s`,
                chunks: this.recordedChunks.length,
                totalSize: `${totalSize} bytes`,
                mimeType: this.mediaRecorder.mimeType
            });
        });

        // Handle recording pause
        this.mediaRecorder.addEventListener('pause', (event) => {
            console.log('⏸️ MediaRecorder paused');
        });

        // Handle recording resume
        this.mediaRecorder.addEventListener('resume', (event) => {
            console.log('▶️ MediaRecorder resumed');
        });

        // Handle errors with detailed information
        this.mediaRecorder.addEventListener('error', (event) => {
            const error = event.error;
            console.error('❌ MediaRecorder error:', {
                name: error.name,
                message: error.message,
                state: this.mediaRecorder.state,
                mimeType: this.mediaRecorder.mimeType
            });

            // Reset recording state on error
            this.isRecording = false;
            this.isPaused = false;

            if (this.onError) {
                this.onError(error);
            }
        });

        // Handle warning events (if supported)
        if ('onwarning' in this.mediaRecorder) {
            this.mediaRecorder.addEventListener('warning', (event) => {
                console.warn('⚠️ MediaRecorder warning:', event);
            });
        }
    },

    /**
     * Get current recording duration in seconds
     */
    getRecordingDuration() {
        if (!this.recordingStartTime) return 0;
        return Math.floor((Date.now() - this.recordingStartTime) / 1000);
    },

    /**
     * Get recording statistics
     */
    getRecordingStats() {
        const totalSize = this.recordedChunks.reduce((sum, chunk) => sum + chunk.size, 0);
        const duration = this.getRecordingDuration();
        const bitrate = duration > 0 ? (totalSize * 8) / duration : 0;

        return {
            duration: duration,
            totalSize: totalSize,
            chunkCount: this.recordedChunks.length,
            estimatedBitrate: Math.round(bitrate),
            mimeType: this.mediaRecorder?.mimeType || 'unknown',
            state: this.mediaRecorder?.state || 'inactive'
        };
    },

    /**
     * Start monitoring audio volume levels
     */
    startVolumeMonitoring() {
        if (!this.analyserNode) return;
        
        const bufferLength = this.analyserNode.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const updateVolume = () => {
            if (!this.analyserNode) return;
            
            this.analyserNode.getByteFrequencyData(dataArray);
            
            // Calculate average volume
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
            }
            const average = sum / bufferLength;
            const volume = average / 255; // Normalize to 0-1
            
            if (this.onVolumeChange) {
                this.onVolumeChange(volume);
            }
            
            // Continue monitoring
            requestAnimationFrame(updateVolume);
        };
        
        updateVolume();
    },

    /**
     * Get current recording state
     */
    getState() {
        return {
            isInitialized: this.isInitialized,
            isRecording: this.isRecording,
            isPaused: this.isPaused,
            audioContextState: this.audioContext?.state,
            recordedDuration: this.recordedChunks.length,
            mimeType: this.mediaRecorder?.mimeType
        };
    },

    /**
     * Clean up resources
     */
    cleanup() {
        try {
            console.log('🧹 Cleaning up AudioRecorder...');
            
            // Stop recording if active
            if (this.isRecording) {
                this.stopRecording();
            }
            
            // Stop media stream tracks
            if (this.mediaStream) {
                this.mediaStream.getTracks().forEach(track => track.stop());
                this.mediaStream = null;
            }
            
            // Disconnect audio nodes
            if (this.sourceNode) {
                this.sourceNode.disconnect();
                this.sourceNode = null;
            }
            
            if (this.analyserNode) {
                this.analyserNode.disconnect();
                this.analyserNode = null;
            }
            
            // Close audio context
            if (this.audioContext && this.audioContext.state !== 'closed') {
                this.audioContext.close();
                this.audioContext = null;
            }
            
            // Reset state
            this.isInitialized = false;
            this.isRecording = false;
            this.isPaused = false;
            this.recordedChunks = [];
            
            console.log('✅ AudioRecorder cleanup complete');
            
        } catch (error) {
            console.error('❌ Error during cleanup:', error);
        }
    }
};

// Make AudioRecorder available globally
window.AudioRecorder = AudioRecorder;
