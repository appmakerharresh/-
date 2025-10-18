self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // Only handle requests in this site
    if (url.origin === location.origin) {
        event.respondWith(
            fetch(event.request).catch(() => {
                // Serve 404 from the other repo
                return fetch('https://appmakerharresh.github.io/404/index.html')
                    .then(resp => resp.text())
                    .then(html => {
                        // Inject original URL
                        html = html.replace(
                            /document\.getElementById\('broken-url'\)\.textContent = window\.location\.href;/,
                            `document.getElementById('broken-url').textContent = "${url.href}";`
                        );
                        return new Response(html, { headers: {'Content-Type': 'text/html'} });
                    });
            })
        );
    }
});
