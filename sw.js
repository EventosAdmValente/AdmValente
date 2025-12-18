const CACHE_NAME = 'adm-valente-cache-v2';

// Recursos críticos que devem ser cacheados para funcionamento offline
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&display=swap',
  'https://unpkg.com/lucide@0.469.0/dist/umd/lucide.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js'
];

// Instalação robusta: não falha se um recurso individual falhar
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      console.log('Instalando Service Worker e cacheando assets...');
      const promises = STATIC_ASSETS.map(async url => {
        try {
          // Tentativa de cachear cada recurso individualmente
          const response = await fetch(url);
          if (response.ok || response.type === 'opaque') {
            return cache.put(url, response);
          }
        } catch (e) {
          console.warn(`Falha ao cachear recurso durante install: ${url}`, e);
        }
      });
      return Promise.allSettled(promises);
    })
  );
  self.skipWaiting();
});

// Limpeza de caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  return self.clients.claim();
});

// Estratégia de Fetch: Cache-First com Fallback de Rede e Cache Dinâmico
self.addEventListener('fetch', event => {
  // Ignorar requisições que não sejam GET
  if (event.request.method !== 'GET') return;
  
  // Ignorar requisições para o Firestore/Auth (o Firebase gerencia seu próprio offline)
  if (event.request.url.includes('firestore.googleapis.com') || 
      event.request.url.includes('identitytoolkit.googleapis.com')) return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Se está no cache, retorna imediatamente
      if (cachedResponse) {
        // Opcional: Atualiza o cache em background (Stale-While-Revalidate)
        fetch(event.request).then(networkResponse => {
           if (networkResponse && networkResponse.ok) {
             caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkResponse));
           }
        }).catch(() => {});
        
        return cachedResponse;
      }

      // Se não está no cache, busca na rede
      return fetch(event.request).then(networkResponse => {
        // Valida se a resposta é digna de cache (sucesso ou opaque de CDN)
        if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(err => {
        // Fallback para navegação: se a rede falhar e for uma página, retorna o index.html
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html') || caches.match('./');
        }
        throw err;
      });
    })
  );
});
