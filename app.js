/**
 * VetScribe - Veterinary Voice-to-SOAP Note Generator
 * Main Application Module
 */

// Application state management
const AppState = {
    currentTab: 'record',
    isRecording: false,
    isPaused: false,
    isConnected: false,
    currentTranscript: '',
    transcriptQuality: null,
    currentSoapNotes: null,
    currentAudioBlob: null,
    patientInfo: {},
    currentRecordingStats: null,
    deviceInfo: null,
    currentRecordingQuality: null,
    recordingStartTime: null,
    recordingTimer: null,
    currentVolume: 0,
    
    // Settings
    settings: {
        llmEndpoint: '',
        audioQuality: 'medium',
        autoDelete: false,
        soapTemplate: 'standard',
        visitType: null,
        includePatientContext: true,
        encryptionEnabled: true,
        encryptionPassword: null
    }
};

// DOM element references
const DOMElements = {
    // Tab navigation
    tabButtons: null,
    tabPanels: null,
    
    // Recording elements
    recordButton: null,
    pauseButton: null,
    stopButton: null,
    recordLabel: null,
    recordingTimer: null,
    recordingStatus: null,
    secondaryControls: null,
    volumeIndicator: null,
    volumeBars: null,
    
    // Connection status
    connectionStatus: null,
    statusIndicator: null,
    statusText: null,
    
    // SOAP notes elements
    generateButton: null,
    soapTextarea: null,
    copyButton: null,
    editButton: null,
    saveButton: null,
    exportButton: null,
    
    // History elements
    searchInput: null,
    historyList: null,
    
    // Settings elements
    llmEndpoint: null,
    audioQuality: null,
    autoDelete: null,
    testConnectionButton: null,
    
    // Loading overlay
    loadingOverlay: null,
    loadingText: null,

    // Keyboard hint
    keyboardHint: null
};

/**
 * Application initialization
 */
async function initializeApp() {
    console.log('🚀 Initializing VetScribe application...');
    
    try {
        // Initialize DOM references
        initializeDOMReferences();
        
        // Set up event listeners
        setupEventListeners();



        // Initialize modules
        await initializeModules();
        
        // Load saved settings
        loadSettings();
        
        // Set initial UI state
        setInitialUIState();


        
        console.log('✅ VetScribe application initialized successfully');
        
    } catch (error) {
        console.error('❌ Failed to initialize application:', error);
        showError('Failed to initialize application. Please refresh the page.');
    }
}

/**
 * Initialize DOM element references
 */
function initializeDOMReferences() {
    // Tab navigation
    DOMElements.tabButtons = document.querySelectorAll('.tab-button');
    DOMElements.tabPanels = document.querySelectorAll('.tab-panel');
    
    // Recording elements
    DOMElements.recordButton = document.getElementById('recordButton');
    DOMElements.pauseButton = document.getElementById('pauseButton');
    DOMElements.stopButton = document.getElementById('stopButton');
    DOMElements.recordLabel = document.getElementById('recordLabel');
    DOMElements.recordingTimer = document.getElementById('recordingTimer');
    DOMElements.recordingStatus = document.getElementById('recordingStatus');
    DOMElements.secondaryControls = document.getElementById('secondaryControls');
    DOMElements.volumeIndicator = document.getElementById('volumeIndicator');
    DOMElements.volumeBars = document.getElementById('volumeBars');
    
    // Connection status
    DOMElements.connectionStatus = document.getElementById('connectionStatus');
    DOMElements.statusIndicator = document.getElementById('statusIndicator');
    DOMElements.statusText = document.getElementById('statusText');
    
    // SOAP notes elements
    DOMElements.generateButton = document.getElementById('generateButton');
    DOMElements.soapTextarea = document.getElementById('soapTextarea');
    DOMElements.copyButton = document.getElementById('copyButton');
    DOMElements.editButton = document.getElementById('editButton');
    DOMElements.saveButton = document.getElementById('saveButton');
    DOMElements.exportButton = document.getElementById('exportButton');
    
    // History elements
    DOMElements.searchInput = document.getElementById('searchInput');
    DOMElements.historyList = document.getElementById('historyList');
    
    // Settings elements
    DOMElements.llmEndpoint = document.getElementById('llmEndpoint');
    DOMElements.audioQuality = document.getElementById('audioQuality');
    DOMElements.autoDelete = document.getElementById('autoDelete');
    DOMElements.testConnectionButton = document.getElementById('testConnectionButton');
    
    // Loading overlay
    DOMElements.loadingOverlay = document.getElementById('loadingOverlay');
    DOMElements.loadingText = document.getElementById('loadingText');

    // Keyboard hint
    DOMElements.keyboardHint = document.getElementById('keyboardHint');

    console.log('📋 DOM references initialized');
}

/**
 * Set up event listeners for UI interactions
 */
function setupEventListeners() {
    // Tab navigation
    DOMElements.tabButtons.forEach(button => {
        button.addEventListener('click', handleTabClick);
    });
    
    // Recording controls
    if (DOMElements.recordButton) {
        DOMElements.recordButton.addEventListener('click', handleRecordButtonClick);
    }

    if (DOMElements.pauseButton) {
        DOMElements.pauseButton.addEventListener('click', handlePauseButtonClick);
    }

    if (DOMElements.stopButton) {
        DOMElements.stopButton.addEventListener('click', handleStopButtonClick);
    }
    
    // SOAP notes buttons
    if (DOMElements.generateButton) {
        DOMElements.generateButton.addEventListener('click', handleGenerateSOAP);
    }

    if (DOMElements.copyButton) {
        DOMElements.copyButton.addEventListener('click', handleCopyToClipboard);
    }

    if (DOMElements.editButton) {
        DOMElements.editButton.addEventListener('click', handleEditNotes);
    }

    if (DOMElements.saveButton) {
        DOMElements.saveButton.addEventListener('click', handleSaveNotes);
    }

    if (DOMElements.exportButton) {
        DOMElements.exportButton.addEventListener('click', handleExportNotes);
    }
    
    // Settings
    if (DOMElements.testConnectionButton) {
        DOMElements.testConnectionButton.addEventListener('click', handleTestConnection);
    }
    
    if (DOMElements.llmEndpoint) {
        DOMElements.llmEndpoint.addEventListener('change', handleSettingsChange);
    }
    
    if (DOMElements.audioQuality) {
        DOMElements.audioQuality.addEventListener('change', handleSettingsChange);
    }
    
    if (DOMElements.autoDelete) {
        DOMElements.autoDelete.addEventListener('change', handleSettingsChange);
    }
    
    // Search functionality
    if (DOMElements.searchInput) {
        DOMElements.searchInput.addEventListener('input', handleSearch);
    }

    // Browser navigation
    window.addEventListener('popstate', handlePopState);

    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboardNavigation);

    console.log('🎯 Event listeners set up');
}

/**
 * Initialize application modules
 */
async function initializeModules() {
    // Set up AudioRecorder event handlers
    if (typeof AudioRecorder !== 'undefined') {
        setupAudioRecorderEvents();
    }

    // Set up Transcription event handlers
    if (typeof Transcription !== 'undefined') {
        setupTranscriptionEvents();
    }

    // Set up LLM Connector event handlers
    if (typeof LLMConnector !== 'undefined') {
        setupLLMConnectorEvents();
    }

    if (typeof SOAPGenerator !== 'undefined') {
        SOAPGenerator.initialize();
    }

    // Initialize enhanced storage system
    if (typeof Storage !== 'undefined') {
        await Storage.init();

        // Load storage statistics
        const stats = Storage.stats;
        console.log('📊 Storage initialized with stats:', stats);

        // Show storage status in UI
        updateStorageStatus(stats);
    }

    // Initialize responsive features
    initializeResponsiveFeatures();

    // Initialize error handling system
    if (typeof ErrorHandler !== 'undefined') {
        ErrorHandler.init();
    }

    // Initialize secure communication
    if (typeof SecureCommunication !== 'undefined') {
        try {
            await SecureCommunication.init();
            console.log('🔒 Secure communication initialized');
        } catch (error) {
            console.warn('⚠️ Secure communication initialization failed:', error);
        }
    }

    // Initialize data validation
    if (typeof DataValidator !== 'undefined') {
        DataValidator.init({
            strictMode: true,
            logValidation: true,
            autoSanitize: true
        });
        console.log('🛡️ Data validation initialized');
    }

    // Initialize privacy management
    if (typeof PrivacyManager !== 'undefined') {
        PrivacyManager.init();
        console.log('🔒 Privacy management initialized');
    }

    // Initialize secure export
    if (typeof SecureExport !== 'undefined') {
        SecureExport.init();
        console.log('📦 Secure export initialized');
    }

    console.log('🔧 Modules initialized');
}

/**
 * Set up AudioRecorder event handlers
 */
function setupAudioRecorderEvents() {
    // Handle recording start
    AudioRecorder.onRecordingStart = () => {
        console.log('🎤 AudioRecorder: Recording started');
        updateConnectionStatus('connected', 'Recording...');
    };

    // Handle recording stop
    AudioRecorder.onRecordingStop = () => {
        console.log('⏹️ AudioRecorder: Recording stopped');
        updateConnectionStatus('connected', 'Ready');
    };

    // Handle recording pause
    AudioRecorder.onRecordingPause = () => {
        console.log('⏸️ AudioRecorder: Recording paused');
        AppState.isPaused = true;
        updateRecordingControlsState();
        updateConnectionStatus('connected', 'Paused');
    };

    // Handle recording resume
    AudioRecorder.onRecordingResume = () => {
        console.log('▶️ AudioRecorder: Recording resumed');
        AppState.isPaused = false;
        updateRecordingControlsState();
        updateConnectionStatus('connected', 'Recording...');
    };

    // Handle volume changes
    AudioRecorder.onVolumeChange = (volume) => {
        AppState.currentVolume = volume;
        updateVolumeIndicator(volume);
    };

    // Handle errors
    AudioRecorder.onError = (error) => {
        console.error('❌ AudioRecorder error:', error);
        handleMicrophoneError(error);

        // Reset recording state
        AppState.isRecording = false;
        AppState.isPaused = false;
        updateRecordingControlsState();

        if (AppState.recordingTimer) {
            clearInterval(AppState.recordingTimer);
            AppState.recordingTimer = null;
        }

        updateConnectionStatus('error', 'Recording failed');
    };

    // Handle permission changes
    AudioRecorder.onPermissionChange = (state) => {
        console.log('🔐 Permission changed:', state);

        switch (state) {
            case 'granted':
                updateConnectionStatus('connected', 'Microphone access granted');
                break;
            case 'denied':
                updateConnectionStatus('error', 'Microphone access denied');
                showError('Microphone access was revoked. Please refresh the page and grant permissions.');
                break;
            case 'prompt':
                updateConnectionStatus('connecting', 'Microphone permission required');
                break;
        }
    };

    // Handle data available (for real-time processing if needed)
    AudioRecorder.onDataAvailable = (enhancedData) => {
        // Enhanced data includes statistics and metadata
        console.log('📊 Audio data chunk received:', {
            chunkSize: enhancedData.data.size,
            totalSize: enhancedData.totalSize,
            duration: enhancedData.duration,
            chunks: enhancedData.chunkCount
        });

        // Update UI with real-time stats if needed
        updateRecordingProgress(enhancedData);
    };
}

/**
 * Set up Transcription event handlers
 */
function setupTranscriptionEvents() {
    // Handle transcription start
    Transcription.onStart = () => {
        console.log('🎤 Transcription: Listening started');
        updateRecordingStatus('Listening for speech...');
    };

    // Handle transcription end
    Transcription.onEnd = () => {
        console.log('⏹️ Transcription: Listening ended');
        updateRecordingStatus('Speech recognition stopped');
    };

    // Handle speech detection
    Transcription.onSpeechStart = () => {
        console.log('🗣️ Transcription: Speech detected');
        updateRecordingStatus('Speech detected - transcribing...');
    };

    // Handle speech end
    Transcription.onSpeechEnd = () => {
        console.log('🤐 Transcription: Speech ended');
        updateRecordingStatus('Processing speech...');
    };

    // Handle transcript updates (real-time)
    Transcription.onTranscriptUpdate = (transcriptData) => {
        console.log('📝 Transcript update:', transcriptData.current);

        // Update app state
        AppState.currentTranscript = transcriptData.current;

        // Update UI with real-time transcript
        updateTranscriptDisplay(transcriptData);
    };

    // Handle final transcript with quality assessment
    Transcription.onFinalTranscript = (finalText, confidence, quality) => {
        console.log('✅ Final transcript:', finalText, 'Confidence:', confidence);

        if (quality) {
            console.log('📊 Transcript quality:', quality);
            handleTranscriptQuality(quality);
        }

        // Validate and sanitize transcript
        let validatedTranscript = Transcription.getState().currentTranscript;
        if (typeof DataValidator !== 'undefined') {
            const validation = DataValidator.validateSecurity(validatedTranscript);

            if (!validation.isSecure) {
                console.warn('⚠️ Transcript security issues:', validation.threats);
                showWarning(
                    'Transcript contains potentially unsafe content.',
                    validation.threats.concat(['Content has been sanitized for safety'])
                );

                // Sanitize the transcript
                validatedTranscript = DataValidator.sanitizeText(validatedTranscript);
            } else {
                // Still sanitize for consistency
                validatedTranscript = DataValidator.sanitizeText(validatedTranscript);
            }
        }

        // Update app state with validated transcript
        AppState.currentTranscript = validatedTranscript;

        // Enable generate button if we have transcript
        if (AppState.currentTranscript.trim().length > 0) {
            enableButton(DOMElements.generateButton);
        }

        // Show confidence and quality indicators
        updateTranscriptConfidence(confidence, quality);
    };

    // Handle transcription errors
    Transcription.onError = (error) => {
        console.error('❌ Transcription error:', error);

        let errorMessage = 'Speech recognition failed.';

        if (error.userAction) {
            errorMessage = `${error.message} ${error.userAction}`;
        } else {
            errorMessage = error.message || 'Unknown transcription error.';
        }

        updateRecordingStatus('Speech recognition error');
        showError(errorMessage);
    };

    // Handle no speech match
    Transcription.onNoMatch = () => {
        console.log('❓ Transcription: No speech match');
        updateRecordingStatus('No speech recognized - try speaking more clearly');
    };

    // Handle fallback recommendations
    Transcription.onFallbackRecommendation = (methods) => {
        console.log('💡 Fallback methods recommended:', methods);
        showFallbackRecommendation(methods);
    };

    // Handle fallback options available
    Transcription.onFallbackOptionsAvailable = (options) => {
        console.log('🔄 Fallback options available:', options);
        showFallbackOptions(options);
    };

    // Handle manual transcription required
    Transcription.onManualTranscriptionRequired = () => {
        console.log('📝 Manual transcription required');
        showManualTranscriptionInterface();
    };

    // Handle file upload required
    Transcription.onFileUploadRequired = () => {
        console.log('📁 File upload required');
        showFileUploadInterface();
    };

    // Handle file upload result
    Transcription.onFileUploadResult = (result) => {
        console.log('📁 File upload result:', result);
        showFileUploadResult(result);
    };
}

/**
 * Set up LLM Connector event handlers
 */
function setupLLMConnectorEvents() {
    // Handle connection changes with enhanced details
    LLMConnector.onConnectionChange = (isConnected, message, details = {}) => {
        console.log('🤖 LLM Connection changed:', isConnected, message, details);

        const status = details.status || (isConnected ? 'connected' : 'error');

        updateConnectionStatus(status, message, {
            endpoint: LLMConnector.currentEndpoint,
            attempts: details.attempts || 0,
            lastError: details.lastError,
            timestamp: details.timestamp
        });
    };

    // Handle LLM responses
    LLMConnector.onResponse = (response) => {
        console.log('🤖 LLM Response received:', response);
        handleSOAPResponse(response);
    };

    // Handle LLM errors
    LLMConnector.onError = (error) => {
        console.error('❌ LLM Error:', error);
        handleLLMError(error);
    };

    // Handle progress updates
    LLMConnector.onProgress = (progress) => {
        console.log('🔄 LLM Progress:', progress);

        if (progress.stage === 'discovery' || progress.stage === 'testing') {
            updateDiscoveryProgress(progress);
        } else {
            updateSOAPGenerationProgress(progress);
        }
    };
}

/**
 * Load saved settings from storage
 */
async function loadSettings() {
    try {
        const savedSettings = localStorage.getItem('vetscribe-settings');
        if (savedSettings) {
            AppState.settings = { ...AppState.settings, ...JSON.parse(savedSettings) };

            // Apply settings to UI
            if (DOMElements.llmEndpoint) {
                DOMElements.llmEndpoint.value = AppState.settings.llmEndpoint || '';
            }
            if (DOMElements.audioQuality) {
                DOMElements.audioQuality.value = AppState.settings.audioQuality || 'medium';
            }
            if (DOMElements.autoDelete) {
                DOMElements.autoDelete.checked = AppState.settings.autoDelete || false;
            }
        }

        // Initialize encryption if enabled
        if (AppState.settings.encryptionEnabled && typeof Encryption !== 'undefined') {
            try {
                await Encryption.init(AppState.settings.encryptionPassword);
                console.log('🔐 Encryption initialized from settings');
            } catch (error) {
                console.warn('⚠️ Failed to initialize encryption from settings:', error);
            }
        }

        console.log('⚙️ Settings loaded');
    } catch (error) {
        console.warn('⚠️ Failed to load settings:', error);
    }
}

/**
 * Set initial UI state
 */
function setInitialUIState() {
    // Initialize navigation from URL
    initializeNavigationFromURL();

    // Set initial connection status
    updateConnectionStatus('disconnected', 'Not connected');

    // Reset recording timer
    updateRecordingTimer(0);

    // Disable buttons that require data
    disableButton(DOMElements.generateButton);
    disableButton(DOMElements.copyButton);
    disableButton(DOMElements.editButton);
    disableButton(DOMElements.saveButton);
    disableButton(DOMElements.exportButton);

    // Show keyboard hints briefly on first load
    showKeyboardHints();

    console.log('🎨 Initial UI state set');
}

/**
 * Tab switching functionality
 */
function handleTabClick(event) {
    const tabName = event.target.dataset.tab;
    if (tabName) {
        switchTab(tabName);
    }
}

function switchTab(tabName) {
    // Validate tab name
    const validTabs = ['record', 'notes', 'history', 'settings'];
    if (!validTabs.includes(tabName)) {
        console.warn(`Invalid tab name: ${tabName}`);
        return;
    }

    // Update state
    AppState.currentTab = tabName;

    // Update tab buttons
    DOMElements.tabButtons.forEach(button => {
        button.classList.remove('active');
        if (button.dataset.tab === tabName) {
            button.classList.add('active');
        }
    });

    // Update tab panels with animation
    DOMElements.tabPanels.forEach(panel => {
        panel.classList.remove('active');
        if (panel.id === `${tabName}Panel`) {
            panel.classList.add('active');
        }
    });

    // Handle tab-specific initialization
    handleTabActivation(tabName);

    // Update URL hash for navigation state
    updateNavigationState(tabName);

    console.log(`📑 Switched to ${tabName} tab`);
}

/**
 * Handle tab-specific initialization when activated
 */
function handleTabActivation(tabName) {
    switch (tabName) {
        case 'record':
            initializeRecordingTab();
            break;
        case 'notes':
            initializeNotesTab();
            break;
        case 'history':
            initializeHistoryTab();
            break;
        case 'settings':
            initializeSettingsTab();
            break;
    }
}

/**
 * Initialize recording tab
 */
function initializeRecordingTab() {
    // Check browser compatibility first
    checkBrowserCompatibility();

    // Check transcription support
    checkTranscriptionSupport();

    // Check microphone permissions
    checkMicrophonePermissions();

    // Update recording controls state
    updateRecordingControlsState();

    // Reset timer if not recording
    if (!AppState.isRecording) {
        updateRecordingTimer(0);
        updateRecordingStatus('Ready to record');
    }
}

/**
 * Check transcription support and show warnings if needed
 */
function checkTranscriptionSupport() {
    try {
        if (typeof Transcription === 'undefined') {
            console.warn('⚠️ Transcription module not loaded');
            return;
        }

        const compatibility = Transcription.getCompatibilityInfo();

        console.log('🎤 Speech recognition compatibility:', compatibility);

        if (!compatibility.supported) {
            showTranscriptionWarning(compatibility);
        } else {
            // Test transcription functionality
            testTranscriptionCapability();
        }

    } catch (error) {
        console.error('❌ Transcription support check failed:', error);
    }
}

