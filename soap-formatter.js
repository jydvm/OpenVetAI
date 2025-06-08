/**
 * VetScribe - SOAP Note Formatter and Validator
 * Professional formatting and validation for veterinary SOAP notes
 */

const SOAPFormatter = {
    // Formatting configuration
    config: {
        sectionHeaders: {
            subjective: 'SUBJECTIVE:',
            objective: 'OBJECTIVE:',
            assessment: 'ASSESSMENT:',
            plan: 'PLAN:'
        },
        
        formatting: {
            lineSpacing: '\n\n',
            sectionSpacing: '\n\n',
            bulletPoint: '• ',
            indentation: '  ',
            maxLineLength: 80
        },
        
        validation: {
            minSectionLength: 10,
            maxSectionLength: 1000,
            requiredSections: ['subjective', 'objective', 'assessment', 'plan'],
            veterinaryTermsThreshold: 3
        }
    },

    /**
     * Format raw SOAP notes with professional styling
     */
    formatSOAPNotes(rawContent, options = {}) {
        try {
            console.log('📝 Formatting SOAP notes...');
            
            // Parse the raw content into sections
            const sections = this.parseSOAPSections(rawContent);
            
            // Validate sections
            const validation = this.validateSections(sections);
            
            // Format each section
            const formattedSections = this.formatSections(sections, options);
            
            // Assemble final SOAP note
            const formattedSOAP = this.assembleSOAPNote(formattedSections, options);
            
            // Apply final formatting touches
            const finalFormatted = this.applyFinalFormatting(formattedSOAP, options);
            
            console.log('✅ SOAP notes formatted successfully');
            
            return {
                content: finalFormatted,
                sections: formattedSections,
                validation: validation,
                metadata: {
                    wordCount: this.countWords(finalFormatted),
                    characterCount: finalFormatted.length,
                    sectionCount: Object.keys(formattedSections).length,
                    formattedAt: new Date().toISOString()
                }
            };
            
        } catch (error) {
            console.error('❌ SOAP formatting failed:', error);
            throw error;
        }
    },

    /**
     * Parse raw content into SOAP sections
     */
    parseSOAPSections(content) {
        const sections = {};
        
        // Define section patterns
        const sectionPatterns = {
            subjective: /SUBJECTIVE:\s*([\s\S]*?)(?=OBJECTIVE:|ASSESSMENT:|PLAN:|$)/i,
            objective: /OBJECTIVE:\s*([\s\S]*?)(?=ASSESSMENT:|PLAN:|$)/i,
            assessment: /ASSESSMENT:\s*([\s\S]*?)(?=PLAN:|$)/i,
            plan: /PLAN:\s*([\s\S]*?)$/i
        };
        
        // Extract each section
        Object.entries(sectionPatterns).forEach(([sectionName, pattern]) => {
            const match = content.match(pattern);
            if (match && match[1]) {
                sections[sectionName] = match[1].trim();
            }
        });
        
        console.log('📋 Parsed SOAP sections:', Object.keys(sections));
        return sections;
    },

    /**
     * Validate SOAP sections for completeness and quality
     */
    validateSections(sections) {
        const validation = {
            isValid: true,
            sections: {},
            issues: [],
            warnings: [],
            score: 0
        };
        
        // Check required sections
        this.config.validation.requiredSections.forEach(sectionName => {
            const hasSection = sections[sectionName] && sections[sectionName].length > 0;
            validation.sections[sectionName] = hasSection;
            
            if (!hasSection) {
                validation.isValid = false;
                validation.issues.push(`Missing ${sectionName.toUpperCase()} section`);
            } else {
                // Check section length
                const sectionLength = sections[sectionName].length;
                if (sectionLength < this.config.validation.minSectionLength) {
                    validation.warnings.push(`${sectionName.toUpperCase()} section is very short`);
                } else if (sectionLength > this.config.validation.maxSectionLength) {
                    validation.warnings.push(`${sectionName.toUpperCase()} section is very long`);
                }
            }
        });
        
        // Calculate validation score
        const validSections = Object.values(validation.sections).filter(Boolean).length;
        validation.score = Math.round((validSections / this.config.validation.requiredSections.length) * 100);
        
        // Check for veterinary terminology
        const allContent = Object.values(sections).join(' ').toLowerCase();
        const veterinaryTermCount = this.countVeterinaryTerms(allContent);
        
        if (veterinaryTermCount < this.config.validation.veterinaryTermsThreshold) {
            validation.warnings.push('Limited veterinary terminology detected');
        }
        
        console.log('✅ SOAP validation completed:', validation);
        return validation;
    },

    /**
     * Format individual SOAP sections
     */
    formatSections(sections, options = {}) {
        const formatted = {};
        
        Object.entries(sections).forEach(([sectionName, content]) => {
            formatted[sectionName] = this.formatSection(sectionName, content, options);
        });
        
        return formatted;
    },

    /**
     * Format individual section content
     */
    formatSection(sectionName, content, options = {}) {
        let formatted = content;
        
        // Apply section-specific formatting
        switch (sectionName) {
            case 'subjective':
                formatted = this.formatSubjectiveSection(content, options);
                break;
            case 'objective':
                formatted = this.formatObjectiveSection(content, options);
                break;
            case 'assessment':
                formatted = this.formatAssessmentSection(content, options);
                break;
            case 'plan':
                formatted = this.formatPlanSection(content, options);
                break;
            default:
                formatted = this.formatGenericSection(content, options);
        }
        
        // Apply common formatting
        formatted = this.applyCommonFormatting(formatted, options);
        
        return formatted;
    },

    /**
     * Format Subjective section
     */
    formatSubjectiveSection(content, options = {}) {
        let formatted = content;
        
        // Organize by topics
        formatted = this.organizeByTopics(formatted, [
            'Chief complaint',
            'History',
            'Owner observations',
            'Behavioral changes',
            'Appetite',
            'Activity level',
            'Elimination'
        ]);
        
        // Standardize common phrases
        formatted = this.standardizeSubjectivePhrases(formatted);
        
        return formatted;
    },

    /**
     * Format Objective section
     */
    formatObjectiveSection(content, options = {}) {
        let formatted = content;
        
        // Organize by examination areas
        formatted = this.organizeByTopics(formatted, [
            'Vital signs',
            'General appearance',
            'Body systems',
            'Physical examination',
            'Diagnostic results'
        ]);
        
        // Format vital signs
        formatted = this.formatVitalSigns(formatted);
        
        // Standardize measurements
        formatted = this.standardizeMeasurements(formatted);
        
        return formatted;
    },

    /**
     * Format Assessment section
     */
    formatAssessmentSection(content, options = {}) {
        let formatted = content;
        
        // Organize diagnoses
        formatted = this.organizeDiagnoses(formatted);
        
        // Standardize diagnostic terminology
        formatted = this.standardizeDiagnosticTerms(formatted);
        
        return formatted;
    },

    /**
     * Format Plan section
     */
    formatPlanSection(content, options = {}) {
        let formatted = content;
        
        // Organize by plan categories
        formatted = this.organizeByTopics(formatted, [
            'Treatment',
            'Medications',
            'Diagnostics',
            'Monitoring',
            'Follow-up',
            'Client education'
        ]);
        
        // Format medications
        formatted = this.formatMedications(formatted);
        
        // Format follow-up instructions
        formatted = this.formatFollowUpInstructions(formatted);
        
        return formatted;
    },

    /**
     * Format generic section
     */
    formatGenericSection(content, options = {}) {
        let formatted = content;
        
        // Basic formatting
        formatted = this.cleanupWhitespace(formatted);
        formatted = this.capitalizeSentences(formatted);
        
        return formatted;
    },

    /**
     * Apply common formatting to all sections
     */
    applyCommonFormatting(content, options = {}) {
        let formatted = content;
        
        // Clean up whitespace
        formatted = this.cleanupWhitespace(formatted);
        
        // Capitalize sentences
        formatted = this.capitalizeSentences(formatted);
        
        // Standardize abbreviations
        formatted = this.standardizeAbbreviations(formatted);
        
        // Format lists
        formatted = this.formatLists(formatted);
        
        return formatted;
    },

    /**
     * Organize content by topics
     */
    organizeByTopics(content, topics) {
        // This is a simplified implementation
        // In a full version, this would use NLP to identify and organize topics
        return content;
    },

    /**
     * Standardize subjective phrases
     */
    standardizeSubjectivePhrases(content) {
        const standardizations = {
            'eating well': 'appetite normal',
            'drinking normally': 'water consumption normal',
            'going to the bathroom': 'elimination normal',
            'seems fine': 'behavior normal',
            'acting normal': 'behavior normal'
        };
        
        let standardized = content;
        Object.entries(standardizations).forEach(([phrase, standard]) => {
            const regex = new RegExp(phrase, 'gi');
            standardized = standardized.replace(regex, standard);
        });
        
        return standardized;
    },

    /**
     * Format vital signs
     */
    formatVitalSigns(content) {
        let formatted = content;
        
        // Standardize temperature format
        formatted = formatted.replace(/(\d+\.?\d*)\s*degrees?\s*(f|fahrenheit)/gi, '$1°F');
        formatted = formatted.replace(/(\d+\.?\d*)\s*degrees?\s*(c|celsius)/gi, '$1°C');
        
        // Standardize heart rate
        formatted = formatted.replace(/heart rate:?\s*(\d+)/gi, 'HR: $1 bpm');
        formatted = formatted.replace(/pulse:?\s*(\d+)/gi, 'HR: $1 bpm');
        
        // Standardize respiratory rate
        formatted = formatted.replace(/respiratory rate:?\s*(\d+)/gi, 'RR: $1 rpm');
        formatted = formatted.replace(/breathing:?\s*(\d+)/gi, 'RR: $1 rpm');
        
        return formatted;
    },

    /**
     * Standardize measurements
     */
    standardizeMeasurements(content) {
        let formatted = content;
        
        // Weight measurements
        formatted = formatted.replace(/(\d+\.?\d*)\s*(lb|lbs|pound|pounds)/gi, '$1 lbs');
        formatted = formatted.replace(/(\d+\.?\d*)\s*(kg|kilogram|kilograms)/gi, '$1 kg');
        
        // Volume measurements
        formatted = formatted.replace(/(\d+\.?\d*)\s*(ml|milliliter|milliliters)/gi, '$1 ml');
        formatted = formatted.replace(/(\d+\.?\d*)\s*(cc|cubic centimeter)/gi, '$1 cc');
        
        return formatted;
    },

    /**
     * Organize diagnoses
     */
    organizeDiagnoses(content) {
        // Look for numbered or bulleted diagnoses and format consistently
        let formatted = content;
        
        // Convert various list formats to consistent bullets
        formatted = formatted.replace(/^\s*\d+[\.\)]\s*/gm, '• ');
        formatted = formatted.replace(/^\s*[-\*]\s*/gm, '• ');
        
        return formatted;
    },

    /**
     * Standardize diagnostic terminology
     */
    standardizeDiagnosticTerms(content) {
        const termStandardizations = {
            'rule out': 'R/O',
            'differential diagnosis': 'DDx',
            'within normal limits': 'WNL',
            'no abnormalities detected': 'NAD'
        };
        
        let standardized = content;
        Object.entries(termStandardizations).forEach(([term, standard]) => {
            const regex = new RegExp(term, 'gi');
            standardized = standardized.replace(regex, standard);
        });
        
        return standardized;
    },

    /**
     * Format medications
     */
    formatMedications(content) {
        let formatted = content;
        
        // Standardize dosage formats
        formatted = formatted.replace(/(\w+)\s+(\d+\.?\d*)\s*(mg|g|ml|cc)\s+(BID|SID|QID|TID)/gi, 
            '$1 $2 $3 $4');
        
        // Standardize routes
        formatted = formatted.replace(/\bby mouth\b/gi, 'PO');
        formatted = formatted.replace(/\borally\b/gi, 'PO');
        formatted = formatted.replace(/\bunder the skin\b/gi, 'SQ');
        formatted = formatted.replace(/\bsubcutaneously\b/gi, 'SQ');
        
        return formatted;
    },

    /**
     * Format follow-up instructions
     */
    formatFollowUpInstructions(content) {
        let formatted = content;
        
        // Standardize time periods
        formatted = formatted.replace(/in (\d+) days?/gi, 'in $1 days');
        formatted = formatted.replace(/in (\d+) weeks?/gi, 'in $1 weeks');
        formatted = formatted.replace(/in (\d+) months?/gi, 'in $1 months');
        
        return formatted;
    },

    /**
     * Clean up whitespace
     */
    cleanupWhitespace(content) {
        return content
            .replace(/\s+/g, ' ')           // Multiple spaces to single space
            .replace(/\n\s*\n/g, '\n')      // Multiple newlines to single
            .trim();                        // Remove leading/trailing whitespace
    },

    /**
     * Capitalize sentences
     */
    capitalizeSentences(content) {
        return content.replace(/(^|[.!?]\s+)([a-z])/g, (match, prefix, letter) => {
            return prefix + letter.toUpperCase();
        });
    },

    /**
     * Standardize abbreviations
     */
    standardizeAbbreviations(content) {
        const abbreviations = {
            'temperature pulse respiration': 'TPR',
            'twice daily': 'BID',
            'once daily': 'SID',
            'four times daily': 'QID',
            'three times daily': 'TID',
            'as needed': 'PRN',
            'body condition score': 'BCS'
        };
        
        let standardized = content;
        Object.entries(abbreviations).forEach(([phrase, abbrev]) => {
            const regex = new RegExp(phrase, 'gi');
            standardized = standardized.replace(regex, abbrev);
        });
        
        return standardized;
    },

    /**
     * Format lists consistently
     */
    formatLists(content) {
        let formatted = content;
        
        // Convert various bullet formats to consistent style
        formatted = formatted.replace(/^\s*[-\*•]\s*/gm, '• ');
        formatted = formatted.replace(/^\s*\d+[\.\)]\s*/gm, '• ');
        
        return formatted;
    },

    /**
     * Assemble final SOAP note
     */
    assembleSOAPNote(sections, options = {}) {
        const { sectionHeaders, formatting } = this.config;
        let assembled = '';
        
        // Add each section with proper headers
        ['subjective', 'objective', 'assessment', 'plan'].forEach(sectionName => {
            if (sections[sectionName]) {
                assembled += sectionHeaders[sectionName] + formatting.lineSpacing;
                assembled += sections[sectionName] + formatting.sectionSpacing;
            }
        });
        
        return assembled.trim();
    },

    /**
     * Apply final formatting touches
     */
    applyFinalFormatting(content, options = {}) {
        let formatted = content;
        
        // Ensure consistent spacing
        formatted = formatted.replace(/\n{3,}/g, '\n\n');
        
        // Ensure proper capitalization of section headers
        formatted = formatted.replace(/^(subjective|objective|assessment|plan):/gmi, 
            (match) => match.toUpperCase());
        
        return formatted;
    },

    /**
     * Count veterinary terms in content
     */
    countVeterinaryTerms(content) {
        const veterinaryTerms = [
            'examination', 'diagnosis', 'treatment', 'medication', 'vaccination',
            'temperature', 'pulse', 'respiration', 'weight', 'bcs',
            'tpr', 'bid', 'sid', 'qid', 'po', 'sq', 'im', 'iv',
            'normal', 'abnormal', 'wnl', 'nad'
        ];
        
        return veterinaryTerms.filter(term => 
            content.includes(term.toLowerCase())
        ).length;
    },

    /**
     * Count words in content
     */
    countWords(content) {
        return content.trim().split(/\s+/).filter(word => word.length > 0).length;
    },

    /**
     * Validate formatted SOAP note
     */
    validateFormattedSOAP(formattedContent) {
        const sections = this.parseSOAPSections(formattedContent);
        return this.validateSections(sections);
    },

    /**
     * Generate formatting report
     */
    generateFormattingReport(originalContent, formattedResult) {
        const report = {
            timestamp: new Date().toISOString(),
            original: {
                wordCount: this.countWords(originalContent),
                characterCount: originalContent.length,
                veterinaryTerms: this.countVeterinaryTerms(originalContent.toLowerCase())
            },
            formatted: {
                wordCount: formattedResult.metadata.wordCount,
                characterCount: formattedResult.metadata.characterCount,
                sectionCount: formattedResult.metadata.sectionCount,
                veterinaryTerms: this.countVeterinaryTerms(formattedResult.content.toLowerCase())
            },
            improvements: [],
            validation: formattedResult.validation
        };

        // Identify improvements made
        if (report.formatted.sectionCount > 0) {
            report.improvements.push('Organized content into SOAP sections');
        }

        if (report.formatted.veterinaryTerms > report.original.veterinaryTerms) {
            report.improvements.push('Standardized veterinary terminology');
        }

        if (formattedResult.validation.score > 75) {
            report.improvements.push('Achieved high-quality SOAP format');
        }

        return report;
    },

    /**
     * Export SOAP note in different formats
     */
    exportSOAP(formattedResult, format = 'text') {
        const { content, sections, validation, metadata } = formattedResult;

        switch (format.toLowerCase()) {
            case 'text':
                return this.exportAsText(content);
            case 'html':
                return this.exportAsHTML(sections, metadata);
            case 'json':
                return this.exportAsJSON(formattedResult);
            case 'markdown':
                return this.exportAsMarkdown(sections, metadata);
            default:
                return content;
        }
    },

    /**
     * Export as plain text
     */
    exportAsText(content) {
        return content;
    },

    /**
     * Export as HTML
     */
    exportAsHTML(sections, metadata) {
        let html = '<div class="soap-note">\n';

        ['subjective', 'objective', 'assessment', 'plan'].forEach(sectionName => {
            if (sections[sectionName]) {
                const headerName = sectionName.charAt(0).toUpperCase() + sectionName.slice(1);
                html += `  <div class="soap-section">\n`;
                html += `    <h3 class="soap-header">${headerName.toUpperCase()}:</h3>\n`;
                html += `    <div class="soap-content">${sections[sectionName].replace(/\n/g, '<br>')}</div>\n`;
                html += `  </div>\n`;
            }
        });

        html += '</div>';
        return html;
    },

    /**
     * Export as JSON
     */
    exportAsJSON(formattedResult) {
        return JSON.stringify(formattedResult, null, 2);
    },

    /**
     * Export as Markdown
     */
    exportAsMarkdown(sections, metadata) {
        let markdown = '# SOAP Notes\n\n';

        ['subjective', 'objective', 'assessment', 'plan'].forEach(sectionName => {
            if (sections[sectionName]) {
                const headerName = sectionName.charAt(0).toUpperCase() + sectionName.slice(1);
                markdown += `## ${headerName}\n\n`;
                markdown += `${sections[sectionName]}\n\n`;
            }
        });

        markdown += `---\n*Generated: ${metadata.formattedAt}*\n`;
        return markdown;
    },

    /**
     * Quick format function for simple use cases
     */
    quickFormat(content) {
        try {
            const result = this.formatSOAPNotes(content);
            return result.content;
        } catch (error) {
            console.warn('⚠️ Quick format failed, returning original content:', error);
            return content;
        }
    },

    /**
     * Validate SOAP note quality
     */
    assessQuality(content) {
        try {
            const sections = this.parseSOAPSections(content);
            const validation = this.validateSections(sections);

            const quality = {
                score: validation.score,
                level: this.getQualityLevel(validation.score),
                sections: validation.sections,
                issues: validation.issues,
                warnings: validation.warnings,
                recommendations: this.generateQualityRecommendations(validation)
            };

            return quality;
        } catch (error) {
            console.error('❌ Quality assessment failed:', error);
            return {
                score: 0,
                level: 'poor',
                issues: ['Failed to assess quality'],
                recommendations: ['Review SOAP note format']
            };
        }
    },

    /**
     * Get quality level from score
     */
    getQualityLevel(score) {
        if (score >= 90) return 'excellent';
        if (score >= 75) return 'good';
        if (score >= 60) return 'fair';
        if (score >= 40) return 'poor';
        return 'very poor';
    },

    /**
     * Generate quality improvement recommendations
     */
    generateQualityRecommendations(validation) {
        const recommendations = [];

        if (!validation.sections.subjective) {
            recommendations.push('Add Subjective section with patient history and owner concerns');
        }

        if (!validation.sections.objective) {
            recommendations.push('Add Objective section with physical examination findings');
        }

        if (!validation.sections.assessment) {
            recommendations.push('Add Assessment section with clinical diagnosis');
        }

        if (!validation.sections.plan) {
            recommendations.push('Add Plan section with treatment recommendations');
        }

        if (validation.warnings.length > 0) {
            recommendations.push('Address section length and content warnings');
        }

        if (recommendations.length === 0) {
            recommendations.push('SOAP note meets professional standards');
        }

        return recommendations;
    }
};

// Make SOAPFormatter available globally
window.SOAPFormatter = SOAPFormatter;
