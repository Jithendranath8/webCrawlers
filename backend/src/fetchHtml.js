const puppeteer = require('puppeteer');

async function fetchHtml(browser, url, retries = 3) {
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

module.exports = fetchHtml;
