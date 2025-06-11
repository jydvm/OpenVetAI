/**
 * OpenVetAI Service Worker
 * Enables PWA functionality, offline support, and bypasses mixed content restrictions
 */

const CACHE_NAME = 'openvetai-v2.0.0';
const STATIC_CACHE = 'openvetai-static-v2.0.0';
const DYNAMIC_CACHE = 'openvetai-dynamic-v2.0.0';

// Files to cache for offline functionality
const STATIC_FILES = [
    '/',
    '/index.html',
    '/app.js',
    '/llm-connector.js',
    '/transcription.js',
    '/soap-formatter.js',
    '/data-validator.js',
    '/privacy-manager.js',
    '/error-handler.js',
    '/styles.css',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

// Install event - cache static files
self.addEventListener('install', event => {
    console.log('🔧 Service Worker installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('📦 Caching static files...');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('✅ Static files cached successfully');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('❌ Failed to cache static files:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('🚀 Service Worker activating...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('🗑️ Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ Service Worker activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, enable offline functionality
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Handle Ollama API requests (bypass CORS/mixed content restrictions)
    if (isOllamaRequest(url)) {
        event.respondWith(handleOllamaRequest(request));
        return;
    }
    
    // Handle static files with cache-first strategy
    if (isStaticFile(url)) {
        event.respondWith(
            caches.match(request)
                .then(response => {
                    return response || fetch(request)
                        .then(fetchResponse => {
                            return caches.open(DYNAMIC_CACHE)
                                .then(cache => {
                                    cache.put(request, fetchResponse.clone());
                                    return fetchResponse;
                                });
                        });
                })
                .catch(() => {
                    // Return offline fallback if available
                    if (request.destination === 'document') {
                        return caches.match('/index.html');
                    }
                })
        );
        return;
    }
    
    // Default: network first, cache fallback
    event.respondWith(
        fetch(request)
            .then(response => {
                // Cache successful responses
                if (response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(DYNAMIC_CACHE)
                        .then(cache => cache.put(request, responseClone));
                }
                return response;
            })
            .catch(() => {
                // Fallback to cache
                return caches.match(request);
            })
    );
});

// Handle Ollama API requests with proper CORS headers
async function handleOllamaRequest(request) {
    try {
        console.log('🔗 Proxying Ollama request:', request.url);
        
        // Create new request with proper headers
        const modifiedRequest = new Request(request.url, {
            method: request.method,
            headers: {
                ...Object.fromEntries(request.headers.entries()),
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            body: request.method !== 'GET' ? await request.blob() : undefined
        });
        
        const response = await fetch(modifiedRequest);
        
        // Add CORS headers to response
        const modifiedResponse = new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: {
                ...Object.fromEntries(response.headers.entries()),
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            }
        });
        
        console.log('✅ Ollama request successful');
        return modifiedResponse;
        
    } catch (error) {
        console.error('❌ Ollama request failed:', error);
        
        // Return error response with CORS headers
        return new Response(JSON.stringify({
            error: 'Failed to connect to Ollama',
            message: error.message,
            timestamp: new Date().toISOString()
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}

// Check if request is for Ollama API
function isOllamaRequest(url) {
    return url.port === '11434' || 
           url.pathname.startsWith('/api/') ||
           url.hostname.match(/^100\.\d+\.\d+\.\d+$/); // Tailscale IP pattern
}

// Check if request is for static file
function isStaticFile(url) {
    return url.origin === self.location.origin &&
           (STATIC_FILES.includes(url.pathname) || 
            url.pathname.endsWith('.js') ||
            url.pathname.endsWith('.css') ||
            url.pathname.endsWith('.html') ||
            url.pathname.endsWith('.png') ||
            url.pathname.endsWith('.ico'));
}

// Handle background sync for offline SOAP generation
self.addEventListener('sync', event => {
    if (event.tag === 'background-soap-generation') {
        console.log('🔄 Background sync: SOAP generation');
        event.waitUntil(processOfflineSOAPRequests());
    }
});

// Process offline SOAP requests when connection is restored
async function processOfflineSOAPRequests() {
    try {
        const cache = await caches.open(DYNAMIC_CACHE);
        const requests = await cache.keys();
        
        const soapRequests = requests.filter(req => 
            req.url.includes('soap-generation') && 
            req.headers.get('x-offline-request') === 'true'
        );
        
        for (const request of soapRequests) {
            try {
                await fetch(request);
                await cache.delete(request);
                console.log('✅ Processed offline SOAP request');
            } catch (error) {
                console.log('⏳ SOAP request still offline, will retry');
            }
        }
    } catch (error) {
        console.error('❌ Failed to process offline requests:', error);
    }
}

// Handle push notifications (future feature)
self.addEventListener('push', event => {
    if (event.data) {
        const data = event.data.json();
        console.log('📱 Push notification received:', data);
        
        event.waitUntil(
            self.registration.showNotification(data.title, {
                body: data.body,
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-72x72.png',
                tag: 'openvetai-notification'
            })
        );
    }
});

console.log('🎉 OpenVetAI Service Worker loaded successfully');
