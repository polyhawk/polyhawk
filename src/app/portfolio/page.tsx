'use client';

import Link from 'next/link';
import { formatCurrency } from '@/data/markets';
import { useState, useEffect } from 'react';
import { getPolymarketUrl } from '@/lib/api';

interface Position {
    title: string;
    outcome: string;
    size: number;
    avgPrice: number;
    currentPrice: number;
    value: number;
    pnl: number;
    slug?: string;
    wallet: string; // Track which wallet owns this position
}

export default function PortfolioPage() {
    const [inputValue, setInputValue] = useState('');
    const [wallets, setWallets] = useState<string[]>([]);
    const [positions, setPositions] = useState<Position[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Load saved wallets on mount
    useEffect(() => {
        const saved = localStorage.getItem('poly_hawk_portfolio_wallets');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    setWallets(parsed);
                    if (parsed.length > 0) {
                        fetchAllPositions(parsed);
                    }
                }
            } catch (e) {
                console.error('Failed to parse saved wallets', e);
            }
        }
    }, []);

    const fetchAllPositions = async (walletList: string[]) => {
        if (walletList.length === 0) {
            setPositions([]);
            return;
        }

        setLoading(true);
        setError('');

        let allPositions: Position[] = [];

        try {
            await Promise.all(walletList.map(async (address) => {
                try {
                    const res = await fetch(`https://data-api.polymarket.com/positions?user=${address}&sortBy=CURRENT&sortDirection=DESC&sizeThreshold=.1`);
                    if (!res.ok) return;
                    const data = await res.json();

                    if (Array.isArray(data)) {
                        const mapped: Position[] = data.map((p: any) => {
                            const size = Math.abs(parseFloat(p.size || '0'));
                            const avgPrice = parseFloat(p.avgPrice || '0.5');
                            const currentPrice = parseFloat(p.curPrice || p.price || '0.5');
                            const value = size * currentPrice;
                            const pnl = (currentPrice - avgPrice) * size;

                            return {
                                title: p.title || p.market || 'Unknown Market',
                                outcome: p.outcome === 'Yes' || p.side === 'Yes' ? 'YES' : 'NO',
                                size,
                                avgPrice,
                                currentPrice,
                                value,
                                pnl,
                                slug: p.slug || p.eventSlug,
                                wallet: address
                            };
                        });
                        allPositions = [...allPositions, ...mapped];
                    }
                } catch (err) {
                    console.error(`Failed to fetch for ${address}`, err);
                }
            }));

            // Sort by value descending
            setPositions(allPositions.sort((a, b) => b.value - a.value));
        } catch (err) {
            console.error('Error fetching positions:', err);
            setError('Failed to refresh portfolio.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddWallet = (e: React.FormEvent) => {
        e.preventDefault();
        const address = inputValue.trim();

        if (!address || !address.startsWith('0x') || address.length < 10) {
            setError('Please enter a valid wallet address (0x...)');
            return;
        }

        if (wallets.includes(address)) {
            setError('Wallet already added.');
            return;
        }

        const newWallets = [...wallets, address];
        setWallets(newWallets);
        localStorage.setItem('poly_hawk_portfolio_wallets', JSON.stringify(newWallets));
        setInputValue('');
        fetchAllPositions(newWallets);
    };

    const handleRemoveWallet = (addressToRemove: string) => {
        const newWallets = wallets.filter(w => w !== addressToRemove);
        setWallets(newWallets);
        localStorage.setItem('poly_hawk_portfolio_wallets', JSON.stringify(newWallets));
        fetchAllPositions(newWallets);
    };

    const totalValue = positions.reduce((acc, pos) => acc + pos.value, 0);
    const totalPnL = positions.reduce((acc, pos) => acc + pos.pnl, 0);
    const totalInvested = positions.reduce((acc, pos) => acc + (pos.size * pos.avgPrice), 0);
    const pnlPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

    return (
        <main className="container" style={{ paddingBottom: '4rem' }}>
            <div style={{ margin: '4rem 0 3rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: 800, background: 'linear-gradient(to bottom right, #fff, #a1a1aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    👋 Welcome to your Portfolio
                </h1>
                <p className="text-secondary" style={{ fontSize: '1.1rem' }}>
                    Track aggregated positions from multiple wallets
                </p>
            </div>

            {/* Wallet Management Section */}
            <div style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '1.5rem',
                marginBottom: '2rem'
            }}>
                <form onSubmit={handleAddWallet} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: wallets.length > 0 ? '1.5rem' : '0' }}>
                    <input
                        type="text"
                        placeholder="Add wallet address (0x...)"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        style={{
                            flex: 1,
                            minWidth: '300px',
                            padding: '0.75rem 1rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border)',
                            background: 'var(--background)',
                            color: 'var(--text-main)',
                            fontSize: '1rem',
                            fontFamily: 'monospace'
                        }}
                    />
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Adding...' : '+ Add Wallet'}
                    </button>
                    {wallets.length > 0 && (
                        <button type="button" onClick={() => fetchAllPositions(wallets)} className="btn btn-outline" disabled={loading}>
                            ↻ Refresh
                        </button>
                    )}
                </form>

                {error && <p style={{ color: '#ef4444', marginTop: '0.75rem', fontSize: '0.9rem' }}>{error}</p>}

                {/* Wallet List */}
                {wallets.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
                        {wallets.map(wallet => (
                            <div key={wallet} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                background: 'var(--background)',
                                padding: '0.4rem 0.8rem',
                                borderRadius: '8px',
                                border: '1px solid var(--border)',
                                fontSize: '0.85rem'
                            }}>
                                <span style={{ fontFamily: 'monospace' }}>
                                    {wallet.substring(0, 6)}...{wallet.substring(wallet.length - 4)}
                                </span>
                                <button
                                    onClick={() => handleRemoveWallet(wallet)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        padding: '0 4px',
                                        fontSize: '1.1rem',
                                        lineHeight: 1
                                    }}
                                    title="Remove wallet"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Stats */}
            {positions.length > 0 && (
                <div className="market-stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '2rem' }}>
                    <div className="stat-card">
                        <div className="stat-label">Total Portfolio Value</div>
                        <div className="stat-value">{formatCurrency(totalValue)}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Active Positions</div>
                        <div className="stat-value">{positions.length}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Total Unrealized P/L</div>
                        <div className={`stat-value ${totalPnL >= 0 ? 'text-green' : 'text-red'}`}>
                            {totalPnL > 0 ? '+' : ''}{formatCurrency(totalPnL)} ({pnlPercent.toFixed(1)}%)
                        </div>
                    </div>
                </div>
            )}

            {/* Positions Table */}
            {loading && positions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                    Loading positions...
                </div>
            ) : positions.length > 0 ? (
                <div className="market-table-container">
                    <table className="market-table">
                        <thead>
                            <tr>
                                <th>Market</th>
                                <th style={{ textAlign: 'center' }}>Side</th>
                                <th style={{ textAlign: 'right' }}>Shares</th>
                                <th style={{ textAlign: 'right' }}>Avg Price</th>
                                <th style={{ textAlign: 'right' }}>Current</th>
                                <th style={{ textAlign: 'right' }}>Value</th>
                                <th style={{ textAlign: 'right' }}>P/L</th>
                            </tr>
                        </thead>
                        <tbody>
                            {positions.map((pos, i) => (
                                <tr key={i + pos.title}>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <a
                                                href={pos.slug ? getPolymarketUrl(`event/${pos.slug}`) : '#'}
                                                target="_blank"
                                                className="market-name"
                                                style={{ color: 'var(--text-main)', textDecoration: 'none' }}
                                            >
                                                {pos.title}
                                            </a>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'monospace', marginTop: '2px' }}>
                                                {pos.wallet.substring(0, 6)}...{pos.wallet.substring(pos.wallet.length - 4)}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span
                                            className={`price-indicator ${pos.outcome === 'YES' ? 'price-yes' : 'price-no'}`}
                                            style={{ padding: '0.2rem 0.5rem', minWidth: '40px', fontSize: '0.8rem' }}
                                        >
                                            {pos.outcome}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{pos.size.toLocaleString()}</td>
                                    <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>{(pos.avgPrice * 100).toFixed(0)}┬ó</td>
                                    <td style={{ textAlign: 'right' }}>{(pos.currentPrice * 100).toFixed(0)}┬ó</td>
                                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(pos.value)}</td>
                                    <td style={{ textAlign: 'right' }} className={pos.pnl >= 0 ? 'text-green' : 'text-red'}>
                                        {pos.pnl > 0 ? '+' : ''}{formatCurrency(pos.pnl)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : wallets.length > 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                    <h3 style={{ marginBottom: '1rem' }}>No Active Positions</h3>
                    <p className="text-secondary">None of the tracked wallets have open positions currently.</p>
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                    <h3 style={{ marginBottom: '1rem' }}>👋 Welcome to your Portfolio</h3>
                    <p className="text-secondary" style={{ marginBottom: '1rem' }}>
                        Add one or more Polymarket wallet addresses to get started.
                    </p>
                </div>
            )}
        </main>
    );
}
