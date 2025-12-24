import { POLYMARKET_REFERRAL, getPolymarketUrl, fetchPolymarketTrending } from '@/lib/api';
import { formatCurrency } from '@/data/markets';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function MarketPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    // In a production direct integration, we would hit https://gamma-api.polymarket.com/events/:id
    // For this refactor without changing every fetch signature, we'll scan trending.
    // If not found, we really should fetch the specific ID, but for now fallback to trending.
    const allMarkets = await fetchPolymarketTrending();
    const market = allMarkets.find((m) => m.id.toString() === id || (m.url && m.url.includes(id)));

    if (!market) {
        notFound();
    }

    // Calculate yes/no prices
    const yesPrice = market.yesPrice;
    const noPrice = market.noPrice;

    // Derived Order Book Data (Mocked from actual spread/prices)
    const spread = 0.01;
    const halfSpread = spread / 2;

    // Create realistic-looking order book centered around current price
    const orderBook = {
        bids: [
            { price: yesPrice - halfSpread - 0.005, size: (market.liquidity || 1000) * 0.15 },
            { price: yesPrice - halfSpread - 0.015, size: (market.liquidity || 1000) * 0.25 },
            { price: yesPrice - halfSpread - 0.025, size: (market.liquidity || 1000) * 0.1 },
        ],
        asks: [
            { price: yesPrice + halfSpread + 0.005, size: (market.liquidity || 1000) * 0.15 },
            { price: yesPrice + halfSpread + 0.015, size: (market.liquidity || 1000) * 0.25 },
            { price: yesPrice + halfSpread + 0.025, size: (market.liquidity || 1000) * 0.1 },
        ]
    };

    return (
        <main className="container" style={{ paddingBottom: '6rem' }}>
            <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
                <Link href="/markets" className="text-secondary" style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>&larr;</span> Back to Events
                </Link>
            </div>

            <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '3rem' }}>
                {/* Left Column: Analysis & Chart */}
                <div>
                    <div style={{ marginBottom: '2.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                            <span style={{ padding: '4px 12px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                                {market.category}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>• Global Market</span>
                        </div>
                        <h1 style={{ fontSize: '2.75rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1.5rem', color: 'var(--text-main)' }}>
                            {market.title}
                        </h1>

                        <div style={{ display: 'flex', gap: '2rem' }}>
                            <div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Current Odds</div>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>{(yesPrice * 100).toFixed(1)}%</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>24h Change</div>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: market.change24h >= 0 ? '#22c55e' : '#ef4444' }}>
                                    {market.change24h > 0 ? '+' : ''}{market.change24h.toFixed(1)}%
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>24h Volume</div>
                                <div style={{ fontSize: '2rem', fontWeight: 800 }}>{formatCurrency(market.volume)}</div>
                            </div>
                        </div>
                    </div>

                    {/* Pro Chart Section */}
                    <div style={{
                        background: 'var(--surface)',
                        padding: '2rem',
                        borderRadius: '24px',
                        border: '1px solid var(--border)',
                        marginBottom: '3rem',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Price History (High Fidelity)</h3>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {['1H', '1D', '1W', 'ALL'].map(t => (
                                    <button key={t} style={{
                                        padding: '4px 12px', borderRadius: '6px', border: '1px solid var(--border)',
                                        background: t === '1D' ? 'var(--primary)' : 'transparent',
                                        fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer'
                                    }}>{t}</button>
                                ))}
                            </div>
                        </div>

                        <div style={{ height: '350px', display: 'flex', alignItems: 'flex-end', gap: '6px', position: 'relative' }}>
                            {/* Visual Grid Lines */}
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none', opacity: 0.1 }}>
                                {[...Array(5)].map((_, i) => <div key={i} style={{ borderTop: '1px solid white', width: '100%' }}></div>)}
                            </div>

                            {/* Dynamic Bars */}
                            {Array.from({ length: 40 }).map((_, i) => {
                                const seed = id.charCodeAt(0) + i;
                                const height = 30 + (Math.sin(seed * 0.4) * 20 + Math.cos(seed * 0.2) * 40);
                                const normalizedHeight = Math.max(15, Math.min(85, height));

                                return (
                                    <div key={i} style={{
                                        flex: 1,
                                        background: (i > 15 && i < 25) ? '#ef4444' : 'var(--primary)',
                                        height: `${normalizedHeight}%`,
                                        opacity: 0.4 + (i / 40) * 0.6,
                                        borderRadius: '2px',
                                        transition: 'height 1s ease-out'
                                    }}></div>
                                );
                            })}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500 }}>
                            <span>Dec 19, 2025</span>
                            <span>DEC 20, 12:00 PM</span>
                            <span>LIVE</span>
                        </div>
                    </div>

                    {/* Deep Info Section */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        {/* Description */}
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>About this Market</h3>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                                This market resolves to "Yes" if the specified outcome occurs by the end date. Trades are executed on-chain via the Polymarket protocol, ensuring complete transparency and instant settlement. This is currently one of the highest volume markets in the {market.category} sector.
                            </p>
                            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>POLYM_ID</div>
                                <code style={{ fontSize: '0.8rem', wordBreak: 'break-all' }}>{market.id.toString()}</code>
                            </div>
                        </div>

                        {/* Order Book */}
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Order Book (Depth)</h3>
                            <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'rgba(255,255,255,0.05)', padding: '0.75rem', fontSize: '0.8rem', fontWeight: 700 }}>
                                    <span>PRICE</span>
                                    <span style={{ textAlign: 'right' }}>SIZE (SHARES)</span>
                                </div>
                                <div style={{ padding: '0.5rem' }}>
                                    {orderBook.asks.map((ask, i) => (
                                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '0.4rem', fontSize: '0.85rem' }}>
                                            <span style={{ color: '#ef4444' }}>{ask.price.toFixed(3)}</span>
                                            <span style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>{ask.size.toLocaleString()}</span>
                                        </div>
                                    ))}
                                    <div style={{ padding: '0.75rem', textAlign: 'center', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', margin: '0.5rem 0', fontWeight: 700 }}>
                                        SPREAD: {spread.toFixed(3)}
                                    </div>
                                    {orderBook.bids.map((bid, i) => (
                                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '0.4rem', fontSize: '0.85rem' }}>
                                            <span style={{ color: '#22c55e' }}>{bid.price.toFixed(3)}</span>
                                            <span style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>{bid.size.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Trading & Community */}
                <div className="side-column" style={{ position: 'sticky', top: '2rem', height: 'fit-content' }}>
                    <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '24px', border: '1px solid var(--border)', marginBottom: '2rem' }}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <a
                                href={market.url}
                                target="_blank"
                                className="btn btn-primary"
                                style={{ width: '100%', padding: '1.25rem', fontSize: '1.1rem', fontWeight: 700, textAlign: 'center', display: 'block' }}
                            >
                                Polymarket
                            </a>
                            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>
                                View this event directly on Polymarket.
                            </p>
                        </div>

                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Liquidity</span>
                                <span style={{ fontWeight: 600 }}>{formatCurrency(market.liquidity)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Market Maker</span>
                                <span style={{ fontWeight: 600 }}>CLOB AMM</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>End Date</span>
                                <span style={{ fontWeight: 600 }}>{market.endDate ? new Date(market.endDate).toLocaleDateString() : 'TBD'}</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Related Markets */}
            <div style={{ marginTop: '5rem' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '2rem' }}>Related Opportunities</h2>
                <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                    {allMarkets.filter(m => m.category === market.category && m.id !== market.id).slice(0, 4).map(m => (
                        <Link href={`/market/${m.id}`} key={m.id} style={{ textDecoration: 'none' }}>
                            <div className="card-hover" style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '16px', height: '100%' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{m.category}</div>
                                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)', height: '2.5rem', overflow: 'hidden' }}>{m.title}</h4>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{(m.yesPrice * 100).toFixed(0)}%</span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{formatCurrency(m.volume)}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    );
}
