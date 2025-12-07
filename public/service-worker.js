// Derive a version string from the service worker URL (query param ?v=...) to bust caches on new deployments
const SW_VERSION = new URL(self.location.href).searchParams.get('v') || 'default';
const CACHE_NAME = `dnd-spellbook-v2-${SW_VERSION}`;
const SUPABASE_CACHE = `supabase-api-v2`;
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
  console.log('Service Worker installing with cache version:', CACHE_NAME);
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then(cache => {
        console.log('Caching static assets:', STATIC_ASSETS);
        return cache.addAll(STATIC_ASSETS).catch(error => {
          console.error('Failed to cache static assets:', error);
          // Try to cache them individually to identify the problematic one
          return Promise.allSettled(
            STATIC_ASSETS.map(asset => 
              cache.add(asset).catch(err => 
                console.error(`Failed to cache ${asset}:`, err)
              )
            )
          );
        });
      }),
      caches.open(SUPABASE_CACHE)
    ])
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => {
            if (key === CACHE_NAME || key === SUPABASE_CACHE) return false;
            if (key.startsWith('dnd-spellbook-v2-')) return true;
            return false;
          })
          .map(key => {
            console.log('Deleting old cache:', key);
            return caches.delete(key);
          })
      );
    })
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

  const cache = await caches.open(SUPABASE_CACHE);
  const cached = await cache.match(request);

  if (request.method !== 'GET') {
    try {
      return await fetch(request);
    } catch (error) {
      if (cached) return cached;
      throw error;
    }
  }

  if (strategy === 'NO_CACHE') {
    try {
      const response = await fetch(request);
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
      return response;
    } catch (error) {
      if (cached) return cached;
      throw error;
    }
  }
  
  if (cached) {  
    const cacheTime = cached.headers.get('sw-cache-time');
    if (cacheTime && isExpired(parseInt(cacheTime), strategy)) {
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

  try {
    const response = await fetch(request);
    
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
    
    return response;
  } catch (error) {
    console.error('Network request failed for', table, ':', error);
    console.log('Attempting to serve from cache for offline access');
    
    const fallbackCache = await cache.match(request);
    if (fallbackCache) {
      console.log('Serving stale cache for', table, 'while offline');
      return fallbackCache;
    }
    
    console.error('No cached data available for', table, 'while offline');
    return new Response(JSON.stringify({ 
      error: "Offline and not cached",
      offline: true,
      table: table
    }), {
      status: 503,
      headers: { "Content-Type": "application/json" }
    });
  }
}

self.addEventListener('fetch', event => {
  const url = event.request.url;
  
  if (isSupabaseRequest(url)) {
    event.respondWith(handleSupabaseRequest(event));
    return;
  }
  
  event.respondWith(
    caches.open(CACHE_NAME).then(async cache => {
      let response = await cache.match(event.request);
      
      if (response) {
        return response;
      }
      
      if (event.request.mode === 'navigate') {
        const indexResponse = await cache.match('/index.html') || await cache.match('/');
        if (indexResponse) {
          return indexResponse;
        }
      }
      
      try {
        const networkResponse = await fetch(event.request);
        if (networkResponse.ok) {
          cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      } catch (error) {
        console.error('Failed to fetch:', event.request.url, error);
        
        if (event.request.mode === 'navigate') {
          const indexResponse = await cache.match('/index.html') || await cache.match('/');
          if (indexResponse) {
            return indexResponse;
          }
          return new Response('<!DOCTYPE html><html><body><h1>Offline</h1><p>App is offline and page not cached.</p></body></html>', {
            headers: { 'Content-Type': 'text/html' }
          });
        }
        
        throw error;
      }
    })
  );
});