const CLIENT_ID = "Ov23liBHw2DVbvcckYY0";
const GITHUB_API = `https://api.github.com/repos/appmakerharresh/mydns/contents/record.json?client_id=${CLIENT_ID}`;
const FALLBACK = "https://appmakerharresh.github.io/404/";

let dnsMap = {};

// Fetch and decode DNS map safely
async function getDNSMap() {
  try {
    const res = await fetch(GITHUB_API);
    const data = await res.json();

    if (!data.content) {
      console.error("record.json not found or content missing");
      return {};
    }

    const base64 = data.content.replace(/\n/g, '');
    return JSON.parse(atob(base64));
  } catch (e) {
    console.error("Failed to fetch DNS map:", e);
    return {};
  }
}

// Install
self.addEventListener('install', event => self.skipWaiting());

// Activate
self.addEventListener('activate', event => self.clients.claim());

// Fetch interception
self.addEventListener('fetch', async event => {
  if (!dnsMap || Object.keys(dnsMap).length === 0) {
    dnsMap = await getDNSMap();
  }

  const url = new URL(event.request.url);
  const target = dnsMap[url.hostname];

  if (target) {
    event.respondWith(fetch(target).catch(() => fetch(FALLBACK)));
  } else {
    event.respondWith(fetch(event.request).catch(() => fetch(FALLBACK)));
  }
});
