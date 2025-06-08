/**
 * VetScribe - Data Validation and Sanitization Module
 * Professional-grade data validation for veterinary practice safety
 * Ensures all data is clean, safe, and properly formatted
 */

const DataValidator = {
    // Validation rules and patterns
    patterns: {
        // Basic patterns
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        phone: /^[\+]?[1-9][\d]{0,15}$/,
        zipCode: /^\d{5}(-\d{4})?$/,
        
        // Veterinary-specific patterns
        animalId: /^[A-Z0-9]{3,20}$/i,
        medicationDose: /^\d+(\.\d+)?\s*(mg|ml|cc|units?|iu|mcg|g|kg|lbs?)\s*(\/\s*(day|week|month|dose))?$/i,
        temperature: /^\d{2,3}(\.\d{1,2})?\s*°?[FC]?$/,
        weight: /^\d+(\.\d{1,2})?\s*(lbs?|kg|g)$/i,
        
        // Security patterns
        sqlInjection: /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)|['"`;]/i,
        xssAttempt: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        htmlTags: /<[^>]*>/g,
        
        // Professional formatting
        vetLicense: /^[A-Z]{2}\d{4,8}$/i,
        clinicId: /^[A-Z0-9]{3,15}$/i
    },
    
    // Sanitization rules
    sanitization: {
        maxLengths: {
            patientName: 100,
            ownerName: 100,
            address: 200,
            phone: 20,
            email: 100,
            notes: 5000,
            soapSection: 2000,
            medication: 200,
            diagnosis: 500
        },
        
        allowedChars: {
            names: /^[a-zA-Z\s\-'\.]+$/,
            alphanumeric: /^[a-zA-Z0-9\s\-_\.]+$/,
            medical: /^[a-zA-Z0-9\s\-_\.\,\(\)\[\]\/\+\*\%\°\#]+$/,
            numeric: /^[\d\.\-\+\s]+$/
        }
    },
    
    // Validation state
    state: {
        strictMode: true,
        logValidation: true,
        autoSanitize: true
    },

    /**
     * Initialize data validation system
     */
    init(options = {}) {
        console.log('🛡️ Initializing data validation system...');
        
        // Apply configuration options
        this.state = { ...this.state, ...options };
        
        // Set up validation interceptors
        this.setupValidationInterceptors();
        
        // Initialize sanitization filters
        this.initializeSanitizationFilters();
        
        console.log('✅ Data validation system initialized');
    },

    /**
     * Set up validation interceptors for forms and inputs
     */
    setupValidationInterceptors() {
        // Intercept form submissions
        document.addEventListener('submit', (event) => {
            this.validateForm(event.target);
        });
        
        // Intercept input changes for real-time validation
        document.addEventListener('input', (event) => {
            if (event.target.matches('input, textarea, select')) {
                this.validateField(event.target);
            }
        });
        
        console.log('🛡️ Validation interceptors configured');
    },

    /**
     * Initialize sanitization filters
     */
    initializeSanitizationFilters() {
        // Create sanitization methods for different data types
        this.sanitizers = {
            text: this.sanitizeText.bind(this),
            medical: this.sanitizeMedicalText.bind(this),
            name: this.sanitizeName.bind(this),
            email: this.sanitizeEmail.bind(this),
            phone: this.sanitizePhone.bind(this),
            numeric: this.sanitizeNumeric.bind(this),
            html: this.sanitizeHTML.bind(this)
        };
        
        console.log('🛡️ Sanitization filters initialized');
    },

    /**
     * Validate patient information
     */
    validatePatientInfo(patientData) {
        const errors = [];
        const warnings = [];
        
        try {
            // Required fields validation
            if (!patientData.name || patientData.name.trim().length === 0) {
                errors.push('Patient name is required');
            } else if (!this.patterns.alphanumeric.test(patientData.name)) {
                errors.push('Patient name contains invalid characters');
            }
            
            // Species validation
            if (patientData.species && !this.isValidSpecies(patientData.species)) {
                warnings.push('Species not recognized - please verify spelling');
            }
            
            // Age validation
            if (patientData.age && !this.isValidAge(patientData.age)) {
                errors.push('Invalid age format');
            }
            
            // Weight validation
            if (patientData.weight && !this.patterns.weight.test(patientData.weight)) {
                errors.push('Invalid weight format (use: 25 lbs or 11.3 kg)');
            }
            
            // Owner information validation
            if (patientData.owner) {
                const ownerValidation = this.validateOwnerInfo(patientData.owner);
                errors.push(...ownerValidation.errors);
                warnings.push(...ownerValidation.warnings);
            }
            
            return {
                isValid: errors.length === 0,
                errors: errors,
                warnings: warnings,
                sanitized: this.sanitizePatientInfo(patientData)
            };
            
        } catch (error) {
            console.error('❌ Patient validation failed:', error);
            return {
                isValid: false,
                errors: ['Validation system error'],
                warnings: [],
                sanitized: patientData
            };
        }
    },

    /**
     * Validate owner information
     */
    validateOwnerInfo(ownerData) {
        const errors = [];
        const warnings = [];
        
        // Name validation
        if (ownerData.name && !this.patterns.names.test(ownerData.name)) {
            errors.push('Owner name contains invalid characters');
        }
        
        // Email validation
        if (ownerData.email && !this.patterns.email.test(ownerData.email)) {
            errors.push('Invalid email format');
        }
        
        // Phone validation
        if (ownerData.phone && !this.isValidPhone(ownerData.phone)) {
            errors.push('Invalid phone number format');
        }
        
        // Address validation
        if (ownerData.address && ownerData.address.length > this.sanitization.maxLengths.address) {
            warnings.push('Address is very long - please verify');
        }
        
        return { errors, warnings };
    },

    /**
     * Validate SOAP notes content
     */
    validateSOAPNotes(soapContent) {
        const errors = [];
        const warnings = [];
        
        try {
            // Basic content validation
            if (!soapContent || soapContent.trim().length === 0) {
                errors.push('SOAP notes cannot be empty');
                return { isValid: false, errors, warnings, sanitized: '' };
            }
            
            // Length validation
            if (soapContent.length > 10000) {
                warnings.push('SOAP notes are very long - consider breaking into sections');
            }
            
            // Security validation
            const securityCheck = this.validateSecurity(soapContent);
            if (!securityCheck.isSecure) {
                errors.push(...securityCheck.threats);
            }
            
            // Medical content validation
            const medicalValidation = this.validateMedicalContent(soapContent);
            warnings.push(...medicalValidation.warnings);
            
            // SOAP structure validation
            const structureValidation = this.validateSOAPStructure(soapContent);
            warnings.push(...structureValidation.warnings);
            
            return {
                isValid: errors.length === 0,
                errors: errors,
                warnings: warnings,
                sanitized: this.sanitizeSOAPNotes(soapContent),
                structure: structureValidation.structure
            };
            
        } catch (error) {
            console.error('❌ SOAP validation failed:', error);
            return {
                isValid: false,
                errors: ['SOAP validation system error'],
                warnings: [],
                sanitized: soapContent
            };
        }
    },

    /**
     * Validate medical content for professional standards
     */
    validateMedicalContent(content) {
        const warnings = [];
        
        // Check for medication dosages
        const medicationMatches = content.match(/\b\d+(\.\d+)?\s*(mg|ml|cc|units?|iu|mcg|g)\b/gi);
        if (medicationMatches) {
            medicationMatches.forEach(match => {
                if (!this.patterns.medicationDose.test(match)) {
                    warnings.push(`Verify medication dosage format: ${match}`);
                }
            });
        }
        
        // Check for temperature readings
        const tempMatches = content.match(/\b\d{2,3}(\.\d{1,2})?\s*°?[FC]?\b/g);
        if (tempMatches) {
            tempMatches.forEach(temp => {
                const numericTemp = parseFloat(temp);
                if (numericTemp < 95 || numericTemp > 110) {
                    warnings.push(`Unusual temperature reading: ${temp} - please verify`);
                }
            });
        }
        
        // Check for common abbreviations
        const commonAbbrevs = ['TPR', 'BID', 'SID', 'QID', 'PRN', 'PO', 'SQ', 'IM', 'IV'];
        const missingAbbrevs = [];
        
        commonAbbrevs.forEach(abbrev => {
            const longForm = this.getAbbreviationLongForm(abbrev);
            if (content.includes(longForm) && !content.includes(abbrev)) {
                missingAbbrevs.push(`Consider using abbreviation "${abbrev}" for "${longForm}"`);
            }
        });
        
        if (missingAbbrevs.length > 0) {
            warnings.push(...missingAbbrevs);
        }
        
        return { warnings };
    },

    /**
     * Validate SOAP structure
     */
    validateSOAPStructure(content) {
        const warnings = [];
        const structure = {
            hasSubjective: false,
            hasObjective: false,
            hasAssessment: false,
            hasPlan: false
        };
        
        // Check for SOAP section headers
        const soapHeaders = [
            { key: 'hasSubjective', patterns: [/\bsubjective\b/i, /\bs:\s*/i, /\bhistory\b/i] },
            { key: 'hasObjective', patterns: [/\bobjective\b/i, /\bo:\s*/i, /\bexam\b/i, /\bphysical\b/i] },
            { key: 'hasAssessment', patterns: [/\bassessment\b/i, /\ba:\s*/i, /\bdiagnosis\b/i] },
            { key: 'hasPlan', patterns: [/\bplan\b/i, /\bp:\s*/i, /\btreatment\b/i] }
        ];
        
        soapHeaders.forEach(section => {
            section.patterns.forEach(pattern => {
                if (pattern.test(content)) {
                    structure[section.key] = true;
                }
            });
        });
        
        // Generate warnings for missing sections
        if (!structure.hasSubjective) {
            warnings.push('Consider adding Subjective section with patient history');
        }
        if (!structure.hasObjective) {
            warnings.push('Consider adding Objective section with examination findings');
        }
        if (!structure.hasAssessment) {
            warnings.push('Consider adding Assessment section with diagnosis');
        }
        if (!structure.hasPlan) {
            warnings.push('Consider adding Plan section with treatment plan');
        }
        
        return { warnings, structure };
    },

    /**
     * Validate data security (check for injection attempts)
     */
    validateSecurity(content) {
        const threats = [];
        
        // Check for SQL injection attempts
        if (this.patterns.sqlInjection.test(content)) {
            threats.push('Content contains potentially dangerous SQL commands');
        }
        
        // Check for XSS attempts
        if (this.patterns.xssAttempt.test(content)) {
            threats.push('Content contains potentially dangerous script tags');
        }
        
        // Check for excessive HTML
        const htmlMatches = content.match(this.patterns.htmlTags);
        if (htmlMatches && htmlMatches.length > 10) {
            threats.push('Content contains excessive HTML tags');
        }
        
        return {
            isSecure: threats.length === 0,
            threats: threats
        };
    },

    /**
     * Sanitize patient information
     */
    sanitizePatientInfo(patientData) {
        const sanitized = {};
        
        // Sanitize each field appropriately
        if (patientData.name) {
            sanitized.name = this.sanitizeName(patientData.name);
        }
        
        if (patientData.species) {
            sanitized.species = this.sanitizeText(patientData.species);
        }
        
        if (patientData.breed) {
            sanitized.breed = this.sanitizeText(patientData.breed);
        }
        
        if (patientData.age) {
            sanitized.age = this.sanitizeText(patientData.age);
        }
        
        if (patientData.weight) {
            sanitized.weight = this.sanitizeText(patientData.weight);
        }
        
        if (patientData.owner) {
            sanitized.owner = this.sanitizeOwnerInfo(patientData.owner);
        }
        
        return sanitized;
    },

    /**
     * Sanitize owner information
     */
    sanitizeOwnerInfo(ownerData) {
        const sanitized = {};
        
        if (ownerData.name) {
            sanitized.name = this.sanitizeName(ownerData.name);
        }
        
        if (ownerData.email) {
            sanitized.email = this.sanitizeEmail(ownerData.email);
        }
        
        if (ownerData.phone) {
            sanitized.phone = this.sanitizePhone(ownerData.phone);
        }
        
        if (ownerData.address) {
            sanitized.address = this.sanitizeText(ownerData.address);
        }
        
        return sanitized;
    },

    /**
     * Sanitize SOAP notes content
     */
    sanitizeSOAPNotes(content) {
        // Remove dangerous content
        let sanitized = content
            .replace(this.patterns.xssAttempt, '') // Remove script tags
            .replace(/javascript:/gi, '') // Remove javascript: protocols
            .replace(/on\w+\s*=/gi, ''); // Remove event handlers
        
        // Normalize whitespace
        sanitized = sanitized
            .replace(/\s+/g, ' ') // Multiple spaces to single space
            .replace(/\n\s*\n/g, '\n\n') // Multiple newlines to double newline
            .trim();
        
        // Limit length
        if (sanitized.length > 10000) {
            sanitized = sanitized.substring(0, 10000) + '... [Content truncated for safety]';
        }
        
        return sanitized;
    },

    /**
     * Sanitize general text
     */
    sanitizeText(text) {
        if (!text) return '';
        
        return text
            .replace(this.patterns.htmlTags, '') // Remove HTML tags
            .replace(/[<>]/g, '') // Remove angle brackets
            .trim()
            .substring(0, 1000); // Limit length
    },

    /**
     * Sanitize medical text (more permissive)
     */
    sanitizeMedicalText(text) {
        if (!text) return '';
        
        return text
            .replace(this.patterns.xssAttempt, '') // Remove dangerous scripts
            .replace(/javascript:/gi, '') // Remove javascript protocols
            .trim();
    },

    /**
     * Sanitize names
     */
    sanitizeName(name) {
        if (!name) return '';
        
        return name
            .replace(/[^a-zA-Z\s\-'\.]/g, '') // Only allow letters, spaces, hyphens, apostrophes, periods
            .replace(/\s+/g, ' ') // Normalize spaces
            .trim()
            .substring(0, this.sanitization.maxLengths.patientName);
    },

    /**
     * Sanitize email addresses
     */
    sanitizeEmail(email) {
        if (!email) return '';
        
        return email
            .toLowerCase()
            .replace(/[^a-z0-9@\.\-_]/g, '') // Only allow valid email characters
            .trim()
            .substring(0, this.sanitization.maxLengths.email);
    },

    /**
     * Sanitize phone numbers
     */
    sanitizePhone(phone) {
        if (!phone) return '';
        
        return phone
            .replace(/[^0-9\+\-\(\)\s]/g, '') // Only allow phone number characters
            .trim()
            .substring(0, this.sanitization.maxLengths.phone);
    },

    /**
     * Sanitize numeric values
     */
    sanitizeNumeric(value) {
        if (!value) return '';
        
        return value
            .replace(/[^0-9\.\-\+\s]/g, '') // Only allow numeric characters
            .trim();
    },

    /**
     * Sanitize HTML content
     */
    sanitizeHTML(html) {
        if (!html) return '';
        
        // Allow only safe HTML tags
        const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li'];
        const tagPattern = new RegExp(`<(?!\/?(?:${allowedTags.join('|')})\b)[^>]*>`, 'gi');
        
        return html
            .replace(tagPattern, '') // Remove disallowed tags
            .replace(/javascript:/gi, '') // Remove javascript protocols
            .replace(/on\w+\s*=/gi, ''); // Remove event handlers
    },

    /**
     * Helper functions
     */
    isValidSpecies(species) {
        const commonSpecies = [
            'dog', 'cat', 'bird', 'rabbit', 'hamster', 'guinea pig', 'ferret',
            'horse', 'cow', 'pig', 'sheep', 'goat', 'chicken', 'duck', 'fish',
            'reptile', 'snake', 'lizard', 'turtle', 'tortoise'
        ];
        return commonSpecies.includes(species.toLowerCase());
    },

    isValidAge(age) {
        // Accept formats like: "2 years", "6 months", "3y", "18m", "2.5 years"
        return /^\d+(\.\d+)?\s*(years?|months?|weeks?|days?|y|m|w|d)$/i.test(age);
    },

    isValidPhone(phone) {
        // Remove formatting and check if it's a valid phone number
        const cleaned = phone.replace(/[^0-9]/g, '');
        return cleaned.length >= 10 && cleaned.length <= 15;
    },

    getAbbreviationLongForm(abbrev) {
        const abbreviations = {
            'TPR': 'temperature, pulse, respiration',
            'BID': 'twice daily',
            'SID': 'once daily',
            'QID': 'four times daily',
            'PRN': 'as needed',
            'PO': 'by mouth',
            'SQ': 'subcutaneous',
            'IM': 'intramuscular',
            'IV': 'intravenous'
        };
        return abbreviations[abbrev] || abbrev;
    },

    /**
     * Validate form data
     */
    validateForm(form) {
        const errors = [];
        const formData = new FormData(form);
        
        for (const [name, value] of formData.entries()) {
            const field = form.querySelector(`[name="${name}"]`);
            const validation = this.validateField(field);
            
            if (!validation.isValid) {
                errors.push(...validation.errors);
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    },

    /**
     * Validate individual form field
     */
    validateField(field) {
        const errors = [];
        const value = field.value;
        const type = field.getAttribute('data-validate') || field.type;
        
        // Required field validation
        if (field.hasAttribute('required') && !value.trim()) {
            errors.push(`${field.name || 'Field'} is required`);
            return { isValid: false, errors };
        }
        
        // Type-specific validation
        switch (type) {
            case 'email':
                if (value && !this.patterns.email.test(value)) {
                    errors.push('Invalid email format');
                }
                break;
            case 'phone':
                if (value && !this.isValidPhone(value)) {
                    errors.push('Invalid phone number');
                }
                break;
            case 'patient-name':
                if (value && !this.patterns.names.test(value)) {
                    errors.push('Name contains invalid characters');
                }
                break;
            case 'weight':
                if (value && !this.patterns.weight.test(value)) {
                    errors.push('Invalid weight format');
                }
                break;
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    },

    /**
     * Get validation summary
     */
    getValidationSummary() {
        return {
            strictMode: this.state.strictMode,
            autoSanitize: this.state.autoSanitize,
            patternsLoaded: Object.keys(this.patterns).length,
            sanitizersLoaded: Object.keys(this.sanitizers).length
        };
    }
};

// Make DataValidator available globally
window.DataValidator = DataValidator;
