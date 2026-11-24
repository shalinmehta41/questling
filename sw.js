var C='questling-v2-flat',F=["./","index.html","manifest.webmanifest","app.css","state.js","art.js","fx.js","coach.js","views.js","app.js","apple-touch-icon.png","icon-192.png","icon-512.png","fredoka-latin-500-normal.woff2","fredoka-latin-600-normal.woff2","fredoka-latin-700-normal.woff2","nunito-latin-400-normal.woff2","nunito-latin-600-normal.woff2","nunito-latin-700-normal.woff2","nunito-latin-800-normal.woff2"];
self.addEventListener('install',function(e){e.waitUntil(caches.open(C).then(function(c){return c.addAll(F)}).then(function(){return self.skipWaiting()}))});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.map(function(x){if(x!==C)return caches.delete(x)}))}).then(function(){return self.clients.claim()}))});
self.addEventListener('fetch',function(e){
  if(e.request.method!=='GET')return;
  e.respondWith(caches.match(e.request).then(function(r){
    if(r)return r;
    return fetch(e.request).then(function(res){
      if(res&&res.status===200&&res.type==='basic'){var cl=res.clone();caches.open(C).then(function(c){c.put(e.request,cl)})}
      return res;
    }).catch(function(){return caches.match('index.html')});
  }));
});
self.addEventListener('notificationclick',function(e){
  e.notification.close();
  e.waitUntil(clients.matchAll({type:'window'}).then(function(l){
    for(var i=0;i<l.length;i++){if('focus' in l[i])return l[i].focus()}
    if(clients.openWindow)return clients.openWindow('./index.html');
  }));
});
