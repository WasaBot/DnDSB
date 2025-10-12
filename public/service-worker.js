const CACHE_NAME = 'dnd-spellbook-v2';
const SUPABASE_CACHE = 'supabase-api-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Cache strategies for different types of data
const CACHE_STRATEGIES = {
  // Static game data that rarely changes
  LONG_TERM: ['spells', 'classes', 'subclasses', 'spellslots', 'attributes', 'class_resources'],
  // Dynamic user data that changes more frequently
  SHORT_TERM: ['characters', 'user_spells'],
  // Real-time data that should always be fresh
  NO_CACHE: ['auth', 'realtime']
};

// Cache duration in milliseconds
const CACHE_DURATION = {
  LONG_TERM: 7 * 24 * 60 * 60 * 1000, // 7 days
  SHORT_TERM: 3 * 60 * 60 * 1000, // 3 hours
};

self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS)),
      caches.open(SUPABASE_CACHE)
    ])
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => ![CACHE_NAME, SUPABASE_CACHE].includes(key))
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

function isSupabaseRequest(url) {
  return url.includes('supabase.co') || url.includes('supabase.io');
}

function getTableFromUrl(url) {
  const match = url.match(/\/rest\/v1\/([^?]+)/);
  return match ? match[1] : null;
}

function getCacheStrategy(table) {
  if (CACHE_STRATEGIES.LONG_TERM.includes(table)) return 'LONG_TERM';
  if (CACHE_STRATEGIES.SHORT_TERM.includes(table)) return 'SHORT_TERM';
  return 'NO_CACHE';
}

function isExpired(timestamp, strategy) {
  if (!timestamp) return true;
  const now = Date.now();
  const duration = CACHE_DURATION[strategy];
  return (now - timestamp) > duration;
}

async function handleSupabaseRequest(event) {
  const request = event.request;
  const url = request.url;
  const table = getTableFromUrl(url);
  const strategy = getCacheStrategy(table);

  // Don't cache non-GET requests or real-time data
  if (request.method !== 'GET' || strategy === 'NO_CACHE') {
    return fetch(request);
  }

  const cache = await caches.open(SUPABASE_CACHE);
  const cached = await cache.match(request);

  // Cache-first strategy: return cached data immediately if available
  if (cached) {  
    // Update cache in background if expired
    const cacheTime = cached.headers.get('sw-cache-time');
    if (cacheTime && isExpired(parseInt(cacheTime), strategy)) {
      // Background update - don't wait for it
      fetch(request).then(response => {
        if (response.ok) {
          const responseToCache = response.clone();
          const headers = new Headers(responseToCache.headers);
          headers.set('sw-cache-time', Date.now().toString());
          
          const cachedResponse = new Response(responseToCache.body, {
            status: responseToCache.status,
            statusText: responseToCache.statusText,
            headers: headers
          });
          
          cache.put(request, cachedResponse);
        }
      }).catch(error => {
        console.log(`Background update failed for ${table}:`, error);
      });
    }
    
    return cached;
  }

  // No cache available, fetch from network
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      // Clone the response and add cache timestamp
      const responseToCache = response.clone();
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cache-time', Date.now().toString());
      
      const cachedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      });
      
      cache.put(request, cachedResponse);
    }
    
    return response;
  } catch (error) {
    console.error('Network request failed:', error);
    
    // Return offline response for critical data
    if (strategy === 'LONG_TERM') {
      return new Response(JSON.stringify({ 
        error: "Offline and not cached",
        offline: true,
        table: table
      }), {
        status: 503,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    throw error;
  }
}

self.addEventListener('fetch', event => {
  const url = event.request.url;
  
  // Handle Supabase API requests
  if (isSupabaseRequest(url)) {
    event.respondWith(handleSupabaseRequest(event));
    return;
  }
  
  // Handle static assets
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});