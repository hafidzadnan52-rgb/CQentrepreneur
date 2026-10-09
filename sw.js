// Service worker Cahaya Entrepreneur — naikkan CACHE saat index.html diperbarui
const CACHE='cq-entrepreneur-v3.11.0';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png','./favicon-48.png'];
const CDN=/^https:\/\/(cdn\.jsdelivr\.net|www\.gstatic\.com\/firebasejs)\//;
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>Promise.all(SHELL.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  // Firestore, Google Drive, OpenRouter, dsb. tidak pernah lewat cache
  if(url.origin!==location.origin&&!CDN.test(req.url))return;
  // Halaman: jaringan dulu (agar update cepat), cache bila offline
  if(req.mode==='navigate'){
    e.respondWith(fetch(req).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put('./index.html',cp));return r}).catch(()=>caches.match('./index.html').then(r=>r||caches.match('./'))));
    return;
  }
  // Aset statis & pustaka CDN: cache dulu, perbarui di belakang layar
  e.respondWith(caches.match(req).then(hit=>{
    const net=fetch(req).then(r=>{if(r&&r.status===200){const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp))}return r}).catch(()=>hit);
    return hit||net;
  }));
});
