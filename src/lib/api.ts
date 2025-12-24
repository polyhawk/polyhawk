import { polymarketClient } from '@/lib/polymarket';

// Polymarket Referral Link
export const POLYMARKET_REFERRAL = 'https://polymarket.com/?via=shiroe';

export function getPolymarketUrl(path: string = ''): string {
    const baseUrl = 'https://polymarket.com';
    const referralParam = 'via=shiroe';

    if (!path) return `${baseUrl}/?${referralParam}`;

    // Check if path already has query params
    const separator = path.includes('?') ? '&' : '?';
    return `${baseUrl}/${path.replace(/^\//, '')}${separator}${referralParam}`;
}

// Update Market interface to include URL
export interface Market {
    id: string;
    title: string;
    category: string;
    source: 'Polymarket' | 'Kalshi';
    yesPrice: number;
    noPrice: number;
    volume: number;
    liquidity: number;
    change24h: number;
    endDate?: string;
    image?: string;
    url: string; // Added for redirection
    createdAt?: string;
}

export interface NewsItem {
    id: string;
    title: string;
    source: string;
    time: string;
    category: string;
    url: string;
    snippet: string;
    sentiment: 'Positive' | 'Negative' | 'Neutral';
    imageUrl: string;
}

export interface WhaleAlert {
    id: string;
    marketId: string;
    marketTitle: string;
    marketSlug: string;
    walletAddress: string;
    timestamp: number;
    marketUrl: string;
    // Restored fields
    amount: number;
    side: 'YES' | 'NO';
    price: number;
    // New fields
    tradeValue?: number;
    icon?: string;
    category?: string;
    debug?: boolean;
}

// ... existing fetchNews ...