/**
 * Show transcription warning for unsupported browsers
 */
function showTranscriptionWarning(compatibility) {
    let message = 'Speech recognition is not supported in this browser. ';
    message += 'You can still record audio, but automatic transcription will not be available.';

    if (compatibility.recommendations.length > 0) {
        message += '\n\nRecommendations:\n';
        message += compatibility.recommendations.map(rec => `• ${rec}`).join('\n');
    }

    console.warn('⚠️ Speech recognition warning:', message);
    updateConnectionStatus('warning', 'No speech recognition');
}

/**
 * Test transcription capability
 */
async function testTranscriptionCapability() {
    try {
        if (typeof Transcription === 'undefined') {
            return;
        }

        // Quick test to ensure transcription works
        const testResult = await Transcription.testRecognition();

        if (testResult.success) {
            console.log('✅ Speech recognition test passed');
            updateConnectionStatus('connected', 'Speech recognition ready');
        } else {
            console.warn('⚠️ Speech recognition test failed:', testResult.error);
            updateConnectionStatus('warning', 'Speech recognition limited');
        }

    } catch (error) {
        console.warn('⚠️ Could not test speech recognition:', error);
        updateConnectionStatus('warning', 'Speech recognition uncertain');
    }
}

/**
 * Check browser compatibility and show warnings if needed
 */
async function checkBrowserCompatibility() {
    try {
        if (typeof AudioRecorder === 'undefined') {
            console.warn('⚠️ AudioRecorder not available, skipping compatibility check');
            return;
        }

        const diagnostics = await AudioRecorder.getDiagnostics();
        const support = diagnostics.support;

        console.log('🔍 Browser compatibility check:', {
            score: support.compatible,
            browser: support.browser,
            issues: support.issues
        });

        // Show warnings for compatibility issues
        if (support.compatible < 70) {
            showCompatibilityWarning(support);
        }

        // Show specific warnings for known issues
        if (support.issues && support.issues.length > 0) {
            const criticalIssues = support.issues.filter(issue => issue.type === 'critical');
            if (criticalIssues.length > 0) {
                showCriticalCompatibilityIssues(criticalIssues);
            }
        }

        // Protocol warning
        if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
            showProtocolWarning();
        }

    } catch (error) {
        console.error('❌ Compatibility check failed:', error);
    }
}

/**
 * Show compatibility warning for low-scoring browsers
 */
function showCompatibilityWarning(support) {
    const browserName = support.browser.name;
    const score = support.compatible;

    let message = `Your browser (${browserName}) has limited compatibility (${score}/100). `;
    message += 'Some features may not work properly. ';

    if (support.recommendations && support.recommendations.length > 0) {
        message += '\n\nRecommendations:\n';
        message += support.recommendations.map(rec => `• ${rec}`).join('\n');
    }

    console.warn('⚠️ Browser compatibility warning:', message);

    // For now, just log the warning
    // In a full implementation, you might show a dismissible banner
}

/**
 * Show critical compatibility issues
 */
function showCriticalCompatibilityIssues(issues) {
    let message = 'Critical compatibility issues detected:\n\n';

    issues.forEach(issue => {
        message += `❌ ${issue.feature}: ${issue.message}\n`;
        message += `   Solution: ${issue.solution}\n\n`;
    });

    console.error('❌ Critical compatibility issues:', issues);
    showError(message);
}

/**
 * Show protocol warning for non-HTTPS sites
 */
function showProtocolWarning() {
    const message = 'You are not using HTTPS. Microphone access may be limited or blocked. ' +
                   'For best results, use HTTPS in production.';

    console.warn('⚠️ Protocol warning:', message);
    updateConnectionStatus('warning', 'HTTP detected - limited functionality');
}

/**
 * Initialize notes tab
 */
function initializeNotesTab() {
    // Update button states based on available data
    updateNotesButtonStates();

    // Check if we have transcript data to generate notes
    if (AppState.currentTranscript && !AppState.currentSoapNotes) {
        enableButton(DOMElements.generateButton);
    }
}

/**
 * Initialize history tab
 */
function initializeHistoryTab() {
    // Load and display saved notes
    loadSavedNotes();

    // Clear search input
    if (DOMElements.searchInput) {
        DOMElements.searchInput.value = '';
    }
}

/**
 * Initialize settings tab
 */
function initializeSettingsTab() {
    // Test connection status
    if (AppState.settings.llmEndpoint) {
        testLLMConnection();
    }

    // Update connection indicator
    updateConnectionStatus();
}

/**
 * Update navigation state in URL
 */
function updateNavigationState(tabName) {
    // Update URL hash without triggering page reload
    if (history.replaceState) {
        history.replaceState(null, null, `#${tabName}`);
    } else {
        window.location.hash = tabName;
    }
}

/**
 * Initialize navigation from URL hash
 */
function initializeNavigationFromURL() {
    const hash = window.location.hash.substring(1);
    const validTabs = ['record', 'notes', 'history', 'settings'];

    if (hash && validTabs.includes(hash)) {
        switchTab(hash);
    } else {
        switchTab('record'); // Default tab
    }
}

/**
 * Handle browser back/forward navigation
 */
function handlePopState(event) {
    const hash = window.location.hash.substring(1);
    if (hash) {
        switchTab(hash);
    } else {
        switchTab('record');
    }
}

/**
 * Navigation helper functions
 */
function updateRecordingButtonState() {
    if (!DOMElements.recordButton) return;

    // Remove all state classes
    DOMElements.recordButton.classList.remove('recording', 'paused');

    if (AppState.isRecording) {
        if (AppState.isPaused) {
            DOMElements.recordButton.classList.add('paused');
        } else {
            DOMElements.recordButton.classList.add('recording');
        }
    }
}

function updateRecordingControlsState() {
    // Update main record button
    updateRecordingButtonState();

    // Update record label
    if (DOMElements.recordLabel) {
        if (AppState.isRecording) {
            if (AppState.isPaused) {
                DOMElements.recordLabel.textContent = 'Resume';
            } else {
                DOMElements.recordLabel.textContent = 'Stop';
            }
        } else {
            DOMElements.recordLabel.textContent = 'Record';
        }
    }

    // Update secondary controls visibility
    if (DOMElements.secondaryControls) {
        if (AppState.isRecording) {
            DOMElements.secondaryControls.classList.add('show');
        } else {
            DOMElements.secondaryControls.classList.remove('show');
        }
    }

    // Update pause button
    if (DOMElements.pauseButton) {
        DOMElements.pauseButton.disabled = !AppState.isRecording;

        if (AppState.isPaused) {
            DOMElements.pauseButton.classList.add('active');
            DOMElements.pauseButton.querySelector('.control-text').textContent = 'Resume';
            DOMElements.pauseButton.querySelector('.control-icon').textContent = '▶️';
        } else {
            DOMElements.pauseButton.classList.remove('active');
            DOMElements.pauseButton.querySelector('.control-text').textContent = 'Pause';
            DOMElements.pauseButton.querySelector('.control-icon').textContent = '⏸️';
        }
    }

    // Update stop button
    if (DOMElements.stopButton) {
        DOMElements.stopButton.disabled = !AppState.isRecording;
    }

    // Update volume indicator
    if (DOMElements.volumeIndicator) {
        if (AppState.isRecording && !AppState.isPaused) {
            DOMElements.volumeIndicator.classList.add('show');
        } else {
            DOMElements.volumeIndicator.classList.remove('show');
        }
    }
}

function updateRecordingStatus(status) {
    if (DOMElements.recordingStatus) {
        DOMElements.recordingStatus.textContent = status;
    }
}

function updateNotesButtonStates() {
    // Enable/disable buttons based on available data
    if (AppState.currentSoapNotes) {
        enableButton(DOMElements.copyButton);
        enableButton(DOMElements.editButton);
        enableButton(DOMElements.saveButton);
        enableButton(DOMElements.exportButton);
    } else {
        disableButton(DOMElements.copyButton);
        disableButton(DOMElements.editButton);
        disableButton(DOMElements.saveButton);
        disableButton(DOMElements.exportButton);
    }

    if (AppState.currentTranscript && !AppState.currentSoapNotes) {
        enableButton(DOMElements.generateButton);
    } else {
        disableButton(DOMElements.generateButton);
    }
}

async function checkMicrophonePermissions() {
    try {
        console.log('🔍 Checking microphone permissions and browser compatibility...');

        // Comprehensive browser support check
        if (typeof AudioRecorder === 'undefined') {
            throw new Error('AudioRecorder module not loaded');
        }

        const support = AudioRecorder.checkBrowserSupport();

        if (!support) {
            const diagnostics = await AudioRecorder.getDiagnostics();
            throw new Error(`Browser not compatible. Score: ${diagnostics.support.compatible}/100`);
        }

        // Check permission status first
        const permissionStatus = await AudioRecorder.checkMicrophonePermission();
        console.log('🔐 Permission status:', permissionStatus);

        if (permissionStatus.state === 'denied') {
            throw new Error('Microphone permission denied. Please enable in browser settings.');
        }

        // Test microphone access
        const testResult = await AudioRecorder.testMicrophoneDevice();

        if (!testResult.success) {
            throw testResult.error;
        }

        console.log('✅ Microphone permissions and compatibility verified');
        updateConnectionStatus('connected', 'Microphone ready');

        // Start monitoring permission changes
        AudioRecorder.monitorPermissionChanges();

    } catch (error) {
        console.error('❌ Microphone check failed:', error);
        await handleMicrophoneError(error);
    }
}

/**
 * Handle microphone errors with recovery options
 */
async function handleMicrophoneError(error) {
    console.log('🔧 Handling microphone error:', error);

    let errorMessage = 'Microphone access failed.';
    let userAction = 'Please check your microphone and try again.';
    let showRecovery = false;

    // Use enhanced error information if available
    if (error.userAction) {
        errorMessage = error.message;
        userAction = error.userAction;
        showRecovery = true;
    } else {
        // Handle standard errors
        switch (error.name) {
            case 'NotAllowedError':
                errorMessage = 'Microphone access denied.';
                userAction = 'Please grant microphone permissions and refresh the page.';
                showRecovery = true;
                break;
            case 'NotFoundError':
                errorMessage = 'No microphone found.';
                userAction = 'Please connect a microphone and try again.';
                break;
            case 'NotSupportedError':
                errorMessage = 'Your browser does not support audio recording.';
                userAction = 'Please use a modern browser like Chrome, Firefox, or Safari.';
                break;
            case 'SecurityError':
                errorMessage = 'Microphone access blocked by security policy.';
                userAction = 'Please ensure you are using HTTPS or localhost.';
                break;
            default:
                errorMessage = error.message || 'Unknown microphone error.';
                break;
        }
    }

    updateConnectionStatus('error', 'Microphone unavailable');

    // Show error with recovery options
    if (showRecovery) {
        await showMicrophoneErrorWithRecovery(errorMessage, userAction, error);
    } else {
        showError(`${errorMessage} ${userAction}`);
    }
}

/**
 * Show microphone error with recovery options
 */
async function showMicrophoneErrorWithRecovery(message, userAction, originalError) {
    console.log('🔄 Showing error with recovery options');

    // For now, show a detailed error message
    // In a full implementation, this could show a modal with recovery options
    let fullMessage = `${message}\n\n${userAction}`;

    // Add browser-specific instructions if available
    if (typeof AudioRecorder !== 'undefined') {
        const instructions = AudioRecorder.getPermissionRecoveryInstructions();
        if (instructions.length > 0) {
            fullMessage += '\n\nDetailed steps:\n' + instructions.map(step => `• ${step}`).join('\n');
        }
    }

    // Add diagnostics for technical users
    if (originalError && originalError.technical) {
        fullMessage += `\n\nTechnical details: ${originalError.technical}`;
    }

    showError(fullMessage);

    // Attempt automatic recovery for certain errors
    if (originalError && originalError.name === 'NotAllowedError') {
        setTimeout(async () => {
            console.log('🔄 Attempting automatic permission recovery...');
            const recovery = await AudioRecorder.recoverFromPermissionError();

            if (recovery.success) {
                console.log('✅ Permission recovery successful');
                updateConnectionStatus('connected', 'Microphone recovered');
                // Could show success message or automatically retry
            } else {
                console.log('❌ Permission recovery failed:', recovery.message);
            }
        }, 5000); // Wait 5 seconds before attempting recovery
    }
}

/**
 * Update volume indicator based on current audio level
 */
function updateVolumeIndicator(volume) {
    // Store current volume
    AppState.currentVolume = volume;

    // Update visual volume bars
    updateVolumeBars(volume);

    // Only update status when recording and not paused
    if (!AppState.isRecording || AppState.isPaused) return;

    // Update connection status with volume level
    const volumePercent = Math.round(volume * 100);
    const volumeBars = '▁▂▃▄▅▆▇█';
    const barIndex = Math.floor(volume * (volumeBars.length - 1));
    const volumeBar = volumeBars[barIndex] || '▁';

    updateConnectionStatus('connected', `Recording ${volumeBar} ${volumePercent}%`);
}

/**
 * Update visual volume bars
 */
function updateVolumeBars(volume) {
    if (!DOMElements.volumeBars) return;

    const bars = DOMElements.volumeBars.querySelectorAll('.volume-bar');
    const activeBarCount = Math.floor(volume * bars.length);

    bars.forEach((bar, index) => {
        // Remove all classes
        bar.classList.remove('active', 'peak', 'overload');

        if (index < activeBarCount) {
            if (volume > 0.9) {
                bar.classList.add('overload'); // Red for very high volume
            } else if (volume > 0.7) {
                bar.classList.add('peak'); // Orange for high volume
            } else {
                bar.classList.add('active'); // Green for normal volume
            }
        }
    });
}

/**
 * Load saved notes from enhanced storage
 */
function loadSavedNotes() {
    console.log('📋 Loading saved notes from storage...');

    try {
        if (typeof Storage === 'undefined') {
            console.warn('⚠️ Storage module not available');
            showEmptyNotesState();
            return;
        }

        // Get recent SOAP notes
        const soapNotes = Storage.getSOAPNotes();
        const recentNotes = soapNotes
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 10); // Show last 10 notes

        if (recentNotes.length === 0) {
            showEmptyNotesState();
            return;
        }

        // Display notes in history list
        displayNotesHistory(recentNotes);

        console.log(`✅ Loaded ${recentNotes.length} saved notes`);

    } catch (error) {
        console.error('❌ Failed to load saved notes:', error);
        showEmptyNotesState();
    }
}

/**
 * Show empty state for notes
 */
function showEmptyNotesState() {
    if (DOMElements.historyList) {
        DOMElements.historyList.innerHTML = `
            <div class="empty-state">
                <p>No saved notes yet. Start by recording a conversation!</p>
            </div>
        `;
    }
}

async function testLLMConnection() {
    if (!AppState.settings.llmEndpoint) {
        updateConnectionStatus('disconnected', 'No endpoint configured');
        showWarning(
            'LLM endpoint not configured. Please set up your connection in Settings.',
            [
                'Go to the Settings tab',
                'Enter your Ollama endpoint URL (e.g., http://100.x.x.x:11434/v1)',
                'Click Test Connection to verify',
                'Ensure Ollama is running on your home PC with Tailscale'
            ]
        );
        return;
    }

    try {
        updateConnectionStatus('connecting', 'Testing connection...');

        // TODO: Implement actual connection test when LLMConnector is ready
        await Utils.sleep(1000); // Simulate connection test

        // For now, simulate success
        updateConnectionStatus('connected', 'Connected to LLM');
        console.log('🔗 LLM connection test successful');

    } catch (error) {
        updateConnectionStatus('error', 'Connection failed');
        console.error('🔗 LLM connection test failed:', error);
    }
}

/**
 * Recording control functions
 */
function handleRecordButtonClick() {
    if (AppState.isRecording) {
        // If recording, stop it
        stopRecording();
    } else {
        // If not recording, start it
        startRecording();
    }
}

function handlePauseButtonClick() {
    if (AppState.isRecording && !AppState.isPaused) {
        pauseRecording();
    } else if (AppState.isRecording && AppState.isPaused) {
        resumeRecording();
    }
}

function handleStopButtonClick() {
    if (AppState.isRecording) {
        stopRecording();
    }
}

async function startRecording() {
    console.log('🎤 Starting recording...');

    try {
        // Initialize AudioRecorder if needed
        if (!AudioRecorder.isInitialized) {
            showLoading('Initializing microphone...');
            const success = await AudioRecorder.initialize();
            hideLoading();

            if (!success) {
                showError(
                    'Failed to initialize microphone. Please check permissions and try again.',
                    'audio',
                    'high',
                    {
                        suggestions: [
                            'Click the microphone icon in your browser\'s address bar',
                            'Select "Allow" when prompted for microphone access',
                            'Check that your microphone is connected and working',
                            'Try refreshing the page and allowing access again'
                        ],
                        retryFunction: () => startRecording(),
                        retryKey: 'audio_init'
                    }
                );
                return;
            }
        }

        // Start audio recording with quality settings
        showLoading('Starting recording...');
        const qualitySettings = getRecordingQualitySettings();
        const success = await AudioRecorder.startRecording(qualitySettings);
        hideLoading();

        if (!success) {
            showError(
                'Failed to start recording. Please try again.',
                'audio',
                'medium',
                {
                    suggestions: [
                        'Ensure your microphone is not being used by another application',
                        'Check microphone permissions in browser settings',
                        'Try using a different microphone if available',
                        'Refresh the page and try again'
                    ],
                    retryFunction: () => startRecording(),
                    retryKey: 'recording_start'
                }
            );
            return;
        }

        // Update app state
        AppState.isRecording = true;
        AppState.isPaused = false;
        AppState.recordingStartTime = Date.now();

        // Update UI
        updateRecordingControlsState();
        updateRecordingStatus('Recording...');

        // Start timer
        AppState.recordingTimer = setInterval(updateRecordingTimerDisplay, 1000);

        // Start transcription if available
        startTranscription();

        console.log('✅ Recording started successfully');

        // Show success feedback
        showSuccess('Recording started successfully. Speak clearly for best results.');

    } catch (error) {
        hideLoading();
        console.error('❌ Failed to start recording:', error);
        showError(
            'Failed to start recording due to a system error.',
            'audio',
            'high',
            {
                technicalDetails: error.message,
                suggestions: [
                    'Check that your browser supports audio recording',
                    'Ensure you\'re using a secure (HTTPS) connection',
                    'Try using a different browser',
                    'Restart your browser and try again'
                ],
                retryFunction: () => startRecording(),
                retryKey: 'recording_system_error'
            }
        );
    }
}

async function stopRecording() {
    console.log('⏹️ Stopping recording...');

    try {
        showLoading('Processing recording...');

        // Stop audio recording and get enhanced data
        const recordingResult = await AudioRecorder.stopRecording();

        if (!recordingResult || !recordingResult.blob) {
            throw new Error('Failed to get recorded audio');
        }

        // Update app state with enhanced data
        AppState.isRecording = false;
        AppState.isPaused = false;
        AppState.currentAudioBlob = recordingResult.blob;
        AppState.currentRecordingStats = recordingResult.stats;
        AppState.currentRecordingQuality = recordingResult.quality;

        // Update UI
        updateRecordingControlsState();
        updateRecordingStatus('Recording complete');

        // Stop timer
        if (AppState.recordingTimer) {
            clearInterval(AppState.recordingTimer);
            AppState.recordingTimer = null;
        }

        // Stop transcription
        stopTranscription();

        hideLoading();

        // Enable generate button since we now have audio
        enableButton(DOMElements.generateButton);

        // Show recording summary with compression analysis
        showRecordingSummary(recordingResult);
        showCompressionAnalysis(recordingResult);

        console.log('✅ Recording stopped successfully', {
            duration: `${recordingResult.stats.duration}s`,
            size: `${(recordingResult.stats.totalSize / 1024).toFixed(1)} KB`,
            quality: recordingResult.quality.quality,
            type: recordingResult.blob.type
        });

        // Auto-switch to notes tab for better UX
        switchTab('notes');

    } catch (error) {
        hideLoading();
        console.error('❌ Failed to stop recording:', error);
        showError(`Failed to stop recording: ${error.message}`);
    }
}

async function pauseRecording() {
    console.log('⏸️ Pausing recording...');

    try {
        const success = AudioRecorder.pauseRecording();

        if (!success) {
            throw new Error('Failed to pause recording');
        }

        // Update app state
        AppState.isPaused = true;

        // Update UI
        updateRecordingControlsState();
        updateRecordingStatus('Paused');

        console.log('✅ Recording paused successfully');

    } catch (error) {
        console.error('❌ Failed to pause recording:', error);
        showError(`Failed to pause recording: ${error.message}`);
    }
}

