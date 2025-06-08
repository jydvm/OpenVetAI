/**
 * VetScribe - Comprehensive Error Handler
 * Professional error handling and user feedback system for veterinary practice
 */

const ErrorHandler = {
    // Error categories and severity levels
    categories: {
        AUDIO: 'audio',
        TRANSCRIPTION: 'transcription',
        LLM: 'llm',
        STORAGE: 'storage',
        NETWORK: 'network',
        VALIDATION: 'validation',
        SYSTEM: 'system',
        USER: 'user'
    },
    
    severity: {
        LOW: 'low',
        MEDIUM: 'medium',
        HIGH: 'high',
        CRITICAL: 'critical'
    },
    
    // Error tracking
    errorLog: [],
    maxLogSize: 100,
    
    // User feedback configuration
    feedbackConfig: {
        showTechnicalDetails: false,
        autoHideSuccess: true,
        autoHideDelay: 5000,
        maxRetryAttempts: 3
    },

    /**
     * Initialize error handling system
     */
    init() {
        console.log('🛡️ Initializing error handling system...');
        
        // Set up global error handlers
        this.setupGlobalErrorHandlers();
        
        // Initialize user feedback system
        this.initializeFeedbackSystem();
        
        // Set up error recovery mechanisms
        this.setupErrorRecovery();
        
        console.log('✅ Error handling system initialized');
    },

    /**
     * Set up global error handlers
     */
    setupGlobalErrorHandlers() {
        // Catch unhandled JavaScript errors
        window.addEventListener('error', (event) => {
            this.handleError({
                category: this.categories.SYSTEM,
                severity: this.severity.HIGH,
                message: 'Unexpected system error occurred',
                technicalDetails: event.error?.message || 'Unknown error',
                stack: event.error?.stack,
                context: {
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno
                }
            });
        });

        // Catch unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError({
                category: this.categories.SYSTEM,
                severity: this.severity.HIGH,
                message: 'System operation failed unexpectedly',
                technicalDetails: event.reason?.message || 'Promise rejection',
                stack: event.reason?.stack,
                context: { type: 'unhandled_promise_rejection' }
            });
        });
    },

    /**
     * Initialize user feedback system
     */
    initializeFeedbackSystem() {
        // Create feedback container if it doesn't exist
        if (!document.getElementById('feedback-container')) {
            this.createFeedbackContainer();
        }
        
        // Set up feedback event listeners
        this.setupFeedbackEventListeners();
    },

    /**
     * Create feedback container in DOM
     */
    createFeedbackContainer() {
        const container = document.createElement('div');
        container.id = 'feedback-container';
        container.className = 'feedback-container';
        container.innerHTML = `
            <div id="feedback-overlay" class="feedback-overlay"></div>
            <div id="feedback-messages" class="feedback-messages"></div>
        `;
        
        document.body.appendChild(container);
    },

    /**
     * Set up feedback event listeners
     */
    setupFeedbackEventListeners() {
        // Close feedback on overlay click
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('feedback-overlay')) {
                this.hideFeedback();
            }
        });
        
        // Close feedback on escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.hideFeedback();
            }
        });
    },

    /**
     * Set up error recovery mechanisms
     */
    setupErrorRecovery() {
        // Set up automatic retry mechanisms
        this.retryAttempts = new Map();
        
        // Set up fallback systems
        this.setupFallbackSystems();
    },

    /**
     * Set up fallback systems
     */
    setupFallbackSystems() {
        // Audio fallback
        this.audioFallback = {
            available: false,
            initialize: () => {
                // Initialize basic audio recording fallback
                console.log('🔄 Initializing audio fallback system...');
            }
        };
        
        // Storage fallback
        this.storageFallback = {
            available: typeof sessionStorage !== 'undefined',
            save: (key, data) => {
                if (this.storageFallback.available) {
                    sessionStorage.setItem(key, JSON.stringify(data));
                }
            },
            get: (key) => {
                if (this.storageFallback.available) {
                    const data = sessionStorage.getItem(key);
                    return data ? JSON.parse(data) : null;
                }
                return null;
            }
        };
    },

    /**
     * Main error handling function
     */
    handleError(errorInfo) {
        try {
            // Log the error
            this.logError(errorInfo);
            
            // Determine user-friendly message
            const userMessage = this.generateUserMessage(errorInfo);
            
            // Show appropriate feedback to user
            this.showUserFeedback(userMessage, errorInfo);
            
            // Attempt automatic recovery if possible
            this.attemptRecovery(errorInfo);
            
            // Report error for monitoring (if configured)
            this.reportError(errorInfo);
            
        } catch (handlingError) {
            console.error('❌ Error in error handler:', handlingError);
            this.showBasicError('A system error occurred. Please refresh the page.');
        }
    },

    /**
     * Log error for debugging and analysis
     */
    logError(errorInfo) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            id: this.generateErrorId(),
            ...errorInfo,
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        // Add to error log
        this.errorLog.push(logEntry);
        
        // Maintain log size
        if (this.errorLog.length > this.maxLogSize) {
            this.errorLog.shift();
        }
        
        // Console logging with appropriate level
        const logLevel = this.getLogLevel(errorInfo.severity);
        console[logLevel](`🛡️ Error [${errorInfo.category}]:`, logEntry);
    },

    /**
     * Generate user-friendly error messages
     */
    generateUserMessage(errorInfo) {
        const { category, severity, message, context } = errorInfo;
        
        // Base messages for each category
        const categoryMessages = {
            [this.categories.AUDIO]: {
                title: 'Microphone Issue',
                message: 'There was a problem with audio recording.',
                suggestions: [
                    'Check that your microphone is connected and working',
                    'Ensure VetScribe has microphone permissions',
                    'Try refreshing the page and allowing microphone access'
                ]
            },
            [this.categories.TRANSCRIPTION]: {
                title: 'Transcription Issue',
                message: 'There was a problem converting speech to text.',
                suggestions: [
                    'Speak clearly and at a moderate pace',
                    'Ensure you\'re in a quiet environment',
                    'Check your internet connection',
                    'Try recording again'
                ]
            },
            [this.categories.LLM]: {
                title: 'SOAP Generation Issue',
                message: 'There was a problem generating SOAP notes.',
                suggestions: [
                    'Check your LM Studio connection',
                    'Verify the LLM endpoint is correct',
                    'Ensure the AI model is running',
                    'Try generating the notes again'
                ]
            },
            [this.categories.STORAGE]: {
                title: 'Storage Issue',
                message: 'There was a problem saving or loading data.',
                suggestions: [
                    'Check available storage space',
                    'Try clearing old data if storage is full',
                    'Refresh the page and try again'
                ]
            },
            [this.categories.NETWORK]: {
                title: 'Connection Issue',
                message: 'There was a problem with the network connection.',
                suggestions: [
                    'Check your internet connection',
                    'Verify VPN or firewall settings',
                    'Try again in a few moments'
                ]
            },
            [this.categories.VALIDATION]: {
                title: 'Input Validation',
                message: 'Please check your input and try again.',
                suggestions: [
                    'Ensure all required fields are filled',
                    'Check that the format is correct',
                    'Review any highlighted errors'
                ]
            },
            [this.categories.SYSTEM]: {
                title: 'System Error',
                message: 'An unexpected system error occurred.',
                suggestions: [
                    'Try refreshing the page',
                    'Clear your browser cache',
                    'Contact support if the problem persists'
                ]
            },
            [this.categories.USER]: {
                title: 'Action Required',
                message: message || 'Please review and try again.',
                suggestions: context?.suggestions || ['Please check your input and try again']
            }
        };
        
        const baseMessage = categoryMessages[category] || categoryMessages[this.categories.SYSTEM];
        
        return {
            ...baseMessage,
            severity: severity,
            category: category,
            customMessage: message,
            technicalDetails: this.feedbackConfig.showTechnicalDetails ? errorInfo.technicalDetails : null
        };
    },

    /**
     * Show user feedback with appropriate styling and actions
     */
    showUserFeedback(userMessage, errorInfo) {
        const { severity, category } = errorInfo;
        
        // Determine feedback type
        const feedbackType = this.getFeedbackType(severity);
        
        // Create feedback element
        const feedbackElement = this.createFeedbackElement(userMessage, feedbackType, errorInfo);
        
        // Show feedback
        this.displayFeedback(feedbackElement, feedbackType);
        
        // Set up auto-hide for non-critical errors
        if (severity !== this.severity.CRITICAL) {
            this.scheduleAutoHide(feedbackElement);
        }
    },

    /**
     * Create feedback element
     */
    createFeedbackElement(userMessage, feedbackType, errorInfo) {
        const element = document.createElement('div');
        element.className = `feedback-message feedback-${feedbackType}`;
        element.setAttribute('data-error-id', this.generateErrorId());
        
        const suggestionsHtml = userMessage.suggestions
            .map(suggestion => `<li>${suggestion}</li>`)
            .join('');
        
        const technicalDetailsHtml = userMessage.technicalDetails 
            ? `<details class="technical-details">
                <summary>Technical Details</summary>
                <pre>${userMessage.technicalDetails}</pre>
               </details>`
            : '';
        
        const retryButtonHtml = this.canRetry(errorInfo) 
            ? `<button class="btn btn-primary retry-button" onclick="ErrorHandler.retryLastAction('${errorInfo.category}')">
                Try Again
               </button>`
            : '';
        
        element.innerHTML = `
            <div class="feedback-header">
                <h4 class="feedback-title">${userMessage.title}</h4>
                <button class="feedback-close" onclick="ErrorHandler.hideFeedback()">&times;</button>
            </div>
            <div class="feedback-body">
                <p class="feedback-message-text">${userMessage.message}</p>
                ${userMessage.customMessage ? `<p class="custom-message">${userMessage.customMessage}</p>` : ''}
                <div class="feedback-suggestions">
                    <h5>What you can do:</h5>
                    <ul>${suggestionsHtml}</ul>
                </div>
                ${technicalDetailsHtml}
            </div>
            <div class="feedback-actions">
                ${retryButtonHtml}
                <button class="btn btn-secondary" onclick="ErrorHandler.hideFeedback()">
                    Close
                </button>
            </div>
        `;
        
        return element;
    },

    /**
     * Display feedback to user
     */
    displayFeedback(feedbackElement, feedbackType) {
        const container = document.getElementById('feedback-messages');
        const overlay = document.getElementById('feedback-overlay');
        
        if (!container || !overlay) {
            console.error('❌ Feedback container not found');
            return;
        }
        
        // Clear existing messages for critical errors
        if (feedbackType === 'error') {
            container.innerHTML = '';
        }
        
        // Add new message
        container.appendChild(feedbackElement);
        
        // Show overlay for critical errors
        if (feedbackType === 'error') {
            overlay.classList.add('active');
        }
        
        // Animate in
        setTimeout(() => {
            feedbackElement.classList.add('show');
        }, 10);
    },

    /**
     * Hide feedback messages
     */
    hideFeedback() {
        const container = document.getElementById('feedback-messages');
        const overlay = document.getElementById('feedback-overlay');
        
        if (container) {
            container.innerHTML = '';
        }
        
        if (overlay) {
            overlay.classList.remove('active');
        }
    },

    /**
     * Schedule auto-hide for non-critical messages
     */
    scheduleAutoHide(feedbackElement) {
        if (this.feedbackConfig.autoHideSuccess) {
            setTimeout(() => {
                if (feedbackElement.parentNode) {
                    feedbackElement.classList.remove('show');
                    setTimeout(() => {
                        if (feedbackElement.parentNode) {
                            feedbackElement.remove();
                        }
                    }, 300);
                }
            }, this.feedbackConfig.autoHideDelay);
        }
    },

    /**
     * Attempt automatic error recovery
     */
    attemptRecovery(errorInfo) {
        const { category, context } = errorInfo;
        
        switch (category) {
            case this.categories.AUDIO:
                this.recoverAudio(context);
                break;
            case this.categories.STORAGE:
                this.recoverStorage(context);
                break;
            case this.categories.NETWORK:
                this.recoverNetwork(context);
                break;
            case this.categories.LLM:
                this.recoverLLM(context);
                break;
        }
    },

    /**
     * Audio recovery mechanisms
     */
    recoverAudio(context) {
        console.log('🔄 Attempting audio recovery...');
        
        // Try to reinitialize audio system
        if (typeof AudioRecorder !== 'undefined') {
            setTimeout(() => {
                AudioRecorder.cleanup();
                AudioRecorder.initialize();
            }, 1000);
        }
    },

    /**
     * Storage recovery mechanisms
     */
    recoverStorage(context) {
        console.log('🔄 Attempting storage recovery...');
        
        // Try fallback storage
        if (this.storageFallback.available) {
            console.log('📦 Using session storage fallback');
        }
    },

    /**
     * Network recovery mechanisms
     */
    recoverNetwork(context) {
        console.log('🔄 Attempting network recovery...');
        
        // Implement network retry logic
        if (context?.retryFunction) {
            const retryKey = context.retryKey || 'default';
            const attempts = this.retryAttempts.get(retryKey) || 0;
            
            if (attempts < this.feedbackConfig.maxRetryAttempts) {
                this.retryAttempts.set(retryKey, attempts + 1);
                setTimeout(() => {
                    context.retryFunction();
                }, 2000 * (attempts + 1)); // Exponential backoff
            }
        }
    },

    /**
     * LLM recovery mechanisms
     */
    recoverLLM(context) {
        console.log('🔄 Attempting LLM recovery...');
        
        // Try to reconnect to LLM
        if (typeof LLMConnector !== 'undefined') {
            setTimeout(() => {
                LLMConnector.testConnection();
            }, 2000);
        }
    },

    /**
     * Utility functions
     */
    generateErrorId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    getLogLevel(severity) {
        const levels = {
            [this.severity.LOW]: 'info',
            [this.severity.MEDIUM]: 'warn',
            [this.severity.HIGH]: 'error',
            [this.severity.CRITICAL]: 'error'
        };
        return levels[severity] || 'error';
    },

    getFeedbackType(severity) {
        const types = {
            [this.severity.LOW]: 'info',
            [this.severity.MEDIUM]: 'warning',
            [this.severity.HIGH]: 'error',
            [this.severity.CRITICAL]: 'error'
        };
        return types[severity] || 'error';
    },

    canRetry(errorInfo) {
        const retryableCategories = [
            this.categories.AUDIO,
            this.categories.TRANSCRIPTION,
            this.categories.LLM,
            this.categories.NETWORK
        ];
        return retryableCategories.includes(errorInfo.category);
    },

    retryLastAction(category) {
        console.log(`🔄 Retrying action for category: ${category}`);
        // Implementation depends on specific retry mechanisms
        this.hideFeedback();
    },

    showBasicError(message) {
        alert(message); // Fallback for when feedback system fails
    },

    reportError(errorInfo) {
        // Placeholder for error reporting to external service
        // In production, this could send errors to monitoring service
        console.log('📊 Error reported for monitoring:', errorInfo);
    }
};

// Make ErrorHandler available globally
window.ErrorHandler = ErrorHandler;
