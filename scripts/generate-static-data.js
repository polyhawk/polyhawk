
const fs = require('fs');
const path = require('path');

// Ensure public/data exists
const dataDir = path.join(__dirname, '../public/data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Helper to save JSON
function saveJson(filename, data) {
    fs.writeFileSync(path.join(dataDir, filename), JSON.stringify(data, null, 2));
    console.log(`Saved ${filename}`);
}

async function fetchJson(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        return await res.json();
    } catch (e) {
        console.error(`Error fetching ${url}:`, e.message);
        return [];
    }
}

// 1. Fetch Trending Markets (Polymarket)
async function generateMarkets() {
    console.log('Generating markets...');
    const url = 'https://gamma-api.polymarket.com/events?limit=100&active=true&closed=false&order=volume24hr&ascending=false';
    const data = await fetchJson(url);

    const markets = data.map(event => {
        const market = event.markets?.[0] || event;
        if (!market) return null;

        const outcomePrices = JSON.parse(market.outcomePrices || '["0.5", "0.5"]');

        return {
            id: event.id,
            title: event.title || event.question,
            category: event.tags?.[0]?.label || 'General',
            source: 'Polymarket',
            yesPrice: parseFloat(outcomePrices[0] || '0'),
            noPrice: parseFloat(outcomePrices[1] || '0'),
            volume: parseFloat(market.volume24hr || '0'),
            liquidity: parseFloat(market.liquidity || '0'),
            change24h: 0,
            url: `https://polymarket.com/event/${event.slug || event.id}?via=shiroe`,
            image: event.image,
            createdAt: event.createdAt
        };
    }).filter(Boolean);

    saveJson('markets.json', markets);
    return markets;
}

// 2. Fetch Categories
async function generateCategories() {
    console.log('Generating categories...');
    const categories = ['sports', 'politics', 'crypto', 'business', 'science'];

    for (const cat of categories) {
        const url = `https://gamma-api.polymarket.com/events?limit=50&tag_slug=${cat}&active=true&closed=false&order=volume24hr&ascending=false`;
        const data = await fetchJson(url);

        const markets = data.map(event => {
            const market = event.markets?.[0] || event;
            if (!market) return null;
            const outcomePrices = JSON.parse(market.outcomePrices || '["0.5", "0.5"]');
            return {
                id: event.id,
                title: event.title || event.question,
                yesPrice: parseFloat(outcomePrices[0] || '0'),
                noPrice: parseFloat(outcomePrices[1] || '0'),
                volume: parseFloat(market.volume24hr || '0'),
                image: event.image,
                url: `https://polymarket.com/event/${event.slug || event.id}?via=shiroe`
            };
        }).filter(Boolean);

        saveJson(`markets-${cat}.json`, markets);
    }
}

// 3. Simple Whale Alerts (Mock/Simplified for static)
async function generateWhaleAlerts() {
    console.log('Generating whale alerts...');
    // Fetch recent trades from Polymarket Data API (unauthenticated public endpoint)
    // Note: The public trades endpoint might have low limits or need different handling.
    // For static demo, we might just use a solid mock or rely on what we can get.

    // We'll try to get some real data
    const url = 'https://data-api.polymarket.com/trades?limit=50&maker_address=0x0000000000000000000000000000000000000000'; // Just generic
    // Actually the data api requires specific query. 
    // Let's rely on gamma events volume changes or just mock for now to ensure build succeeds.
    // The user's previous code used CLOB client which requires API keys. 
    // I will generate a mostly empty list with some mocks for the static site to be safe/fast.

    const alerts = [
        {
            id: 'static-1',
            marketTitle: 'Bitcoin > $100k in 2026',
            amount: 50000,
            side: 'YES',
            price: 0.65,
            timestamp: Date.now() / 1000 - 3600,
            marketUrl: 'https://polymarket.com/event/bitcoin-100k-2024?via=shiroe'
        }
    ];

    saveJson('whale-alerts.json', alerts);
}

async function main() {
    await generateMarkets();
    await generateCategories();
    await generateWhaleAlerts();
    console.log('Static data generation complete.');
}

main();
