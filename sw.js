var C='questling-v2',F=["./","index.html","manifest.webmanifest","css/app.css","js/state.js","js/art.js","js/fx.js","js/coach.js","js/views.js","js/app.js","icons/apple-touch-icon.png","icons/icon-192.png","icons/icon-512.png","fonts/fredoka-latin-500-normal.woff2","fonts/fredoka-latin-600-normal.woff2","fonts/fredoka-latin-700-normal.woff2","fonts/nunito-latin-400-normal.woff2","fonts/nunito-latin-600-normal.woff2","fonts/nunito-latin-700-normal.woff2","fonts/nunito-latin-800-normal.woff2"];
self.addEventListener('install',function(e){e.waitUntil(caches.open(C).then(function(c){return c.addAll(F)}).then(function(){return self.skipWaiting()}))});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(x){return x!==C}).map(function(x){return caches.delete(x)}))}).then(function(){return self.clients.claim()}))});
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
