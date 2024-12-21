const fetchHtmlWithPuppeteer = require('./fetchHtml');
const extractProductUrls = require('./extractUrls');
const { getSearchUrl } = require('./config');
const puppeteer = require('puppeteer');

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

module.exports = searchAndExtractProductUrls;
