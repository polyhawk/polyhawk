
async function debugTrades() {
    try {
        const response = await fetch('https://data-api.polymarket.com/trades?limit=5&sortBy=TIMESTAMP&sortDirection=DESC');
        if (response.ok) {
            const trades = await response.json();
            console.log('Sample Trades:', JSON.stringify(trades, null, 2));
        } else {
            console.error('Failed to fetch trades', response.status);
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

debugTrades();
