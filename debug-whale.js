
// Mock 'fetch' for Node environment if needed, or rely on Next.js/Node 18+ global fetch
// We will just copy the logic effectively or import if we can run ts-node.
// Since running ts-node on a file importing '@/lib/api' is hard due to aliases,
// I will write a script that REPLICATES the logic of fetchWhaleAlertsV2 exactly, 
// using generic imports, to see what the API returns.

async function debugWhaleAlerts() {
    console.log('--- Starting Debug ---');

    // 1. Fetch Events
    console.log('Fetching Events...');
    let events = [];
    try {
        const eventsResponse = await fetch('https://gamma-api.polymarket.com/events?limit=500&active=true&closed=false&order=volume24hr&ascending=false');
        if (eventsResponse.ok) {
            events = await eventsResponse.json();
            console.log(`Fetched ${events.length} events.`);
        } else {
            console.log('Events fetch failed:', eventsResponse.status, eventsResponse.statusText);
        }
    } catch (e) {
        console.error('Events network error:', e);
    }

    const conditionToEvent = new Map();
    if (Array.isArray(events)) {
        for (const event of events) {
            const cat = event.tags?.[0]?.label || event.tags?.[0] || event.category || 'Other';

            // Log structure of first event for debug
            if (conditionToEvent.size === 0) {
                // console.log('DEBUG: First Event Structure:', JSON.stringify(event, null, 2));
            }

            if (event.markets) {
                for (const market of event.markets) {
                    // The Data API returns 'conditionId' which matches `condition_id` or `id` in gamma markets.
                    const data = { title: event.title, slug: event.slug, category: cat };

                    if (market.condition_id) conditionToEvent.set(market.condition_id, data);
                    if (market.id) conditionToEvent.set(market.id, data);
                    if (market.asset_id) conditionToEvent.set(market.asset_id, data);
                    if (market.questionID) conditionToEvent.set(market.questionID, data);
                }
            } else {
                // Sometimes event IS the market?
                // console.log('DEBUG: Event has no markets array:', event.id);
            }
        }
    }
    console.log(`Mapped ${conditionToEvent.size} conditions.`);

    // 2. Fetch Trades
    console.log('Fetching Trades...');
    const url = `https://data-api.polymarket.com/trades?limit=1000&sortBy=TIMESTAMP&sortDirection=DESC`;
    const tradeRes = await fetch(url);
    const trades = await tradeRes.json();
    console.log(`Fetched ${trades.length} trades.`);

    if (trades.length > 0) {
        console.log('Sample Trade:', JSON.stringify(trades[0], null, 2));
        const sampleId = trades[0].conditionId;
        console.log(`Checking Map for Sample ID: ${sampleId}`);
        if (conditionToEvent.has(sampleId)) {
            console.log('MATCH FOUND in Map for Sample ID');
        } else {
            console.log('NO MATCH in Map for Sample ID');
            // Log a few keys to see format
            console.log('Sample Map Keys:', Array.from(conditionToEvent.keys()).slice(0, 3));
        }
    }

    // 3. Filter
    let matches = 0;
    const MIN_WHALE_VALUE = 10; // Drastically lower for debugging

    for (const trade of trades) {
        // Safe Parse
        const size = parseFloat(trade.size || '0');
        const price = parseFloat(trade.price || '0');
        const amount = parseFloat(trade.amount || '0'); // Sometimes 'amount' is usd value?

        let tradeValue = 0;
        if (size > 0) tradeValue = size * price;
        else tradeValue = amount;

        // Check Value
        if (tradeValue >= MIN_WHALE_VALUE) {
            // Check Map
            const conditionId = trade.conditionId || trade.asset || 'unknown';
            const eventInfo = conditionToEvent.get(conditionId);

            if (eventInfo) {
                matches++;
                if (matches <= 3) {
                    console.log(`MATCH #${matches}: $${tradeValue.toFixed(2)} on "${eventInfo.title}"`);
                }
            } else {
                // console.log(`Missed Map for $${tradeValue}: ${conditionId}`);
            }
        }
    }

    console.log(`Total Matches: ${matches}`);

    if (matches === 0) {
        console.log('PROBLEM: No matches found. Either Value threshold too high or Map lookup failing.');
    }
}

debugWhaleAlerts();