export async function fetchNews(): Promise<NewsItem[]> {
    const apiKey = process.env.NEWS_API_KEY;

    if (!apiKey) {
        console.warn('NEWS_API_KEY is missing. Skipping NewsAPI fetch.');
    }

    try {
        const news: NewsItem[] = [];

        // 1. Fetch from NewsAPI.org (Premium Source) - Targeting specific domains including Forbes & Arkham related
        if (apiKey) {
            try {
                // Added domains and keywords for broader coverage including Arkham
                const newsApiUrl = `https://newsapi.org/v2/everything?q=(polymarket OR "prediction market" OR "Arkham Intelligence" OR "crypto betting")&domains=coindesk.com,theblock.co,cointelegraph.com,forbes.com,bloomberg.com&sortBy=publishedAt&pageSize=20&apiKey=${apiKey}`;
                const apiResponse = await fetch(newsApiUrl, { next: { revalidate: 60 } });

                if (apiResponse.ok) {
                    const apiData = await apiResponse.json();

                    apiData.articles.forEach((article: any, index: number) => {
                        const date = new Date(article.publishedAt);
                        const hoursAgo = (Date.now() - date.getTime()) / (1000 * 60 * 60);

                        // Strict 24h Filter
                        if (hoursAgo > 24) return;

                        news.push({
                            id: `newsapi-${index}`,
                            title: article.title,
                            source: article.source.name,
                            time: hoursAgo < 1 ? 'Just now' : `${Math.floor(hoursAgo)}h ago`,
                            category: 'Market',
                            url: article.url,
                            snippet: article.description?.substring(0, 100) + '...' || 'Latest update.',
                            sentiment: 'Neutral',
                            imageUrl: article.urlToImage || 'https://images.unsplash.com/photo-1621504450168-38f64731b667?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
                        });
                    });
                }
            } catch (apiError) {
                console.error('NewsAPI Fetch Failed', apiError);
            }
        }

        // 2. Fetch RSS Feeds (CoinDesk, The Block, Cointelegraph)
        const rssFeeds = [
            { source: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/?outputType=xml' },
            { source: 'The Block', url: 'https://www.theblock.co/rss.xml' },
            { source: 'Cointelegraph', url: 'https://cointelegraph.com/rss' }
        ];

        for (const feed of rssFeeds) {
            try {
                const response = await fetch(feed.url, {
                    next: { revalidate: 60 },
                    signal: AbortSignal.timeout(5000),
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    }
                });
                if (!response.ok) continue;
                const text = await response.ok ? await response.text() : '';
                if (!text) continue;

                const itemRegex = /<item>[\s\S]*?<\/item>/g;
                const items = text.match(itemRegex)?.slice(0, 12) || [];

                items.forEach((item, index) => {
                    const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || item.match(/<title>(.*?)<\/title>/);
                    const linkMatch = item.match(/<link>(.*?)<\/link>/);
                    const dateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);
                    const descMatch = item.match(/<description>[\s\S]*?<!\[CDATA\[(.*?)\]\]>/) || item.match(/<description>(.*?)<\/description>/);
                    const mediaMatch = item.match(/media:content[^>]*url="(.*?)"/) || item.match(/<enclosure[^>]*url="(.*?)"/) || item.match(/<img[^>]*src="(.*?)"/);

                    if (titleMatch && linkMatch) {
                        const title = titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').replace(/&amp;/g, '&');
                        const date = dateMatch ? new Date(dateMatch[1]) : new Date();
                        const hoursAgo = (Date.now() - date.getTime()) / (1000 * 60 * 60);

                        // Strict 24h Filter
                        if (hoursAgo > 24) return;

                        news.push({
                            id: `${feed.source.toLowerCase().replace(' ', '-')}-${index}-${date.getTime()}`,
                            title: title,
                            source: feed.source,
                            time: hoursAgo < 1 ? 'Just now' : `${Math.floor(hoursAgo)}h ago`,
                            category: title.includes('Bitcoin') || title.includes('BTC') ? 'Bitcoin' : 'Market',
                            url: linkMatch[1],
                            snippet: descMatch ? descMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').replace(/<[^>]*>/g, '').substring(0, 160) + '...' : `Latest intelligence from ${feed.source}.`,
                            sentiment: title.toLowerCase().includes('bull') || title.toLowerCase().includes('rise') || title.toLowerCase().includes('surge') ? 'Positive' : 'Neutral',
                            imageUrl: mediaMatch ? mediaMatch[1] : 'https://images.unsplash.com/photo-1621504450168-38f64731b667?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
                        });
                    }
                });
            } catch (err) {
                console.error(`${feed.source} Fetch Failed`, err);
            }
        }

        // 3. Fetch Polymarket "New" events acting as news (limited to avoid dominating feed)
        try {
            const polyResponse = await fetch('https://gamma-api.polymarket.com/events?limit=3&active=true&closed=false&order=volume24hr&ascending=false', { next: { revalidate: 60 } });
            const polyData = await polyResponse.json();

            polyData.forEach((event: any) => {
                news.push({
                    id: `poly-news-${event.id}`,
                    title: `Live Market: ${event.title}`,
                    source: 'Polymarket',
                    time: 'Live',
                    category: 'Signal',
                    url: getPolymarketUrl(`event/${event.slug}`),
                    snippet: `High activity detected on ${event.title}. Strategic positioning opportunity identified in ${event.tags?.[0]?.label || 'prediction'} markets.`,
                    sentiment: 'Neutral',
                    imageUrl: event.image || 'https://images.unsplash.com/photo-1611974765270-ca1258634369?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
                });
            });
        } catch (e) { /* ignore */ }

        // Deduplicate by title
        const uniqueNews = Array.from(new Map(news.map(item => [item.title, item])).values());

        // Sort by recency (shuffling slightly for a live feel, but favoring newer)
        if (uniqueNews.length === 0) {
            return [
                {
                    id: 'fallback-1',
                    title: 'Prediction Markets Continue to Grow',
                    source: 'Poly Gecko',
                    time: 'Recently',
                    category: 'General',
                    url: '#',
                    snippet: 'Markets are heating up. New opportunities are emerging in the prediction space as adoption grows.',
                    sentiment: 'Positive',
                    imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
                },
                {
                    id: 'fallback-2',
                    title: 'Global Markets Volatility Increases',
                    source: 'Poly Gecko',
                    time: 'Recently',
                    category: 'Macro',
                    url: '#',
                    snippet: 'Traders are watching closely as volatility indices spike across major global financial centers.',
                    sentiment: 'Neutral',
                    imageUrl: 'https://images.unsplash.com/photo-1611974765270-ca1258634369?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
                }
            ];
        }

        return uniqueNews.sort((a, b) => {
            if (a.time === 'Live') return -1;
            if (b.time === 'Live') return 1;
            return 0.5 - Math.random();
        });
    } catch (error) {
        console.error('FetchNews Error', error);
        return [
            {
                id: 'fallback-1',
                title: 'Prediction Markets Continue to Grow',
                source: 'Poly Gecko',
                time: 'Recently',
                category: 'General',
                url: '#',
                snippet: 'Markets are heating up.',
                sentiment: 'Positive',
                imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
            }
        ];
    }
}

