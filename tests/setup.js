/**
 * Jest setup file for VetScribe tests
 * This file runs before each test suite
 */

// Mock browser APIs that might not be available in test environment
global.MediaRecorder = class MockMediaRecorder {
    constructor() {
        this.state = 'inactive';
        this.ondataavailable = null;
        this.onstop = null;
        this.onerror = null;
    }
    
    start() {
        this.state = 'recording';
    }
    
    stop() {
        this.state = 'inactive';
        if (this.onstop) {
            this.onstop();
        }
    }
    
    pause() {
        this.state = 'paused';
    }
    
    resume() {
        this.state = 'recording';
    }
};

global.AudioContext = class MockAudioContext {
    constructor() {
        this.state = 'suspended';
    }
    
    createMediaStreamSource() {
        return {
            connect: jest.fn(),
            disconnect: jest.fn()
        };
    }
    
    createAnalyser() {
        return {
            connect: jest.fn(),
            disconnect: jest.fn(),
            getByteFrequencyData: jest.fn(),
            fftSize: 256,
            frequencyBinCount: 128
        };
    }
    
    resume() {
        this.state = 'running';
        return Promise.resolve();
    }
    
    suspend() {
        this.state = 'suspended';
        return Promise.resolve();
    }
    
    close() {
        this.state = 'closed';
        return Promise.resolve();
    }
};

global.webkitAudioContext = global.AudioContext;

// Mock Speech Recognition API
global.webkitSpeechRecognition = class MockSpeechRecognition {
    constructor() {
        this.continuous = false;
        this.interimResults = false;
        this.lang = 'en-US';
        this.onstart = null;
        this.onresult = null;
        this.onerror = null;
        this.onend = null;
    }
    
    start() {
        if (this.onstart) {
            this.onstart();
        }
    }
    
    stop() {
        if (this.onend) {
            this.onend();
        }
    }
    
    abort() {
        if (this.onend) {
            this.onend();
        }
    }
};

global.SpeechRecognition = global.webkitSpeechRecognition;

// Mock navigator.mediaDevices
Object.defineProperty(global.navigator, 'mediaDevices', {
    value: {
        getUserMedia: jest.fn().mockResolvedValue({
            getTracks: () => [{
                stop: jest.fn(),
                getSettings: () => ({ deviceId: 'mock-device' })
            }]
        }),
        enumerateDevices: jest.fn().mockResolvedValue([
            {
                deviceId: 'mock-audio-input',
                kind: 'audioinput',
                label: 'Mock Microphone'
            }
        ])
    },
    writable: true
});

// Mock clipboard API
Object.defineProperty(global.navigator, 'clipboard', {
    value: {
        writeText: jest.fn().mockResolvedValue(),
        readText: jest.fn().mockResolvedValue('mock clipboard content')
    },
    writable: true
});

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    length: 0,
    key: jest.fn()
};

Object.defineProperty(global, 'localStorage', {
    value: localStorageMock,
    writable: true
});

// Mock fetch API
global.fetch = jest.fn();

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-blob-url');
global.URL.revokeObjectURL = jest.fn();

// Mock Blob constructor
global.Blob = class MockBlob {
    constructor(content, options) {
        this.content = content;
        this.type = options?.type || '';
        this.size = content ? content.join('').length : 0;
    }
};

// Mock File constructor
global.File = class MockFile extends global.Blob {
    constructor(content, name, options) {
        super(content, options);
        this.name = name;
        this.lastModified = Date.now();
    }
};

// Mock console methods to reduce noise in tests
const originalConsole = global.console;
global.console = {
    ...originalConsole,
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn()
};

// Restore console for specific tests if needed
global.restoreConsole = () => {
    global.console = originalConsole;
};

// Mock timers
jest.useFakeTimers();

// Clean up after each test
afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    localStorage.clear();
});

// Global test utilities
global.createMockEvent = (type, properties = {}) => {
    const event = new Event(type);
    Object.assign(event, properties);
    return event;
};

global.createMockElement = (tagName, properties = {}) => {
    const element = document.createElement(tagName);
    Object.assign(element, properties);
    return element;
};

// Mock performance API
global.performance = {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByType: jest.fn(() => []),
    getEntriesByName: jest.fn(() => [])
};

console.log('🧪 Jest setup complete - VetScribe test environment ready');