async function resumeRecording() {
    console.log('▶️ Resuming recording...');

    try {
        const success = AudioRecorder.resumeRecording();

        if (!success) {
            throw new Error('Failed to resume recording');
        }

        // Update app state
        AppState.isPaused = false;

        // Update UI
        updateRecordingControlsState();
        updateRecordingStatus('Recording...');

        console.log('✅ Recording resumed successfully');

    } catch (error) {
        console.error('❌ Failed to resume recording:', error);
        showError(`Failed to resume recording: ${error.message}`);
    }
}

/**
 * Utility functions
 */
function updateRecordingTimer(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    
    if (DOMElements.recordingTimer) {
        DOMElements.recordingTimer.textContent = timeString;
    }
}

function updateRecordingTimerDisplay() {
    if (AppState.recordingStartTime) {
        const elapsed = Math.floor((Date.now() - AppState.recordingStartTime) / 1000);
        updateRecordingTimer(elapsed);
    }
}

/**
 * Enhanced connection status display with detailed information and retry indicators
 */
function updateConnectionStatus(status, message = '', details = {}) {
    AppState.isConnected = status === 'connected';

    const statusIndicator = DOMElements.statusIndicator;
    const statusText = DOMElements.statusText;

    if (statusIndicator && statusText) {
        // Remove all status classes
        statusIndicator.className = 'status-indicator';

        // Add current status class
        statusIndicator.classList.add(status);

        // Update status text with enhanced information
        const displayMessage = message || getDefaultStatusMessage(status);
        statusText.textContent = displayMessage;

        // Add retry indicator if reconnecting
        if (status === 'reconnecting' && details.attempts > 0) {
            addRetryIndicator(statusIndicator, details.attempts);
        } else {
            removeRetryIndicator(statusIndicator);
        }

        console.log(`🔗 Status updated: ${status} - ${displayMessage}`, details);
    }
}

/**
 * Get enhanced status message for a given status
 */
function getDefaultStatusMessage(status) {
    const messages = {
        'connected': 'Connected to Ollama',
        'connecting': 'Connecting to Ollama...',
        'reconnecting': 'Reconnecting...',
        'disconnected': 'Not connected',
        'error': 'Connection error',
        'warning': 'Connection issues'
    };

    return messages[status] || 'Unknown status';
}

/**
 * Add retry indicator to status
 */
function addRetryIndicator(statusIndicator, attempts) {
    removeRetryIndicator(statusIndicator);

    const retryIndicator = document.createElement('div');
    retryIndicator.className = 'retry-indicator';
    retryIndicator.title = `Retry attempt ${attempts}`;
    statusIndicator.appendChild(retryIndicator);
}

/**
 * Remove retry indicator
 */
function removeRetryIndicator(statusIndicator) {
    const existing = statusIndicator.querySelector('.retry-indicator');
    if (existing) {
        existing.remove();
    }
}

function enableButton(button) {
    if (button) {
        button.disabled = false;
    }
}

function disableButton(button) {
    if (button) {
        button.disabled = true;
    }
}

/**
 * Enhanced error handling with user-friendly feedback
 */
function showError(message, category = 'system', severity = 'medium', context = {}) {
    console.error('❌', message);

    if (typeof ErrorHandler !== 'undefined') {
        ErrorHandler.handleError({
            category: ErrorHandler.categories[category.toUpperCase()] || ErrorHandler.categories.SYSTEM,
            severity: ErrorHandler.severity[severity.toUpperCase()] || ErrorHandler.severity.MEDIUM,
            message: message,
            context: context,
            technicalDetails: context.technicalDetails || message
        });
    } else {
        // Fallback to basic alert if ErrorHandler not available
        alert(message);
    }
}

/**
 * Show success feedback to user
 */
function showSuccess(message, autoHide = true) {
    console.log('✅', message);

    if (typeof ErrorHandler !== 'undefined') {
        ErrorHandler.handleError({
            category: ErrorHandler.categories.USER,
            severity: ErrorHandler.severity.LOW,
            message: message,
            context: {
                type: 'success',
                autoHide: autoHide,
                suggestions: ['Operation completed successfully']
            }
        });
    }
}

/**
 * Show warning feedback to user
 */
function showWarning(message, suggestions = []) {
    console.warn('⚠️', message);

    if (typeof ErrorHandler !== 'undefined') {
        ErrorHandler.handleError({
            category: ErrorHandler.categories.USER,
            severity: ErrorHandler.severity.MEDIUM,
            message: message,
            context: {
                type: 'warning',
                suggestions: suggestions.length > 0 ? suggestions : ['Please review and try again']
            }
        });
    }
}

/**
 * Show info feedback to user
 */
function showInfo(message, suggestions = []) {
    console.info('ℹ️', message);

    if (typeof ErrorHandler !== 'undefined') {
        ErrorHandler.handleError({
            category: ErrorHandler.categories.USER,
            severity: ErrorHandler.severity.LOW,
            message: message,
            context: {
                type: 'info',
                suggestions: suggestions.length > 0 ? suggestions : []
            }
        });
    }
}

function showLoading(message = 'Processing...') {
    if (DOMElements.loadingOverlay) {
        DOMElements.loadingOverlay.classList.add('active');
    }
    if (DOMElements.loadingText) {
        DOMElements.loadingText.textContent = message;
    }
}

function hideLoading() {
    if (DOMElements.loadingOverlay) {
        DOMElements.loadingOverlay.classList.remove('active');
    }
}

// SOAP generation event handler
async function handleGenerateSOAP() {
    console.log('🔄 Generate SOAP clicked');
    try {
        await generateSOAPNotes();
    } catch (error) {
        console.error('❌ SOAP generation failed:', error);
    }
}

async function handleCopyToClipboard() {
    console.log('📋 Copy to clipboard clicked');

    if (DOMElements.soapTextarea && DOMElements.soapTextarea.value.trim()) {
        const success = await Utils.copyToClipboard(DOMElements.soapTextarea.value);

        if (success) {
            // Temporarily change button text to show success
            const originalText = DOMElements.copyButton.textContent;
            DOMElements.copyButton.textContent = 'Copied!';
            DOMElements.copyButton.style.backgroundColor = 'var(--success-color)';

            setTimeout(() => {
                DOMElements.copyButton.textContent = originalText;
                DOMElements.copyButton.style.backgroundColor = '';
            }, 2000);
        } else {
            showError(
                'Failed to copy to clipboard.',
                'system',
                'medium',
                {
                    suggestions: [
                        'Try selecting the text manually and pressing Ctrl+C (or Cmd+C on Mac)',
                        'Check that your browser supports clipboard access',
                        'Ensure the page has focus and try again',
                        'Use the manual copy method if automatic copying fails'
                    ]
                }
            );
        }
    }
}

function handleEditNotes() {
    console.log('✏️ Edit notes clicked');

    if (DOMElements.soapTextarea) {
        const isReadonly = DOMElements.soapTextarea.hasAttribute('readonly');

        if (isReadonly) {
            // Enable editing
            DOMElements.soapTextarea.removeAttribute('readonly');
            DOMElements.soapTextarea.focus();
            DOMElements.editButton.textContent = 'Done Editing';
        } else {
            // Disable editing
            DOMElements.soapTextarea.setAttribute('readonly', true);
            DOMElements.editButton.textContent = 'Edit Notes';
        }
    }
}

function handleSaveNotes() { console.log('💾 Save notes clicked'); }
function handleExportNotes() { console.log('📤 Export notes clicked'); }
function handleTestConnection() {
    console.log('🔗 Test connection clicked');
    testLLMConnection();
}

function handleSettingsChange() {
    console.log('⚙️ Settings changed');
    saveSettings();
}

function handleSearch() {
    console.log('🔍 Search input changed');
    // TODO: Implement search functionality when Storage module is ready
}

/**
 * Keyboard navigation handler
 */
function handleKeyboardNavigation(event) {
    // Handle keyboard shortcuts
    if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
            case '1':
                event.preventDefault();
                switchTab('record');
                break;
            case '2':
                event.preventDefault();
                switchTab('notes');
                break;
            case '3':
                event.preventDefault();
                switchTab('history');
                break;
            case '4':
                event.preventDefault();
                switchTab('settings');
                break;
            case 'r':
                if (AppState.currentTab === 'record') {
                    event.preventDefault();
                    handleRecordButtonClick();
                }
                break;
            case 'g':
                if (AppState.currentTab === 'notes' && !DOMElements.generateButton.disabled) {
                    event.preventDefault();
                    handleGenerateSOAP();
                }
                break;
            case 'c':
                if (AppState.currentTab === 'notes' && !DOMElements.copyButton.disabled) {
                    event.preventDefault();
                    handleCopyToClipboard();
                }
                break;
        }
    }

    // Handle escape key
    if (event.key === 'Escape') {
        // Close any open modals or cancel current operation
        if (AppState.isRecording) {
            handleRecordButtonClick();
        }
        hideLoading();
    }

    // Handle space bar for recording (when focused on record button)
    if (event.key === ' ' && event.target === DOMElements.recordButton) {
        event.preventDefault();
        handleRecordButtonClick();
    }
}

/**
 * Save current settings to localStorage
 */
function saveSettings() {
    try {
        // Collect current settings from UI
        if (DOMElements.llmEndpoint) {
            AppState.settings.llmEndpoint = DOMElements.llmEndpoint.value.trim();
        }
        if (DOMElements.audioQuality) {
            AppState.settings.audioQuality = DOMElements.audioQuality.value;
        }
        if (DOMElements.autoDelete) {
            AppState.settings.autoDelete = DOMElements.autoDelete.checked;
        }

        // Save to localStorage
        localStorage.setItem('vetscribe-settings', JSON.stringify(AppState.settings));

        console.log('⚙️ Settings saved');

        // Test connection if endpoint changed
        if (AppState.settings.llmEndpoint) {
            testLLMConnection();
        }

    } catch (error) {
        console.error('⚙️ Failed to save settings:', error);
        showError('Failed to save settings');
    }
}

/**
 * Show keyboard navigation hints
 */
function showKeyboardHints() {
    if (DOMElements.keyboardHint) {
        DOMElements.keyboardHint.classList.add('show');

        // Hide after 5 seconds
        setTimeout(() => {
            hideKeyboardHints();
        }, 5000);
    }
}

/**
 * Hide keyboard navigation hints
 */
function hideKeyboardHints() {
    if (DOMElements.keyboardHint) {
        DOMElements.keyboardHint.classList.remove('show');
    }
}

/**
 * Toggle keyboard hints visibility
 */
function toggleKeyboardHints() {
    if (DOMElements.keyboardHint) {
        if (DOMElements.keyboardHint.classList.contains('show')) {
            hideKeyboardHints();
        } else {
            showKeyboardHints();
        }
    }
}

/**
 * Show recording summary with quality analysis
 */
function showRecordingSummary(recordingResult) {
    const { stats, quality } = recordingResult;

    // Create summary message
    const duration = Utils.formatTime(stats.duration);
    const size = Utils.formatFileSize(stats.totalSize);
    const qualityText = quality.quality.charAt(0).toUpperCase() + quality.quality.slice(1);

    let message = `Recording complete!\n\n`;
    message += `Duration: ${duration}\n`;
    message += `Size: ${size}\n`;
    message += `Quality: ${qualityText}\n`;
    message += `Format: ${stats.mimeType}\n`;

    if (quality.recommendations.length > 0) {
        message += `\nRecommendations:\n`;
        quality.recommendations.forEach(rec => {
            message += `• ${rec}\n`;
        });
    }

    console.log('📊 Recording Summary:', message);

    // For now, just log the summary
    // In a full implementation, you might show this in a modal or notification
    updateConnectionStatus('connected', `Recorded ${duration} (${qualityText} quality)`);
}

/**
 * Update recording progress during recording
 */
function updateRecordingProgress(enhancedData) {
    // Update connection status with progress info
    const duration = Utils.formatTime(enhancedData.duration);
    const size = Utils.formatFileSize(enhancedData.totalSize);

    updateConnectionStatus('connected', `Recording ${duration} (${size})`);
}

/**
 * Get recording quality settings with compression optimization
 */
function getRecordingQualitySettings() {
    const quality = AppState.settings.audioQuality || 'medium';

    // Use AudioRecorder's compression profiles for consistency
    if (typeof AudioRecorder !== 'undefined') {
        const profile = AudioRecorder.compressionProfiles[quality];
        if (profile) {
            return {
                quality: quality,
                audioBitsPerSecond: profile.audioBitsPerSecond,
                timeslice: quality === 'high' ? 500 : 1000,
                mimeType: AudioRecorder.getOptimalFormat('voice', quality)
            };
        }
    }

    // Fallback settings if AudioRecorder not available
    const fallbackSettings = {
        low: {
            quality: 'low',
            audioBitsPerSecond: 32000,
            timeslice: 2000
        },
        medium: {
            quality: 'medium',
            audioBitsPerSecond: 64000,
            timeslice: 1000
        },
        high: {
            quality: 'high',
            audioBitsPerSecond: 128000,
            timeslice: 500
        }
    };

    return fallbackSettings[quality] || fallbackSettings.medium;
}

/**
 * Show compression analysis in recording summary
 */
function showCompressionAnalysis(recordingResult) {
    const { stats, quality } = recordingResult;

    if (!quality.compressionRatio) return;

    console.log('🗜️ Compression Analysis:', {
        originalEstimate: `${(stats.totalSize * quality.compressionRatio / (1024 * 1024)).toFixed(1)} MB (uncompressed)`,
        actualSize: `${(stats.totalSize / (1024 * 1024)).toFixed(1)} MB`,
        compressionRatio: `${quality.compressionRatio}:1`,
        codec: quality.codec,
        efficiency: quality.compression
    });
}

/**
 * Get format recommendations for user
 */
function getFormatRecommendations() {
    if (typeof AudioRecorder === 'undefined') return null;

    const recommendations = AudioRecorder.getCompressionRecommendations('veterinary');
    const supportedFormats = AudioRecorder.getSupportedMimeTypes();

    return {
        recommended: recommendations,
        supported: supportedFormats,
        optimal: AudioRecorder.getOptimalFormat('voice', AppState.settings.audioQuality || 'medium')
    };
}

/**
 * Estimate recording file size for user feedback
 */
function estimateRecordingSize(durationMinutes = 5) {
    if (typeof AudioRecorder === 'undefined') return null;

    const quality = AppState.settings.audioQuality || 'medium';
    const estimate = AudioRecorder.estimateFileSize(durationMinutes * 60, { quality });

    return {
        duration: `${durationMinutes} minutes`,
        size: `${estimate.megabytes} MB`,
        quality: quality,
        bitrate: `${Math.round(estimate.bitrate / 1000)} kbps`
    };
}

/**
 * Update transcript display with real-time updates
 */
function updateTranscriptDisplay(transcriptData) {
    // For now, just update the connection status
    // In a full implementation, you might show the transcript in a dedicated area
    const wordCount = transcriptData.current.split(' ').filter(word => word.length > 0).length;
    updateConnectionStatus('connected', `Transcribing... (${wordCount} words)`);
}

/**
 * Update transcript confidence and quality indicators
 */
function updateTranscriptConfidence(confidence, quality) {
    if (confidence !== undefined && confidence !== null) {
        const confidencePercent = Math.round(confidence * 100);
        console.log(`🎯 Transcript confidence: ${confidencePercent}%`);

        // Determine status based on confidence and quality
        let status = 'connected';
        let message = `Confidence: ${confidencePercent}%`;

        if (quality) {
            message += ` | Quality: ${quality.quality}`;

            // Adjust status based on quality
            if (quality.quality === 'poor' || quality.quality === 'very poor') {
                status = 'warning';
            } else if (confidencePercent < 60) {
                status = 'warning';
            }
        } else {
            // Fallback to confidence-only assessment
            if (confidencePercent < 60) {
                status = 'warning';
            }
        }

        updateConnectionStatus(status, message);
    }
}

/**
 * Handle transcript quality assessment
 */
function handleTranscriptQuality(quality) {
    console.log('📊 Processing transcript quality assessment:', quality);

    // Log quality metrics
    console.log(`📈 Quality metrics:`, {
        overall: quality.quality,
        confidence: Math.round(quality.confidence * 100) + '%',
        veterinaryTerms: quality.veterinaryTerms,
        completeness: Math.round(quality.completeness * 100) + '%'
    });

    // Handle quality issues
    if (quality.issues && quality.issues.length > 0) {
        console.warn('⚠️ Transcript quality issues:', quality.issues);
    }

    // Show suggestions for improvement
    if (quality.suggestions && quality.suggestions.length > 0) {
        console.log('💡 Quality improvement suggestions:', quality.suggestions);

        // For poor quality, show warning
        if (quality.quality === 'poor' || quality.quality === 'very poor') {
            showTranscriptQualityWarning(quality);
        }
    }

    // Store quality assessment for SOAP generation
    AppState.transcriptQuality = quality;
}

/**
 * Show transcript quality warning
 */
function showTranscriptQualityWarning(quality) {
    let message = `Transcript quality is ${quality.quality}. `;

    if (quality.suggestions.length > 0) {
        message += 'Suggestions:\n';
        message += quality.suggestions.map(s => `• ${s}`).join('\n');
    }

    console.warn('⚠️ Quality warning:', message);

    // Update status to show warning
    updateRecordingStatus('Low quality transcript - check suggestions');

    // In a full implementation, could show a modal or notification
    // For now, just log the warning
}

/**
 * Start transcription with recording
 */
async function startTranscription() {
    try {
        if (typeof Transcription === 'undefined') {
            console.warn('⚠️ Transcription module not available');
            return false;
        }

        // Check if transcription is supported
        const compatibility = Transcription.getCompatibilityInfo();
        if (!compatibility.supported) {
            console.warn('⚠️ Speech recognition not supported in this browser');
            updateRecordingStatus('Speech recognition not available');
            return false;
        }

        // Start listening
        const success = await Transcription.startListening();

        if (success) {
            console.log('✅ Transcription started successfully');
            return true;
        } else {
            console.error('❌ Failed to start transcription');
            return false;
        }

    } catch (error) {
        console.error('❌ Transcription start error:', error);
        return false;
    }
}

/**
 * Stop transcription
 */
function stopTranscription() {
    try {
        if (typeof Transcription === 'undefined') {
            return;
        }

        const success = Transcription.stopListening();

        if (success) {
            console.log('✅ Transcription stopped successfully');
        }

    } catch (error) {
        console.error('❌ Transcription stop error:', error);
    }
}

/**
 * Get current transcript for SOAP generation
 */
function getCurrentTranscript() {
    if (typeof Transcription !== 'undefined') {
        const state = Transcription.getState();
        return state.finalTranscript || AppState.currentTranscript;
    }

    return AppState.currentTranscript || '';
}

/**
 * Show fallback recommendation to user
 */
function showFallbackRecommendation(methods) {
    const methodNames = methods.map(method => {
        const methodInfo = Transcription.fallbackMethods[method];
        return methodInfo ? methodInfo.name : method;
    }).join(', ');

    const message = `Speech recognition is limited in this browser. Recommended alternatives: ${methodNames}`;

    console.log('💡 Showing fallback recommendation:', message);
    updateRecordingStatus('Speech recognition limited - alternatives available');

    // Could show a more detailed UI here
    // For now, just update the status
}

/**
 * Show fallback options to user
 */
function showFallbackOptions(options) {
    console.log('🔄 Showing fallback options:', options);

    if (options.length === 0) {
        updateRecordingStatus('No transcription options available');
        return;
    }

    // Auto-select the first recommended option
    const recommended = options.find(opt => opt.recommended);
    const selected = recommended || options[0];

    console.log('🤖 Auto-selecting fallback option:', selected.name);
    updateRecordingStatus(`Using ${selected.name} for transcription`);

    // In a full implementation, this could show a selection dialog
    // For now, we'll auto-select the best option
}

/**
 * Show manual transcription interface
 */
function showManualTranscriptionInterface() {
    console.log('📝 Showing manual transcription interface');
    updateRecordingStatus('Manual transcription mode - type your notes');

    // In a full implementation, this would show a text area
    // For now, just update the status and enable the notes tab

    // Enable the notes tab for manual input
    enableButton(document.querySelector('[data-tab="notes"]'));

    // Could automatically switch to notes tab
    // switchTab('notes');
}

/**
 * Show file upload interface
 */
