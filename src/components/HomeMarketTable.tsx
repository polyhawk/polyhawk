'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Market } from '@/lib/api';
import { formatCurrency } from '@/data/markets';

interface HomeMarketTableProps {
    initialMarkets: Market[];
}

export default function HomeMarketTable({ initialMarkets }: HomeMarketTableProps) {
    const [displayCount, setDisplayCount] = useState(10);
    const hasMore = initialMarkets.length > displayCount;

    const visibleMarkets = initialMarkets.slice(0, displayCount);

    return (
        <div style={{ background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border)', overflow: 'hidden', marginBottom: '5rem' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Trending Markets</h2>
                <Link href="/markets" className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>View All</Link>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table className="market-table-v2" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                            <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Market</th>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Yes</th>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>No</th>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Volume</th>
                            <th className="hide-mobile" style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Source</th>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {visibleMarkets.map((market, i) => (
                            <tr key={`${market.source}-${market.id}`} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '1rem 1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span className="hide-mobile" style={{ color: 'var(--text-secondary)', width: '20px', fontSize: '0.8rem' }}>{i + 1}</span>
                                        <Link href={`/market/${market.id}`} style={{ fontWeight: 600, color: 'var(--text-main)', textDecoration: 'none', fontSize: '0.9rem', lineHeight: '1.4', display: 'block' }}>
                                            {market.title}
                                        </Link>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '0.3rem 0.6rem',
                                        borderRadius: '6px',
                                        background: 'rgba(79, 70, 229, 0.1)',
                                        color: 'var(--primary)',
                                        fontWeight: 700,
                                        fontSize: '0.85rem'
                                    }}>
                                        {(market.yesPrice * 100).toFixed(0)}¢
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '0.3rem 0.6rem',
                                        borderRadius: '6px',
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        color: '#ef4444',
                                        fontWeight: 700,
                                        fontSize: '0.85rem'
                                    }}>
                                        {(market.noPrice * 100).toFixed(0)}¢
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', fontWeight: 600, fontSize: '0.85rem' }}>
                                    ${Number(market.volume) >= 1000000
                                        ? (Number(market.volume) / 1000000).toFixed(1) + 'M'
                                        : (Number(market.volume) / 1000).toFixed(0) + 'K'}
                                </td>
                                <td className="hide-mobile" style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: market.source === 'Polymarket' ? 'var(--primary)' : '#10b981' }}></div>
                                        {market.source}
                                    </div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <a href={market.url} target="_blank" className="btn btn-secondary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}>
                                        Polymarket
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {hasMore && (
                <div style={{ padding: '1.5rem', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
                    <button
                        onClick={() => setDisplayCount(prev => prev + 20)}
                        className="btn btn-outline"
                        style={{ width: '100%', maxWidth: '200px', fontWeight: 700 }}
                    >
                        Show More
                    </button>
                </div>
            )}
        </div>
    );
}
