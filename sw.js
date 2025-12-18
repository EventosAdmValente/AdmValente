const CACHE_NAME = 'adm-valente-cache-v3';

// Recursos críticos que devem ser cacheados para funcionamento offline
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
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

// Instalação robusta: não falha se um recurso individual falhar e aceita respostas opacas das CDNs
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      console.log('Instalando Service Worker...');
      const promises = STATIC_ASSETS.map(async url => {
        try {
          const response = await fetch(url, { mode: 'no-cors' }); // Garante que CDNs não barrem a requisição
          // No modo 'no-cors', a resposta é opaca (status 0). Aceitamos status 0 ou 200.
          if (response.status === 200 || response.status === 0) {
            return cache.put(url, response);
          }
        } catch (e) {
          console.warn(`Falha ao cachear recurso no install: ${url}`, e);
        }
      });
      return Promise.allSettled(promises);
    })
  );
  self.skipWaiting();
});

// Ativação e limpeza de versões antigas
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  return self.clients.claim();
});

// Estratégia de Fetch corrigida: Clona o stream e aceita respostas de CDNs
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  // IMPORTANTE: Deixa o Firebase gerenciar seus próprios dados e autenticação
  // Se o SW tentar cachear estas URLs, ele quebrará a sincronização em tempo real
  const url = event.request.url;
  if (url.includes('firestore.googleapis.com') || 
      url.includes('identitytoolkit.googleapis.com') ||
      url.includes('firebase-installations.googleapis.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Cria a promessa de rede para buscar e atualizar o cache
      const networkFetch = fetch(event.request).then(networkResponse => {
        // Validação: Aceita 200 (sucesso) ou 0 (opaca/CDN)
        if (networkResponse && (networkResponse.status === 200 || networkResponse.status === 0)) {
          const responseToCache = networkResponse.clone(); // CORREÇÃO: Clona para não consumir o stream
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Se a rede falhar, o erro é capturado aqui para não quebrar a execução
        return null; 
      });

      // Retorna o cache se existir, senão espera pela rede
      // Isso garante que o esqueleto carregue instantaneamente
      return cachedResponse || networkFetch;
    })
  );
});
