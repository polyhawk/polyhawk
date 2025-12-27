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
    const apiKey = process.env.CRYPTOPANIC_API_KEY;
    const news: NewsItem[] = [];

    if (!apiKey) {
        console.warn('CRYPTOPANIC_API_KEY is missing. Using generic events as news.');
        return getFallbackNews();
    }

    try {
        // CryptoPanic API - Filter by 'hot' or 'rising' and specific currencies if needed, or public 'panic' / 'all'
        // Using 'kind: news' and 'filter: hot'
        const url = `https://cryptopanic.com/api/v1/posts/?auth_token=${apiKey}&public=true&filter=hot&kind=news`;

        const response = await fetch(url, { next: { revalidate: 300 } }); // Cache for 5 min

        if (!response.ok) {
            throw new Error(`CryptoPanic Fetch Failed: ${response.status}`);
        }

        const data = await response.json();

        if (data.results && Array.isArray(data.results)) {
            data.results.forEach((item: any) => {
                // Calculate time ago
                const date = new Date(item.created_at);
                const hoursAgo = (Date.now() - date.getTime()) / (1000 * 60 * 60);

                // Strict 48h Filter (CryptoPanic items can be slightly older but still relevant "hot" items)
                if (hoursAgo > 48) return;

                news.push({
                    id: `cp-${item.id}`,
                    title: item.title,
                    source: item.domain || item.source?.title || 'CryptoPanic',
                    time: hoursAgo < 1 ? 'Just now' : `${Math.floor(hoursAgo)}h ago`,
                    category: 'Market', // CryptoPanic is mostly market/crypto news
                    url: item.url, // This is the CryptoPanic link which usually redirects or shows source
                    snippet: 'Trending news from the crypto prediction space.', // CryptoPanic doesn't always provide descriptions in free tier easily
                    sentiment: item.votes && (item.votes.positive > item.votes.negative) ? 'Positive' : 'Neutral',
                    imageUrl: 'https://images.unsplash.com/photo-1621504450168-38f64731b667?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' // No images in free tier usually
                });
            });
        }
    } catch (error) {
        console.error('CryptoPanic Error:', error);
    }

    // 2. Fetch Polymarket Events (High Volume & Newest) as News
    try {
        // Fetch Top Volume
        const volResponse = await fetch('https://gamma-api.polymarket.com/events?limit=10&active=true&closed=false&order=volume24hr&ascending=false', { next: { revalidate: 60 } });
        const volData = await volResponse.json();

        // Fetch Newest
        const newResponse = await fetch('https://gamma-api.polymarket.com/events?limit=10&active=true&closed=false&order=startDate&ascending=false', { next: { revalidate: 60 } });
        const newData = await newResponse.json();

        const allPoly = [...volData, ...newData];

        allPoly.forEach((event: any) => {
            news.push({
                id: `poly-news-${event.id}`,
                title: `Market Update: ${event.title}`,
                source: 'Polymarket',
                time: 'Live',
                category: event.new ? 'New Market' : 'Trending',
                url: getPolymarketUrl(`event/${event.slug}`),
                snippet: `Market active. Volume: $${Math.floor(Number(event.volume24hr || 0)).toLocaleString()}. Liquidity: $${Math.floor(Number(event.liquidity || 0)).toLocaleString()}.`,
                sentiment: 'Neutral',
                imageUrl: event.image || 'https://images.unsplash.com/photo-1611974765270-ca1258634369?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
            });
        });
    } catch (e) { console.error('Poly News Error', e); }

    // Deduplicate by title
    const uniqueNews = Array.from(new Map(news.map(item => [item.title, item])).values());
}

function getFallbackNews(): NewsItem[] {
    return [
        {
            id: 'fallback-1',
            title: 'Prediction Markets Continue to Grow',
            source: 'PolyHawk',
            time: 'Recently',
            category: 'General',
            url: '#',
            snippet: 'Markets are heating up. New opportunities are emerging in the prediction space.',
            sentiment: 'Positive',
            imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
        }
    ];
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

        // Sort by volume
        return polyMarkets
            .sort((a, b) => b.volume - a.volume)
            .slice(0, 50);
    } catch (e) {
        console.error('Error fetching category markets, falling back to search:', e);
        const all = await fetchPolymarketTrending();
        return all.filter(m => m.title.toLowerCase().includes(category.toLowerCase()) || m.category.toLowerCase().includes(category.toLowerCase()));
    }
}



