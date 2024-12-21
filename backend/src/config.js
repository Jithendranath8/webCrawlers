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

module.exports = { getSearchUrl };
