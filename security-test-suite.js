/**
 * VetScribe - Security Test Suite
 * Comprehensive testing for all security features
 * Run these tests to verify security implementation
 */

const SecurityTestSuite = {
    testResults: [],
    
    /**
     * Run all security tests
     */
    async runAllTests() {
        console.log('🧪 Starting comprehensive security test suite...');
        this.testResults = [];
        
        try {
            // Test encryption
            await this.testEncryption();
            
            // Test secure communication
            await this.testSecureCommunication();
            
            // Test data validation
            await this.testDataValidation();
            
            // Test privacy management
            await this.testPrivacyManagement();
            
            // Generate test report
            this.generateTestReport();
            
        } catch (error) {
            console.error('❌ Test suite failed:', error);
            this.addTestResult('Test Suite', 'FAILED', `Test suite crashed: ${error.message}`);
        }
    },

    /**
     * Test encryption functionality
     */
    async testEncryption() {
        console.log('🔐 Testing encryption...');
        
        try {
            // Test 1: Encryption availability
            const encryptionAvailable = typeof Encryption !== 'undefined';
            this.addTestResult('Encryption Module', encryptionAvailable ? 'PASS' : 'FAIL', 
                encryptionAvailable ? 'Encryption module loaded' : 'Encryption module not found');
            
            if (!encryptionAvailable) return;
            
            // Test 2: Browser support
            const browserSupport = Encryption.isBrowserSupported();
            this.addTestResult('Browser Crypto Support', browserSupport ? 'PASS' : 'FAIL',
                browserSupport ? 'Web Crypto API supported' : 'Web Crypto API not supported');
            
            // Test 3: Encryption initialization
            try {
                await Encryption.init('test-password-123');
                const status = Encryption.getEncryptionStatus();
                this.addTestResult('Encryption Init', status.initialized ? 'PASS' : 'FAIL',
                    status.initialized ? 'Encryption initialized successfully' : 'Encryption failed to initialize');
                
                // Test 4: Data encryption/decryption
                if (status.initialized) {
                    const testData = 'Test patient data: Fluffy the cat, 2 years old';
                    const encrypted = await Encryption.encrypt(testData);
                    const decrypted = await Encryption.decrypt(encrypted);
                    
                    this.addTestResult('Data Encryption', decrypted === testData ? 'PASS' : 'FAIL',
                        decrypted === testData ? 'Data encrypted and decrypted correctly' : 'Encryption/decryption failed');
                }
                
            } catch (error) {
                this.addTestResult('Encryption Init', 'FAIL', `Encryption initialization failed: ${error.message}`);
            }
            
        } catch (error) {
            this.addTestResult('Encryption Test', 'FAIL', `Encryption test failed: ${error.message}`);
        }
    },

    /**
     * Test secure communication
     */
    async testSecureCommunication() {
        console.log('🔒 Testing secure communication...');
        
        try {
            // Test 1: Secure communication availability
            const secureCommAvailable = typeof SecureCommunication !== 'undefined';
            this.addTestResult('Secure Communication Module', secureCommAvailable ? 'PASS' : 'FAIL',
                secureCommAvailable ? 'Secure communication module loaded' : 'Secure communication module not found');
            
            if (!secureCommAvailable) return;
            
            // Test 2: Security status
            const securityStatus = SecureCommunication.getSecurityStatus();
            this.addTestResult('Security Status', 'INFO', 
                `HTTPS: ${securityStatus.httpsEnabled}, Connection: ${securityStatus.connectionQuality}`);
            
            // Test 3: URL validation
            const testUrls = [
                { url: 'https://example.com', shouldPass: true },
                { url: 'http://100.64.1.1:1234', shouldPass: true }, // Tailscale
                { url: 'http://example.com', shouldPass: false },
                { url: 'javascript:alert("xss")', shouldPass: false }
            ];
            
            testUrls.forEach(test => {
                try {
                    SecureCommunication.validateRequestURL(test.url);
                    this.addTestResult('URL Validation', test.shouldPass ? 'PASS' : 'FAIL',
                        `URL ${test.url} validation result`);
                } catch (error) {
                    this.addTestResult('URL Validation', !test.shouldPass ? 'PASS' : 'FAIL',
                        `URL ${test.url} correctly rejected: ${error.message}`);
                }
            });
            
        } catch (error) {
            this.addTestResult('Secure Communication Test', 'FAIL', `Secure communication test failed: ${error.message}`);
        }
    },

    /**
     * Test data validation
     */
    async testDataValidation() {
        console.log('🛡️ Testing data validation...');
        
        try {
            // Test 1: Data validator availability
            const validatorAvailable = typeof DataValidator !== 'undefined';
            this.addTestResult('Data Validator Module', validatorAvailable ? 'PASS' : 'FAIL',
                validatorAvailable ? 'Data validator module loaded' : 'Data validator module not found');
            
            if (!validatorAvailable) return;
            
            // Test 2: Patient data validation
            const testPatient = {
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
            
            const patientValidation = DataValidator.validatePatientInfo(testPatient);
            this.addTestResult('Patient Validation', patientValidation.isValid ? 'PASS' : 'FAIL',
                patientValidation.isValid ? 'Valid patient data accepted' : `Validation errors: ${patientValidation.errors.join(', ')}`);
            
            // Test 3: Malicious data detection
            const maliciousData = {
                name: 'Fluffy<script>alert("xss")</script>',
                species: 'cat',
                owner: {
                    name: 'John; DROP TABLE patients;--',
                    email: 'john@example.com'
                }
            };
            
            const maliciousValidation = DataValidator.validatePatientInfo(maliciousData);
            const sanitizedName = maliciousValidation.sanitized.name;
            const containsScript = sanitizedName.includes('<script>');
            
            this.addTestResult('Malicious Data Sanitization', !containsScript ? 'PASS' : 'FAIL',
                !containsScript ? 'Malicious scripts removed' : 'Malicious scripts not removed');
            
            // Test 4: SOAP note validation
            const testSOAP = `S: Owner reports cat is eating well and playing normally
O: Temp 101.5°F, HR 180 bpm, alert and responsive
A: Healthy adult cat, routine wellness exam
P: Continue current diet, return in 1 year for wellness exam`;
            
            const soapValidation = DataValidator.validateSOAPNotes(testSOAP);
            this.addTestResult('SOAP Validation', soapValidation.isValid ? 'PASS' : 'FAIL',
                soapValidation.isValid ? 'Valid SOAP notes accepted' : `SOAP validation errors: ${soapValidation.errors.join(', ')}`);
            
            // Test 5: Security validation
            const maliciousSOAP = `S: Patient doing well<script>alert('xss')</script>
O: Normal exam; SELECT * FROM patients;
A: Healthy
P: Continue care`;
            
            const securityValidation = DataValidator.validateSecurity(maliciousSOAP);
            this.addTestResult('Security Validation', !securityValidation.isSecure ? 'PASS' : 'FAIL',
                !securityValidation.isSecure ? 'Security threats detected' : 'Security threats not detected');
            
        } catch (error) {
            this.addTestResult('Data Validation Test', 'FAIL', `Data validation test failed: ${error.message}`);
        }
    },

    /**
     * Test privacy management
     */
    async testPrivacyManagement() {
        console.log('🔒 Testing privacy management...');
        
        try {
            // Test 1: Privacy manager availability
            const privacyAvailable = typeof PrivacyManager !== 'undefined';
            this.addTestResult('Privacy Manager Module', privacyAvailable ? 'PASS' : 'FAIL',
                privacyAvailable ? 'Privacy manager module loaded' : 'Privacy manager module not found');
            
            if (!privacyAvailable) return;
            
            // Test 2: Privacy status
            const privacyStatus = PrivacyManager.getPrivacyStatus();
            this.addTestResult('Privacy Status', 'INFO',
                `Audit logging: ${privacyStatus.config.auditLogging}, Data minimization: ${privacyStatus.config.dataMinimization}`);
            
            // Test 3: Retention policies
            const retentionPolicies = privacyStatus.retentionPolicies;
            const soapRetention = retentionPolicies.soapNotes?.defaultDays;
            const recordingRetention = retentionPolicies.recordings?.defaultDays;
            
            this.addTestResult('Retention Policies', soapRetention === 2555 ? 'PASS' : 'FAIL',
                `SOAP notes retention: ${soapRetention} days (should be 2555 for 7 years)`);
            
            this.addTestResult('Auto-Delete Policies', recordingRetention <= 365 ? 'PASS' : 'FAIL',
                `Recording retention: ${recordingRetention} days (should be ≤365 for storage efficiency)`);
            
            // Test 4: Audit logging
            PrivacyManager.logAuditEvent('test_event', { testData: 'security test' });
            const auditLog = PrivacyManager.getAuditLog(1);
            
            this.addTestResult('Audit Logging', auditLog.length > 0 ? 'PASS' : 'FAIL',
                auditLog.length > 0 ? 'Audit events logged successfully' : 'Audit logging failed');
            
        } catch (error) {
            this.addTestResult('Privacy Management Test', 'FAIL', `Privacy management test failed: ${error.message}`);
        }
    },

    /**
     * Add test result
     */
    addTestResult(testName, status, details) {
        const result = {
            test: testName,
            status: status,
            details: details,
            timestamp: new Date().toISOString()
        };
        
        this.testResults.push(result);
        
        const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : 'ℹ️';
        console.log(`${statusIcon} ${testName}: ${status} - ${details}`);
    },

    /**
     * Generate comprehensive test report
     */
    generateTestReport() {
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.status === 'PASS').length;
        const failedTests = this.testResults.filter(r => r.status === 'FAIL').length;
        const infoTests = this.testResults.filter(r => r.status === 'INFO').length;
        
        const report = {
            summary: {
                total: totalTests,
                passed: passedTests,
                failed: failedTests,
                info: infoTests,
                successRate: Math.round((passedTests / (totalTests - infoTests)) * 100)
            },
            results: this.testResults,
            timestamp: new Date().toISOString()
        };
        
        console.log('\n📊 SECURITY TEST REPORT');
        console.log('========================');
        console.log(`Total Tests: ${totalTests}`);
        console.log(`✅ Passed: ${passedTests}`);
        console.log(`❌ Failed: ${failedTests}`);
        console.log(`ℹ️ Info: ${infoTests}`);
        console.log(`Success Rate: ${report.summary.successRate}%`);
        console.log('========================\n');
        
        // Show detailed results
        this.testResults.forEach(result => {
            const statusIcon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : 'ℹ️';
            console.log(`${statusIcon} ${result.test}: ${result.details}`);
        });
        
        return report;
    },

    /**
     * Export test report
     */
    exportTestReport() {
        const report = this.generateTestReport();
        
        const reportData = JSON.stringify(report, null, 2);
        const dataBlob = new Blob([reportData], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `vetscribe-security-test-report-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        
        console.log('📊 Security test report exported');
    }
};

// Make SecurityTestSuite available globally
window.SecurityTestSuite = SecurityTestSuite;
