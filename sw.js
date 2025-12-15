const CACHE_NAME = 'adm-valente-v5';

// Arquivos vitais para o app funcionar offline
// NOTA: As URLs aqui DEVEM ser idênticas às usadas no index.html
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  // Ícones
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  // Bibliotecas CSS e Fontes
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&display=swap',
  // Lucide Icons (Versão Fixa)
  'https://unpkg.com/lucide@0.469.0/dist/umd/lucide.min.js',
  // Scripts do Firebase (Exatamente as versões do importmap)
  'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js',
  'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js',
  'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js',
  // Bibliotecas PDF
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.error("Erro ao cachear assets:", err);
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
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Ignora requisições que não sejam GET
  if (event.request.method !== 'GET') return;
  
  // Ignora requisições para a API do Firestore (deixe o SDK lidar com isso via IndexedDB)
  if (event.request.url.includes('firestore.googleapis.com')) return;
  if (event.request.url.includes('googleapis.com/auth')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Prioridade: Cache -> Rede
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        // Se falhar na rede e não tiver cache, não retorna nada (ou página de erro customizada)
        // Isso evita erros vermelhos no console em modo avião para assets não essenciais
      });
    })
  );
});
