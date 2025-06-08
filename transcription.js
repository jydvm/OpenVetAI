/**
 * VetScribe - Transcription Module
 * Handles browser-based speech recognition using Web Speech API
 */

const Transcription = {
    // Speech recognition instance
    recognition: null,
    
    // Transcription state
    isInitialized: false,
    isListening: false,
    isPaused: false,
    
    // Transcription data
    currentTranscript: '',
    finalTranscript: '',
    interimTranscript: '',
    confidence: 0,
    
    // Configuration
    settings: {
        language: 'en-US',
        continuous: true,
        interimResults: true,
        maxAlternatives: 1,
        grammars: null
    },
    
    // Browser support information
    support: {
        webSpeechAPI: false,
        speechRecognition: false,
        speechGrammarList: false,
        browser: null,
        fallbackOptions: []
    },

    // Fallback transcription options
    fallbackMethods: {
        manual: {
            name: 'Manual Transcription',
            description: 'Type or paste transcription manually',
            available: true,
            accuracy: 'user-dependent',
            cost: 'free'
        },
        fileUpload: {
            name: 'Audio File Upload',
            description: 'Upload audio file for external transcription',
            available: true,
            accuracy: 'external-service',
            cost: 'varies'
        },
        webWorker: {
            name: 'Client-side Processing',
            description: 'Browser-based audio processing (experimental)',
            available: false,
            accuracy: 'limited',
            cost: 'free'
        },
        cloudAPI: {
            name: 'Cloud Transcription API',
            description: 'External transcription service integration',
            available: false,
            accuracy: 'high',
            cost: 'paid'
        }
    },

    // Current fallback mode
    currentFallback: null,
    fallbackTranscript: '',
    
    // Event callbacks
    onTranscriptUpdate: null,
    onFinalTranscript: null,
    onError: null,
    onStart: null,
    onEnd: null,
    onSpeechStart: null,
    onSpeechEnd: null,
    onNoMatch: null,

    /**
     * Initialize the transcription system
     */
    async initialize() {
        try {
            console.log('🎙️ Initializing Transcription module...');
            
            // Check browser support
            this.checkBrowserSupport();
            
            if (!this.support.speechRecognition) {
                throw new Error('Speech recognition not supported in this browser');
            }
            
            // Initialize speech recognition
            this.initializeSpeechRecognition();
            
            // Set up event handlers
            this.setupEventHandlers();
            
            this.isInitialized = true;
            console.log('✅ Transcription module initialized successfully');
            
            return true;
            
        } catch (error) {
            console.error('❌ Failed to initialize Transcription module:', error);
            if (this.onError) {
                this.onError(error);
            }
            return false;
        }
    },

    /**
     * Check browser support for Web Speech API
     */
    checkBrowserSupport() {
        // Detect browser
        this.support.browser = this.detectBrowser();
        
        // Check for Web Speech API support
        this.support.webSpeechAPI = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
        this.support.speechRecognition = this.support.webSpeechAPI;
        this.support.speechGrammarList = 'webkitSpeechGrammarList' in window || 'SpeechGrammarList' in window;
        
        // Identify available fallback options
        this.identifyFallbackOptions();

        console.log('🔍 Speech recognition support:', this.support);

        // Browser-specific warnings and fallback recommendations
        if (this.support.browser.name === 'Firefox') {
            console.warn('⚠️ Firefox has limited Web Speech API support');
            this.recommendFallbacks(['manual', 'fileUpload']);
        } else if (this.support.browser.name === 'Safari') {
            console.warn('⚠️ Safari Web Speech API support may be limited');
            this.recommendFallbacks(['manual', 'fileUpload']);
        } else if (!this.support.speechRecognition) {
            console.warn('⚠️ No speech recognition support detected');
            this.recommendFallbacks(['manual', 'fileUpload', 'cloudAPI']);
        }

        return this.support.speechRecognition;
    },

    /**
     * Identify available fallback transcription options
     */
    identifyFallbackOptions() {
        const fallbacks = [];

        // Manual transcription is always available
        fallbacks.push('manual');

        // File upload is available if File API is supported
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            fallbacks.push('fileUpload');
            this.fallbackMethods.fileUpload.available = true;
        }

        // Web Worker processing (experimental)
        if (typeof Worker !== 'undefined') {
            this.fallbackMethods.webWorker.available = true;
            fallbacks.push('webWorker');
        }

        // Cloud API integration (requires configuration)
        if (this.hasCloudAPIConfiguration()) {
            this.fallbackMethods.cloudAPI.available = true;
            fallbacks.push('cloudAPI');
        }

        this.support.fallbackOptions = fallbacks;
        console.log('🔄 Available fallback options:', fallbacks);
    },

    /**
     * Check if cloud API configuration is available
     */
    hasCloudAPIConfiguration() {
        // Check for API keys or endpoints in settings
        // This would be configured by the user in settings
        return false; // Default to false until configured
    },

    /**
     * Recommend specific fallback methods
     */
    recommendFallbacks(methods) {
        const available = methods.filter(method =>
            this.support.fallbackOptions.includes(method)
        );

        if (available.length > 0) {
            console.log('💡 Recommended fallback methods:', available);

            // Notify the app about recommended fallbacks
            if (this.onFallbackRecommendation) {
                this.onFallbackRecommendation(available);
            }
        }
    },

    /**
     * Activate fallback transcription mode
     */
    activateFallback(method) {
        if (!this.support.fallbackOptions.includes(method)) {
            throw new Error(`Fallback method '${method}' not available`);
        }

        this.currentFallback = method;
        console.log(`🔄 Activated fallback method: ${method}`);

        switch (method) {
            case 'manual':
                return this.activateManualTranscription();
            case 'fileUpload':
                return this.activateFileUploadTranscription();
            case 'webWorker':
                return this.activateWebWorkerTranscription();
            case 'cloudAPI':
                return this.activateCloudAPITranscription();
            default:
                throw new Error(`Unknown fallback method: ${method}`);
        }
    },

    /**
     * Activate manual transcription mode
     */
    activateManualTranscription() {
        console.log('📝 Manual transcription mode activated');

        // Reset transcripts
        this.resetTranscripts();

        // Notify listeners
        if (this.onStart) {
            this.onStart();
        }

        // Show manual input interface
        this.showManualTranscriptionInterface();

        return {
            success: true,
            method: 'manual',
            message: 'Manual transcription ready. Type or paste your transcript.'
        };
    },

    /**
     * Show manual transcription interface
     */
    showManualTranscriptionInterface() {
        // This would typically show a text area for manual input
        // For now, we'll just log and notify the app
        console.log('📝 Manual transcription interface should be shown');

        if (this.onManualTranscriptionRequired) {
            this.onManualTranscriptionRequired();
        }
    },

    /**
     * Set manual transcript
     */
    setManualTranscript(text) {
        if (this.currentFallback !== 'manual') {
            console.warn('⚠️ Manual transcription not active');
            return false;
        }

        this.fallbackTranscript = text;
        this.finalTranscript = text;
        this.currentTranscript = text;

        console.log('📝 Manual transcript set:', text);

        // Notify listeners
        if (this.onTranscriptUpdate) {
            this.onTranscriptUpdate({
                current: this.currentTranscript,
                final: this.finalTranscript,
                interim: '',
                confidence: 1.0, // Manual transcription has perfect confidence
                method: 'manual'
            });
        }

        if (this.onFinalTranscript) {
            this.onFinalTranscript(text, 1.0);
        }

        return true;
    },

    /**
     * Activate file upload transcription mode
     */
    activateFileUploadTranscription() {
        console.log('📁 File upload transcription mode activated');

        // Reset transcripts
        this.resetTranscripts();

        // Show file upload interface
        this.showFileUploadInterface();

        return {
            success: true,
            method: 'fileUpload',
            message: 'File upload ready. Select an audio file for transcription.'
        };
    },

    /**
     * Show file upload interface
     */
    showFileUploadInterface() {
        console.log('📁 File upload interface should be shown');

        if (this.onFileUploadRequired) {
            this.onFileUploadRequired();
        }
    },

    /**
     * Handle uploaded audio file
     */
    async handleAudioFileUpload(file) {
        try {
            if (this.currentFallback !== 'fileUpload') {
                throw new Error('File upload transcription not active');
            }

            console.log('📁 Processing uploaded file:', file.name);

            // Validate file type
            if (!file.type.startsWith('audio/')) {
                throw new Error('Please select an audio file');
            }

            // For now, we'll just show instructions for external transcription
            // In a full implementation, this could integrate with cloud services
            const result = {
                success: true,
                filename: file.name,
                size: file.size,
                type: file.type,
                message: 'Audio file ready for external transcription',
                instructions: [
                    'Upload this file to a transcription service like:',
                    '• Google Cloud Speech-to-Text',
                    '• Amazon Transcribe',
                    '• Microsoft Azure Speech',
                    '• Rev.com or Otter.ai',
                    'Then paste the transcript back into the manual input'
                ]
            };

            console.log('📁 File upload result:', result);

            if (this.onFileUploadResult) {
                this.onFileUploadResult(result);
            }

            return result;

        } catch (error) {
            console.error('❌ File upload failed:', error);

            if (this.onError) {
                this.onError(error);
            }

            return {
                success: false,
                error: error.message
            };
        }
    },

    /**
     * Activate Web Worker transcription (experimental)
     */
    activateWebWorkerTranscription() {
        console.log('⚙️ Web Worker transcription mode activated (experimental)');

        // This is a placeholder for future Web Worker-based transcription
        // Could use libraries like wav2vec2.js or similar

        return {
            success: false,
            method: 'webWorker',
            message: 'Web Worker transcription not yet implemented',
            note: 'This feature is planned for future releases'
        };
    },

    /**
     * Activate cloud API transcription
     */
    activateCloudAPITranscription() {
        console.log('☁️ Cloud API transcription mode activated');

        // This would integrate with external transcription APIs
        // Requires API keys and configuration

        return {
            success: false,
            method: 'cloudAPI',
            message: 'Cloud API transcription requires configuration',
            instructions: [
                'Configure API credentials in settings',
                'Supported services: Google Cloud, AWS, Azure',
                'API keys must be provided by the user'
            ]
        };
    },

    /**
     * Get fallback transcription options for user selection
     */
    getFallbackOptions() {
        const options = [];

        this.support.fallbackOptions.forEach(methodKey => {
            const method = this.fallbackMethods[methodKey];
            if (method && method.available) {
                options.push({
                    key: methodKey,
                    name: method.name,
                    description: method.description,
                    accuracy: method.accuracy,
                    cost: method.cost,
                    recommended: this.isRecommendedFallback(methodKey)
                });
            }
        });

        return options;
    },

    /**
     * Check if a fallback method is recommended for current browser
     */
    isRecommendedFallback(methodKey) {
        const browser = this.support.browser.name;

        // Recommend manual for all unsupported browsers
        if (methodKey === 'manual') {
            return true;
        }

        // Recommend file upload for browsers with good File API support
        if (methodKey === 'fileUpload' && ['Chrome', 'Firefox', 'Edge'].includes(browser)) {
            return true;
        }

        return false;
    },

    /**
     * Show fallback selection interface
     */
    showFallbackSelection() {
        const options = this.getFallbackOptions();

        console.log('🔄 Available fallback transcription options:', options);

        if (this.onFallbackOptionsAvailable) {
            this.onFallbackOptionsAvailable(options);
        }

        return options;
    },

    /**
     * Auto-select best fallback method
     */
    autoSelectFallback() {
        const options = this.getFallbackOptions();

        if (options.length === 0) {
            console.warn('⚠️ No fallback options available');
            return null;
        }

        // Prefer recommended options
        const recommended = options.filter(opt => opt.recommended);
        const selected = recommended.length > 0 ? recommended[0] : options[0];

        console.log('🤖 Auto-selected fallback:', selected);

        try {
            return this.activateFallback(selected.key);
        } catch (error) {
            console.error('❌ Failed to activate auto-selected fallback:', error);
            return null;
        }
    },

    /**
     * Enhanced start listening with fallback support
     */
    async startListening() {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            // Try Web Speech API first
            if (this.support.speechRecognition) {
                return await this.startWebSpeechRecognition();
            }

            // Fall back to alternative methods
            console.log('🔄 Web Speech API not available, showing fallback options');

            const fallbackResult = this.autoSelectFallback();

            if (fallbackResult && fallbackResult.success) {
                return true;
            } else {
                // Show manual selection if auto-select fails
                this.showFallbackSelection();
                return false;
            }

        } catch (error) {
            console.error('❌ Failed to start transcription:', error);
            if (this.onError) {
                this.onError(error);
            }
            return false;
        }
    },

    /**
     * Start Web Speech API recognition
     */
    async startWebSpeechRecognition() {
        if (this.isListening) {
            console.warn('⚠️ Speech recognition already listening');
            return false;
        }

        console.log('🎤 Starting Web Speech API recognition...');

        // Reset transcripts
        this.resetTranscripts();

        // Start recognition
        this.recognition.start();

        return true;
    },

    /**
     * Enhanced stop listening with fallback support
     */
    stopListening() {
        try {
            if (this.currentFallback) {
                return this.stopFallbackTranscription();
            } else if (this.isListening && this.recognition) {
                console.log('⏹️ Stopping Web Speech API recognition...');
                this.recognition.stop();
                return true;
            }

            console.warn('⚠️ No active transcription to stop');
            return false;

        } catch (error) {
            console.error('❌ Failed to stop transcription:', error);
            if (this.onError) {
                this.onError(error);
            }
            return false;
        }
    },

    /**
     * Stop fallback transcription
     */
    stopFallbackTranscription() {
        console.log(`⏹️ Stopping fallback transcription: ${this.currentFallback}`);

        const method = this.currentFallback;
        this.currentFallback = null;

        // Notify listeners
        if (this.onEnd) {
            this.onEnd();
        }

        return {
            success: true,
            method: method,
            transcript: this.currentTranscript
        };
    },

    /**
     * Detect browser type and version
     */
    detectBrowser() {
        const userAgent = navigator.userAgent;
        let browser = { name: 'Unknown', version: 'Unknown', mobile: false };
        
        browser.mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        
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
     * Initialize speech recognition instance
     */
    initializeSpeechRecognition() {
        // Create speech recognition instance
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        // Configure recognition settings
        this.recognition.continuous = this.settings.continuous;
        this.recognition.interimResults = this.settings.interimResults;
        this.recognition.lang = this.settings.language;
        this.recognition.maxAlternatives = this.settings.maxAlternatives;
        
        // Set up grammars if supported and provided
        if (this.support.speechGrammarList && this.settings.grammars) {
            this.setupGrammars();
        }
        
        console.log('🎤 Speech recognition configured:', {
            language: this.recognition.lang,
            continuous: this.recognition.continuous,
            interimResults: this.recognition.interimResults,
            maxAlternatives: this.recognition.maxAlternatives
        });
    },

    /**
     * Set up speech grammars for better recognition
     */
    setupGrammars() {
        try {
            const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
            const grammarList = new SpeechGrammarList();
            
            // Veterinary-specific grammar
            const veterinaryGrammar = this.createVeterinaryGrammar();
            grammarList.addFromString(veterinaryGrammar, 1);
            
            this.recognition.grammars = grammarList;
            console.log('📝 Veterinary grammar loaded');
            
        } catch (error) {
            console.warn('⚠️ Could not set up grammars:', error);
        }
    },

    /**
     * Create enhanced veterinary-specific grammar for better recognition
     */
    createVeterinaryGrammar() {
        // Comprehensive JSGF grammar for veterinary terms
        const grammar = `
            #JSGF V1.0;
            grammar veterinary;

            public <veterinary_terms> =
                // Procedures and examinations
                vaccination | vaccinations | vaccine | vaccines |
                examination | exam | physical | checkup | wellness |
                surgery | surgical | procedure | spay | neuter |
                dental | cleaning | extraction | radiograph | x-ray |
                blood work | blood test | urinalysis | fecal |

                // Vital signs and measurements
                temperature | temp | weight | heart rate | pulse |
                respiratory rate | breathing | blood pressure |
                body condition score | BCS |

                // Anatomical terms
                abdomen | thorax | chest | lymph nodes | mucous membranes |
                eyes | ears | nose | throat | mouth | teeth | gums |
                skin | coat | paws | nails | tail | limbs |
                heart | lungs | liver | kidneys | bladder |

                // Clinical findings
                normal | abnormal | within normal limits | WNL |
                alert | responsive | quiet | depressed | lethargic |
                bright | active | painful | tender | swollen |
                enlarged | decreased | increased | elevated |

                // Diagnoses and conditions
                otitis | dermatitis | gastritis | arthritis |
                infection | inflammation | allergy | parasites |
                diabetes | kidney disease | heart disease |
                upper respiratory | URI | gastrointestinal | GI |

                // Treatments and medications
                antibiotic | antibiotics | anti-inflammatory |
                pain medication | prednisone | metacam | rimadyl |
                prescription | medication | treatment | therapy |
                dosage | administration | twice daily | once daily |

                // Follow-up and monitoring
                follow up | recheck | monitoring | progress |
                improvement | response | continue | discontinue |

                // Animals and demographics
                dog | cat | canine | feline | puppy | kitten |
                male | female | spayed | neutered | intact |
                years old | months old | weeks old | pound | pounds |

                // Common abbreviations
                TPR | BID | SID | QID | PRN | PO | SQ | IM | IV;
        `;

        return grammar;
    },

    /**
     * Post-process transcript for veterinary accuracy
     */
    postProcessTranscript(transcript) {
        if (!transcript || typeof transcript !== 'string') {
            return transcript;
        }

        let processed = transcript;

        // Apply veterinary-specific corrections
        processed = this.applyVeterinaryCorrections(processed);

        // Apply medical abbreviation corrections
        processed = this.applyMedicalAbbreviations(processed);

        // Apply dosage and measurement corrections
        processed = this.applyDosageCorrections(processed);

        // Apply capitalization rules
        processed = this.applyCapitalizationRules(processed);

        // Clean up spacing and punctuation
        processed = this.cleanupFormatting(processed);

        console.log('📝 Transcript post-processed:', {
            original: transcript.substring(0, 100) + '...',
            processed: processed.substring(0, 100) + '...'
        });

        return processed;
    },

    /**
     * Apply veterinary-specific word corrections
     */
    applyVeterinaryCorrections(text) {
        const corrections = {
            // Common misheard veterinary terms
            'vaccination': ['back nation', 'vac nation', 'vaccination'],
            'examination': ['exam nation', 'examination'],
            'temperature': ['temp nature', 'temperature'],
            'respiratory': ['resp ratory', 'respiratory'],
            'mucous membranes': ['mucus membranes', 'mucous membranes'],
            'lymph nodes': ['limb nodes', 'lymph nodes'],
            'heart rate': ['heart rate', 'heartrate'],
            'blood pressure': ['blood pressure', 'bloodpressure'],
            'body condition': ['body condition', 'bodycondition'],
            'within normal limits': ['within normal limits', 'WNL'],
            'upper respiratory': ['upper respiratory', 'URI'],
            'gastrointestinal': ['gastro intestinal', 'GI'],
            'twice daily': ['twice daily', 'BID'],
            'once daily': ['once daily', 'SID'],
            'as needed': ['as needed', 'PRN'],
            'by mouth': ['by mouth', 'PO'],
            'subcutaneous': ['sub q', 'SQ'],
            'intramuscular': ['IM', 'intramuscular'],
            'intravenous': ['IV', 'intravenous']
        };

        let corrected = text;

        Object.entries(corrections).forEach(([correct, variants]) => {
            variants.forEach(variant => {
                const regex = new RegExp(variant, 'gi');
                corrected = corrected.replace(regex, correct);
            });
        });

        return corrected;
    },

    /**
     * Apply medical abbreviation standardization
     */
    applyMedicalAbbreviations(text) {
        const abbreviations = {
            'temperature pulse respiration': 'TPR',
            'temp pulse resp': 'TPR',
            'twice a day': 'BID',
            'twice daily': 'BID',
            'once a day': 'SID',
            'once daily': 'SID',
            'four times a day': 'QID',
            'as needed': 'PRN',
            'when necessary': 'PRN',
            'by mouth': 'PO',
            'orally': 'PO',
            'under the skin': 'SQ',
            'subcutaneously': 'SQ',
            'into the muscle': 'IM',
            'intramuscularly': 'IM',
            'into the vein': 'IV',
            'intravenously': 'IV',
            'within normal limits': 'WNL',
            'upper respiratory infection': 'URI',
            'gastrointestinal': 'GI',
            'body condition score': 'BCS'
        };

        let processed = text;

        Object.entries(abbreviations).forEach(([phrase, abbrev]) => {
            const regex = new RegExp(phrase, 'gi');
            processed = processed.replace(regex, abbrev);
        });

        return processed;
    },

    /**
     * Apply dosage and measurement corrections
     */
    applyDosageCorrections(text) {
        let corrected = text;

        // Standardize weight measurements
        corrected = corrected.replace(/(\d+)\s*(lb|lbs|pound|pounds)/gi, '$1 lbs');
        corrected = corrected.replace(/(\d+)\s*(kg|kilogram|kilograms)/gi, '$1 kg');
        corrected = corrected.replace(/(\d+)\s*(g|gram|grams)/gi, '$1 g');
        corrected = corrected.replace(/(\d+)\s*(mg|milligram|milligrams)/gi, '$1 mg');

        // Standardize temperature
        corrected = corrected.replace(/(\d+\.?\d*)\s*degrees?\s*(fahrenheit|f)/gi, '$1°F');
        corrected = corrected.replace(/(\d+\.?\d*)\s*degrees?\s*(celsius|c)/gi, '$1°C');

        // Standardize dosages
        corrected = corrected.replace(/(\d+\.?\d*)\s*(ml|milliliter|milliliters)/gi, '$1 ml');
        corrected = corrected.replace(/(\d+\.?\d*)\s*(cc|cubic centimeter)/gi, '$1 cc');

        return corrected;
    },

    /**
     * Apply proper capitalization for medical terms
     */
    applyCapitalizationRules(text) {
        let capitalized = text;

        // Capitalize proper medical terms
        const properTerms = [
            'TPR', 'BID', 'SID', 'QID', 'PRN', 'PO', 'SQ', 'IM', 'IV',
            'WNL', 'URI', 'GI', 'BCS', 'CBC', 'BUN', 'ALT', 'AST'
        ];

        properTerms.forEach(term => {
            const regex = new RegExp(`\\b${term}\\b`, 'gi');
            capitalized = capitalized.replace(regex, term.toUpperCase());
        });

        return capitalized;
    },

    /**
     * Clean up formatting and spacing
     */
    cleanupFormatting(text) {
        let cleaned = text;

        // Fix multiple spaces
        cleaned = cleaned.replace(/\s+/g, ' ');

        // Fix spacing around punctuation
        cleaned = cleaned.replace(/\s+([,.!?])/g, '$1');
        cleaned = cleaned.replace(/([,.!?])\s*/g, '$1 ');

        // Trim whitespace
        cleaned = cleaned.trim();

        return cleaned;
    },

    /**
     * Assess transcript quality and confidence
     */
    assessTranscriptQuality(transcript, confidence) {
        const assessment = {
            confidence: confidence || 0,
            quality: 'unknown',
            issues: [],
            suggestions: [],
            veterinaryTerms: 0,
            medicalAbbreviations: 0,
            completeness: 0
        };

        if (!transcript || transcript.trim().length === 0) {
            assessment.quality = 'empty';
            assessment.issues.push('No transcript content');
            return assessment;
        }

        // Analyze veterinary content
        assessment.veterinaryTerms = this.countVeterinaryTerms(transcript);
        assessment.medicalAbbreviations = this.countMedicalAbbreviations(transcript);

        // Assess completeness
        assessment.completeness = this.assessCompleteness(transcript);

        // Determine overall quality
        assessment.quality = this.determineQuality(assessment);

        // Generate suggestions
        assessment.suggestions = this.generateQualitySuggestions(assessment);

        console.log('📊 Transcript quality assessment:', assessment);

        return assessment;
    },

    /**
     * Count veterinary-specific terms in transcript
     */
    countVeterinaryTerms(transcript) {
        const veterinaryTerms = [
            'examination', 'vaccine', 'vaccination', 'temperature', 'weight',
            'heart rate', 'respiratory', 'abdomen', 'thorax', 'lymph nodes',
            'mucous membranes', 'diagnosis', 'treatment', 'medication',
            'prescription', 'follow up', 'normal', 'abnormal', 'spayed',
            'neutered', 'canine', 'feline', 'puppy', 'kitten'
        ];

        let count = 0;
        const lowerTranscript = transcript.toLowerCase();

        veterinaryTerms.forEach(term => {
            const regex = new RegExp(`\\b${term}\\b`, 'g');
            const matches = lowerTranscript.match(regex);
            if (matches) {
                count += matches.length;
            }
        });

        return count;
    },

    /**
     * Count medical abbreviations in transcript
     */
    countMedicalAbbreviations(transcript) {
        const abbreviations = [
            'TPR', 'BID', 'SID', 'QID', 'PRN', 'PO', 'SQ', 'IM', 'IV',
            'WNL', 'URI', 'GI', 'BCS', 'CBC', 'BUN', 'ALT', 'AST'
        ];

        let count = 0;

        abbreviations.forEach(abbrev => {
            const regex = new RegExp(`\\b${abbrev}\\b`, 'g');
            const matches = transcript.match(regex);
            if (matches) {
                count += matches.length;
            }
        });

        return count;
    },

    /**
     * Assess transcript completeness
     */
    assessCompleteness(transcript) {
        const words = transcript.trim().split(/\s+/).length;

        // Veterinary consultations typically have 50-500 words
        if (words < 20) return 0.2; // Very short
        if (words < 50) return 0.5; // Short but usable
        if (words < 200) return 0.8; // Good length
        if (words < 500) return 1.0; // Comprehensive
        return 0.9; // Very long, might be too detailed
    },

    /**
     * Determine overall transcript quality
     */
    determineQuality(assessment) {
        const { confidence, veterinaryTerms, completeness } = assessment;

        // Calculate weighted score
        let score = 0;
        score += confidence * 0.4; // 40% weight on confidence
        score += Math.min(veterinaryTerms / 10, 1) * 0.3; // 30% weight on vet terms
        score += completeness * 0.3; // 30% weight on completeness

        if (score >= 0.8) return 'excellent';
        if (score >= 0.6) return 'good';
        if (score >= 0.4) return 'fair';
        if (score >= 0.2) return 'poor';
        return 'very poor';
    },

    /**
     * Generate quality improvement suggestions
     */
    generateQualitySuggestions(assessment) {
        const suggestions = [];

        if (assessment.confidence < 0.6) {
            suggestions.push('Low confidence detected - consider speaking more clearly or using manual transcription');
        }

        if (assessment.veterinaryTerms < 3) {
            suggestions.push('Few veterinary terms detected - ensure medical terminology is clearly spoken');
        }

        if (assessment.completeness < 0.5) {
            suggestions.push('Transcript appears short - consider providing more detailed consultation notes');
        }

        if (assessment.medicalAbbreviations === 0) {
            suggestions.push('Consider using standard medical abbreviations (TPR, BID, etc.) for efficiency');
        }

        return suggestions;
    },

    /**
     * Enhanced result handling with quality assessment
     */
    handleRecognitionResults(event) {
        let interimTranscript = '';
        let finalTranscript = '';
        let totalConfidence = 0;
        let finalResults = 0;

        // Process all results
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const transcript = result[0].transcript;

            if (result.isFinal) {
                finalTranscript += transcript;
                totalConfidence += result[0].confidence;
                finalResults++;
            } else {
                interimTranscript += transcript;
            }
        }

        // Update transcripts with post-processing
        if (finalTranscript) {
            const processedTranscript = this.postProcessTranscript(finalTranscript);
            this.finalTranscript += processedTranscript;
            this.currentTranscript = this.finalTranscript + interimTranscript;

            // Calculate average confidence
            const avgConfidence = finalResults > 0 ? totalConfidence / finalResults : 0;
            this.confidence = avgConfidence;

            console.log('📝 Final transcript processed:', {
                original: finalTranscript,
                processed: processedTranscript,
                confidence: avgConfidence
            });

            // Assess quality
            const quality = this.assessTranscriptQuality(this.finalTranscript, this.confidence);

            if (this.onFinalTranscript) {
                this.onFinalTranscript(processedTranscript, avgConfidence, quality);
            }
        }

        if (interimTranscript) {
            this.interimTranscript = interimTranscript;
            this.currentTranscript = this.finalTranscript + interimTranscript;
        }

        // Notify listeners of transcript update
        if (this.onTranscriptUpdate) {
            this.onTranscriptUpdate({
                current: this.currentTranscript,
                final: this.finalTranscript,
                interim: this.interimTranscript,
                confidence: this.confidence
            });
        }
    },

    /**
     * Set up event handlers for speech recognition
     */
    setupEventHandlers() {
        // Recognition start
        this.recognition.onstart = () => {
            console.log('🎤 Speech recognition started');
            this.isListening = true;
            
            if (this.onStart) {
                this.onStart();
            }
        };
        
        // Recognition end
        this.recognition.onend = () => {
            console.log('⏹️ Speech recognition ended');
            this.isListening = false;
            
            if (this.onEnd) {
                this.onEnd();
            }
        };
        
        // Speech start detected
        this.recognition.onspeechstart = () => {
            console.log('🗣️ Speech detected');
            
            if (this.onSpeechStart) {
                this.onSpeechStart();
            }
        };
        
        // Speech end detected
        this.recognition.onspeechend = () => {
            console.log('🤐 Speech ended');
            
            if (this.onSpeechEnd) {
                this.onSpeechEnd();
            }
        };
        
        // Results received
        this.recognition.onresult = (event) => {
            this.handleRecognitionResults(event);
        };
        
        // No match found
        this.recognition.onnomatch = () => {
            console.log('❓ No speech match found');
            
            if (this.onNoMatch) {
                this.onNoMatch();
            }
        };
        
        // Error occurred
        this.recognition.onerror = (event) => {
            this.handleRecognitionError(event);
        };
        
        console.log('🎯 Speech recognition event handlers set up');
    },

    /**
     * Handle speech recognition results
     */
    handleRecognitionResults(event) {
        let interimTranscript = '';
        let finalTranscript = '';
        
        // Process all results
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const transcript = result[0].transcript;
            
            if (result.isFinal) {
                finalTranscript += transcript;
                this.confidence = result[0].confidence;
            } else {
                interimTranscript += transcript;
            }
        }
        
        // Update transcripts
        if (finalTranscript) {
            this.finalTranscript += finalTranscript;
            this.currentTranscript = this.finalTranscript + interimTranscript;
            
            console.log('📝 Final transcript:', finalTranscript, 'Confidence:', this.confidence);
            
            if (this.onFinalTranscript) {
                this.onFinalTranscript(finalTranscript, this.confidence);
            }
        }
        
        if (interimTranscript) {
            this.interimTranscript = interimTranscript;
            this.currentTranscript = this.finalTranscript + interimTranscript;
        }
        
        // Notify listeners of transcript update
        if (this.onTranscriptUpdate) {
            this.onTranscriptUpdate({
                current: this.currentTranscript,
                final: this.finalTranscript,
                interim: this.interimTranscript,
                confidence: this.confidence
            });
        }
    },

    /**
     * Handle speech recognition errors
     */
    handleRecognitionError(event) {
        const error = event.error;
        const message = event.message || 'Unknown error';
        
        console.error('❌ Speech recognition error:', error, message);
        
        const errorInfo = this.createTranscriptionError(error, message);
        
        if (this.onError) {
            this.onError(errorInfo);
        }
    },

    /**
     * Create descriptive transcription error
     */
    createTranscriptionError(errorType, message) {
        const errorMap = {
            'no-speech': {
                message: 'No speech detected. Please speak clearly into the microphone.',
                userAction: 'Ensure you are speaking clearly and the microphone is working.',
                technical: 'No speech input detected'
            },
            'aborted': {
                message: 'Speech recognition was stopped.',
                userAction: 'Speech recognition was manually stopped.',
                technical: 'Recognition aborted'
            },
            'audio-capture': {
                message: 'Audio capture failed. Please check your microphone.',
                userAction: 'Check microphone connection and permissions.',
                technical: 'Audio capture error'
            },
            'network': {
                message: 'Network error during speech recognition.',
                userAction: 'Check your internet connection and try again.',
                technical: 'Network connectivity issue'
            },
            'not-allowed': {
                message: 'Microphone access denied for speech recognition.',
                userAction: 'Grant microphone permissions and try again.',
                technical: 'Microphone permission denied'
            },
            'service-not-allowed': {
                message: 'Speech recognition service not allowed.',
                userAction: 'Speech recognition may be disabled in browser settings.',
                technical: 'Speech service blocked'
            },
            'bad-grammar': {
                message: 'Speech grammar error.',
                userAction: 'This is a technical issue. Please try again.',
                technical: 'Grammar configuration error'
            },
            'language-not-supported': {
                message: 'Selected language not supported for speech recognition.',
                userAction: 'Try switching to English or another supported language.',
                technical: 'Language not supported'
            }
        };
        
        const errorInfo = errorMap[errorType] || {
            message: `Speech recognition error: ${message}`,
            userAction: 'Please try again or check your browser settings.',
            technical: message
        };
        
        const enhancedError = new Error(errorInfo.message);
        enhancedError.name = errorType;
        enhancedError.userAction = errorInfo.userAction;
        enhancedError.technical = errorInfo.technical;
        enhancedError.originalError = { error: errorType, message };
        
        return enhancedError;
    },

    /**
     * Start speech recognition
     */
    async startListening() {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            if (this.isListening) {
                console.warn('⚠️ Speech recognition already listening');
                return false;
            }

            console.log('🎤 Starting speech recognition...');

            // Reset transcripts
            this.resetTranscripts();

            // Start recognition
            this.recognition.start();

            return true;

        } catch (error) {
            console.error('❌ Failed to start speech recognition:', error);
            if (this.onError) {
                this.onError(error);
            }
            return false;
        }
    },

    /**
     * Stop speech recognition
     */
    stopListening() {
        try {
            if (!this.isListening) {
                console.warn('⚠️ Speech recognition not listening');
                return false;
            }

            console.log('⏹️ Stopping speech recognition...');

            this.recognition.stop();

            return true;

        } catch (error) {
            console.error('❌ Failed to stop speech recognition:', error);
            if (this.onError) {
                this.onError(error);
            }
            return false;
        }
    },

    /**
     * Abort speech recognition immediately
     */
    abortListening() {
        try {
            if (!this.isListening) {
                console.warn('⚠️ Speech recognition not listening');
                return false;
            }

            console.log('🛑 Aborting speech recognition...');

            this.recognition.abort();

            return true;

        } catch (error) {
            console.error('❌ Failed to abort speech recognition:', error);
            if (this.onError) {
                this.onError(error);
            }
            return false;
        }
    },

    /**
     * Reset all transcripts
     */
    resetTranscripts() {
        this.currentTranscript = '';
        this.finalTranscript = '';
        this.interimTranscript = '';
        this.confidence = 0;

        console.log('🔄 Transcripts reset');
    },

    /**
     * Get current transcription state
     */
    getState() {
        return {
            isInitialized: this.isInitialized,
            isListening: this.isListening,
            isPaused: this.isPaused,
            currentTranscript: this.currentTranscript,
            finalTranscript: this.finalTranscript,
            interimTranscript: this.interimTranscript,
            confidence: this.confidence,
            language: this.settings.language,
            support: this.support
        };
    },

    /**
     * Update language setting
     */
    setLanguage(language) {
        this.settings.language = language;

        if (this.recognition) {
            this.recognition.lang = language;
            console.log('🌐 Language updated to:', language);
        }
    },

    /**
     * Update recognition settings
     */
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };

        if (this.recognition) {
            this.recognition.continuous = this.settings.continuous;
            this.recognition.interimResults = this.settings.interimResults;
            this.recognition.lang = this.settings.language;
            this.recognition.maxAlternatives = this.settings.maxAlternatives;

            console.log('⚙️ Recognition settings updated:', this.settings);
        }
    },

    /**
     * Get supported languages
     */
    getSupportedLanguages() {
        // Common languages supported by most browsers
        return [
            { code: 'en-US', name: 'English (US)', recommended: true },
            { code: 'en-GB', name: 'English (UK)' },
            { code: 'en-AU', name: 'English (Australia)' },
            { code: 'en-CA', name: 'English (Canada)' },
            { code: 'es-ES', name: 'Spanish (Spain)' },
            { code: 'es-MX', name: 'Spanish (Mexico)' },
            { code: 'fr-FR', name: 'French (France)' },
            { code: 'de-DE', name: 'German (Germany)' },
            { code: 'it-IT', name: 'Italian (Italy)' },
            { code: 'pt-BR', name: 'Portuguese (Brazil)' },
            { code: 'ja-JP', name: 'Japanese (Japan)' },
            { code: 'ko-KR', name: 'Korean (South Korea)' },
            { code: 'zh-CN', name: 'Chinese (Simplified)' },
            { code: 'zh-TW', name: 'Chinese (Traditional)' }
        ];
    },

    /**
     * Test speech recognition functionality
     */
    async testRecognition() {
        try {
            console.log('🧪 Testing speech recognition...');

            if (!this.support.speechRecognition) {
                throw new Error('Speech recognition not supported');
            }

            // Create a test recognition instance
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const testRecognition = new SpeechRecognition();

            testRecognition.continuous = false;
            testRecognition.interimResults = false;
            testRecognition.lang = 'en-US';

            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    testRecognition.stop();
                    resolve({
                        success: true,
                        message: 'Speech recognition test completed (timeout)',
                        duration: 3000
                    });
                }, 3000);

                testRecognition.onstart = () => {
                    console.log('🎤 Test recognition started');
                };

                testRecognition.onresult = (event) => {
                    clearTimeout(timeout);
                    const transcript = event.results[0][0].transcript;
                    const confidence = event.results[0][0].confidence;

                    resolve({
                        success: true,
                        message: 'Speech recognition test successful',
                        transcript: transcript,
                        confidence: confidence
                    });
                };

                testRecognition.onerror = (event) => {
                    clearTimeout(timeout);
                    reject(new Error(`Test failed: ${event.error}`));
                };

                testRecognition.onend = () => {
                    clearTimeout(timeout);
                };

                try {
                    testRecognition.start();
                } catch (error) {
                    clearTimeout(timeout);
                    reject(error);
                }
            });

        } catch (error) {
            console.error('❌ Speech recognition test failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    /**
     * Get browser compatibility information
     */
    getCompatibilityInfo() {
        const compatibility = {
            supported: this.support.speechRecognition,
            browser: this.support.browser,
            features: {
                webSpeechAPI: this.support.webSpeechAPI,
                speechGrammarList: this.support.speechGrammarList,
                continuous: true,
                interimResults: true
            },
            limitations: [],
            recommendations: []
        };

        // Browser-specific limitations and recommendations
        switch (this.support.browser.name) {
            case 'Chrome':
                compatibility.recommendations.push('Chrome has excellent Web Speech API support');
                break;
            case 'Firefox':
                compatibility.limitations.push('Limited Web Speech API support');
                compatibility.recommendations.push('Consider using Chrome for better speech recognition');
                break;
            case 'Safari':
                compatibility.limitations.push('Web Speech API support may be limited');
                compatibility.recommendations.push('Test thoroughly on Safari devices');
                break;
            case 'Edge':
                compatibility.recommendations.push('Modern Edge has good Web Speech API support');
                break;
            default:
                compatibility.limitations.push('Unknown browser - compatibility uncertain');
                compatibility.recommendations.push('Use Chrome, Firefox, or Edge for best results');
        }

        if (this.support.browser.mobile) {
            compatibility.limitations.push('Mobile browsers may have reduced speech recognition capabilities');
            compatibility.recommendations.push('Test speech recognition on target mobile devices');
        }

        return compatibility;
    },

    /**
     * Clean up resources
     */
    cleanup() {
        try {
            console.log('🧹 Cleaning up Transcription module...');

            // Stop recognition if active
            if (this.isListening) {
                this.abortListening();
            }

            // Clear transcripts
            this.resetTranscripts();

            // Reset state
            this.isInitialized = false;
            this.isListening = false;
            this.isPaused = false;

            // Clear recognition instance
            this.recognition = null;

            console.log('✅ Transcription cleanup complete');

        } catch (error) {
            console.error('❌ Error during cleanup:', error);
        }
    }
};

// Make Transcription available globally
window.Transcription = Transcription;
