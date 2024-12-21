function normalizeUrl(baseUrl, href) {
    try {
        const url = new URL(href, baseUrl);
        return url.href;
    } catch {
        console.error(`Invalid URL: ${href}`);
        return null;
    }
}

module.exports = { normalizeUrl };
