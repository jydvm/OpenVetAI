/**
 * VetScribe - SOAP Note Templates and Prompts
 * Professional veterinary SOAP note generation system
 */

const SOAPTemplates = {
    // Template configurations
    templates: {
        standard: {
            name: 'Standard SOAP',
            description: 'Complete SOAP format for routine consultations',
            sections: ['subjective', 'objective', 'assessment', 'plan'],
            required: ['subjective', 'objective', 'assessment', 'plan']
        },
        wellness: {
            name: 'Wellness Exam',
            description: 'Optimized for routine wellness examinations',
            sections: ['subjective', 'objective', 'assessment', 'plan'],
            focus: 'preventive care, vaccinations, routine health maintenance'
        },
        emergency: {
            name: 'Emergency Visit',
            description: 'Structured for urgent care situations',
            sections: ['subjective', 'objective', 'assessment', 'plan'],
            focus: 'presenting complaint, immediate findings, urgent treatment'
        },
        surgical: {
            name: 'Surgical Consultation',
            description: 'Pre/post-operative documentation',
            sections: ['subjective', 'objective', 'assessment', 'plan'],
            focus: 'surgical indication, procedure planning, post-op care'
        },
        followup: {
            name: 'Follow-up Visit',
            description: 'Progress evaluation and treatment adjustment',
            sections: ['subjective', 'objective', 'assessment', 'plan'],
            focus: 'treatment response, progress evaluation, plan modification'
        }
    },

    /**
     * Generate veterinary-specific system prompt
     */
    generateSystemPrompt(templateType = 'standard', options = {}) {
        const template = this.templates[templateType] || this.templates.standard;
        
        let prompt = `You are a professional veterinary assistant specialized in creating accurate, comprehensive SOAP notes from consultation transcripts.

ROLE & EXPERTISE:
- Licensed veterinary medical documentation specialist
- Expert in veterinary terminology, procedures, and medical standards
- Focused on creating clear, concise, and clinically accurate documentation
- Committed to maintaining professional medical record standards

DOCUMENTATION STANDARDS:
- Use proper veterinary medical terminology and standard abbreviations
- Maintain professional, objective tone throughout
- Include relevant clinical details while remaining concise
- Follow standard SOAP format: Subjective, Objective, Assessment, Plan
- Ensure documentation supports clinical decision-making and continuity of care

FORMATTING REQUIREMENTS:
- Use clear section headers (SUBJECTIVE:, OBJECTIVE:, ASSESSMENT:, PLAN:)
- Include vital signs, measurements, and clinical findings in appropriate sections
- Specify medications with dosages, routes, and frequencies when mentioned
- Note follow-up instructions and monitoring requirements clearly
- Use standard veterinary abbreviations (TPR, BID, SID, PO, SQ, etc.)

CLINICAL FOCUS:`;

        // Add template-specific focus
        if (template.focus) {
            prompt += `\n- Emphasize ${template.focus}`;
        }

        prompt += `\n\nQUALITY STANDARDS:
- Accuracy: Ensure all medical information is correctly interpreted
- Completeness: Include all clinically relevant information from the transcript
- Clarity: Use clear, unambiguous language appropriate for medical records
- Consistency: Maintain consistent terminology and formatting throughout
- Professional: Suitable for legal medical documentation and insurance purposes

Remember: These notes will be used for patient care, medical records, and potential legal documentation.`;

        return prompt;
    },

    /**
     * Generate main SOAP prompt with transcript
     */
    generateSOAPPrompt(transcript, templateType = 'standard', options = {}) {
        const systemPrompt = this.generateSystemPrompt(templateType, options);
        const template = this.templates[templateType] || this.templates.standard;
        
        let prompt = `${systemPrompt}

CONSULTATION TRANSCRIPT:
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
     * Generate enhanced prompt with patient context
     */
    generateEnhancedPrompt(transcript, patientInfo = {}, templateType = 'standard', options = {}) {
        const basePrompt = this.generateSOAPPrompt(transcript, templateType, options);
        
        let enhancedPrompt = basePrompt;
        
        // Add patient context if available
        if (Object.keys(patientInfo).length > 0) {
            let contextSection = '\n\nPATIENT CONTEXT:\n';
            
            if (patientInfo.species) contextSection += `Species: ${patientInfo.species}\n`;
            if (patientInfo.breed) contextSection += `Breed: ${patientInfo.breed}\n`;
            if (patientInfo.age) contextSection += `Age: ${patientInfo.age}\n`;
            if (patientInfo.weight) contextSection += `Weight: ${patientInfo.weight}\n`;
            if (patientInfo.sex) contextSection += `Sex: ${patientInfo.sex}\n`;
            if (patientInfo.history) contextSection += `Medical History: ${patientInfo.history}\n`;
            
            // Insert context before transcript
            enhancedPrompt = enhancedPrompt.replace('CONSULTATION TRANSCRIPT:', contextSection + '\nCONSULTATION TRANSCRIPT:');
        }
        
        return enhancedPrompt;
    },

    /**
     * Generate specialized prompts for different visit types
     */
    generateSpecializedPrompt(transcript, visitType, options = {}) {
        const specializedPrompts = {
            wellness: this.generateWellnessPrompt(transcript, options),
            emergency: this.generateEmergencyPrompt(transcript, options),
            surgical: this.generateSurgicalPrompt(transcript, options),
            followup: this.generateFollowupPrompt(transcript, options),
            dental: this.generateDentalPrompt(transcript, options),
            vaccination: this.generateVaccinationPrompt(transcript, options)
        };
        
        return specializedPrompts[visitType] || this.generateSOAPPrompt(transcript, 'standard', options);
    },

    /**
     * Wellness examination prompt
     */
    generateWellnessPrompt(transcript, options = {}) {
        const systemPrompt = `You are a veterinary assistant specializing in wellness examination documentation.

WELLNESS EXAM FOCUS:
- Emphasize preventive care measures and health maintenance
- Include vaccination status and recommendations
- Note body condition score and weight management
- Document parasite prevention and dental health
- Highlight age-appropriate screening recommendations
- Include client education topics discussed

DOCUMENTATION PRIORITIES:
- Complete physical examination findings
- Vaccination history and current needs
- Parasite prevention status
- Dental health assessment
- Nutritional counseling
- Behavioral observations
- Preventive care recommendations`;

        return `${systemPrompt}

WELLNESS EXAMINATION TRANSCRIPT:
${transcript}

Please generate comprehensive wellness examination SOAP notes:

SUBJECTIVE:
[Owner concerns, behavioral changes, appetite, activity level, elimination habits]

OBJECTIVE:
[Complete physical exam findings, vital signs, body condition score, weight]

ASSESSMENT:
[Overall health status, any abnormal findings, wellness recommendations]

PLAN:
[Vaccination schedule, parasite prevention, dental care, follow-up recommendations]

SOAP NOTES:`;
    },

    /**
     * Emergency visit prompt
     */
    generateEmergencyPrompt(transcript, options = {}) {
        const systemPrompt = `You are a veterinary assistant specializing in emergency medicine documentation.

EMERGENCY DOCUMENTATION FOCUS:
- Prioritize presenting complaint and chief concern
- Document timeline of symptoms and progression
- Include triage assessment and stability
- Note emergency interventions performed
- Emphasize immediate treatment and monitoring
- Document client communication about prognosis

CRITICAL ELEMENTS:
- Presenting complaint and duration
- Vital signs and stability assessment
- Emergency diagnostics performed
- Immediate treatments administered
- Response to treatment
- Discharge instructions or hospitalization plan`;

        return `${systemPrompt}

EMERGENCY CONSULTATION TRANSCRIPT:
${transcript}

Please generate emergency visit SOAP notes:

SUBJECTIVE:
[Chief complaint, timeline, owner observations, precipitating factors]

OBJECTIVE:
[Triage findings, vital signs, physical exam, emergency diagnostics]

ASSESSMENT:
[Emergency diagnosis, severity assessment, prognosis]

PLAN:
[Emergency treatment, monitoring, hospitalization, discharge planning]

SOAP NOTES:`;
    },

    /**
     * Surgical consultation prompt
     */
    generateSurgicalPrompt(transcript, options = {}) {
        const systemPrompt = `You are a veterinary assistant specializing in surgical consultation documentation.

SURGICAL DOCUMENTATION FOCUS:
- Document surgical indication and necessity
- Include pre-operative assessment and risk factors
- Note anesthetic considerations and protocols
- Detail surgical procedure planning
- Document post-operative care requirements
- Include client consent and communication

SURGICAL ELEMENTS:
- Indication for surgery
- Pre-operative diagnostics
- Anesthetic risk assessment
- Surgical procedure details
- Post-operative monitoring plan
- Complications and management`;

        return `${systemPrompt}

SURGICAL CONSULTATION TRANSCRIPT:
${transcript}

Please generate surgical consultation SOAP notes:

SUBJECTIVE:
[Surgical indication, owner concerns, patient history relevant to surgery]

OBJECTIVE:
[Pre-operative exam, diagnostics, anesthetic assessment, surgical findings]

ASSESSMENT:
[Surgical diagnosis, procedure indication, anesthetic risk]

PLAN:
[Surgical procedure, anesthetic protocol, post-op care, monitoring]

SOAP NOTES:`;
    },

    /**
     * Follow-up visit prompt
     */
    generateFollowupPrompt(transcript, options = {}) {
        const systemPrompt = `You are a veterinary assistant specializing in follow-up visit documentation.

FOLLOW-UP DOCUMENTATION FOCUS:
- Assess response to previous treatment
- Document progress since last visit
- Note any complications or concerns
- Evaluate treatment plan effectiveness
- Modify treatment as needed
- Plan continued monitoring

FOLLOW-UP ELEMENTS:
- Treatment compliance and response
- Resolution or progression of condition
- Any new concerns or complications
- Medication adjustments needed
- Continued monitoring requirements
- Next follow-up recommendations`;

        return `${systemPrompt}

FOLLOW-UP VISIT TRANSCRIPT:
${transcript}

Please generate follow-up visit SOAP notes:

SUBJECTIVE:
[Treatment response, owner observations, compliance, new concerns]

OBJECTIVE:
[Current exam findings, comparison to previous visit, diagnostic updates]

ASSESSMENT:
[Treatment response, condition progress, any complications]

PLAN:
[Treatment modifications, continued monitoring, next follow-up]

SOAP NOTES:`;
    },

    /**
     * Dental procedure prompt
     */
    generateDentalPrompt(transcript, options = {}) {
        const systemPrompt = `You are a veterinary assistant specializing in dental procedure documentation.

DENTAL DOCUMENTATION FOCUS:
- Document oral examination findings
- Include dental charting and pathology
- Note anesthetic considerations for dental work
- Detail dental procedures performed
- Document post-operative dental care
- Include home care recommendations

DENTAL ELEMENTS:
- Oral examination findings
- Dental pathology and staging
- Radiographic findings
- Procedures performed
- Extractions and complications
- Post-operative care instructions`;

        return `${systemPrompt}

DENTAL CONSULTATION TRANSCRIPT:
${transcript}

Please generate dental procedure SOAP notes:

SUBJECTIVE:
[Dental concerns, eating habits, oral discomfort, halitosis]

OBJECTIVE:
[Oral exam, dental charting, radiographs, procedure findings]

ASSESSMENT:
[Dental diagnosis, pathology staging, treatment needs]

PLAN:
[Dental procedures, extractions, post-op care, home dental care]

SOAP NOTES:`;
    },

    /**
     * Vaccination visit prompt
     */
    generateVaccinationPrompt(transcript, options = {}) {
        const systemPrompt = `You are a veterinary assistant specializing in vaccination documentation.

VACCINATION DOCUMENTATION FOCUS:
- Document vaccination history and status
- Include vaccine products and lot numbers
- Note any previous vaccine reactions
- Document current health assessment
- Include vaccination schedule planning
- Record client education provided

VACCINATION ELEMENTS:
- Current vaccination status
- Vaccines administered today
- Vaccine products and lot numbers
- Any adverse reactions
- Future vaccination schedule
- Client education topics`;

        return `${systemPrompt}

VACCINATION VISIT TRANSCRIPT:
${transcript}

Please generate vaccination visit SOAP notes:

SUBJECTIVE:
[Vaccination history, any previous reactions, current health status]

OBJECTIVE:
[Physical exam, health assessment, vaccines administered]

ASSESSMENT:
[Health status for vaccination, vaccination needs]

PLAN:
[Vaccination schedule, monitoring for reactions, next vaccines due]

SOAP NOTES:`;
    },

    /**
     * Get template information
     */
    getTemplateInfo(templateType) {
        return this.templates[templateType] || null;
    },

    /**
     * List available templates
     */
    getAvailableTemplates() {
        return Object.keys(this.templates).map(key => ({
            key,
            ...this.templates[key]
        }));
    },

    /**
     * Validate template type
     */
    isValidTemplate(templateType) {
        return templateType in this.templates;
    }
};

// Make SOAPTemplates available globally
window.SOAPTemplates = SOAPTemplates;
