import crypto from 'crypto';

const API_KEY = process.env.POLYMARKET_API_KEY;
const API_SECRET = process.env.POLYMARKET_API_SECRET;
const API_PASSPHRASE = process.env.POLYMARKET_API_PASSPHRASE;
const CLOB_API_URL = 'https://clob.polymarket.com';
const GAMMA_API_URL = 'https://gamma-api.polymarket.com';

interface RequestOptions {
    method: 'GET' | 'POST' | 'DELETE' | 'PUT';
    path: string;
    body?: any;
    isPublic?: boolean;
}

export class PolymarketClient {
    private static instance: PolymarketClient;

    private constructor() { }

    public static getInstance(): PolymarketClient {
        if (!PolymarketClient.instance) {
            PolymarketClient.instance = new PolymarketClient();
        }
        return PolymarketClient.instance;
    }

    private signRequest(timestamp: number, method: string, requestPath: string, body?: string): string {
        if (!API_SECRET) return '';
        const timestampStr = Math.floor(timestamp).toString();
        const message = timestampStr + method + requestPath + (body || '');
        const hmac = crypto.createHmac('sha256', Buffer.from(API_SECRET, 'base64'));
        hmac.update(message);
        return hmac.digest('base64');
    }

    public async request<T>(options: RequestOptions): Promise<T> {
        const { method, path, body, isPublic } = options;
        const timestamp = Date.now() / 1000;
        const bodyStr = body ? JSON.stringify(body) : undefined;

        let headers: HeadersInit = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        if (!isPublic && API_KEY && API_SECRET && API_PASSPHRASE) {
            const signature = this.signRequest(timestamp, method, path, bodyStr);
            headers = {
                ...headers,
                'POLY-API-KEY': API_KEY,
                'POLY-API-SIGNATURE': signature,
                'POLY-API-PASSPHRASE': API_PASSPHRASE,
                'POLY-API-TIMESTAMP': Math.floor(timestamp).toString()
            };
        }

        const url = `${CLOB_API_URL}${path}`;

        try {
            const response = await fetch(url, {
                method,
                headers,
                body: bodyStr,
                cache: 'no-store'
            });

            if (!response.ok) {
                const errorText = await response.text();
                // If 401/403 despite keys, maybe keys are wrong or endpoint restricted.
                // Fallback shouldn't happen here, caller should handle error.
                throw new Error(`CLOB API Error ${response.status}: ${errorText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`PolymarketClient Request Error [${method} ${path}]:`, error);
            throw error;
        }
    }

    // --- Core Endpoints ---

    public async getMarkets(limit: number = 100, active: boolean = true) {
        // Gamma API is better for display metadata (images, titles)
        // CLOB API /markets is raw.
        // We'll use Gamma for this usually, but let's allow fetching via CLOB if needed.
        // For general "Markets" page, Gamma is superior.
        // But user asked to use "Builder API" (CLOB).
        // Let's implement getting markets from CLOB and mapping metadata if possible, 
        // OR use Gamma but authenticated? Gamma doesn't use these keys usually.
        // We will stick to Gamma for rich metadata but use CLOB for orderbooks/prices if needed.

        // Actually, let's proxy Gamma requests here too for consistency if we wanted, 
        // but Gamma is public.
        // Let's keep this client focused on CLOB authenticated actions.

        // For "getMarkets", we'll actually fetch sampling-markets from CLOB which is efficient
        return this.request({
            method: 'GET',
            path: '/sampling-simplified-markets?next_cursor=',
            isPublic: true // This endpoint is public usually? Or authenticated? 
            // "Builder API" usually implies authenticated.
            // Let's try authenticated.
        });
    }

    public async getTrades(limit: number = 100): Promise<any[]> {
        return this.request({
            method: 'GET',
            path: `/data/trades?limit=${limit}&taker_only=true`,
            isPublic: false
        });
    }

    public async getPositions(userAddress: string): Promise<any[]> {
        return this.request({
            method: 'GET',
            path: `/positions?user=${userAddress}`,
            isPublic: false // User keys can read any positions usually
        });
    }

    public async getOrderBook(tokenId: string): Promise<any> {
        return this.request({
            method: 'GET',
            path: `/book?token_id=${tokenId}`,
            isPublic: false
        });
    }

    // --- Leaderboard Helper ---
    public async getLeaderboard(limit: number = 20): Promise<any[]> {
        // Polymarket doesn't have a direct "Leaderboard" endpoint on CLOB publicly documented often.
        // But we can simulate one or use Gamma's leaderboard.
        // Let's use Gamma for the *list* of users, then CLOB for their *positions*.
        try {
            const resp = await fetch(`${GAMMA_API_URL}/leaderboard?window=all&limit=${limit}&rank=pnl`, {
                headers: { 'Accept': 'application/json' },
                next: { revalidate: 300 }
            });
            if (resp.ok) return await resp.json();
            return [];
        } catch (e) {
            console.error('Leaderboard fetch failed', e);
            return [];
        }
    }
}

export const polymarketClient = PolymarketClient.getInstance();