export async function fetchNewMarkets(): Promise<Market[]> {
    try {
        // Fetch new markets from Polymarket
        const polyResponse = await fetch('https://gamma-api.polymarket.com/events?limit=15&active=true&closed=false&order=volume24hr&ascending=false', { next: { revalidate: 10 } });
        const polyData = await polyResponse.json();
        const polyMarkets = mapPolymarketData(polyData);

        // Retrieve only Polymarket
        return polyMarkets
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
    const poly = await fetchPolymarketTrending();
    const opportunities: ArbitrageOpportunity[] = [];

    // STRICT MODE: No arbitrage possible without second exchange
    if (mode === 'strict') {
        return [];
    }

    // DEMO MODE: Simulate opportunities for UI
    const maxOpp = 5;

    // Create mock opportunities from high-volume Polymarket events
    for (let i = 0; i < Math.min(poly.length, maxOpp); i++) {
        const m = poly[i];
        const spread = Math.random() * 3 + 0.5;

        opportunities.push({
            market1: { ...m, source: 'Polymarket' },
            market2: { ...m, id: m.id + '-mock', source: 'Polymarket', yesPrice: m.yesPrice - 0.05, noPrice: m.noPrice + 0.05 }, // Mock discrepancy
            spread: spread,
            event: m.title
        });
    }

    return opportunities;
}

export async function fetchAllMarkets(): Promise<Market[]> {
    const poly = await fetchPolymarketTrending();
    return poly;
}



export async function fetchWhaleAlertsV2(): Promise<WhaleAlert[]> {
    try {
        // First, fetch active events from gamma-api to build a lookup map
        // This is crucial because data-api trades only give us condition_id/market_id
        let events = [];
        try {
            const eventsResponse = await fetch('https://gamma-api.polymarket.com/events?limit=1000&active=true&closed=false&order=volume24hr&ascending=false', {
                cache: 'force-cache',
                next: { revalidate: 60 } // Cache events for 1 min (improved from 5)
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
                        // Also map the asset ID itself if possible (sometimes conditionId != asset_id but commonly used)
                        if (market.clobTokenIds && Array.isArray(JSON.parse(market.clobTokenIds))) {
                            try {
                                const tokens = JSON.parse(market.clobTokenIds);
                                tokens.forEach((t: string) => conditionToEvent.set(t, eventData));
                            } catch (e) { }
                        }
                    }
                }
            }
        }

        // Fetch trades in multiple batches to get a longer history
        let trades: any[] = [];
        const BATCH_COUNT = 5;
        let lastTimestamp = 0;

        for (let b = 0; b < BATCH_COUNT; b++) {
            try {
                // Use CLOB Client for authenticated access (higher limits, uses USER provided keys)
                if (process.env.POLYMARKET_API_KEY && process.env.POLYMARKET_API_SECRET) {
                    const params = new URLSearchParams({
                        limit: '1000',
                        taker_only: 'true'
                    });
                    if (lastTimestamp > 0) params.append('before', lastTimestamp.toString());

                    const clobData = await polymarketClient.request({
                        method: 'GET',
                        path: `/data/trades?${params.toString()}`,
                        isPublic: false
                    }) as any[];

                    if (Array.isArray(clobData)) {
                        trades.push(...clobData);
                        if (clobData.length > 0) {
                            const last = clobData[clobData.length - 1];
                            lastTimestamp = last.timestamp || 0;
                        } else {
                            break;
                        }
                        continue;
                    }
                }

                // FALLBACK DELETED: We only use authenticated CLOB client now.
                if (!process.env.POLYMARKET_API_KEY) {
                    // Break if no keys, as we can't use CLOB
                    console.warn("No Polymarket Keys provided, Whale alerts limited.");
                    break;
                }
            } catch (err) {
                console.error('Batch fetch error:', err);
                break;
            }
        }

        const whaleAlerts: WhaleAlert[] = [];
        const MIN_WHALE_VALUE = 5000;
        const seenTrades = new Set<string>();

        for (const trade of trades) {
            const size = parseFloat(trade.size || '0');
            const amount = parseFloat(trade.amount || '0');
            const price = parseFloat(trade.price || '0.5');

            let tradeValue = size > 0 ? size * price : amount;

            if (tradeValue >= MIN_WHALE_VALUE) {
                const tradeId = `${trade.transactionHash || trade.id}-${trade.timestamp}`;
                if (seenTrades.has(tradeId)) continue;
                seenTrades.add(tradeId);

                const conditionId = trade.conditionId || trade.asset || 'unknown';
                let eventInfo = conditionToEvent.get(conditionId);

                if (!eventInfo && trade.title) {
                    eventInfo = {
                        title: trade.title,
                        slug: trade.slug || trade.eventSlug,
                        icon: trade.icon,
                        category: 'Market'
                    };
                }

                // Fallback: If event info is missing, try to fetch it on-the-fly
                // This handles cases where a new market appears that wasn't in our events cache
                if (!eventInfo) {
                    try {
                        // Attempt to fetch market by condition ID
                        const marketRes = await fetch(`https://gamma-api.polymarket.com/markets?condition_id=${conditionId}`);
                        if (marketRes.ok) {
                            const marketsData = await marketRes.json();
                            if (Array.isArray(marketsData) && marketsData.length > 0) {
                                const m = marketsData[0];
                                // We need the parent event usually, but market data might suffice
                                // Or fetch event by market id
                                if (m.events && m.events.length > 0) {
                                    const e = m.events[0];
                                    eventInfo = {
                                        title: e.title,
                                        slug: e.slug,
                                        icon: e.icon || e.image,
                                        category: e.category || 'Market'
                                    };
                                    // Cache it for this execution
                                    conditionToEvent.set(conditionId, eventInfo);
                                }
                            }
                        }
                    } catch (err) {
                        // console.error('Fallback fetch failed', err);
                    }
                }

                if (!eventInfo || !eventInfo.slug) continue;

                whaleAlerts.push({
                    id: tradeId,
                    marketId: conditionId,
                    marketTitle: eventInfo.title,
                    marketSlug: eventInfo.slug,
                    walletAddress: trade.proxyWallet || trade.taker || trade.maker || 'Unknown',
                    amount: tradeValue,
                    side: (trade.outcome === 'Yes' || trade.outcome === 'YES') ? 'YES' : 'NO',
                    price: price,
                    timestamp: trade.timestamp || Date.now() / 1000,
                    marketUrl: getPolymarketUrl(`event/${eventInfo.slug}`),
                    tradeValue: tradeValue,
                    icon: eventInfo.icon || 'https://polymarket.com/favicon.ico',
                    category: eventInfo.category || 'Market',
                    debug: false
                });

                if (whaleAlerts.length >= 100) break;
            }
        }

        whaleAlerts.sort((a, b) => b.timestamp - a.timestamp);

        if (whaleAlerts.length === 0) {
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
        // 1. Try Builder API (CLOB) if keys are present
        if (process.env.POLYMARKET_API_KEY && process.env.POLYMARKET_API_SECRET) {
            try {
                console.log(`Using Builder API for portfolio tracking: ${address}`);
                const positions = await polymarketClient.getPositions(address);

                if (Array.isArray(positions)) {
                    // Normalize CLOB data to match expected Data API format if needed
                    // Component already handles common aliases like pos.asset_id/pos.id
                    positionsCache[address] = { data: positions, timestamp: now };
                    return positions;
                }
            } catch (clobErr) {
                console.error('Builder API Positions failed, falling back to Data API:', clobErr);
            }
        }

        // 2. FALLBACK: Use Data API for positions
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

export const getPortfolio = fetchUserPositions;
