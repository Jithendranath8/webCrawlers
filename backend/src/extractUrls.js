const { normalizeUrl } = require('./utils');

async function extractProductUrls(htmlContent, baseUrl, productName) {
    const regex = /href="(.*?)"/g;
    const productUrlPatterns = [
        new RegExp(`/${productName}/`),
        /\/product\//,
        /\/item\//,
        /\/dp\//,
        /\/p\//,
        /\/buy\//,
        /\/pd\//,
        /\/ip\//
    ];

    const urls = new Set();
    let match;

    while ((match = regex.exec(htmlContent)) !== null) {
        const href = match[1];
        const fullUrl = normalizeUrl(baseUrl, href);
        if (fullUrl && productUrlPatterns.some((pattern) => pattern.test(fullUrl))) {
            urls.add(fullUrl);
        }
    }

    return Array.from(urls);
}

module.exports = extractProductUrls;
