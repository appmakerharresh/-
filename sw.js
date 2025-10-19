const GITHUB_API = "https://api.github.com/repos/appmakerharresh/-/contents/record.json?client_id=Ov23liBHw2DVbvcckYY0";
let dnsMap = {};

// Fetch and decode DNS map safely
async function getDNSMap() {
  try {
    const res = await fetch(GITHUB_API);
    const data = await res.json();

    if(!data.content) {
      console.error("record.json not found or content missing");
      return {};
    }

    // Remove line breaks in Base64 and decode
    const base64 = data.content.replace(/\n/g,'');
    const map = JSON.parse(atob(base64));
    return map;
  } catch(e) {
    console.error("Failed to fetch DNS map:", e);
    return {};
  }
}

// Install Service Worker
self.addEventListener('install', event => {
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', event => {
  self.clients.claim();
});

// Intercept fetch requests
self.addEventListener('fetch', async event => {
  if(!dnsMap || Object.keys(dnsMap).length === 0) {
    dnsMap = await getDNSMap();
  }

  const url = new URL(event.request.url);
  const mapped = dnsMap[url.hostname];
  
  if(mapped) {
    event.respondWith(fetch(mapped).catch(() => fetch('https://appmakerharresh.github.io/404/')));
  } else {
    event.respondWith(fetch(event.request).catch(() => fetch('https://appmakerharresh.github.io/404/')));
  }
});
