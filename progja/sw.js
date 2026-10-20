// Service worker Progja GA: hanya untuk notifikasi perangkat (tanpa cache offline).
self.addEventListener("install",()=>self.skipWaiting());
self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));
self.addEventListener("notificationclick",e=>{
  e.notification.close();
  e.waitUntil(self.clients.matchAll({type:"window",includeUncontrolled:true}).then(ws=>{
    for(const w of ws){if("focus" in w){w.navigate&&w.navigate("./#tugas");return w.focus();}}
    return self.clients.openWindow("./#tugas");
  }));
});