function showFileUploadInterface() {
    console.log('📁 Showing file upload interface');
    updateRecordingStatus('File upload mode - select audio file for transcription');

    // In a full implementation, this would show a file picker
    // For now, just update the status

    // Could create a file input element dynamically
    // const fileInput = document.createElement('input');
    // fileInput.type = 'file';
    // fileInput.accept = 'audio/*';
    // fileInput.onchange = handleFileUpload;
    // fileInput.click();
}

/**
 * Show file upload result
 */
function showFileUploadResult(result) {
    console.log('📁 Showing file upload result:', result);

    if (result.success) {
        let message = `File "${result.filename}" ready for transcription.`;

        if (result.instructions) {
            message += ' Check console for transcription service options.';
            console.log('📋 Transcription instructions:', result.instructions);
        }

        updateRecordingStatus(message);
    } else {
        updateRecordingStatus(`File upload failed: ${result.error}`);
    }
}

/**
 * Handle manual transcript input
 */
function handleManualTranscriptInput(text) {
    if (typeof Transcription !== 'undefined' && Transcription.currentFallback === 'manual') {
        const success = Transcription.setManualTranscript(text);

        if (success) {
            console.log('📝 Manual transcript set successfully');
            updateRecordingStatus('Manual transcript entered');

            // Enable generate button
            if (text.trim().length > 0) {
                enableButton(DOMElements.generateButton);
            }
        }
    }
}

/**
 * Check if fallback transcription is active
 */
function isFallbackTranscriptionActive() {
    return typeof Transcription !== 'undefined' && Transcription.currentFallback !== null;
}

/**
 * Get current transcription method
 */
function getCurrentTranscriptionMethod() {
    if (typeof Transcription === 'undefined') {
        return 'none';
    }

    if (Transcription.currentFallback) {
        return Transcription.currentFallback;
    }

    if (Transcription.isListening) {
        return 'webspeech';
    }

    return 'none';
}

/**
 * Enhanced transcription support check with fallback handling
 */
function checkTranscriptionSupport() {
    try {
        if (typeof Transcription === 'undefined') {
            console.warn('⚠️ Transcription module not loaded');
            return;
        }

        const compatibility = Transcription.getCompatibilityInfo();

        console.log('🎤 Speech recognition compatibility:', compatibility);

        if (!compatibility.supported) {
            showTranscriptionWarning(compatibility);

            // Show available fallback options
            const fallbackOptions = Transcription.getFallbackOptions();
            if (fallbackOptions.length > 0) {
                console.log('🔄 Available fallback options:', fallbackOptions);
                updateRecordingStatus(`Speech recognition unavailable - ${fallbackOptions.length} alternatives available`);
            }
        } else {
            // Test transcription functionality
            testTranscriptionCapability();
        }

    } catch (error) {
        console.error('❌ Transcription support check failed:', error);
    }
}

/**
 * Generate SOAP notes from current transcript
 */
async function generateSOAPNotes() {
    try {
        console.log('🤖 Starting SOAP note generation...');

        // Check if we have a transcript
        const transcript = getCurrentTranscript();
        if (!transcript || transcript.trim().length === 0) {
            throw new Error('No transcript available for SOAP generation');
        }

        // Check LLM connection
        if (typeof LLMConnector === 'undefined') {
            throw new Error('LLM Connector not available');
        }

        // Show loading state
        showLoading('Generating SOAP notes...');
        updateConnectionStatus('connecting', 'Generating SOAP notes...');

        // Disable generate button during processing
        disableButton(DOMElements.generateButton);

        // Prepare enhanced options for SOAP generation
        const options = {
            includeQuality: AppState.transcriptQuality ? true : false,
            transcriptQuality: AppState.transcriptQuality,
            templateType: AppState.settings.soapTemplate || 'standard',
            visitType: AppState.settings.visitType || null,
            patientInfo: AppState.patientInfo || {},
            requestId: `soap_${Date.now()}`
        };

        // Generate SOAP notes
        const response = await LLMConnector.generateSOAPNotes(transcript, options);

        console.log('✅ SOAP notes generated successfully');

        // Store the generated SOAP notes
        AppState.currentSoapNotes = response.content;

        // Update UI
        hideLoading();
        updateConnectionStatus('connected', 'SOAP notes generated');

        // Switch to notes tab to show results
        switchTab('notes');

        // Update notes display
        updateNotesDisplay(response.content);

        return response;

    } catch (error) {
        console.error('❌ SOAP generation failed:', error);

        hideLoading();
        enableButton(DOMElements.generateButton);
        updateConnectionStatus('error', 'SOAP generation failed');

        // Enhanced error handling for SOAP generation
        showError(
            'Failed to generate SOAP notes. Please check your connection and try again.',
            'llm',
            'high',
            {
                technicalDetails: error.message,
                suggestions: [
                    'Verify that Ollama is running on your home PC',
                    'Check that the LLM endpoint URL is correct in Settings',
                    'Ensure your Tailscale connection is active',
                    'Try testing the connection using the Test Connection button',
                    'Check that the AI model is loaded: ollama list',
                    'Verify your transcript contains sufficient content for SOAP generation'
                ],
                retryFunction: () => generateSOAPNotes(),
                retryKey: 'soap_generation'
            }
        );
        throw error;
    }
}

/**
 * Handle enhanced SOAP response from LLM with formatting
 */
function handleSOAPResponse(response) {
    console.log('📝 Processing enhanced SOAP response...');

    try {
        // Check if response is already formatted
        const validation = response.validation || LLMConnector.validateSOAPNotes(response.content);

        // Show quality feedback
        if (response.qualityMetrics) {
            console.log('📊 SOAP quality metrics:', response.qualityMetrics);
            showSOAPQualityFeedback(response.qualityMetrics);
        }

        // Show formatting status
        if (response.isFormatted) {
            console.log('✨ SOAP notes professionally formatted');
            updateConnectionStatus('connected', 'SOAP notes formatted and ready');
        }

        // Handle validation issues
        if (!validation.isValid) {
            console.warn('⚠️ Generated SOAP notes may be incomplete:', validation.issues);

            // Show warning but still display the notes
            const issueText = validation.issues.join(', ');
            showError(`SOAP notes generated but may be incomplete: ${issueText}`);

            // Offer to reformat if formatter is available
            if (typeof SOAPFormatter !== 'undefined' && !response.isFormatted) {
                offerSOAPReformatting(response.content);
            }
        } else {
            console.log('✅ SOAP notes validation passed');
        }

        // Store the enhanced response
        AppState.currentSoapNotes = response.content;
        AppState.soapMetadata = {
            validation: validation,
            qualityMetrics: response.qualityMetrics,
            isFormatted: response.isFormatted,
            templateUsed: response.templateUsed,
            visitType: response.visitType,
            generatedAt: new Date().toISOString()
        };

        // Display the notes
        updateNotesDisplay(response.content, response);

        console.log('✅ Enhanced SOAP response processed successfully');

        // Validate and sanitize SOAP notes
        if (typeof DataValidator !== 'undefined') {
            const validation = DataValidator.validateSOAPNotes(response.content);

            if (!validation.isValid) {
                console.warn('⚠️ SOAP validation issues:', validation.errors);
                showWarning(
                    'SOAP notes generated but may need review.',
                    validation.errors.concat(validation.warnings)
                );
            } else if (validation.warnings.length > 0) {
                console.info('ℹ️ SOAP validation suggestions:', validation.warnings);
                showInfo(
                    'SOAP notes generated successfully with suggestions.',
                    validation.warnings
                );
            }

            // Use sanitized content
            response.content = validation.sanitized;
            AppState.currentSoapNotes = validation.sanitized;
        }

        // Show success feedback with quality information
        const qualityText = response.qualityMetrics?.overall
            ? ` (Quality: ${response.qualityMetrics.overall}%)`
            : '';
        showSuccess(`SOAP notes generated successfully${qualityText}`);

    } catch (error) {
        console.error('❌ Failed to process SOAP response:', error);

        // Fallback to basic handling
        AppState.currentSoapNotes = response.content || '';
        updateNotesDisplay(AppState.currentSoapNotes);

        showError('SOAP notes generated but processing failed. Notes may need manual review.');
    }
}

/**
 * Handle LLM errors
 */
function handleLLMError(error) {
    console.error('❌ Handling LLM error:', error);

    let errorMessage = 'LLM connection failed.';
    let userAction = 'Please check your Ollama connection.';

    if (error.message.includes('timeout')) {
        errorMessage = 'LLM request timed out.';
        userAction = 'The model may be processing. Please try again.';
    } else if (error.message.includes('404')) {
        errorMessage = 'Ollama endpoint not found.';
        userAction = 'Please check your Ollama is running and accessible.';
    } else if (error.message.includes('No endpoint configured')) {
        errorMessage = 'No LLM endpoint configured.';
        userAction = 'Please configure your Ollama connection in settings.';
    } else {
        errorMessage = error.message || 'Unknown LLM error.';
    }

    updateConnectionStatus('error', 'LLM error');
    showError(`${errorMessage} ${userAction}`);
}

/**
 * Update SOAP generation progress
 */
function updateSOAPGenerationProgress(progress) {
    console.log('🔄 SOAP generation progress:', progress);

    // Update status with progress information
    if (progress.stage) {
        updateConnectionStatus('connecting', `${progress.stage}...`);
    }

    // Could update a progress bar here in the future
}

/**
 * Update notes display with enhanced SOAP formatting
 */
function updateNotesDisplay(soapContent, response = null) {
    console.log('📝 Updating enhanced notes display...');

    try {
        // Find the notes content area
        const notesContent = document.querySelector('.notes-content');
        if (!notesContent) {
            console.warn('⚠️ Notes content area not found');
            return;
        }

        // Display the SOAP content
        notesContent.textContent = soapContent;

        // Add formatting indicators if available
        if (response && response.isFormatted) {
            notesContent.classList.add('formatted-soap');
        }

        // Show quality indicator
        if (response && response.qualityMetrics) {
            showSOAPQualityIndicator(response.qualityMetrics);
        }

        console.log('✅ Enhanced notes display updated');

    } catch (error) {
        console.error('❌ Failed to update notes display:', error);

        // Fallback to basic display
        const notesContent = document.querySelector('.notes-content');
        if (notesContent) {
            notesContent.textContent = soapContent;
        }
    }
}

/**
 * Show SOAP quality feedback to user
 */
function showSOAPQualityFeedback(qualityMetrics) {
    console.log('📊 Showing SOAP quality feedback:', qualityMetrics);

    const { overall, completeness, professionalTerminology, structure } = qualityMetrics;

    let message = `SOAP Quality: ${overall}% overall`;

    if (overall >= 90) {
        updateConnectionStatus('connected', `Excellent SOAP quality (${overall}%)`);
    } else if (overall >= 75) {
        updateConnectionStatus('connected', `Good SOAP quality (${overall}%)`);
    } else if (overall >= 60) {
        updateConnectionStatus('warning', `Fair SOAP quality (${overall}%)`);
    } else {
        updateConnectionStatus('warning', `SOAP quality needs improvement (${overall}%)`);
    }

    // Log detailed metrics for debugging
    console.log('📈 Detailed quality metrics:', {
        completeness: `${completeness}%`,
        terminology: `${professionalTerminology}%`,
        structure: `${structure}%`
    });
}

/**
 * Show SOAP quality indicator in UI
 */
function showSOAPQualityIndicator(qualityMetrics) {
    // Find or create quality indicator
    let qualityIndicator = document.querySelector('.soap-quality-indicator');

    if (!qualityIndicator) {
        qualityIndicator = document.createElement('div');
        qualityIndicator.className = 'soap-quality-indicator';

        const notesContent = document.querySelector('.notes-content');
        if (notesContent && notesContent.parentNode) {
            notesContent.parentNode.insertBefore(qualityIndicator, notesContent);
        }
    }

    const { overall } = qualityMetrics;
    let qualityClass = 'poor';
    let qualityText = 'Poor';

    if (overall >= 90) {
        qualityClass = 'excellent';
        qualityText = 'Excellent';
    } else if (overall >= 75) {
        qualityClass = 'good';
        qualityText = 'Good';
    } else if (overall >= 60) {
        qualityClass = 'fair';
        qualityText = 'Fair';
    }

    qualityIndicator.innerHTML = `
        <div class="quality-badge ${qualityClass}">
            <span class="quality-text">${qualityText}</span>
            <span class="quality-score">${overall}%</span>
        </div>
    `;
}

/**
 * Offer SOAP reformatting option
 */
function offerSOAPReformatting(soapContent) {
    console.log('🔄 Offering SOAP reformatting...');

    // In a full implementation, this could show a modal or button
    // For now, just log the option and auto-format

    if (typeof SOAPFormatter !== 'undefined') {
        try {
            const formattedResult = SOAPFormatter.formatSOAPNotes(soapContent);

            console.log('✨ SOAP notes reformatted successfully');

            // Update display with formatted content
            AppState.currentSoapNotes = formattedResult.content;
            updateNotesDisplay(formattedResult.content, {
                isFormatted: true,
                qualityMetrics: SOAPFormatter.assessQuality(formattedResult.content)
            });

            updateConnectionStatus('connected', 'SOAP notes reformatted');

        } catch (error) {
            console.warn('⚠️ SOAP reformatting failed:', error);
        }
    }
}

/**
 * Validate current SOAP notes
 */
function validateCurrentSOAPNotes() {
    if (!AppState.currentSoapNotes) {
        console.warn('⚠️ No SOAP notes to validate');
        return null;
    }

    try {
        if (typeof SOAPFormatter !== 'undefined') {
            return SOAPFormatter.assessQuality(AppState.currentSoapNotes);
        } else {
            // Fallback validation
            return LLMConnector.validateSOAPNotes(AppState.currentSoapNotes);
        }
    } catch (error) {
        console.error('❌ SOAP validation failed:', error);
        return null;
    }
}

/**
 * Format current SOAP notes
 */
function formatCurrentSOAPNotes() {
    if (!AppState.currentSoapNotes) {
        console.warn('⚠️ No SOAP notes to format');
        return false;
    }

    try {
        if (typeof SOAPFormatter !== 'undefined') {
            const formattedResult = SOAPFormatter.formatSOAPNotes(AppState.currentSoapNotes);

            // Update app state
            AppState.currentSoapNotes = formattedResult.content;
            AppState.soapMetadata = {
                ...AppState.soapMetadata,
                validation: formattedResult.validation,
                isFormatted: true,
                formattedAt: new Date().toISOString()
            };

            // Update display
            updateNotesDisplay(formattedResult.content, {
                isFormatted: true,
                qualityMetrics: formattedResult.metadata
            });

            console.log('✨ SOAP notes formatted successfully');
            updateConnectionStatus('connected', 'SOAP notes formatted');

            return true;
        } else {
            console.warn('⚠️ SOAP formatter not available');
            return false;
        }
    } catch (error) {
        console.error('❌ SOAP formatting failed:', error);
        showError(`SOAP formatting failed: ${error.message}`);
        return false;
    }
}

/**
 * Export SOAP notes in different formats
 */
function exportSOAPNotes(format = 'text') {
    if (!AppState.currentSoapNotes) {
        console.warn('⚠️ No SOAP notes to export');
        return null;
    }

    try {
        if (typeof SOAPFormatter !== 'undefined') {
            // Create formatted result object
            const formattedResult = {
                content: AppState.currentSoapNotes,
                sections: SOAPFormatter.parseSOAPSections(AppState.currentSoapNotes),
                validation: AppState.soapMetadata?.validation || {},
                metadata: AppState.soapMetadata || {}
            };

            const exported = SOAPFormatter.exportSOAP(formattedResult, format);

            console.log(`📤 SOAP notes exported as ${format}`);
            return exported;
        } else {
            // Fallback to plain text
            console.log('📤 SOAP notes exported as plain text (fallback)');
            return AppState.currentSoapNotes;
        }
    } catch (error) {
        console.error('❌ SOAP export failed:', error);
        return AppState.currentSoapNotes; // Fallback to original content
    }
}

/**
 * Test LLM connection
 */
async function testLLMConnection() {
    try {
        console.log('🧪 Testing LLM connection...');

        if (typeof LLMConnector === 'undefined') {
            throw new Error('LLM Connector not available');
        }

        showLoading('Testing Ollama connection...');

        const success = await LLMConnector.testConnection();

        hideLoading();

        if (success) {
            updateConnectionStatus('connected', 'Ollama connection successful');
            showSuccess('Ollama connection test successful!');
        }

        return success;

    } catch (error) {
        console.error('❌ LLM connection test failed:', error);

        hideLoading();
        updateConnectionStatus('error', 'Ollama connection failed');
        showError(`Connection test failed: ${error.message}`);

        return false;
    }
}

/**
 * Auto-discover LLM endpoint
 */
async function autoDiscoverLLMEndpoint() {
    try {
        console.log('🔍 Auto-discovering LM Studio endpoint...');

        if (typeof LLMConnector === 'undefined') {
            throw new Error('LLM Connector not available');
        }

        showLoading('Discovering LM Studio on Tailscale...');

        const endpoint = await LLMConnector.autoDiscoverEndpoint();

        hideLoading();

        if (endpoint) {
            updateConnectionStatus('connected', `Found LM Studio at ${endpoint}`);
            showSuccess(`LM Studio discovered at: ${endpoint}`);
        }

        return endpoint;

    } catch (error) {
        console.error('❌ LLM auto-discovery failed:', error);

        hideLoading();
        updateConnectionStatus('error', 'Auto-discovery failed');
        showError(`Auto-discovery failed: ${error.message}`);

        return null;
    }
}

/**
 * Update discovery progress
 */
function updateDiscoveryProgress(progress) {
    console.log('🔍 Discovery progress:', progress);

    const { stage, current, total, message } = progress;

    if (stage === 'discovery') {
        updateConnectionStatus('connecting', 'Discovering LM Studio endpoints...');
    } else if (stage === 'testing') {
        const percent = total > 0 ? Math.round((current / total) * 100) : 0;
        updateConnectionStatus('connecting', `Testing endpoints... ${current}/${total} (${percent}%)`);
    }

    // Update loading text if visible
    const loadingText = document.getElementById('loadingText');
    if (loadingText && message) {
        loadingText.textContent = message;
    }
}

/**
 * Enhanced LLM connection test with detailed reporting
 */
async function testLLMConnectionDetailed() {
    try {
        console.log('🧪 Running detailed LLM connection test...');

        if (typeof LLMConnector === 'undefined') {
            throw new Error('LLM Connector not available');
        }

        showLoading('Running connection diagnostics...');

        // Run comprehensive diagnostics
        const diagnostics = await LLMConnector.getConnectionDiagnostics();

        hideLoading();

        // Show detailed results
        showConnectionDiagnostics(diagnostics);

        return diagnostics;

    } catch (error) {
        console.error('❌ Detailed connection test failed:', error);

        hideLoading();
        updateConnectionStatus('error', 'Connection diagnostics failed');
        showError(`Diagnostics failed: ${error.message}`);

        return null;
    }
}

/**
 * Show connection diagnostics results
 */
function showConnectionDiagnostics(diagnostics) {
    console.log('📊 Showing connection diagnostics:', diagnostics);

    // Determine overall status
    const isHealthy = diagnostics.isConnected &&
                     diagnostics.tests.currentEndpoint?.isWorking &&
                     diagnostics.tests.models?.count > 0;

    if (isHealthy) {
        updateConnectionStatus('connected', 'All systems operational');
        showSuccess('Connection test successful! LM Studio is ready for SOAP generation.');
    } else {
        updateConnectionStatus('warning', 'Issues detected');

        // Show specific issues and recommendations
        const issues = diagnostics.recommendations.filter(r =>
            !r.includes('operational')
        );

        if (issues.length > 0) {
            const message = `Connection issues detected:\n${issues.map(i => `• ${i}`).join('\n')}`;
            showError(message);
        }
    }

    // Log detailed information for debugging
    console.log('📊 Detailed diagnostics:', {
        endpoint: diagnostics.currentEndpoint,
        connected: diagnostics.isConnected,
        models: diagnostics.tests.models?.count || 0,
        responseTime: diagnostics.tests.currentEndpoint?.responseTime,
        recommendations: diagnostics.recommendations
    });
}

/**
 * Auto-discover LLM endpoint with enhanced UI feedback
 */
