const CACHE_NAME = 'adm-valente-v2';

// Arquivos vitais para o app funcionar offline
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  // Ícones (Certifique-se que a pasta icons existe no servidor)
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  // Bibliotecas Externas
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest',
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
      // Tenta cachear tudo. Se algum arquivo (ex: um ícone) faltar no servidor,
      // o cache falhará, mas o site ainda abre online.
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
  // O Firestore lida com sua própria persistência de dados via IndexedDB
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('firestore.googleapis.com')) return;
  if (event.request.url.includes('googleapis.com/auth')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Retorna do cache se existir, senão busca na rede
      return cachedResponse || fetch(event.request).then((response) => {
        return response;
      }).catch(() => {
        // Se estiver offline e não tiver no cache, não faz nada (ou poderia retornar uma página de fallback)
      });
    })
  );
});