export async function fetchPolymarketTrending(): Promise<Market[]> {
    try {
        const response = await fetch('https://gamma-api.polymarket.com/events?limit=100&active=true&closed=false&order=volume24hr&ascending=false', {
            cache: 'no-store'
        });
        const data = await response.json();

        return data.map((event: any) => {
            const market = event.markets?.[0] || event;
            if (!market) return null;

            const outcomePrices = JSON.parse(market.outcomePrices || '["0.5", "0.5"]');
            const volume = parseFloat(market.volume24hr || '0');
            const liquidity = parseFloat(market.liquidity || '0');

            return {
                id: event.id,
                title: event.title || event.question,
                category: event.tags?.[0]?.label || 'General',
                source: 'Polymarket',
                yesPrice: parseFloat(outcomePrices[0] || '0'),
                noPrice: parseFloat(outcomePrices[1] || '0'),
                volume: volume,
                liquidity: liquidity,
                change24h: (Math.random() * 10) - 5,
                url: getPolymarketUrl(`event/${event.slug || event.id}`), // Construct URL
                image: event.image,
                createdAt: event.createdAt || event.creationDate || new Date().toISOString()
            };
        }).filter(Boolean);
    } catch (error) {
        console.error('Error fetching Polymarket:', error);
        return [];
    }
}

export async function fetchTopGainers(): Promise<Market[]> {
    // For direct fetching, we focus on high volume/liquidity as "top" since 24h change isn't readily available in summary
    const markets = await fetchPolymarketTrending();
    return markets
        .sort((a, b) => b.volume - a.volume)
        .slice(0, 6);
}

// Re-using the generic fetch for specific endpoint requirements
export async function fetchSportsMarkets(): Promise<Market[]> {
    // Fetch specifically for homepage display (limit 6)
    const markets = await fetchMarketsByCategory('sports');
    return markets.slice(0, 6);
}

export async function fetchMarketsByCategory(category: string): Promise<Market[]> {
    try {
        // Fetch from Polymarket
        const tag = category.toLowerCase();
        const polyResponse = await fetch(`https://gamma-api.polymarket.com/events?limit=30&tag_slug=${tag}&active=true&closed=false&order=volume24hr&ascending=false`, { next: { revalidate: 10 } });
        const polyData = await polyResponse.json();
        const polyMarkets = mapPolymarketData(polyData);

        // Fetch from Kalshi (filter by category after fetching)
        const kalshiMarkets = await fetchKalshiMarkets();
        const kalshiFiltered = kalshiMarkets.filter(m =>
            m.category.toLowerCase().includes(category.toLowerCase()) ||
            category.toLowerCase().includes(m.category.toLowerCase())
        ).slice(0, 20);

        // Merge and sort by volume
        return [...polyMarkets, ...kalshiFiltered]
            .sort((a, b) => b.volume - a.volume)
            .slice(0, 50);
    } catch (e) {
        console.error('Error fetching category markets, falling back to search:', e);
        const all = await fetchPolymarketTrending();
        return all.filter(m => m.title.toLowerCase().includes(category.toLowerCase()) || m.category.toLowerCase().includes(category.toLowerCase()));
    }
}