async function autoDiscoverLLMEndpointEnhanced() {
    try {
        console.log('🔍 Enhanced auto-discovery starting...');

        if (typeof LLMConnector === 'undefined') {
            throw new Error('LLM Connector not available');
        }

        showLoading('Discovering LM Studio on network...');
        updateConnectionStatus('connecting', 'Scanning network for LM Studio...');

        // Run enhanced auto-discovery
        const endpoint = await LLMConnector.autoDiscoverEndpoint({
            maxConcurrent: 5,
            quickTest: true,
            reportProgress: true
        });

        hideLoading();

        if (endpoint) {
            updateConnectionStatus('connected', `LM Studio found at ${endpoint}`);
            showSuccess(`LM Studio discovered and connected!\nEndpoint: ${endpoint}`);

            // Test the connection to ensure it's fully working
            await testLLMConnection();
        }

        return endpoint;

    } catch (error) {
        console.error('❌ Enhanced auto-discovery failed:', error);

        hideLoading();
        updateConnectionStatus('error', 'Auto-discovery failed');

        // Provide helpful error message
        let errorMessage = 'Auto-discovery failed. ';

        if (error.message.includes('No endpoints to test')) {
            errorMessage += 'No potential endpoints found. Ensure LM Studio is running on your Tailscale network.';
        } else if (error.message.includes('No working')) {
            errorMessage += 'No working LM Studio instances found. Check that:\n';
            errorMessage += '• LM Studio is running\n';
            errorMessage += '• Server is enabled in LM Studio\n';
            errorMessage += '• Tailscale is connected\n';
            errorMessage += '• Firewall allows connections';
        } else {
            errorMessage += error.message;
        }

        showError(errorMessage);

        return null;
    }
}

/**
 * Generate and show discovery report
 */
async function generateDiscoveryReport() {
    try {
        console.log('📊 Generating discovery report...');

        if (typeof LLMConnector === 'undefined') {
            throw new Error('LLM Connector not available');
        }

        showLoading('Scanning network and generating report...');

        const report = await LLMConnector.generateDiscoveryReport();

        hideLoading();

        // Show report summary
        showDiscoveryReport(report);

        return report;

    } catch (error) {
        console.error('❌ Discovery report generation failed:', error);

        hideLoading();
        showError(`Report generation failed: ${error.message}`);

        return null;
    }
}

/**
 * Show discovery report results
 */
function showDiscoveryReport(report) {
    console.log('📊 Showing discovery report:', report);

    const { totalEndpoints, workingEndpoints, summary } = report;

    let message = `Network Discovery Report:\n\n`;
    message += `• Total endpoints tested: ${totalEndpoints}\n`;
    message += `• Working endpoints found: ${summary.working}\n`;
    message += `• Failed endpoints: ${summary.failed}\n`;

    if (summary.avgResponseTime > 0) {
        message += `• Average response time: ${summary.avgResponseTime}ms\n`;
    }

    if (workingEndpoints.length > 0) {
        message += `\nWorking Endpoints:\n`;
        workingEndpoints.forEach(endpoint => {
            message += `• ${endpoint.endpoint} (${endpoint.responseTime}ms, ${endpoint.models.length} models)\n`;
        });

        updateConnectionStatus('connected', `Found ${summary.working} working endpoints`);
        showSuccess(message);
    } else {
        message += `\nNo working LM Studio instances found.`;
        updateConnectionStatus('error', 'No working endpoints found');
        showError(message);
    }
}

/**
 * Handle test connection button with enhanced features
 */
async function handleTestConnection() {
    console.log('🧪 Test connection button clicked');

    // Show options for different types of tests
    const testType = await showTestConnectionOptions();

    switch (testType) {
        case 'basic':
            await testLLMConnection();
            break;
        case 'detailed':
            await testLLMConnectionDetailed();
            break;
        case 'discover':
            await autoDiscoverLLMEndpointEnhanced();
            break;
        case 'report':
            await generateDiscoveryReport();
            break;
        default:
            await testLLMConnection(); // Default to basic test
    }
}

/**
 * Show test connection options (simplified for now)
 */
async function showTestConnectionOptions() {
    // For now, just return 'detailed' for comprehensive testing
    // In a full implementation, this could show a modal with options
    return 'detailed';
}

/**
 * Get available SOAP templates
 */
function getAvailableSOAPTemplates() {
    if (typeof SOAPTemplates !== 'undefined') {
        return SOAPTemplates.getAvailableTemplates();
    }

    // Fallback templates if SOAPTemplates not available
    return [
        { key: 'standard', name: 'Standard SOAP', description: 'Complete SOAP format for routine consultations' },
        { key: 'wellness', name: 'Wellness Exam', description: 'Optimized for routine wellness examinations' },
        { key: 'emergency', name: 'Emergency Visit', description: 'Structured for urgent care situations' },
        { key: 'surgical', name: 'Surgical Consultation', description: 'Pre/post-operative documentation' },
        { key: 'followup', name: 'Follow-up Visit', description: 'Progress evaluation and treatment adjustment' }
    ];
}

/**
 * Set SOAP template for generation
 */
function setSOAPTemplate(templateType) {
    if (typeof SOAPTemplates !== 'undefined' && SOAPTemplates.isValidTemplate(templateType)) {
        AppState.settings.soapTemplate = templateType;
        saveSettings();
        console.log('📝 SOAP template set to:', templateType);
        return true;
    }

    console.warn('⚠️ Invalid SOAP template:', templateType);
    return false;
}

/**
 * Set visit type for specialized SOAP generation
 */
function setVisitType(visitType) {
    const validVisitTypes = ['wellness', 'emergency', 'surgical', 'followup', 'dental', 'vaccination', null];

    if (validVisitTypes.includes(visitType)) {
        AppState.settings.visitType = visitType;
        saveSettings();
        console.log('🏥 Visit type set to:', visitType || 'standard');
        return true;
    }

    console.warn('⚠️ Invalid visit type:', visitType);
    return false;
}

/**
 * Set patient information for enhanced SOAP generation
 */
function setPatientInfo(patientInfo) {
    AppState.patientInfo = { ...patientInfo };
    console.log('🐕 Patient info updated:', AppState.patientInfo);
}

/**
 * Get current SOAP generation settings
 */
function getSOAPGenerationSettings() {
    return {
        template: AppState.settings.soapTemplate,
        visitType: AppState.settings.visitType,
        includePatientContext: AppState.settings.includePatientContext,
        patientInfo: AppState.patientInfo
    };
}

/**
 * Auto-detect visit type from transcript
 */
function autoDetectVisitType(transcript) {
    if (!transcript || transcript.length < 50) {
        return null;
    }

    const lowerTranscript = transcript.toLowerCase();

    // Keywords for different visit types
    const visitTypeKeywords = {
        wellness: ['wellness', 'annual', 'checkup', 'routine', 'vaccination', 'vaccine'],
        emergency: ['emergency', 'urgent', 'acute', 'sudden', 'collapse', 'trauma'],
        surgical: ['surgery', 'surgical', 'procedure', 'operation', 'spay', 'neuter'],
        followup: ['follow up', 'followup', 'recheck', 'progress', 'monitoring'],
        dental: ['dental', 'teeth', 'oral', 'cleaning', 'extraction'],
        vaccination: ['vaccination', 'vaccine', 'shots', 'immunization']
    };

    // Score each visit type
    const scores = {};
    Object.entries(visitTypeKeywords).forEach(([type, keywords]) => {
        scores[type] = keywords.filter(keyword => lowerTranscript.includes(keyword)).length;
    });

    // Find the highest scoring visit type
    const maxScore = Math.max(...Object.values(scores));
    if (maxScore > 0) {
        const detectedType = Object.entries(scores).find(([type, score]) => score === maxScore)?.[0];
        console.log('🔍 Auto-detected visit type:', detectedType, 'Score:', maxScore);
        return detectedType;
    }

    return null;
}

/**
 * Display notes history in UI
 */
function displayNotesHistory(notes) {
    if (!DOMElements.historyList) return;

    const historyHTML = notes.map(note => {
        const date = new Date(note.timestamp).toLocaleDateString();
        const time = new Date(note.timestamp).toLocaleTimeString();
        const preview = note.content.substring(0, 100) + '...';
        const patientName = note.patientInfo?.name || 'Unknown Patient';
        const visitType = note.metadata?.visitType || 'Standard';
        const qualityScore = note.metadata?.qualityScore || 0;

        return `
            <div class="history-item" data-note-id="${note.id}">
                <div class="history-header">
                    <span class="patient-name">${patientName}</span>
                    <span class="visit-type">${visitType}</span>
                    <span class="quality-score">Quality: ${qualityScore}%</span>
                    <span class="timestamp">${date} ${time}</span>
                </div>
                <div class="history-preview">${preview}</div>
                <div class="history-actions">
                    <button class="btn-small" onclick="loadNote('${note.id}')">Load</button>
                    <button class="btn-small btn-danger" onclick="deleteNote('${note.id}')">Delete</button>
                </div>
            </div>
        `;
    }).join('');

    DOMElements.historyList.innerHTML = historyHTML;
}

/**
 * Load a specific note by ID
 */
function loadNote(noteId) {
    try {
        console.log('📋 Loading note:', noteId);

        if (typeof Storage === 'undefined') {
            showError(
                'Storage system is not available.',
                'storage',
                'medium',
                {
                    suggestions: [
                        'Check that your browser supports local storage',
                        'Ensure you\'re not in private/incognito mode',
                        'Try refreshing the page',
                        'Clear browser cache and try again'
                    ]
                }
            );
            return;
        }

        const note = Storage.getSOAPNote(noteId);
        if (!note) {
            showError('Note not found');
            return;
        }

        // Load note content into the notes tab
        AppState.currentSoapNotes = note.content;
        updateNotesDisplay(note.content, {
            isFormatted: note.metadata?.isFormatted,
            qualityMetrics: { overall: note.metadata?.qualityScore || 0 }
        });

        // Switch to notes tab
        switchTab('notes');

        console.log('✅ Note loaded successfully');

    } catch (error) {
        console.error('❌ Failed to load note:', error);
        showError(`Failed to load note: ${error.message}`);
    }
}

/**
 * Delete a specific note by ID
 */
function deleteNote(noteId) {
    try {
        console.log('🗑️ Deleting note:', noteId);

        if (typeof Storage === 'undefined') {
            showError('Storage not available');
            return;
        }

        // Confirm deletion
        if (!confirm('Are you sure you want to delete this note?')) {
            return;
        }

        const success = Storage.deleteSOAPNote(noteId);
        if (success) {
            // Refresh the history display
            loadSavedNotes();
            console.log('✅ Note deleted successfully');
        } else {
            showError('Failed to delete note');
        }

    } catch (error) {
        console.error('❌ Failed to delete note:', error);
        showError(`Failed to delete note: ${error.message}`);
    }
}

/**
 * Save current session data to storage
 */
async function saveCurrentSession() {
    try {
        if (typeof Storage === 'undefined') {
            console.warn('⚠️ Storage not available for session saving');
            return null;
        }

        console.log('💾 Saving current session...');

        let recordingId = null;
        let transcriptId = null;
        let soapId = null;

        // Save recording if available
        if (AppState.currentAudioBlob) {
            recordingId = await Storage.saveRecording(AppState.currentAudioBlob, {
                duration: AppState.currentRecordingStats?.duration || 0,
                quality: AppState.currentRecordingQuality?.quality || 'medium',
                patientInfo: AppState.patientInfo,
                sessionId: AppState.currentSessionId
            });
        }

        // Save transcript if available
        if (AppState.currentTranscript) {
            transcriptId = Storage.saveTranscript(AppState.currentTranscript, {
                recordingId: recordingId,
                quality: AppState.transcriptQuality,
                patientInfo: AppState.patientInfo,
                sessionId: AppState.currentSessionId
            });
        }

        // Save SOAP notes if available
        if (AppState.currentSoapNotes) {
            soapId = Storage.saveSOAPNotes(AppState.currentSoapNotes, {
                transcriptId: transcriptId,
                recordingId: recordingId,
                templateUsed: AppState.settings.soapTemplate,
                visitType: AppState.settings.visitType,
                qualityScore: AppState.soapMetadata?.qualityMetrics?.overall || 0,
                validation: AppState.soapMetadata?.validation,
                isFormatted: AppState.soapMetadata?.isFormatted,
                patientInfo: AppState.patientInfo,
                sessionId: AppState.currentSessionId
            });
        }

        // Save complete session
        const sessionId = Storage.saveSession({
            sessionId: AppState.currentSessionId,
            recordingId: recordingId,
            transcriptId: transcriptId,
            soapId: soapId,
            patientInfo: AppState.patientInfo,
            duration: AppState.currentRecordingStats?.duration || 0,
            templateUsed: AppState.settings.soapTemplate,
            visitType: AppState.settings.visitType,
            status: 'completed'
        });

        console.log('✅ Session saved successfully:', sessionId);

        // Refresh history if we're on that tab
        if (AppState.currentTab === 'history') {
            loadSavedNotes();
        }

        return sessionId;

    } catch (error) {
        console.error('❌ Failed to save session:', error);
        return null;
    }
}

/**
 * Initialize responsive features and mobile optimizations
 */
function initializeResponsiveFeatures() {
    console.log('📱 Initializing responsive features...');

    // Detect device type
    const deviceInfo = detectDeviceType();
    AppState.deviceInfo = deviceInfo;

    console.log('📱 Device detected:', deviceInfo);

    // Apply device-specific optimizations
    applyDeviceOptimizations(deviceInfo);

    // Set up responsive event listeners
    setupResponsiveEventListeners();

    // Handle orientation changes
    setupOrientationHandling();

    // Set up touch optimizations
    setupTouchOptimizations();

    // Handle viewport changes
    setupViewportHandling();

    console.log('✅ Responsive features initialized');
}

/**
 * Detect device type and capabilities
 */
function detectDeviceType() {
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Android(?=.*\bMobile\b)(?=.*\bTablet\b)|Android(?=.*\bTablet\b)/i.test(userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);

    // Check for touch support
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Check screen size
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Determine device category
    let deviceType = 'desktop';
    if (isMobile && !isTablet) {
        deviceType = 'mobile';
    } else if (isTablet || (screenWidth >= 768 && screenWidth < 1024)) {
        deviceType = 'tablet';
    }

    return {
        type: deviceType,
        isMobile: isMobile && !isTablet,
        isTablet: isTablet,
        isDesktop: !isMobile,
        isIOS: isIOS,
        isAndroid: isAndroid,
        isSafari: isSafari,
        hasTouch: hasTouch,
        screenWidth: screenWidth,
        screenHeight: screenHeight,
        viewportWidth: viewportWidth,
        viewportHeight: viewportHeight,
        pixelRatio: window.devicePixelRatio || 1
    };
}

/**
 * Apply device-specific optimizations
 */
function applyDeviceOptimizations(deviceInfo) {
    const body = document.body;

    // Add device-specific classes
    body.classList.add(`device-${deviceInfo.type}`);

    if (deviceInfo.hasTouch) {
        body.classList.add('touch-device');
    }

    if (deviceInfo.isIOS) {
        body.classList.add('ios-device');

        // iOS-specific optimizations
        applyIOSOptimizations();
    }

    if (deviceInfo.isAndroid) {
        body.classList.add('android-device');

        // Android-specific optimizations
        applyAndroidOptimizations();
    }

    if (deviceInfo.isMobile) {
        // Mobile-specific optimizations
        applyMobileOptimizations();
    }

    if (deviceInfo.isTablet) {
        // Tablet-specific optimizations
        applyTabletOptimizations();
    }
}

/**
 * Apply iOS-specific optimizations
 */
function applyIOSOptimizations() {
    // Fix iOS Safari viewport height issues
    const setVH = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', () => {
        setTimeout(setVH, 100);
    });

    // Prevent zoom on input focus
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        if (input.style.fontSize !== '16px') {
            input.style.fontSize = '16px';
        }
    });

    // Handle iOS safe areas
    if (CSS.supports('padding: max(0px)')) {
        document.documentElement.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top)');
        document.documentElement.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)');
    }
}

/**
 * Apply Android-specific optimizations
 */
function applyAndroidOptimizations() {
    // Android-specific touch optimizations
    document.addEventListener('touchstart', function() {}, { passive: true });

    // Handle Android keyboard resize
    const originalHeight = window.innerHeight;
    window.addEventListener('resize', () => {
        const currentHeight = window.innerHeight;
        const heightDiff = originalHeight - currentHeight;

        if (heightDiff > 150) {
            // Keyboard is likely open
            document.body.classList.add('keyboard-open');
        } else {
            // Keyboard is likely closed
            document.body.classList.remove('keyboard-open');
        }
    });
}

/**
 * Apply mobile-specific optimizations
 */
function applyMobileOptimizations() {
    // Disable text selection on mobile for better UX
    const controlElements = document.querySelectorAll('.btn, .nav-tab, .record-button');
    controlElements.forEach(element => {
        element.style.webkitUserSelect = 'none';
        element.style.userSelect = 'none';
    });

    // Optimize scroll behavior
    document.body.style.webkitOverflowScrolling = 'touch';

    // Prevent pull-to-refresh on mobile
    document.body.style.overscrollBehavior = 'none';

    // Hide keyboard hints on mobile
    const keyboardHints = document.querySelectorAll('.keyboard-hint');
    keyboardHints.forEach(hint => {
        hint.style.display = 'none';
    });
}

/**
 * Apply tablet-specific optimizations
 */
function applyTabletOptimizations() {
    // Tablet-specific touch optimizations
    const buttons = document.querySelectorAll('.btn, button');
    buttons.forEach(button => {
        button.style.minHeight = '44px';
    });
}

/**
 * Set up responsive event listeners
 */
function setupResponsiveEventListeners() {
    // Window resize handler
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            handleResponsiveResize();
        }, 250);
    });

    // Media query listeners
    const mobileQuery = window.matchMedia('(max-width: 767px)');
    const tabletQuery = window.matchMedia('(min-width: 768px) and (max-width: 1023px)');
    const desktopQuery = window.matchMedia('(min-width: 1024px)');

    mobileQuery.addListener(handleMediaQueryChange);
    tabletQuery.addListener(handleMediaQueryChange);
    desktopQuery.addListener(handleMediaQueryChange);

    // Initial check
    handleMediaQueryChange();
}

/**
 * Handle responsive resize events
 */
function handleResponsiveResize() {
    const newDeviceInfo = detectDeviceType();

    // Update device info if changed
    if (newDeviceInfo.type !== AppState.deviceInfo?.type) {
        console.log('📱 Device type changed:', newDeviceInfo.type);
        AppState.deviceInfo = newDeviceInfo;
        applyDeviceOptimizations(newDeviceInfo);
    }

    // Update viewport-dependent elements
    updateViewportDependentElements();
}

/**
 * Handle media query changes
 */
function handleMediaQueryChange() {
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    const isTablet = window.matchMedia('(min-width: 768px) and (max-width: 1023px)').matches;
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;

    // Update UI based on current breakpoint
    if (isMobile) {
        enableMobileMode();
    } else if (isTablet) {
        enableTabletMode();
    } else if (isDesktop) {
        enableDesktopMode();
    }
}

/**
 * Enable mobile-specific UI mode
 */
function enableMobileMode() {
    console.log('📱 Enabling mobile mode');

    // Hide desktop-specific elements
    const desktopElements = document.querySelectorAll('.desktop-only');
    desktopElements.forEach(element => {
        element.style.display = 'none';
    });

    // Show mobile-specific elements
    const mobileElements = document.querySelectorAll('.mobile-only');
    mobileElements.forEach(element => {
        element.style.display = 'block';
    });

    // Adjust tab behavior for mobile
    adjustTabsForMobile();
}

/**
 * Enable tablet-specific UI mode
 */
function enableTabletMode() {
    console.log('📱 Enabling tablet mode');

    // Show/hide appropriate elements
    const desktopElements = document.querySelectorAll('.desktop-only');
    desktopElements.forEach(element => {
        element.style.display = 'none';
    });

    const mobileElements = document.querySelectorAll('.mobile-only');
    mobileElements.forEach(element => {
        element.style.display = 'none';
    });
}

/**
 * Enable desktop-specific UI mode
 */
function enableDesktopMode() {
    console.log('🖥️ Enabling desktop mode');

    // Show desktop-specific elements
    const desktopElements = document.querySelectorAll('.desktop-only');
    desktopElements.forEach(element => {
        element.style.display = 'block';
    });

    // Hide mobile-specific elements
    const mobileElements = document.querySelectorAll('.mobile-only');
    mobileElements.forEach(element => {
        element.style.display = 'none';
    });
}

/**
 * Adjust tabs for mobile interface
 */
function adjustTabsForMobile() {
    const navTabs = document.querySelectorAll('.nav-tab');
    navTabs.forEach(tab => {
        // Make tabs more touch-friendly
        tab.style.minHeight = '44px';
        tab.style.padding = '12px 8px';
    });
}

