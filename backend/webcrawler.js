const puppeteer = require('puppeteer');
const fs = require('fs');

function normalizeUrl(baseUrl, href) {
    try {
        const url = new URL(href, baseUrl);
        return url.href;
    } catch {
        console.error(`Invalid URL: ${href}`);
        return null;
    }
}

async function fetchHtmlWithPuppeteer(browser, url, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const page = await browser.newPage();
            await page.setUserAgent(
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            );
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                if (['image', 'stylesheet', 'font'].includes(request.resourceType())) {
                    request.abort();
                } else {
                    request.continue();
                }
            });
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
            const htmlContent = await page.content();
            await page.close();
            return htmlContent;
        } catch (error) {
            if (i === retries - 1) {
                console.error(`Error fetching ${url} after retries: ${error.message}`);
                return null;
            }
            console.log(`Retrying (${i + 1}/${retries}) for ${url}`);
        }
    }
}

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

function getSearchUrl(domain, productName) {
    const searchUrls = {
        'amazon.in': `https://www.amazon.in/s?k=${productName}`,
        'flipkart.com': `https://www.flipkart.com/search?q=${productName}`,
        'snapdeal.com': `https://www.snapdeal.com/search?keyword=${productName}`,
        'jiomart.com': `https://www.jiomart.com/search/${productName}`,
        'bigbasket.com': `https://www.bigbasket.com/ps/?q=${productName}`,
        'ajio.com': `https://www.ajio.com/search/?text=${productName}`,
        'meesho.com': `https://www.meesho.com/search?q=${productName}&searchType=manual&searchIdentifier=text_search`
    };

    const host = new URL(domain).host.replace(/^www\./, '');
    return searchUrls[host] || null;
}

async function searchAndExtractProductUrls(productName, domains) {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const groupedProductUrls = {};
    const formattedProductName = productName.replace(/\s+/g, '-');

    try {
        const results = await Promise.all(
            domains.map(async (domain) => {
                const searchUrl = getSearchUrl(domain, formattedProductName);
                if (!searchUrl) {
                    console.error(`Search URL not defined for domain: ${domain}`);
                    return null;
                }

                console.log(`Searching for "${productName}" on: ${domain}`);
                const htmlContent = await fetchHtmlWithPuppeteer(browser, searchUrl);
                if (!htmlContent) {
                    console.error(`Failed to fetch HTML content for search: ${searchUrl}`);
                    return null;
                }

                const baseUrl = new URL(domain).origin;
                const productUrls = await extractProductUrls(htmlContent, baseUrl, formattedProductName);
                const hostName = new URL(domain).host.split('.')[1];

                return { hostName, productUrls };
            })
        );

        results.forEach((result) => {
            if (result) {
                groupedProductUrls[result.hostName] = (groupedProductUrls[result.hostName] || []).concat(result.productUrls);
            }
        });
    } finally {
        await browser.close();
    }

    return groupedProductUrls;
}

(async () => {
    const productName = 'pant';
    const domains = [
        'https://www.amazon.in',
        'https://www.flipkart.com',
        'https://www.snapdeal.com',
        'https://www.jiomart.com',
        'https://www.bigbasket.com',
        'https://www.ajio.com',
        'https://www.meesho.com',
    ];

    const groupedUrls = await searchAndExtractProductUrls(productName, domains);

    fs.writeFileSync('productUrls.json', JSON.stringify(groupedUrls, null, 2));

    console.log('Product URLs are saved in productUrls.json');
})();
