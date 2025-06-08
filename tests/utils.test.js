/**
 * Unit tests for Utils module
 */

// Mock DOM environment for testing
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

// Load the Utils module
require('../utils.js');

describe('Utils', () => {
    describe('formatTime', () => {
        test('formats seconds correctly', () => {
            expect(Utils.formatTime(0)).toBe('00:00');
            expect(Utils.formatTime(30)).toBe('00:30');
            expect(Utils.formatTime(60)).toBe('01:00');
            expect(Utils.formatTime(90)).toBe('01:30');
            expect(Utils.formatTime(3661)).toBe('61:01');
        });
    });

    describe('formatDate', () => {
        test('formats date correctly', () => {
            const testDate = new Date('2024-01-15T10:30:00Z');
            const formatted = Utils.formatDate(testDate);
            expect(formatted).toMatch(/Jan 15, 2024/);
        });
    });

    describe('generateId', () => {
        test('generates unique IDs', () => {
            const id1 = Utils.generateId();
            const id2 = Utils.generateId();
            
            expect(id1).toBeDefined();
            expect(id2).toBeDefined();
            expect(id1).not.toBe(id2);
            expect(typeof id1).toBe('string');
            expect(id1.length).toBeGreaterThan(0);
        });
    });

    describe('isValidUrl', () => {
        test('validates URLs correctly', () => {
            expect(Utils.isValidUrl('http://localhost:1234')).toBe(true);
            expect(Utils.isValidUrl('https://example.com')).toBe(true);
            expect(Utils.isValidUrl('http://100.64.0.1:1234')).toBe(true);
            expect(Utils.isValidUrl('not-a-url')).toBe(false);
            expect(Utils.isValidUrl('')).toBe(false);
            expect(Utils.isValidUrl('ftp://example.com')).toBe(true);
        });
    });

    describe('sanitizeText', () => {
        test('sanitizes text input', () => {
            expect(Utils.sanitizeText('Hello World')).toBe('Hello World');
            expect(Utils.sanitizeText('  Hello World  ')).toBe('Hello World');
            expect(Utils.sanitizeText('Hello <script>alert("xss")</script> World')).toBe('Hello alert("xss") World');
            expect(Utils.sanitizeText('<div>Hello</div>')).toBe('Hello');
            expect(Utils.sanitizeText(123)).toBe('');
            expect(Utils.sanitizeText(null)).toBe('');
            expect(Utils.sanitizeText(undefined)).toBe('');
        });

        test('limits text length', () => {
            const longText = 'a'.repeat(20000);
            const sanitized = Utils.sanitizeText(longText);
            expect(sanitized.length).toBe(10000);
        });
    });

    describe('simpleEncrypt and simpleDecrypt', () => {
        test('encrypts and decrypts text', () => {
            const originalText = 'Hello, World! 🌍';
            const encrypted = Utils.simpleEncrypt(originalText);
            const decrypted = Utils.simpleDecrypt(encrypted);
            
            expect(encrypted).not.toBe(originalText);
            expect(decrypted).toBe(originalText);
        });

        test('handles invalid encrypted text', () => {
            expect(Utils.simpleDecrypt('invalid-base64')).toBe('');
            expect(Utils.simpleDecrypt('')).toBe('');
        });
    });

    describe('checkBrowserSupport', () => {
        test('returns browser support object', () => {
            const support = Utils.checkBrowserSupport();
            
            expect(support).toHaveProperty('mediaRecorder');
            expect(support).toHaveProperty('speechRecognition');
            expect(support).toHaveProperty('localStorage');
            expect(support).toHaveProperty('webAudio');
            expect(support).toHaveProperty('fetch');
            
            expect(typeof support.mediaRecorder).toBe('boolean');
            expect(typeof support.speechRecognition).toBe('boolean');
            expect(typeof support.localStorage).toBe('boolean');
            expect(typeof support.webAudio).toBe('boolean');
            expect(typeof support.fetch).toBe('boolean');
        });
    });

    describe('getBrowserInfo', () => {
        test('returns browser information', () => {
            const info = Utils.getBrowserInfo();
            
            expect(info).toHaveProperty('name');
            expect(info).toHaveProperty('version');
            expect(info).toHaveProperty('userAgent');
            expect(info).toHaveProperty('isMobile');
            
            expect(typeof info.name).toBe('string');
            expect(typeof info.version).toBe('string');
            expect(typeof info.userAgent).toBe('string');
            expect(typeof info.isMobile).toBe('boolean');
        });
    });

    describe('debounce', () => {
        test('debounces function calls', (done) => {
            let callCount = 0;
            const debouncedFn = Utils.debounce(() => {
                callCount++;
            }, 100);
            
            // Call multiple times quickly
            debouncedFn();
            debouncedFn();
            debouncedFn();
            
            // Should not have been called yet
            expect(callCount).toBe(0);
            
            // Wait for debounce period
            setTimeout(() => {
                expect(callCount).toBe(1);
                done();
            }, 150);
        });
    });

    describe('throttle', () => {
        test('throttles function calls', (done) => {
            let callCount = 0;
            const throttledFn = Utils.throttle(() => {
                callCount++;
            }, 100);
            
            // Call multiple times quickly
            throttledFn();
            throttledFn();
            throttledFn();
            
            // Should have been called once immediately
            expect(callCount).toBe(1);
            
            // Wait and call again
            setTimeout(() => {
                throttledFn();
                expect(callCount).toBe(2);
                done();
            }, 150);
        });
    });

    describe('deepClone', () => {
        test('clones objects deeply', () => {
            const original = {
                name: 'Test',
                nested: {
                    value: 42,
                    array: [1, 2, 3]
                },
                date: new Date('2024-01-01')
            };
            
            const cloned = Utils.deepClone(original);
            
            expect(cloned).toEqual(original);
            expect(cloned).not.toBe(original);
            expect(cloned.nested).not.toBe(original.nested);
            expect(cloned.nested.array).not.toBe(original.nested.array);
            expect(cloned.date).not.toBe(original.date);
        });

        test('handles primitive values', () => {
            expect(Utils.deepClone(42)).toBe(42);
            expect(Utils.deepClone('hello')).toBe('hello');
            expect(Utils.deepClone(null)).toBe(null);
            expect(Utils.deepClone(undefined)).toBe(undefined);
        });
    });

    describe('formatFileSize', () => {
        test('formats file sizes correctly', () => {
            expect(Utils.formatFileSize(0)).toBe('0 Bytes');
            expect(Utils.formatFileSize(1024)).toBe('1 KB');
            expect(Utils.formatFileSize(1048576)).toBe('1 MB');
            expect(Utils.formatFileSize(1073741824)).toBe('1 GB');
            expect(Utils.formatFileSize(1536)).toBe('1.5 KB');
        });
    });

    describe('isMobileDevice', () => {
        test('detects mobile devices', () => {
            const result = Utils.isMobileDevice();
            expect(typeof result).toBe('boolean');
        });
    });

    describe('now', () => {
        test('returns current timestamp', () => {
            const timestamp = Utils.now();
            expect(typeof timestamp).toBe('number');
            expect(timestamp).toBeGreaterThan(0);
        });
    });

    describe('sleep', () => {
        test('sleeps for specified time', async () => {
            const start = Date.now();
            await Utils.sleep(100);
            const end = Date.now();
            
            expect(end - start).toBeGreaterThanOrEqual(90); // Allow some variance
        });
    });
});