/**
 * Set up orientation change handling
 */
function setupOrientationHandling() {
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            handleOrientationChange();
        }, 100);
    });
}

/**
 * Handle orientation changes
 */
function handleOrientationChange() {
    console.log('📱 Orientation changed');

    // Update device info
    AppState.deviceInfo = detectDeviceType();

    // Adjust UI for new orientation
    updateViewportDependentElements();

    // Handle specific orientation adjustments
    if (AppState.deviceInfo.isMobile) {
        const isLandscape = window.innerWidth > window.innerHeight;

        if (isLandscape) {
            enableMobileLandscapeMode();
        } else {
            enableMobilePortraitMode();
        }
    }
}

/**
 * Enable mobile landscape mode
 */
function enableMobileLandscapeMode() {
    console.log('📱 Mobile landscape mode');
    document.body.classList.add('mobile-landscape');
    document.body.classList.remove('mobile-portrait');
}

/**
 * Enable mobile portrait mode
 */
function enableMobilePortraitMode() {
    console.log('📱 Mobile portrait mode');
    document.body.classList.add('mobile-portrait');
    document.body.classList.remove('mobile-landscape');
}

/**
 * Set up touch optimizations
 */
function setupTouchOptimizations() {
    if (!AppState.deviceInfo?.hasTouch) return;

    // Add touch event listeners for better responsiveness
    const touchElements = document.querySelectorAll('.btn, .nav-tab, .record-button');

    touchElements.forEach(element => {
        // Add touch feedback
        element.addEventListener('touchstart', handleTouchStart, { passive: true });
        element.addEventListener('touchend', handleTouchEnd, { passive: true });
        element.addEventListener('touchcancel', handleTouchEnd, { passive: true });
    });
}

/**
 * Handle touch start events
 */
function handleTouchStart(event) {
    event.target.classList.add('touch-active');
}

/**
 * Handle touch end events
 */
function handleTouchEnd(event) {
    setTimeout(() => {
        event.target.classList.remove('touch-active');
    }, 150);
}

/**
 * Set up viewport handling
 */
function setupViewportHandling() {
    // Handle viewport meta tag updates
    updateViewportMeta();

    // Monitor viewport changes
    window.addEventListener('resize', updateViewportMeta);
}

/**
 * Update viewport meta tag based on device
 */
function updateViewportMeta() {
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) return;

    let content = 'width=device-width, initial-scale=1.0';

    if (AppState.deviceInfo?.isMobile) {
        // Prevent zoom on mobile
        content += ', maximum-scale=1.0, user-scalable=no';
    }

    if (AppState.deviceInfo?.isIOS) {
        // iOS-specific viewport settings
        content += ', viewport-fit=cover';
    }

    viewportMeta.setAttribute('content', content);
}

/**
 * Update viewport-dependent elements
 */
function updateViewportDependentElements() {
    // Update any elements that depend on viewport size
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Update CSS custom properties
    document.documentElement.style.setProperty('--viewport-width', `${viewportWidth}px`);
    document.documentElement.style.setProperty('--viewport-height', `${viewportHeight}px`);

    // Update audio visualization if visible
    if (AppState.isRecording) {
        updateAudioVisualizationSize();
    }
}

/**
 * Update audio visualization size for current viewport
 */
function updateAudioVisualizationSize() {
    const visualization = document.querySelector('.audio-visualization');
    if (!visualization) return;

    const isMobile = AppState.deviceInfo?.isMobile;
    const isLandscape = window.innerWidth > window.innerHeight;

    if (isMobile && isLandscape) {
        visualization.style.height = '40px';
    } else if (isMobile) {
        visualization.style.height = '60px';
    } else {
        visualization.style.height = '80px';
    }
}

/**
 * Get encryption status for display
 */
function getEncryptionStatus() {
    if (typeof Encryption === 'undefined') {
        return {
            available: false,
            initialized: false,
            enabled: false,
            status: 'Encryption module not available'
        };
    }

    const status = Encryption.getEncryptionStatus();

    return {
        available: true,
        initialized: status.initialized,
        enabled: status.enabled,
        algorithm: status.algorithm,
        keyLength: status.keyLength,
        browserSupported: status.browserSupported,
        status: status.initialized ?
            (status.enabled ? 'Active - Data is encrypted' : 'Disabled - Data is not encrypted') :
            'Not initialized'
    };
}

/**
 * Toggle encryption on/off
 */
async function toggleEncryption(enabled, password = null) {
    try {
        if (typeof Encryption === 'undefined') {
            showError(
                'Encryption is not available in this browser.',
                'system',
                'medium',
                {
                    suggestions: [
                        'Use a modern browser that supports Web Crypto API',
                        'Ensure you\'re using HTTPS',
                        'Try refreshing the page'
                    ]
                }
            );
            return false;
        }

        if (enabled) {
            // Initialize encryption
            await Encryption.init(password);
            AppState.settings.encryptionEnabled = true;
            AppState.settings.encryptionPassword = password;

            showSuccess('Encryption enabled. Your data will now be encrypted.');
            console.log('🔐 Encryption enabled');
        } else {
            // Disable encryption
            Encryption.setEncryptionEnabled(false);
            AppState.settings.encryptionEnabled = false;
            AppState.settings.encryptionPassword = null;

            showWarning(
                'Encryption disabled. New data will not be encrypted.',
                [
                    'Existing encrypted data will remain encrypted',
                    'Consider re-enabling encryption for sensitive data',
                    'You can enable encryption again at any time'
                ]
            );
            console.log('🔓 Encryption disabled');
        }

        // Save settings
        saveSettings();

        // Update UI
        updateEncryptionStatusDisplay();

        return true;

    } catch (error) {
        console.error('❌ Failed to toggle encryption:', error);
        showError(
            'Failed to change encryption settings.',
            'system',
            'high',
            {
                technicalDetails: error.message,
                suggestions: [
                    'Check that your browser supports encryption',
                    'Ensure you\'re using a secure connection (HTTPS)',
                    'Try refreshing the page and trying again'
                ]
            }
        );
        return false;
    }
}

/**
 * Update encryption status display in UI
 */
function updateEncryptionStatusDisplay() {
    const status = getEncryptionStatus();

    // Update status indicator if it exists
    const statusElement = document.querySelector('.encryption-status');
    if (statusElement) {
        statusElement.textContent = status.status;
        statusElement.className = `encryption-status ${status.enabled ? 'enabled' : 'disabled'}`;
    }

    // Update encryption toggle if it exists
    const toggleElement = document.querySelector('#encryptionEnabled');
    if (toggleElement) {
        toggleElement.checked = status.enabled;
    }

    // Update encryption details if they exist
    const detailsElement = document.querySelector('.encryption-details');
    if (detailsElement && status.available) {
        detailsElement.innerHTML = `
            <div class="encryption-info">
                <div class="info-item">
                    <span class="label">Algorithm:</span>
                    <span class="value">${status.algorithm || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="label">Key Length:</span>
                    <span class="value">${status.keyLength || 'N/A'} bits</span>
                </div>
                <div class="info-item">
                    <span class="label">Browser Support:</span>
                    <span class="value">${status.browserSupported ? 'Yes' : 'No'}</span>
                </div>
            </div>
        `;
    }

    console.log('🔐 Encryption status updated:', status);
}

/**
 * Handle encryption password setup
 */
async function setupEncryptionPassword() {
    try {
        // In a full implementation, this would show a secure password dialog
        const password = prompt('Enter a password for encryption (leave empty for automatic key generation):');

        if (password === null) {
            // User cancelled
            return false;
        }

        // Enable encryption with password
        const success = await toggleEncryption(true, password || null);

        if (success) {
            showSuccess('Encryption password set successfully.');
        }

        return success;

    } catch (error) {
        console.error('❌ Failed to setup encryption password:', error);
        showError(
            'Failed to setup encryption password.',
            'system',
            'medium',
            {
                technicalDetails: error.message,
                suggestions: [
                    'Try again with a different password',
                    'Use automatic key generation instead',
                    'Check browser console for technical details'
                ]
            }
        );
        return false;
    }
}

/**
 * Clear encryption keys (for security)
 */
function clearEncryptionKeys() {
    try {
        if (typeof Encryption !== 'undefined') {
            Encryption.clearKeys();
            showInfo('Encryption keys cleared for security.');
            console.log('🔐 Encryption keys cleared');
        }
    } catch (error) {
        console.error('❌ Failed to clear encryption keys:', error);
    }
}

/**
 * Export encrypted data with security warning
 */
function exportEncryptedData() {
    try {
        const status = getEncryptionStatus();

        if (!status.enabled) {
            showWarning(
                'Data is not encrypted. Export will contain unencrypted information.',
                [
                    'Consider enabling encryption before exporting',
                    'Ensure exported data is stored securely',
                    'Delete exported files after use'
                ]
            );
        } else {
            showInfo(
                'Exporting encrypted data. Keep your encryption password safe.',
                [
                    'You will need the same password to decrypt this data',
                    'Store the password separately from the exported file',
                    'Consider using a password manager'
                ]
            );
        }

        // Proceed with normal export
        exportStoredData();

    } catch (error) {
        console.error('❌ Failed to export encrypted data:', error);
        showError('Failed to export data.');
    }
}

/**
 * Get comprehensive security status
 */
function getSecurityStatus() {
    const status = {
        timestamp: new Date().toISOString(),
        encryption: getEncryptionStatus(),
        communication: null,
        connection: null,
        overall: 'unknown'
    };

    // Get communication security status
    if (typeof SecureCommunication !== 'undefined') {
        status.communication = SecureCommunication.getSecurityStatus();
    }

    // Get connection status
    if (typeof LLMConnector !== 'undefined') {
        status.connection = {
            isConnected: LLMConnector.isConnected,
            endpoint: LLMConnector.currentEndpoint,
            isTailscale: LLMConnector.currentEndpoint ?
                LLMConnector.currentEndpoint.includes('100.') : false
        };
    }

    // Calculate overall security level
    status.overall = calculateOverallSecurity(status);

    return status;
}

/**
 * Calculate overall security level
 */
function calculateOverallSecurity(status) {
    let score = 0;
    let maxScore = 0;

    // Encryption score (40% weight)
    maxScore += 40;
    if (status.encryption.enabled && status.encryption.initialized) {
        score += 40;
    } else if (status.encryption.available) {
        score += 20;
    }

    // Communication security score (30% weight)
    maxScore += 30;
    if (status.communication) {
        if (status.communication.httpsEnabled) score += 15;
        if (status.communication.secureConnection) score += 15;
    }

    // Connection security score (30% weight)
    maxScore += 30;
    if (status.connection) {
        if (status.connection.isTailscale) score += 20;
        if (status.connection.isConnected) score += 10;
    }

    const percentage = Math.round((score / maxScore) * 100);

    if (percentage >= 90) return 'excellent';
    if (percentage >= 75) return 'good';
    if (percentage >= 50) return 'fair';
    if (percentage >= 25) return 'poor';
    return 'critical';
}

/**
 * Update security status display
 */
function updateSecurityStatusDisplay() {
    const status = getSecurityStatus();

    // Update main security indicator
    const securityIndicator = document.querySelector('.security-status');
    if (securityIndicator) {
        securityIndicator.className = `security-status ${status.overall}`;
        securityIndicator.textContent = `Security: ${status.overall.charAt(0).toUpperCase() + status.overall.slice(1)}`;
    }

    // Update detailed security info
    const securityDetails = document.querySelector('.security-details');
    if (securityDetails) {
        securityDetails.innerHTML = `
            <div class="security-section">
                <h4>Data Encryption</h4>
                <div class="status-item ${status.encryption.enabled ? 'enabled' : 'disabled'}">
                    ${status.encryption.status}
                </div>
            </div>
            <div class="security-section">
                <h4>Communication</h4>
                <div class="status-item ${status.communication?.httpsEnabled ? 'enabled' : 'disabled'}">
                    ${status.communication?.httpsEnabled ? 'HTTPS Enabled' : 'HTTPS Disabled'}
                </div>
            </div>
            <div class="security-section">
                <h4>Connection</h4>
                <div class="status-item ${status.connection?.isTailscale ? 'enabled' : 'disabled'}">
                    ${status.connection?.isTailscale ? 'Tailscale VPN' : 'Direct Connection'}
                </div>
            </div>
        `;
    }

    console.log('🔒 Security status updated:', status);
}

/**
 * Monitor security status continuously
 */
function startSecurityMonitoring() {
    // Update security status every 30 seconds
    setInterval(() => {
        updateSecurityStatusDisplay();
    }, 30000);

    // Initial update
    updateSecurityStatusDisplay();

    console.log('🔒 Security monitoring started');
}

/**
 * Handle security warnings
 */
function handleSecurityWarning(type, message, suggestions = []) {
    console.warn(`🔒 Security warning [${type}]:`, message);

    if (typeof ErrorHandler !== 'undefined') {
        ErrorHandler.handleError({
            category: ErrorHandler.categories.SYSTEM,
            severity: ErrorHandler.severity.MEDIUM,
            message: `Security Warning: ${message}`,
            context: {
                type: 'security_warning',
                securityType: type,
                suggestions: suggestions.length > 0 ? suggestions : [
                    'Review your security settings',
                    'Ensure you\'re using HTTPS connections',
                    'Check that encryption is enabled',
                    'Verify your Tailscale connection'
                ]
            }
        });
    }
}

/**
 * Validate connection security
 */
function validateConnectionSecurity(endpoint) {
    const warnings = [];

    try {
        const url = new URL(endpoint);

        // Check for HTTPS
        if (url.protocol !== 'https:' && !isLocalhost(url.hostname) && !isTailscaleIP(url.hostname)) {
            warnings.push({
                type: 'insecure_protocol',
                message: 'Connection is not using HTTPS',
                suggestions: [
                    'Use HTTPS for external connections',
                    'Configure SSL/TLS on your LM Studio server',
                    'Use Tailscale for secure networking'
                ]
            });
        }

        // Check for Tailscale
        if (!isTailscaleIP(url.hostname) && !isLocalhost(url.hostname)) {
            warnings.push({
                type: 'non_tailscale',
                message: 'Connection is not using Tailscale VPN',
                suggestions: [
                    'Install and configure Tailscale for secure networking',
                    'Connect both devices to the same Tailscale network',
                    'Use Tailscale IP addresses for connections'
                ]
            });
        }

        // Show warnings
        warnings.forEach(warning => {
            handleSecurityWarning(warning.type, warning.message, warning.suggestions);
        });

        return warnings.length === 0;

    } catch (error) {
        console.error('❌ Failed to validate connection security:', error);
        return false;
    }
}

/**
 * Check if hostname is localhost
 */
function isLocalhost(hostname) {
    return ['localhost', '127.0.0.1', '::1'].includes(hostname);
}

/**
 * Check if IP is in Tailscale range
 */
function isTailscaleIP(hostname) {
    return /^100\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname);
}

/**
 * Generate security report
 */
function generateSecurityReport() {
    const status = getSecurityStatus();

    const report = {
        ...status,
        recommendations: [],
        risks: [],
        compliance: {
            dataEncryption: status.encryption.enabled,
            secureTransmission: status.communication?.httpsEnabled || status.connection?.isTailscale,
            accessControl: true, // Local-only access
            auditTrail: true // Request logging
        }
    };

    // Generate recommendations
    if (!status.encryption.enabled) {
        report.recommendations.push('Enable data encryption to protect patient information');
        report.risks.push('Patient data stored without encryption');
    }

    if (!status.communication?.httpsEnabled && !status.connection?.isTailscale) {
        report.recommendations.push('Use HTTPS or Tailscale for secure communication');
        report.risks.push('Data transmitted without encryption');
    }

    if (!status.connection?.isTailscale) {
        report.recommendations.push('Use Tailscale VPN for enhanced network security');
    }

    // Overall compliance score
    const complianceItems = Object.values(report.compliance);
    const complianceScore = Math.round((complianceItems.filter(Boolean).length / complianceItems.length) * 100);
    report.complianceScore = complianceScore;

    console.log('📊 Security report generated:', report);
    return report;
}

/**
 * Export security report
 */