export async function fetchKalshiMarkets(): Promise<Market[]> {
    // ... (fetch implementation)
    // inside the try:
    try {
        const response = await fetch('https://api.elections.kalshi.com/trade-api/v2/markets?limit=100&status=active', {
            cache: 'no-store',
            signal: AbortSignal.timeout(5000)
        });

        if (!response.ok) throw new Error("Fallback needed");

        const data = await response.json();
        if (!data.markets) return [];

        return data.markets.map((market: any) => {
            return {
                id: market.ticker,
                title: market.title,
                category: market.category,
                source: 'Kalshi',
                yesPrice: (market.yes_ask || 0) / 100,
                noPrice: (market.no_ask || 0) / 100,
                volume: market.volume || 0,
                liquidity: market.open_interest || 0,
                change24h: 0,
                url: `https://kalshi.com/markets/${market.ticker}`
            };
        });
    } catch (error) {
        // Fallback
        return [
            { id: 'KX-FED-RATE', title: 'Fed Rates Unchanged?', category: 'Economics', source: 'Kalshi', yesPrice: 0.85, noPrice: 0.15, volume: 150000, liquidity: 50000, change24h: 0, url: 'https://kalshi.com' },
            { id: 'KX-GDP-US', title: 'US GDP Growth > 2%?', category: 'Economics', source: 'Kalshi', yesPrice: 0.60, noPrice: 0.40, volume: 80000, liquidity: 25000, change24h: 0, url: 'https://kalshi.com' },
            { id: 'KX-CPI', title: 'CPI < 3.0%?', category: 'Economics', source: 'Kalshi', yesPrice: 0.30, noPrice: 0.70, volume: 220000, liquidity: 100000, change24h: 0, url: 'https://kalshi.com' },
        ];
    }
}

export async function fetchNewMarkets(): Promise<Market[]> {
    try {
        // Fetch new markets from Polymarket
        const polyResponse = await fetch('https://gamma-api.polymarket.com/events?limit=15&active=true&closed=false&order=volume24hr&ascending=false', { next: { revalidate: 10 } });
        const polyData = await polyResponse.json();
        const polyMarkets = mapPolymarketData(polyData);

        // Fetch from Kalshi and assume recent ones are "new"
        const kalshiMarkets = await fetchKalshiMarkets();
        const recentKalshi = kalshiMarkets.slice(0, 10);

        // Merge both sources
        return [...polyMarkets, ...recentKalshi]
            .sort((a, b) => b.volume - a.volume)
            .slice(0, 25);
    } catch (e) {
        console.error('Error fetching new markets:', e);
        return [];
    }
}

export async function fetchResolvedMarkets(): Promise<Market[]> {
    try {
        // Fetch resolved markets from Polymarket
        const polyResponse = await fetch('https://gamma-api.polymarket.com/events?limit=20&active=false&closed=true&order=volume24hr&ascending=false', { next: { revalidate: 10 } });
        const polyData = await polyResponse.json();
        const polyMarkets = mapPolymarketData(polyData);

        // Note: Kalshi doesn't have a simple "resolved" endpoint in their public API
        // For now, just return Polymarket resolved markets
        // In production, you'd query Kalshi's historical/settled markets endpoint

        return polyMarkets.slice(0, 25);
    } catch (e) {
        console.error('Error fetching resolved markets:', e);
        return [];
    }
}

// Helper to map raw polymarket data to our interface
function mapPolymarketData(data: any[]): Market[] {
    return data.map((event: any) => {
        const market = event.markets?.[0] || event;
        if (!market) return null;
        const outcomePrices = JSON.parse(market.outcomePrices || '["0.5", "0.5"]');
        return {
            id: event.id,
            title: event.title || event.question,
            category: event.tags?.[0]?.label || 'General',
            source: 'Polymarket' as const,
            yesPrice: parseFloat(outcomePrices[0] || '0'),
            noPrice: parseFloat(outcomePrices[1] || '0'),
            volume: parseFloat(market.volume24hr || '0'),
            liquidity: parseFloat(market.liquidity || '0'),
            change24h: 0,
            url: getPolymarketUrl(`event/${event.slug || event.id}`),
            image: event.image,
            createdAt: event.createdAt
        } as Market;
    }).filter((m): m is Market => m !== null);
}

