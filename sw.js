const CACHE_NAME = 'adm-valente-v3';

// Arquivos vitais para o app funcionar offline
// NOTA: Usamos versões fixas e caminhos completos para evitar redirects que falham no cache offline.
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  // Ícones (Certifique-se que a pasta icons existe no servidor)
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  // Bibliotecas Externas (Versões Fixas)
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@0.469.0/dist/umd/lucide.min.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&display=swap',
  // Scripts do Firebase (versões específicas usadas no importmap do index.html)
  'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js',
  'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js',
  'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js',
  // Bibliotecas extras (PDF)
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js'
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Força o SW a ativar imediatamente
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Tenta cachear tudo.
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.error("Aviso: Falha ao cachear alguns arquivos (verifique se a pasta icons existe):", err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName); // Limpa caches antigos
          }
        })
      );
    })
  );
  self.clients.claim(); // Controla as páginas imediatamente
});

self.addEventListener('fetch', (event) => {
  // Ignora requisições que não sejam GET ou que sejam para o Firestore/Google APIs dinâmicas
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('firestore.googleapis.com')) return;
  if (event.request.url.includes('googleapis.com/auth')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Retorna do cache se existir, senão busca na rede
      return cachedResponse || fetch(event.request).then((response) => {
        return response;
      }).catch(() => {
        // Se estiver offline e não tiver no cache, não faz nada
      });
    })
  );
});