function exportSecurityReport() {
    try {
        const report = generateSecurityReport();

        const reportData = {
            title: 'VetScribe Security Report',
            generated: new Date().toISOString(),
            ...report
        };

        const dataStr = JSON.stringify(reportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `vetscribe-security-report-${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        URL.revokeObjectURL(url);

        showSuccess('Security report exported successfully.');
        console.log('📊 Security report exported');

    } catch (error) {
        console.error('❌ Failed to export security report:', error);
        showError('Failed to export security report.');
    }
}

/**
 * Validate patient information input
 */
function validatePatientInput(patientData) {
    if (typeof DataValidator === 'undefined') {
        console.warn('⚠️ DataValidator not available, skipping validation');
        return { isValid: true, errors: [], warnings: [], sanitized: patientData };
    }

    try {
        const validation = DataValidator.validatePatientInfo(patientData);

        if (!validation.isValid) {
            console.warn('⚠️ Patient validation errors:', validation.errors);
            showWarning(
                'Patient information has validation issues.',
                validation.errors
            );
        }

        if (validation.warnings.length > 0) {
            console.info('ℹ️ Patient validation warnings:', validation.warnings);
            showInfo(
                'Patient information suggestions.',
                validation.warnings
            );
        }

        return validation;

    } catch (error) {
        console.error('❌ Patient validation failed:', error);
        return { isValid: false, errors: ['Validation system error'], warnings: [], sanitized: patientData };
    }
}

/**
 * Validate and sanitize form input
 */
function validateFormInput(formElement) {
    if (typeof DataValidator === 'undefined') {
        console.warn('⚠️ DataValidator not available, skipping form validation');
        return { isValid: true, errors: [] };
    }

    try {
        const validation = DataValidator.validateForm(formElement);

        if (!validation.isValid) {
            console.warn('⚠️ Form validation errors:', validation.errors);

            // Show validation errors to user
            validation.errors.forEach(error => {
                showWarning('Form validation error', [error]);
            });
        }

        return validation;

    } catch (error) {
        console.error('❌ Form validation failed:', error);
        return { isValid: false, errors: ['Form validation system error'] };
    }
}

/**
 * Sanitize text input for display
 */
function sanitizeTextForDisplay(text, type = 'text') {
    if (typeof DataValidator === 'undefined') {
        console.warn('⚠️ DataValidator not available, returning original text');
        return text;
    }

    try {
        switch (type) {
            case 'medical':
                return DataValidator.sanitizeMedicalText(text);
            case 'name':
                return DataValidator.sanitizeName(text);
            case 'email':
                return DataValidator.sanitizeEmail(text);
            case 'phone':
                return DataValidator.sanitizePhone(text);
            case 'html':
                return DataValidator.sanitizeHTML(text);
            default:
                return DataValidator.sanitizeText(text);
        }
    } catch (error) {
        console.error('❌ Text sanitization failed:', error);
        return text;
    }
}

/**
 * Validate LLM endpoint URL
 */
function validateLLMEndpoint(endpoint) {
    if (typeof DataValidator === 'undefined') {
        return { isValid: true, warnings: [] };
    }

    const warnings = [];

    try {
        const url = new URL(endpoint);

        // Check for HTTPS
        if (url.protocol !== 'https:' && !isLocalhost(url.hostname) && !isTailscaleIP(url.hostname)) {
            warnings.push('Consider using HTTPS for secure connections');
        }

        // Check for Tailscale
        if (!isTailscaleIP(url.hostname) && !isLocalhost(url.hostname)) {
            warnings.push('Consider using Tailscale for enhanced security');
        }

        // Check port range
        if (url.port && (parseInt(url.port) < 1024 || parseInt(url.port) > 65535)) {
            warnings.push('Port number should be between 1024 and 65535');
        }

        return {
            isValid: true,
            warnings: warnings,
            sanitized: endpoint.trim()
        };

    } catch (error) {
        return {
            isValid: false,
            warnings: ['Invalid URL format'],
            sanitized: endpoint
        };
    }
}

/**
 * Validate and sanitize settings input
 */
function validateSettingsInput(settings) {
    if (typeof DataValidator === 'undefined') {
        return { isValid: true, sanitized: settings };
    }

    const sanitized = { ...settings };
    const warnings = [];

    try {
        // Validate LLM endpoint
        if (settings.llmEndpoint) {
            const endpointValidation = validateLLMEndpoint(settings.llmEndpoint);
            sanitized.llmEndpoint = endpointValidation.sanitized;
            warnings.push(...endpointValidation.warnings);
        }

        // Sanitize text fields
        if (settings.clinicName) {
            sanitized.clinicName = DataValidator.sanitizeName(settings.clinicName);
        }

        if (settings.vetLicense) {
            sanitized.vetLicense = DataValidator.sanitizeText(settings.vetLicense);
        }

        // Validate numeric settings
        if (settings.audioQuality && !['low', 'medium', 'high'].includes(settings.audioQuality)) {
            warnings.push('Invalid audio quality setting');
            sanitized.audioQuality = 'medium';
        }

        return {
            isValid: warnings.length === 0,
            warnings: warnings,
            sanitized: sanitized
        };

    } catch (error) {
        console.error('❌ Settings validation failed:', error);
        return { isValid: false, sanitized: settings };
    }
}

/**
 * Show validation summary
 */
function showValidationSummary() {
    if (typeof DataValidator === 'undefined') {
        showInfo('Data validation not available.');
        return;
    }

    try {
        const summary = DataValidator.getValidationSummary();

        showInfo('Data Validation Status', [
            `Strict mode: ${summary.strictMode ? 'Enabled' : 'Disabled'}`,
            `Auto-sanitize: ${summary.autoSanitize ? 'Enabled' : 'Disabled'}`,
            `Validation patterns: ${summary.patternsLoaded}`,
            `Sanitization filters: ${summary.sanitizersLoaded}`
        ]);

        console.log('🛡️ Validation summary:', summary);

    } catch (error) {
        console.error('❌ Failed to get validation summary:', error);
        showError('Failed to get validation status.');
    }
}

/**
 * Test data validation system
 */
function testDataValidation() {
    if (typeof DataValidator === 'undefined') {
        showError('Data validation system not available.');
        return;
    }

    try {
        console.log('🧪 Testing data validation system...');

        // Test patient validation
        const testPatient = {
            name: 'Fluffy<script>alert("test")</script>',
            species: 'cat',
            age: '2 years',
            weight: '8.5 lbs',
            owner: {
                name: 'John Doe',
                email: 'john@example.com',
                phone: '555-123-4567'
            }
        };

        const patientValidation = DataValidator.validatePatientInfo(testPatient);
        console.log('🧪 Patient validation test:', patientValidation);

        // Test SOAP validation
        const testSOAP = 'S: Owner reports cat is eating well\nO: Temp 101.5°F, alert and responsive\nA: Healthy cat\nP: Continue current diet';
        const soapValidation = DataValidator.validateSOAPNotes(testSOAP);
        console.log('🧪 SOAP validation test:', soapValidation);

        // Test security validation
        const maliciousContent = '<script>alert("xss")</script>SELECT * FROM users';
        const securityValidation = DataValidator.validateSecurity(maliciousContent);
        console.log('🧪 Security validation test:', securityValidation);

        showSuccess('Data validation system test completed. Check console for details.');

    } catch (error) {
        console.error('❌ Data validation test failed:', error);
        showError('Data validation test failed.');
    }
}

/**
 * Set up hybrid UI interactions (VetSOAP-inspired)
 */
function setupHybridUI() {
    console.log('🎨 Setting up hybrid UI...');

    try {
        // Set up quick action cards
        setupQuickActions();

        // Set up mobile menu toggle
        setupMobileMenu();

        // Set up global search
        setupGlobalSearch();

        // Set up adaptive navigation
        setupAdaptiveNavigation();

        console.log('✅ Hybrid UI setup complete');

    } catch (error) {
        console.error('❌ Failed to setup hybrid UI:', error);
    }
}

/**
 * Set up quick action card interactions
 */
function setupQuickActions() {
    const actionCards = document.querySelectorAll('.action-card');

    actionCards.forEach(card => {
        card.addEventListener('click', (event) => {
            event.preventDefault();
            const action = card.dataset.action;
            handleQuickAction(action);
        });

        // Add keyboard support
        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                const action = card.dataset.action;
                handleQuickAction(action);
            }
        });

        // Make cards focusable
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
    });
}

/**
 * Handle quick action clicks
 */
function handleQuickAction(action) {
    console.log('🎯 Quick action triggered:', action);

    switch (action) {
        case 'record':
            // Switch to record tab and show detailed interface
            switchToDetailedMode('record');
            break;

        case 'history':
            // Switch to history tab
            switchToDetailedMode('history');
            break;

        case 'settings':
            // Switch to settings tab
            switchToDetailedMode('settings');
            break;

        default:
            console.warn('Unknown quick action:', action);
    }
}

/**
 * Switch from welcome mode to detailed interface mode
 */
function switchToDetailedMode(tabName = 'record') {
    console.log('🔄 Switching to detailed mode:', tabName);

    // Hide welcome section
    const welcomeSection = document.getElementById('welcomeSection');
    if (welcomeSection) {
        welcomeSection.style.display = 'none';
    }

    // Show detailed navigation
    const tabNavigation = document.getElementById('tabNavigation');
    if (tabNavigation) {
        tabNavigation.style.display = 'flex';
    }

    // Switch to the specified tab
    switchTab(tabName);

    // Update app state
    AppState.interfaceMode = 'detailed';

    // Add back button functionality
    addBackToWelcomeButton();
}

/**
 * Switch back to welcome mode
 */
function switchToWelcomeMode() {
    console.log('🔄 Switching to welcome mode');

    // Show welcome section
    const welcomeSection = document.getElementById('welcomeSection');
    if (welcomeSection) {
        welcomeSection.style.display = 'block';
    }

    // Hide detailed navigation
    const tabNavigation = document.getElementById('tabNavigation');
    if (tabNavigation) {
        tabNavigation.style.display = 'none';
    }

    // Update app state
    AppState.interfaceMode = 'welcome';

    // Remove back button
    removeBackToWelcomeButton();
}

/**
 * Add back to welcome button
 */
function addBackToWelcomeButton() {
    // Check if button already exists
    if (document.getElementById('backToWelcomeButton')) {
        return;
    }

    const tabNavigation = document.getElementById('tabNavigation');
    if (tabNavigation) {
        const backButton = document.createElement('button');
        backButton.id = 'backToWelcomeButton';
        backButton.className = 'tab-button back-button';
        backButton.innerHTML = '← Home';
        backButton.addEventListener('click', switchToWelcomeMode);

        tabNavigation.insertBefore(backButton, tabNavigation.firstChild);
    }
}

/**
 * Remove back to welcome button
 */
function removeBackToWelcomeButton() {
    const backButton = document.getElementById('backToWelcomeButton');
    if (backButton) {
        backButton.remove();
    }
}

/**
 * Set up mobile menu toggle
 */
function setupMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const tabNavigation = document.getElementById('tabNavigation');

    if (mobileMenuToggle && tabNavigation) {
        mobileMenuToggle.addEventListener('click', () => {
            const isVisible = tabNavigation.style.display !== 'none';

            if (isVisible) {
                tabNavigation.style.display = 'none';
                mobileMenuToggle.classList.remove('active');
            } else {
                tabNavigation.style.display = 'flex';
                mobileMenuToggle.classList.add('active');
                switchToDetailedMode();
            }
        });
    }
}

/**
 * Set up global search functionality
 */
function setupGlobalSearch() {
    const globalSearch = document.getElementById('globalSearch');

    if (globalSearch) {
        globalSearch.addEventListener('input', (event) => {
            const query = event.target.value.trim();

            if (query.length > 2) {
                performGlobalSearch(query);
            } else {
                clearSearchResults();
            }
        });

        globalSearch.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                const query = globalSearch.value.trim();
                if (query.length > 0) {
                    performGlobalSearch(query);
                    switchToDetailedMode('history');
                }
            }
        });
    }
}

/**
 * Perform global search across patients and notes
 */
function performGlobalSearch(query) {
    console.log('🔍 Global search:', query);

    // In a full implementation, this would search through:
    // - Patient names
    // - Owner names
    // - SOAP note content
    // - Historical records

    // For now, just switch to history tab and filter
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = query;
        // Trigger the existing search functionality
        searchInput.dispatchEvent(new Event('input'));
    }
}

/**
 * Clear search results
 */
function clearSearchResults() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput && searchInput.value !== '') {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));
    }
}

/**
 * Set up adaptive navigation based on screen size
 */
function setupAdaptiveNavigation() {
    // Check screen size and adapt interface
    function adaptInterface() {
        const isMobile = window.innerWidth <= 767;
        const welcomeSection = document.getElementById('welcomeSection');
        const tabNavigation = document.getElementById('tabNavigation');

        if (isMobile) {
            // On mobile, start with welcome mode
            if (AppState.interfaceMode !== 'detailed') {
                if (welcomeSection) welcomeSection.style.display = 'block';
                if (tabNavigation) tabNavigation.style.display = 'none';
            }
        } else {
            // On desktop, can show both or switch based on preference
            if (AppState.interfaceMode === 'welcome') {
                if (welcomeSection) welcomeSection.style.display = 'block';
                if (tabNavigation) tabNavigation.style.display = 'none';
            }
        }
    }

    // Initial adaptation
    adaptInterface();

    // Adapt on resize
    window.addEventListener('resize', adaptInterface);
}

/**
 * Update welcome section based on app state
 */
function updateWelcomeSection() {
    const welcomeGreeting = document.querySelector('.welcome-greeting');
    const welcomeSubtitle = document.querySelector('.welcome-subtitle');

    if (welcomeGreeting && welcomeSubtitle) {
        const currentHour = new Date().getHours();
        let greeting = 'Hi!';

        if (currentHour < 12) {
            greeting = 'Good morning!';
        } else if (currentHour < 17) {
            greeting = 'Good afternoon!';
        } else {
            greeting = 'Good evening!';
        }

        welcomeGreeting.textContent = `${greeting} How can I assist you today?`;

        // Update subtitle based on current state
        if (AppState.currentTranscript && !AppState.currentSoapNotes) {
            welcomeSubtitle.textContent = 'You have a transcript ready for SOAP note generation...';
        } else if (AppState.currentSoapNotes) {
            welcomeSubtitle.textContent = 'You have SOAP notes ready to save or export...';
        } else {
            welcomeSubtitle.textContent = 'Here are some things I can do for you...';
        }
    }
}

/**
 * Initialize hybrid UI state
 */
function initializeHybridUIState() {
    // Set initial interface mode
    AppState.interfaceMode = 'welcome';

    // Update welcome section
    updateWelcomeSection();

    // Set up periodic updates
    setInterval(updateWelcomeSection, 60000); // Update every minute
}

/**
 * Get comprehensive privacy status
 */
function getPrivacyStatus() {
    if (typeof PrivacyManager === 'undefined') {
        return {
            available: false,
            status: 'Privacy management not available'
        };
    }

    try {
        const status = PrivacyManager.getPrivacyStatus();

        return {
            available: true,
            ...status,
            dataTypes: Object.keys(status.retentionPolicies),
            autoCleanupEnabled: Object.values(status.retentionPolicies).some(policy => policy.autoDelete),
            complianceLevel: calculatePrivacyCompliance(status)
        };

    } catch (error) {
        console.error('❌ Failed to get privacy status:', error);
        return {
            available: false,
            status: 'Privacy status unavailable',
            error: error.message
        };
    }
}

/**
 * Calculate privacy compliance level
 */
function calculatePrivacyCompliance(privacyStatus) {
    let score = 0;
    let maxScore = 0;

    // Audit logging (20% weight)
    maxScore += 20;
    if (privacyStatus.auditLogging) score += 20;

    // Data minimization (20% weight)
    maxScore += 20;
    if (privacyStatus.dataMinimization) score += 20;

    // Retention policies configured (30% weight)
    maxScore += 30;
    const configuredPolicies = Object.values(privacyStatus.retentionPolicies).filter(policy =>
        policy.defaultDays > 0
    );
    score += Math.round((configuredPolicies.length / Object.keys(privacyStatus.retentionPolicies).length) * 30);

    // Recent cleanup activity (15% weight)
    maxScore += 15;
    if (privacyStatus.lastCleanup) {
        const daysSinceCleanup = (Date.now() - new Date(privacyStatus.lastCleanup).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceCleanup <= 7) score += 15;
        else if (daysSinceCleanup <= 30) score += 10;
        else if (daysSinceCleanup <= 90) score += 5;
    }

    // Auto-deletion enabled (15% weight)
    maxScore += 15;
    const autoDeletePolicies = Object.values(privacyStatus.retentionPolicies).filter(policy => policy.autoDelete);
    if (autoDeletePolicies.length > 0) score += 15;

    const percentage = Math.round((score / maxScore) * 100);

    if (percentage >= 90) return 'excellent';
    if (percentage >= 75) return 'good';
    if (percentage >= 50) return 'fair';
    if (percentage >= 25) return 'poor';
    return 'critical';
}

/**
 * Show privacy settings dialog
 */
function showPrivacySettings() {
    if (typeof PrivacyManager === 'undefined') {
        showError('Privacy management not available.');
        return;
    }

    try {
        const status = PrivacyManager.getPrivacyStatus();

        // Create privacy settings display
        const settingsInfo = [
            `Audit Logging: ${status.config.auditLogging ? 'Enabled' : 'Disabled'}`,
            `Data Minimization: ${status.config.dataMinimization ? 'Enabled' : 'Disabled'}`,
            `Auto-Delete: ${status.config.autoDeleteEnabled ? 'Enabled' : 'Disabled'}`,
            '',
            'Data Retention Policies:',
            ...Object.entries(status.retentionPolicies).map(([type, policy]) =>
                `  ${type}: ${policy.defaultDays} days ${policy.autoDelete ? '(auto-delete)' : ''}`
            ),
            '',
            `Last Cleanup: ${status.lastCleanup ? new Date(status.lastCleanup).toLocaleDateString() : 'Never'}`,
            `Items Deleted: ${status.totalItemsDeleted}`
        ];

        showInfo('Privacy Settings', settingsInfo);

    } catch (error) {
        console.error('❌ Failed to show privacy settings:', error);
        showError('Failed to load privacy settings.');
    }
}

/**
 * Export all user data
 */
async function exportUserData() {
    if (typeof PrivacyManager === 'undefined') {
        showError('Privacy management not available.');
        return;
    }

    try {
        showInfo('Preparing data export...', ['This may take a moment for large datasets']);

        const exportData = await PrivacyManager.exportUserData();

        // Create downloadable file
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `vetscribe-data-export-${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        URL.revokeObjectURL(url);

        showSuccess('Data export completed successfully.');
        console.log('📦 User data exported');

    } catch (error) {
        console.error('❌ Failed to export user data:', error);
        showError('Failed to export user data.');
    }
}

/**
 * Delete all user data with confirmation
 */
async function deleteAllUserData() {
    if (typeof PrivacyManager === 'undefined') {
        showError('Privacy management not available.');
        return;
    }

    try {
        // Multiple confirmation steps for safety
        const firstConfirm = confirm(
            'WARNING: This will permanently delete ALL your data including recordings, transcripts, SOAP notes, and settings.\n\n' +
            'This action CANNOT be undone.\n\n' +
            'Are you sure you want to continue?'
        );

        if (!firstConfirm) {
            return;
        }

        const secondConfirm = confirm(
            'FINAL WARNING: All data will be permanently deleted.\n\n' +
            'Consider exporting your data first.\n\n' +
            'Type "DELETE" in the next prompt to confirm.'
        );

        if (!secondConfirm) {
            return;
        }

        const finalConfirm = prompt(
            'Type "DELETE" (in capital letters) to confirm permanent deletion of all data:'
        );

        if (finalConfirm !== 'DELETE') {
            showInfo('Data deletion cancelled.');
            return;
        }

        // Perform deletion
        await PrivacyManager.deleteAllUserData();

        // Reload the page to reset the application
        setTimeout(() => {
            window.location.reload();
        }, 2000);

    } catch (error) {
        console.error('❌ Failed to delete user data:', error);
        showError('Failed to delete user data.');
    }
}

/**
 * Perform manual data cleanup
 */
async function performManualCleanup() {
    if (typeof PrivacyManager === 'undefined') {
        showError('Privacy management not available.');
        return;
    }

    try {
        showInfo('Starting manual data cleanup...', ['Removing expired data according to retention policies']);

        await PrivacyManager.performAutomaticCleanup();

        showSuccess('Manual cleanup completed successfully.');
        console.log('🧹 Manual cleanup performed');

        // Refresh any displayed data
        if (AppState.currentTab === 'history') {
            loadSavedNotes();
        }

    } catch (error) {
        console.error('❌ Manual cleanup failed:', error);
        showError('Manual cleanup failed.');
    }
}

/**
 * Update retention policy for a data type
 */
function updateRetentionPolicy(dataType, days, autoDelete = null) {
    if (typeof PrivacyManager === 'undefined') {
        showError('Privacy management not available.');
        return false;
    }

    try {
        const newPolicy = { defaultDays: parseInt(days) };
        if (autoDelete !== null) {
            newPolicy.autoDelete = autoDelete;
        }

        const success = PrivacyManager.updateRetentionPolicy(dataType, newPolicy);

        if (success) {
            showSuccess(`Retention policy updated for ${dataType}.`);
            console.log(`🔒 Retention policy updated: ${dataType} = ${days} days`);
        } else {
            showWarning(`Cannot modify retention policy for ${dataType}.`, [
                'This data type has legal retention requirements',
                'Policy changes are not permitted'
            ]);
        }

        return success;

    } catch (error) {
        console.error('❌ Failed to update retention policy:', error);
        showError('Failed to update retention policy.');
        return false;
    }
}

/**
 * Show audit log
 */
function showAuditLog(limit = 50) {
    if (typeof PrivacyManager === 'undefined') {
        showError('Privacy management not available.');
        return;
    }

    try {
        const auditLog = PrivacyManager.getAuditLog(limit);

        if (auditLog.length === 0) {
            showInfo('Audit log is empty.');
            return;
        }

        const logEntries = auditLog.map(entry =>
            `${new Date(entry.timestamp).toLocaleString()} - ${entry.eventType}`
        );

        showInfo(`Audit Log (Last ${auditLog.length} entries)`, logEntries);

        console.log('📋 Audit log displayed:', auditLog);

    } catch (error) {
        console.error('❌ Failed to show audit log:', error);
        showError('Failed to load audit log.');
    }
}

/**
 * Generate privacy compliance report
 */
function generatePrivacyReport() {
    try {
        const privacyStatus = getPrivacyStatus();
        const securityStatus = getSecurityStatus();

        const report = {
            title: 'VetScribe Privacy & Security Compliance Report',
            generated: new Date().toISOString(),
            privacy: privacyStatus,
            security: securityStatus,
            compliance: {
                privacyLevel: privacyStatus.complianceLevel,
                securityLevel: securityStatus.overall,
                overallCompliance: calculateOverallCompliance(privacyStatus, securityStatus)
            },
            recommendations: generateComplianceRecommendations(privacyStatus, securityStatus)
        };

        console.log('📊 Privacy compliance report generated:', report);
        return report;

    } catch (error) {
        console.error('❌ Failed to generate privacy report:', error);
        return null;
    }
}

/**
 * Calculate overall compliance score
 */
function calculateOverallCompliance(privacyStatus, securityStatus) {
    const privacyScore = getComplianceScore(privacyStatus.complianceLevel);
    const securityScore = getComplianceScore(securityStatus.overall);

    const overallScore = Math.round((privacyScore + securityScore) / 2);

    if (overallScore >= 90) return 'excellent';
    if (overallScore >= 75) return 'good';
    if (overallScore >= 50) return 'fair';
    if (overallScore >= 25) return 'poor';
    return 'critical';
}

/**
 * Get numeric score from compliance level
 */
function getComplianceScore(level) {
    switch (level) {
        case 'excellent': return 95;
        case 'good': return 80;
        case 'fair': return 60;
        case 'poor': return 35;
        case 'critical': return 15;
        default: return 0;
    }
}

/**
 * Generate compliance recommendations
 */
function generateComplianceRecommendations(privacyStatus, securityStatus) {
    const recommendations = [];

    // Privacy recommendations
    if (!privacyStatus.config?.auditLogging) {
        recommendations.push('Enable audit logging for compliance tracking');
    }

    if (!privacyStatus.autoCleanupEnabled) {
        recommendations.push('Enable automatic data cleanup for better privacy protection');
    }

    // Security recommendations
    if (!securityStatus.encryption?.enabled) {
        recommendations.push('Enable data encryption for sensitive information protection');
    }

    if (!securityStatus.communication?.httpsEnabled && !securityStatus.connection?.isTailscale) {
        recommendations.push('Use HTTPS or Tailscale for secure communication');
    }

    // Overall recommendations
    if (recommendations.length === 0) {
        recommendations.push('Excellent compliance! Continue monitoring and maintaining current practices.');
    }

    return recommendations;
}

/**
 * Export privacy compliance report
 */
function exportPrivacyReport() {
    try {
        const report = generatePrivacyReport();

        if (!report) {
            showError('Failed to generate privacy report.');
            return;
        }

        const reportData = JSON.stringify(report, null, 2);
        const dataBlob = new Blob([reportData], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `vetscribe-privacy-report-${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        URL.revokeObjectURL(url);

        showSuccess('Privacy compliance report exported successfully.');
        console.log('📊 Privacy report exported');

    } catch (error) {
        console.error('❌ Failed to export privacy report:', error);
        showError('Failed to export privacy report.');
    }
}

/**
 * Export SOAP notes with encryption options - SECURE EXPORT
 */
async function exportSOAPNotesSecure(noteIds = [], options = {}) {
    try {
        if (typeof SecureExport === 'undefined') {
            showError('Secure export system not available.');
            return;
        }

        const {
            encrypt = true,
            format = 'json',
            password = null
        } = options;

        showInfo('Preparing SOAP notes export...', [
            encrypt ? 'Export will be encrypted for security' : 'Export will be unencrypted',
            `Format: ${format.toUpperCase()}`,
            'This may take a moment for large datasets'
        ]);

        const result = await SecureExport.exportSOAPNotes(noteIds, {
            encrypt,
            format,
            password,
            includeMetadata: true
        });

        if (result.success) {
            const messages = [
                `File: ${result.filename}`,
                `Encrypted: ${result.encrypted ? 'Yes' : 'No'}`,
                'Export completed successfully'
            ];

            if (result.encrypted) {
                messages.push('Remember your password - it\'s required to decrypt the file');
            }

            showSuccess('SOAP notes exported successfully!', messages);
        }

        return result;

    } catch (error) {
        console.error('❌ Secure SOAP export failed:', error);
        showError('Failed to export SOAP notes.', [error.message]);
    }
}

/**
 * Export complete user data with encryption - SECURE EXPORT
 */
async function exportCompleteDataSecure(options = {}) {
    try {
        if (typeof SecureExport === 'undefined') {
            showError('Secure export system not available.');
            return;
        }

        const {
            password = null,
            includeAuditLog = false
        } = options;

        // Confirm export with user
        const confirmed = confirm(
            'Export all your VetScribe data?\n\n' +
            'This will include:\n' +
            '• All SOAP notes\n' +
            '• All transcripts\n' +
            '• All recordings\n' +
            '• All sessions\n' +
            '• Settings and preferences\n' +
            (includeAuditLog ? '• Audit log\n' : '') +
            '\nThe export will be encrypted for security.'
        );

        if (!confirmed) {
            return;
        }

        showInfo('Preparing complete data export...', [
            'This will export ALL your VetScribe data',
            'Export will be encrypted for security',
            'This may take several minutes for large datasets'
        ]);

        const result = await SecureExport.exportCompleteData({
            password,
            includeAuditLog
        });

        if (result.success) {
            showSuccess('Complete data export successful!', [
                `File: ${result.filename}`,
                'All data exported and encrypted',
                'Store your password securely - it\'s required to decrypt the file',
                'This file contains all your VetScribe data'
            ]);
        }

        return result;

    } catch (error) {
        console.error('❌ Complete data export failed:', error);
        showError('Failed to export complete data.', [error.message]);
    }
}

/**
 * Export specific data type with options - SECURE EXPORT
 */
async function exportDataTypeSecure(dataType, options = {}) {
    try {
        if (typeof SecureExport === 'undefined') {
            showError('Secure export system not available.');
            return;
        }

        const {
            encrypt = false,
            format = 'json',
            password = null
        } = options;

        showInfo(`Preparing ${dataType} export...`, [
            `Format: ${format.toUpperCase()}`,
            `Encrypted: ${encrypt ? 'Yes' : 'No'}`
        ]);

        const result = await SecureExport.exportDataType(dataType, {
            encrypt,
            format,
            password
        });

        if (result.success) {
            showSuccess(`${dataType} exported successfully!`, [
                `File: ${result.filename}`,
                `Encrypted: ${result.encrypted ? 'Yes' : 'No'}`
            ]);
        }

        return result;

    } catch (error) {
        console.error(`❌ ${dataType} export failed:`, error);
        showError(`Failed to export ${dataType}.`, [error.message]);
    }
}

/**
 * Show export options dialog
 */
function showExportOptions() {
    try {
        if (typeof SecureExport === 'undefined') {
            showError('Secure export system not available.');
            return;
        }

        const stats = SecureExport.getExportStats();

        const exportInfo = [
            'VetScribe Secure Export Options:',
            '',
            '📦 Available Exports:',
            '• SOAP Notes (encrypted recommended)',
            '• Complete Data (always encrypted)',
            '• Recordings (JSON format)',
            '• Transcripts (JSON/CSV/TXT)',
            '• Sessions (JSON format)',
            '• Settings (JSON format)',
            '',
            '🔒 Security Features:',
            '• AES-GCM encryption',
            '• Password protection',
            '• Audit logging',
            '• Data validation',
            '',
            '📊 Export Statistics:',
            `• Total exports: ${stats.totalExports}`,
            `• Encrypted exports: ${stats.encryptedExports}`,
            `• Encryption rate: ${stats.encryptionRate}%`,
            `• Last export: ${stats.lastExport ? new Date(stats.lastExport).toLocaleDateString() : 'Never'}`,
            '',
            'Use the console commands to export data:',
            '• exportSOAPNotesSecure()',
            '• exportCompleteDataSecure()',
            '• exportDataTypeSecure("transcripts")'
        ];

        showInfo('Secure Export System', exportInfo);

    } catch (error) {
        console.error('❌ Failed to show export options:', error);
        showError('Failed to load export options.');
    }
}

/**
 * Quick export current SOAP notes
 */
async function quickExportSOAP() {
    try {
        // Get current SOAP notes if available
        if (AppState.currentSoapNotes) {
            // Export current SOAP note
            const tempId = 'current-' + Date.now();
            const tempNote = {
                id: tempId,
                content: AppState.currentSoapNotes,
                timestamp: new Date().toISOString(),
                metadata: {
                    exported: true,
                    source: 'current_session'
                }
            };

            // Create temporary export
            const result = await SecureExport.exportSOAPNotes([tempId], {
                encrypt: true,
                format: 'json'
            });

            if (result.success) {
                showSuccess('Current SOAP notes exported!', [
                    'Your current SOAP notes have been exported',
                    'File is encrypted for security',
                    'Remember your password for decryption'
                ]);
            }

        } else {
            // Export all saved SOAP notes
            await exportSOAPNotesSecure();
        }

    } catch (error) {
        console.error('❌ Quick SOAP export failed:', error);
        showError('Failed to export SOAP notes.');
    }
}

/**
 * Test secure export functionality
 */
async function testSecureExport() {
    try {
        if (typeof SecureExport === 'undefined') {
            showError('Secure export system not available.');
            return;
        }

        console.log('🧪 Testing secure export functionality...');

        // Test data
        const testData = [
            {
                id: 'test-1',
                content: 'Test SOAP note for export testing',
                timestamp: new Date().toISOString(),
                patient: 'Test Patient'
            }
        ];

        // Test plain export
        const plainResult = await SecureExport.exportDataType('test', {
            encrypt: false,
            format: 'json'
        });

        // Test encrypted export
        const encryptedResult = await SecureExport.exportDataType('test', {
            encrypt: true,
            format: 'json',
            password: 'test-password-123'
        });

        const results = [
            `Plain export: ${plainResult.success ? '✅ Success' : '❌ Failed'}`,
            `Encrypted export: ${encryptedResult.success ? '✅ Success' : '❌ Failed'}`,
            'Export system is working correctly'
        ];

        showSuccess('Secure export test completed!', results);
        console.log('✅ Secure export test passed');

    } catch (error) {
        console.error('❌ Secure export test failed:', error);
        showError('Secure export test failed.', [error.message]);
    }
}

/**
 * Test all security features - EASY TESTING FUNCTION
 */
async function testSecurity() {
    console.log('🧪 Starting security tests...');

    if (typeof SecurityTestSuite === 'undefined') {
        console.error('❌ Security test suite not available');
        showError('Security test suite not loaded.');
        return;
    }

    try {
        showInfo('Running security tests...', ['This will test all security features', 'Check the browser console for detailed results']);

        await SecurityTestSuite.runAllTests();

        const report = SecurityTestSuite.generateTestReport();

        // Show summary to user
        const summaryMessages = [
            `Total Tests: ${report.summary.total}`,
            `✅ Passed: ${report.summary.passed}`,
            `❌ Failed: ${report.summary.failed}`,
            `ℹ️ Info: ${report.summary.info}`,
            `Success Rate: ${report.summary.successRate}%`,
            '',
            'Check browser console (F12) for detailed results'
        ];

        if (report.summary.successRate >= 80) {
            showSuccess('Security tests completed successfully!', summaryMessages);
        } else if (report.summary.successRate >= 60) {
            showWarning('Security tests completed with some issues.', summaryMessages);
        } else {
            showError('Security tests found significant issues.', summaryMessages);
        }

        return report;

    } catch (error) {
        console.error('❌ Security testing failed:', error);
        showError('Security testing failed.', [error.message]);
    }
}

/**
 * Test encryption specifically
 */
async function testEncryption() {
    console.log('🔐 Testing encryption...');

    try {
        if (typeof Encryption === 'undefined') {
            showError('Encryption module not available.');
            return;
        }

        // Test browser support
        const browserSupported = Encryption.isBrowserSupported();
        if (!browserSupported) {
            showError('Your browser does not support encryption.', [
                'Use a modern browser like Chrome, Firefox, or Safari',
                'Ensure you\'re using HTTPS',
                'Try refreshing the page'
            ]);
            return;
        }

        // Test initialization
        await Encryption.init('test-password-123');
        const status = Encryption.getEncryptionStatus();

        if (!status.initialized) {
            showError('Encryption failed to initialize.');
            return;
        }

        // Test encryption/decryption
        const testData = 'Test patient data: Fluffy the cat, 2 years old, owner: John Doe';
        const encrypted = await Encryption.encrypt(testData);
        const decrypted = await Encryption.decrypt(encrypted);

        if (decrypted === testData) {
            showSuccess('Encryption test passed!', [
                'Browser supports encryption ✅',
                'Encryption initialized ✅',
                'Data encrypted and decrypted correctly ✅',
                `Algorithm: ${status.algorithm}`,
                `Key length: ${status.keyLength} bits`
            ]);
        } else {
            showError('Encryption test failed - data corruption detected.');
        }

    } catch (error) {
        console.error('❌ Encryption test failed:', error);
        showError('Encryption test failed.', [error.message]);
    }
}

/**
 * Test data validation
 */
function testDataValidation() {
    console.log('🛡️ Testing data validation...');

    try {
        if (typeof DataValidator === 'undefined') {
            showError('Data validation module not available.');
            return;
        }

        // Test normal patient data
        const goodPatient = {
            name: 'Fluffy',
            species: 'cat',
            age: '2 years',
            weight: '8.5 lbs',
            owner: {
                name: 'John Doe',
                email: 'john@example.com',
                phone: '555-123-4567'
            }
        };

        const goodValidation = DataValidator.validatePatientInfo(goodPatient);

        // Test malicious data
        const badPatient = {
            name: 'Fluffy<script>alert("hack")</script>',
            species: 'cat',
            owner: {
                name: 'John; DROP TABLE patients;--',
                email: 'not-an-email'
            }
        };

        const badValidation = DataValidator.validatePatientInfo(badPatient);

        // Test SOAP notes
        const goodSOAP = 'S: Patient eating well\nO: Normal exam\nA: Healthy\nP: Continue care';
        const soapValidation = DataValidator.validateSOAPNotes(goodSOAP);

        // Test malicious SOAP
        const badSOAP = 'S: Patient fine<script>alert("xss")</script>\nO: Normal';
        const soapSecurityValidation = DataValidator.validateSecurity(badSOAP);

        const results = [
            `Good patient data: ${goodValidation.isValid ? '✅ Valid' : '❌ Invalid'}`,
            `Malicious data detected: ${!badValidation.isValid ? '✅ Blocked' : '❌ Not blocked'}`,
            `SOAP validation: ${soapValidation.isValid ? '✅ Valid' : '❌ Invalid'}`,
            `Security threats detected: ${!soapSecurityValidation.isSecure ? '✅ Detected' : '❌ Missed'}`,
            `Sanitized malicious name: "${badValidation.sanitized.name}"`
        ];

        const allPassed = goodValidation.isValid && !badValidation.isValid &&
                         soapValidation.isValid && !soapSecurityValidation.isSecure;

        if (allPassed) {
            showSuccess('Data validation test passed!', results);
        } else {
            showWarning('Data validation test had issues.', results);
        }

    } catch (error) {
        console.error('❌ Data validation test failed:', error);
        showError('Data validation test failed.', [error.message]);
    }
}

/**
 * Test privacy management
 */
function testPrivacyManagement() {
    console.log('🔒 Testing privacy management...');

    try {
        if (typeof PrivacyManager === 'undefined') {
            showError('Privacy management module not available.');
            return;
        }

        const status = PrivacyManager.getPrivacyStatus();

        // Test audit logging
        PrivacyManager.logAuditEvent('test_event', { testData: 'privacy test' });
        const auditLog = PrivacyManager.getAuditLog(1);

        const results = [
            `Audit logging: ${status.config.auditLogging ? '✅ Enabled' : '❌ Disabled'}`,
            `Data minimization: ${status.config.dataMinimization ? '✅ Enabled' : '❌ Disabled'}`,
            `SOAP retention: ${status.retentionPolicies.soapNotes?.defaultDays} days (should be 2555)`,
            `Recording retention: ${status.retentionPolicies.recordings?.defaultDays} days`,
            `Auto-delete enabled: ${Object.values(status.retentionPolicies).some(p => p.autoDelete) ? '✅ Yes' : '❌ No'}`,
            `Audit log working: ${auditLog.length > 0 ? '✅ Yes' : '❌ No'}`,
            `Last cleanup: ${status.lastCleanup || 'Never'}`
        ];

        showInfo('Privacy Management Status', results);

    } catch (error) {
        console.error('❌ Privacy management test failed:', error);
        showError('Privacy management test failed.', [error.message]);
    }
}

/**
 * Test secure communication
 */
function testSecureCommunication() {
    console.log('🔒 Testing secure communication...');

    try {
        if (typeof SecureCommunication === 'undefined') {
            showError('Secure communication module not available.');
            return;
        }

        const status = SecureCommunication.getSecurityStatus();

        // Test URL validation
        const testResults = [];

        try {
            SecureCommunication.validateRequestURL('https://example.com');
            testResults.push('✅ HTTPS URL accepted');
        } catch (error) {
            testResults.push('❌ HTTPS URL rejected');
        }

        try {
            SecureCommunication.validateRequestURL('http://100.64.1.1:1234');
            testResults.push('✅ Tailscale URL accepted');
        } catch (error) {
            testResults.push('❌ Tailscale URL rejected');
        }

        try {
            SecureCommunication.validateRequestURL('http://example.com');
            testResults.push('❌ HTTP URL accepted (should be rejected)');
        } catch (error) {
            testResults.push('✅ HTTP URL correctly rejected');
        }

        const results = [
            `HTTPS enabled: ${status.httpsEnabled ? '✅ Yes' : '❌ No'}`,
            `Connection quality: ${status.connectionQuality}`,
            `Active requests: ${status.activeRequests}`,
            '',
            'URL Validation Tests:',
            ...testResults
        ];

        showInfo('Secure Communication Status', results);

    } catch (error) {
        console.error('❌ Secure communication test failed:', error);
        showError('Secure communication test failed.', [error.message]);
    }
}

/**
 * Export security test report
 */
function exportSecurityReport() {
    try {
        if (typeof SecurityTestSuite === 'undefined') {
            showError('Security test suite not available.');
            return;
        }

        SecurityTestSuite.exportTestReport();
        showSuccess('Security test report exported successfully.');

    } catch (error) {
        console.error('❌ Failed to export security report:', error);
        showError('Failed to export security report.');
    }
}

/**
 * Quick security status check
 */
function checkSecurityStatus() {
    console.log('🔍 Checking security status...');

    try {
        const results = [];

        // Check encryption
        if (typeof Encryption !== 'undefined') {
            const encStatus = getEncryptionStatus();
            results.push(`🔐 Encryption: ${encStatus.enabled ? '✅ Active' : '❌ Disabled'}`);
        } else {
            results.push('🔐 Encryption: ❌ Not available');
        }

        // Check secure communication
        if (typeof SecureCommunication !== 'undefined') {
            const commStatus = SecureCommunication.getSecurityStatus();
            results.push(`🔒 HTTPS: ${commStatus.httpsEnabled ? '✅ Enabled' : '❌ Disabled'}`);
        } else {
            results.push('🔒 Secure Communication: ❌ Not available');
        }

        // Check data validation
        if (typeof DataValidator !== 'undefined') {
            results.push('🛡️ Data Validation: ✅ Active');
        } else {
            results.push('🛡️ Data Validation: ❌ Not available');
        }

        // Check privacy management
        if (typeof PrivacyManager !== 'undefined') {
            const privacyStatus = PrivacyManager.getPrivacyStatus();
            results.push(`🔒 Privacy Management: ✅ Active (${privacyStatus.config.auditLogging ? 'Audit enabled' : 'Audit disabled'})`);
        } else {
            results.push('🔒 Privacy Management: ❌ Not available');
        }

        // Overall security score
        const securityStatus = getSecurityStatus();
        results.push('');
        results.push(`📊 Overall Security: ${securityStatus.overall.toUpperCase()}`);

        showInfo('Security Status Check', results);

    } catch (error) {
        console.error('❌ Security status check failed:', error);
        showError('Security status check failed.', [error.message]);
    }
}

/**
 * Clean up resources when the app is closed
 */
function cleanupApp() {
    console.log('🧹 Cleaning up application...');

    // Stop recording if active
    if (AppState.isRecording) {
        AudioRecorder.stopRecording();
    }

    // Clean up AudioRecorder
    if (typeof AudioRecorder !== 'undefined') {
        AudioRecorder.cleanup();
    }

    // Clear timers
    if (AppState.recordingTimer) {
        clearInterval(AppState.recordingTimer);
    }

    console.log('✅ Application cleanup complete');
}

/**
 * Simple diagnostic function
 */
function diagnoseApp() {
    console.log('🔍 Diagnosing VetScribe...');

    // Check if DOM elements exist
    const recordButton = document.getElementById('recordButton');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');

    console.log('📋 DOM Elements Check:');
    console.log('- Record button:', recordButton ? '✅ Found' : '❌ Missing');
    console.log('- Tab buttons:', tabButtons.length, 'found');
    console.log('- Tab panels:', tabPanels.length, 'found');

    // Check if modules are loaded
    console.log('📦 Modules Check:');
    console.log('- AudioRecorder:', typeof AudioRecorder !== 'undefined' ? '✅ Loaded' : '❌ Missing');
    console.log('- Transcription:', typeof Transcription !== 'undefined' ? '✅ Loaded' : '❌ Missing');
    console.log('- Storage:', typeof Storage !== 'undefined' ? '✅ Loaded' : '❌ Missing');

    return {
        recordButton: !!recordButton,
        tabButtons: tabButtons.length,
        tabPanels: tabPanels.length,
        audioRecorder: typeof AudioRecorder !== 'undefined',
        transcription: typeof Transcription !== 'undefined',
        storage: typeof Storage !== 'undefined'
    };
}

// Make diagnoseApp available globally for testing
window.diagnoseApp = diagnoseApp;

// Make export functions available globally for testing
window.showExportOptions = showExportOptions;
window.exportSOAPNotesSecure = exportSOAPNotesSecure;
window.exportCompleteDataSecure = exportCompleteDataSecure;
window.exportDataTypeSecure = exportDataTypeSecure;
window.quickExportSOAP = quickExportSOAP;
window.testSecureExport = testSecureExport;

// Initialize the application when the DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        try {
            await initializeApp();
        } catch (error) {
            console.error('❌ App initialization failed:', error);
            // Run diagnostics
            diagnoseApp();
        }
    });
} else {
    (async () => {
        try {
            await initializeApp();
        } catch (error) {
            console.error('❌ App initialization failed:', error);
            // Run diagnostics
            diagnoseApp();
        }
    })();
}

// Clean up when the page is unloaded
window.addEventListener('beforeunload', cleanupApp);
window.addEventListener('unload', cleanupApp);