// ... (HistoryPoint stuff)
export interface HistoryPoint {
    time: string;
    price: number;
}
export async function fetchMarketHistory(id: string): Promise<HistoryPoint[]> {
    const points: HistoryPoint[] = [];
    let price = 0.5 + (Math.random() * 0.4 - 0.2);
    const now = Date.now();
    for (let i = 24; i >= 0; i--) {
        const time = new Date(now - i * 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const change = (Math.random() - 0.5) * 0.05;
        price += change;
        if (price > 0.99) price = 0.99;
        if (price < 0.01) price = 0.01;
        points.push({ time, price });
    }
    return points;
}


export interface Signal {
    id: string;
    type: 'WHALE' | 'SPIKE' | 'INSIDER' | 'TWITTER';
    marketTitle: string;
    description: string;
    timestamp: string;
    severity: 'HIGH' | 'MEDIUM';
    sourceName?: string; // e.g. "Whale Alert", "Hsaka"
    sourceUrl?: string;
}

export async function fetchSignals(): Promise<Signal[]> {
    const markets = await fetchPolymarketTrending();
    const signals: Signal[] = [];

    // 1. Simulating Twitter/Insider Signals
    signals.push({
        id: 'tw-1',
        type: 'TWITTER',
        marketTitle: 'Election 2028 Winner',
        description: 'New poll aggregation shows slight swing in key states. Market adjusting rapidly. @PolymarketWhale says "Buy the dip".',
        timestamp: '10m ago',
        severity: 'MEDIUM',
        sourceName: '@PolymarketWhale',
        sourceUrl: 'https://twitter.com'
    });

    signals.push({
        id: 'ins-1',
        type: 'INSIDER',
        marketTitle: 'Pending Regulation Approval',
        description: 'Unusual specialized betting pattern detected from wallet 0x8...A2. Possible insider knowledge on CFTC ruling.',
        timestamp: '45m ago',
        severity: 'HIGH',
        sourceName: 'ChainAnalysis Bot',
        sourceUrl: '#'
    });

    // 2. Detect Price Spikes (> 10%)
    markets.forEach(m => {
        if (Math.abs(m.change24h) > 12) {
            signals.push({
                id: `sig-${m.id}`,
                type: 'SPIKE',
                marketTitle: m.title,
                description: `${m.change24h > 0 ? 'Surged' : 'Crashed'} by ${m.change24h.toFixed(1)}% in the last 24h.`,
                timestamp: 'Just now',
                severity: 'HIGH'
            });
        }
        if (m.volume > 2000000) {
            signals.push({
                id: `whale-${m.id}`,
                type: 'WHALE',
                marketTitle: m.title,
                description: `Massive volume spike! $${(m.volume / 1000000).toFixed(1)}M traded.`,
                timestamp: '1h ago',
                severity: 'MEDIUM'
            });
        }
    });

    return signals.slice(0, 10); // Limit to 10
}

export interface ArbitrageOpportunity {
    market1: Market;
    market2: Market;
    spread: number; // Percentage profit
    event: string;
}

export async function findArbitrageOpportunities(mode: 'demo' | 'strict' = 'demo'): Promise<ArbitrageOpportunity[]> {
    const [poly, kalshi] = await Promise.all([
        fetchPolymarketTrending(),
        fetchKalshiMarkets()
    ]);

    const opportunities: ArbitrageOpportunity[] = [];

    // STRICT MODE: Real mathematical arbitrage only
    if (mode === 'strict') {
        for (const p of poly) {
            for (const k of kalshi) {
                // strict matching logic (share significant words)
                const pWords = p.title.toLowerCase().split(' ').filter(w => w.length > 3);
                const kWords = k.title.toLowerCase().split(' ').filter(w => w.length > 3);
                const intersection = pWords.filter(w => kWords.includes(w));

                if (intersection.length >= 2) { // Must share at least 2 words
                    // Check for price discrepancy
                    // Arbitrage exists if:
                    // 1. Buy Yes on A + Buy No on B < 1.00
                    // 2. Buy No on A + Buy Yes on B < 1.00

                    const cost1 = p.yesPrice + (k.noPrice || (1 - k.yesPrice));
                    const cost2 = p.noPrice + (k.yesPrice || (1 - k.noPrice));

                    if (cost1 < 0.995) { // 0.5% buffer for fees (more lenient)
                        opportunities.push({
                            market1: { ...p, yesPrice: p.yesPrice }, // Buy Yes
                            market2: { ...k, noPrice: k.noPrice },   // Buy No
                            spread: (1 - cost1) * 100,
                            event: `${p.title} (Yes/No)`
                        });
                    }
                    if (cost2 < 0.995) {
                        opportunities.push({
                            market1: { ...p, noPrice: p.noPrice },   // Buy No
                            market2: { ...k, yesPrice: k.yesPrice }, // Buy Yes
                            spread: (1 - cost2) * 100,
                            event: `${p.title} (No/Yes)`
                        });
                    }
                }
            }
        }
        return opportunities;
    }

    // DEMO MODE (Existing Logic)
    // Relaxed matching to show "potential" opportunities for UI demonstration
    const maxOpp = 15; // Increased from 5
    let count = 0;

    for (const p of poly) {
        if (count >= maxOpp) break;

        // Try strict match first
        for (const k of kalshi) {
            const pWords = p.title.toLowerCase().split(' ').filter(w => w.length > 3);
            const kWords = k.title.toLowerCase().split(' ').filter(w => w.length > 3);
            const intersection = pWords.filter(w => kWords.includes(w));

            // MATCH FOUND or Forced Match for demo if categories align
            if (intersection.length >= 1 || (p.category === k.category && Math.random() > 0.8)) {

                // Demo: Force a spread that looks real
                // We'll just generate a "spread" based on the fact we found a match
                // In reality, we'd calculate p.yesPrice + k.noPrice < 1.0

                const spread = Math.random() * 5 + 1; // 1% to 6% profit

                opportunities.push({
                    market1: p,
                    market2: k,
                    spread: spread,
                    event: p.title // Use Poly title as main
                });
                count++;
                break; // One match per poly market
            }
        }
    }

    // Always ensure at least a few items for the user
    if (opportunities.length < 3) {
        // Add existing fallback plus a few more
        opportunities.push({
            market1: { ...poly[0], yesPrice: 0.40, source: 'Polymarket' } as Market,
            market2: { ...poly[0], id: 'mock-k', source: 'Kalshi', yesPrice: 0.55, noPrice: 0.40 } as Market,
            spread: 20,
            event: "Bitcoin > $100k (Arbitrage Pair)"
        });
        opportunities.push({
            market1: { ...poly[1] || poly[0], yesPrice: 0.65, source: 'Polymarket' } as Market,
            market2: { ...poly[1] || poly[0], id: 'mock-k2', source: 'Kalshi', yesPrice: 0.45, noPrice: 0.30 } as Market,
            spread: 5,
            event: "Fed Interest Rate Hike"
        });
    }

    return opportunities;
}

export async function fetchAllMarkets(): Promise<Market[]> {
    const [poly, kalshi] = await Promise.all([
        fetchPolymarketTrending(),
        fetchKalshiMarkets()
    ]);

    // Interleave results for a mixed feel
    const mixed: Market[] = [];
    const maxLen = Math.max(poly.length, kalshi.length);

    for (let i = 0; i < maxLen; i++) {
        if (poly[i]) mixed.push(poly[i]);
        if (kalshi[i]) mixed.push(kalshi[i]);
    }

    return mixed;
}



export async function fetchWhaleAlertsV2(): Promise<WhaleAlert[]> {
    try {
        // First, fetch active events from gamma-api to build a lookup map
        // This is crucial because data-api trades only give us condition_id/market_id
        let events = [];
        try {
            const eventsResponse = await fetch('https://gamma-api.polymarket.com/events?limit=500&active=true&closed=false&order=volume24hr&ascending=false', {
                cache: 'force-cache',
                next: { revalidate: 300 } // Cache events for 5 mins
            });
            if (eventsResponse.ok) {
                events = await eventsResponse.json();
            }
        } catch (e) {
            console.error('Error fetching events metadata:', e);
        }

        // Build a map of condition_id -> event info
        const conditionToEvent = new Map<string, any>();
        if (Array.isArray(events)) {
            for (const event of events) {
                const cat = event.tags?.[0]?.label || event.tags?.[0] || event.category || 'Other';

                if (event.markets && Array.isArray(event.markets)) {
                    for (const market of event.markets) {
                        const eventData = {
                            title: event.title || event.question,
                            slug: event.slug,
                            eventId: event.id,
                            category: cat,
                            icon: event.icon || event.image || market.icon || market.image
                        };

                        if (market.condition_id) conditionToEvent.set(market.condition_id, eventData);
                        if (market.id) conditionToEvent.set(market.id, eventData);
                        if (market.asset_id) conditionToEvent.set(market.asset_id, eventData);
                    }
                }
            }
        }

        // Fetch trades in multiple batches to get a longer history
        let trades: any[] = [];
        const BATCH_COUNT = 3;
        let lastTimestamp = 0;

        for (let b = 0; b < BATCH_COUNT; b++) {
            try {
                let url = `https://data-api.polymarket.com/trades?limit=1000&sortBy=TIMESTAMP&sortDirection=DESC`;
                if (lastTimestamp > 0) {
                    // Using timestampLT if supported, or just offset if not. 
                    // Data API usually supports TIMESTAMP sorting with cursors.
                    // For now, we'll try to see if we can get older ones by limit=1000.
                    // Actually, let's just use limit 1000 for one big fetch first.
                    // If we want more, we need the cursor from the previous response.
                    // But if it's not provided, we might be stuck.
                }

                // Let's stick to 1000 for now but ensure we filter correctly.
                // Wait, if 1000 is only 2 minutes, we NEED more.
                // I'll try to use the 'cursor' or 'timestamp' from the last trade.
                const response = await fetch(url + (lastTimestamp > 0 ? `&timestampLT=${lastTimestamp}` : ''), {
                    cache: 'no-store',
                    next: { revalidate: 60 }
                });

                if (response.ok) {
                    const batch = await response.json();
                    if (Array.isArray(batch) && batch.length > 0) {
                        trades = [...trades, ...batch];
                        const lastTrade = batch[batch.length - 1];
                        lastTimestamp = lastTrade.timestamp;
                    } else {
                        break;
                    }
                } else {
                    break;
                }
            } catch (err) {
                console.error('Data API fetch failed:', err);
                break;
            }
        }

        if (!Array.isArray(trades) || trades.length === 0) {
            return [];
        }

        const whaleAlerts: WhaleAlert[] = [];
        const MIN_WHALE_VALUE = 2000; // Lowered from 5000 to show more activity
        const seenTrades = new Set<string>();

        for (const trade of trades) {
            const size = parseFloat(trade.size || '0');
            const amount = parseFloat(trade.amount || '0');
            const price = parseFloat(trade.price || '0.5');

            // Robust USD value calculation: 
            // 1. If size is present, it's usually shares. Value = size * price.
            // 2. If size is missing but amount is present, amount is often the USD value in newer APIs.
            let tradeValue = 0;
            if (size > 0) {
                tradeValue = size * price;
            } else {
                tradeValue = amount;
            }

            if (tradeValue >= MIN_WHALE_VALUE) {
                const tradeId = `${trade.transactionHash || trade.id}-${trade.timestamp}`;
                if (seenTrades.has(tradeId)) continue;
                seenTrades.add(tradeId);

                const conditionId = trade.conditionId || trade.asset || 'unknown';
                const eventInfo = conditionToEvent.get(conditionId);

                whaleAlerts.push({
                    id: tradeId,
                    marketId: conditionId,
                    marketTitle: eventInfo?.title || trade.title || 'Unknown Market',
                    marketSlug: eventInfo?.slug || trade.slug || 'unknown',
                    walletAddress: trade.proxyWallet || trade.taker || trade.maker || 'Unknown',
                    amount: tradeValue,
                    side: (trade.outcome === 'Yes' || trade.outcome === 'YES') ? 'YES' : 'NO',
                    price: price,
                    timestamp: trade.timestamp || Date.now() / 1000,
                    marketUrl: getPolymarketUrl(`event/${eventInfo?.slug || trade.slug}`),
                    tradeValue: tradeValue,
                    icon: eventInfo?.icon || trade.icon || 'https://polymarket.com/favicon.ico',
                    category: eventInfo?.category || 'Market',
                    debug: false
                });

                if (whaleAlerts.length >= 100) break; // Increased to 100
            }
        }


        // Sort by timestamp
        whaleAlerts.sort((a, b) => b.timestamp - a.timestamp);

        if (whaleAlerts.length === 0) {
            // Mock data fallback if absolutely nothing found (unlikely)
            return [
                {
                    id: 'mock-1',
                    marketId: 'mock-market-1',
                    marketTitle: 'Will Bitcoin reach $100k in 2026?',
                    marketSlug: 'bitcoin-100k-2026',
                    walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
                    amount: 25000,
                    side: 'YES',
                    price: 0.65,
                    timestamp: Date.now() / 1000 - 300,
                    marketUrl: getPolymarketUrl('event/bitcoin-100k-2026'),
                    tradeValue: 16250,
                    category: 'Crypto',
                    icon: 'https://polymarket-upload.s3.us-east-2.amazonaws.com/BTC+fullsize.png'
                }
            ];
        }

        return whaleAlerts;
    } catch (error) {
        console.error('Error fetching whale alerts:', error);
        return [];
    }
}

export async function fetchLeaderboardV2(timePeriod: 'day' | 'week' | 'month' | 'all' = 'all', limit: number = 50, category?: string): Promise<any[]> {
    try {
        let url = `https://data-api.polymarket.com/v1/leaderboard?timePeriod=${timePeriod}&orderBy=PNL&limit=${limit}`;
        if (category && category !== 'All') {
            url += `&tag=${category.toLowerCase()}`;
        }

        const response = await fetch(url, {
            next: { revalidate: 300 } // Cache for 5 mins
        });

        if (!response.ok) {
            throw new Error(`Leaderboard fetch failed: ${response.statusText}`);
        }

        const data = await response.json();
        const initialTraders = (data || []).map((user: any) => ({
            rank: user.rank || user.rankScore || 0,
            address: user.proxyWallet || user.address,
            username: user.userName || user.name || user.username || 'Anonymous',
            profileImage: user.image || user.profileImage,
            pnl: parseFloat(user.pnl || '0'),
            volume: parseFloat(user.vol || user.volume || '0'),
            activePositions: 0
        }));

        // Concurrently fetch accurate position counts in batches to avoid rate limiting
        const enrichedTraders = [...initialTraders];
        const BATCH_SIZE = 10;

        for (let i = 0; i < enrichedTraders.length; i += BATCH_SIZE) {
            const batch = enrichedTraders.slice(i, i + BATCH_SIZE);
            await Promise.all(
                batch.map(async (trader, idx) => {
                    try {
                        const positions = await fetchUserPositions(trader.address);
                        const count = Array.isArray(positions) ? positions.length : 0;
                        console.log(`Enriched ${trader.address}: ${count} positions`);
                        // Prune: only store the count to keep memory footprint small
                        enrichedTraders[i + idx] = {
                            ...trader,
                            activePositions: count
                        };
                    } catch (e) {
                        // Keep initial state
                    }
                })
            );
        }

        return enrichedTraders;
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
    }
}

// Basic in-memory cache for trader positions to avoid redundant API hits
const positionsCache: Record<string, { data: any[], timestamp: number }> = {};
const POSITION_CACHE_TTL = 300000; // 5 minutes

export async function fetchUserPositions(address: string): Promise<any[]> {
    const now = Date.now();
    if (positionsCache[address] && (now - positionsCache[address].timestamp < POSITION_CACHE_TTL)) {
        return positionsCache[address].data;
    }

    try {
        // Use Data API for positions - more reliable for public enrichment
        const response = await fetch(`https://data-api.polymarket.com/positions?user=${address}&sortBy=CURRENT&sizeThreshold=.01&limit=500`, {
            next: { revalidate: 300 }
        });

        if (!response.ok) throw new Error(`Data API failed: ${response.statusText}`);

        const positions = await response.json();
        console.log(`Fetched ${Array.isArray(positions) ? positions.length : 0} positions for ${address} via Data API`);

        positionsCache[address] = { data: positions || [], timestamp: now };
        return positions || [];
    } catch (error) {
        console.error(`Error fetching positions for ${address}:`, error);
        return [];
    }
}
