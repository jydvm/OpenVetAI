module.exports = {
    // Test environment
    testEnvironment: 'jsdom',
    
    // Test file patterns
    testMatch: [
        '**/tests/**/*.test.js'
    ],
    
    // Setup files
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    
    // Coverage configuration
    collectCoverageFrom: [
        '*.js',
        '!node_modules/**',
        '!tests/**',
        '!jest.config.js',
        '!coverage/**'
    ],
    
    // Coverage directory
    coverageDirectory: 'coverage',
    
    // Coverage reporters
    coverageReporters: [
        'text',
        'lcov',
        'html'
    ],
    
    // Coverage thresholds
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70
        }
    },
    
    // Module file extensions
    moduleFileExtensions: [
        'js',
        'json'
    ],
    
    // Transform files
    transform: {},
    
    // Test timeout
    testTimeout: 10000,
    
    // Verbose output
    verbose: true,
    
    // Clear mocks between tests
    clearMocks: true,
    
    // Restore mocks after each test
    restoreMocks: true
};
