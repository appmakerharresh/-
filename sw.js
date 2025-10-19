const CLIENT_ID = "Ov23liBHw2DVbvcckYY0";
const GITHUB_API = `https://api.github.com/repos/appmakerharresh/mydns/contents/record.json?client_id=${CLIENT_ID}`;
const FALLBACK = "https://appmakerharresh.github.io/404/";

// Install & activate SW immediately
self.addEventListener('install', event => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(clients.claim()));

// Always fetch latest DNS mapping from GitHub
async function getDNSMap() {
    try {
        const res = await fetch(GITHUB_API);
        const data = await res.json();
        return JSON.parse(atob(data.content)); // decode Base64
    } catch (err) {
        console.error('Failed to fetch DNS map:', err);
        return {}; // fallback empty mapping
    }
}

// Intercept all fetch requests
self.addEventListener('fetch', event => {
    event.respondWith((async () => {
        const dns = await getDNSMap();
        const url = new URL(event.request.url);
        const target = dns[url.hostname];

        if (target) {
            let fetchUrl = target;
            if (!fetchUrl.endsWith('/') && url.pathname !== '/') fetchUrl += url.pathname;

            try {
                const resp = await fetch(fetchUrl);
                const body = await resp.text();
                return new Response(body, {
                    headers: { "Content-Type": resp.headers.get("Content-Type") || "text/html" }
                });
            } catch (err) {
                const fallbackResp = await fetch(FALLBACK);
                return new Response(await fallbackResp.text(), { headers: { "Content-Type": "text/html" } });
            }
        } else {
            const fallbackResp = await fetch(FALLBACK);
            return new Response(await fallbackResp.text(), { headers: { "Content-Type": "text/html" } });
        }
    })());
});
