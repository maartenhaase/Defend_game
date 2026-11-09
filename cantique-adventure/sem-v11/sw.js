// Privacy refresh: prevent an older offline cache from bypassing the new code screen.
// This worker retires itself and clears only this game's previous caches.
self.addEventListener('install',event=>{
  event.waitUntil(self.skipWaiting());
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const names=await caches.keys();
    await Promise.all(names.filter(name=>name.startsWith('sem-cantique-')).map(name=>caches.delete(name)));
    await self.registration.unregister();
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',event=>{
  if(event.request.mode==='navigate'){
    event.respondWith(fetch(event.request,{cache:'no-store'}));
  }
});
