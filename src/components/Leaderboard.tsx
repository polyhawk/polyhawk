'use client';

import { useState, useEffect } from 'react';
import styles from '@/app/leaderboard/leaderboard.module.css';

interface Trader {
    rank: number;
    address: string;
    username: string;
    profileImage: string;
    pnl: number;
    volume: number;
    activePositions?: number;
}

export default function Leaderboard({
    onSelectTrader,
    initialTraders = []
}: {
    onSelectTrader: (address: string) => void,
    initialTraders?: Trader[]
}) {
    const [traders, setTraders] = useState<Trader[]>(initialTraders);
    const [loading, setLoading] = useState(initialTraders.length === 0);
    const [timePeriod, setTimePeriod] = useState<'day' | 'week' | 'month' | 'all'>('all');
    const [category, setCategory] = useState<string>('All');

    const periods = [
        { id: 'day', label: 'Daily' },
        { id: 'week', label: 'Weekly' },
        { id: 'month', label: 'Monthly' },
        { id: 'all', label: 'All-Time' }
    ];

    const categories = ['All', 'Politics', 'Sports', 'Crypto', 'Business'];

    useEffect(() => {
        // Skip fetching if we already have initial traders and haven't changed filters yet
        if (traders.length > 0 && timePeriod === 'all' && category === 'All' && !loading) {
            return;
        }

        const fetchLeaderboardData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/leaderboard?limit=50&timePeriod=${timePeriod}&category=${category}`);
                const data = await response.json();

                if (Array.isArray(data)) {
                    setTraders(data);
                }
            } catch (error) {
                console.error('Error fetching leaderboard:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboardData();
    }, [timePeriod, category]);

    return (
        <div className={styles.leaderboardCard}>
            <div className={styles.cardHeader}>
                <div className={styles.headerTop}>
                    <h2 className={styles.cardTitle}>
                        <span style={{ fontSize: '1.75rem' }}>🏆</span> Top Traders
                    </h2>

                    <div className={styles.periodToggle}>
                        {periods.map(p => (
                            <button
                                key={p.id}
                                //@ts-ignore
                                onClick={() => setTimePeriod(p.id)}
                                className={`${styles.periodButton} ${timePeriod === p.id ? styles.periodButtonActive : ''}`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.categoryBar}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`${styles.categoryButton} ${category === cat ? styles.categoryButtonActive : ''}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.leaderboardTable}>
                    <thead className={styles.tableHeader}>
                        <tr className={styles.headerRow}>
                            <th className={styles.tableTh}>Rank</th>
                            <th className={styles.tableTh}>Trader</th>
                            <th className={`${styles.tableTh} ${styles.thCenter}`}>Active</th>
                            <th className={`${styles.tableTh} ${styles.thRight}`}>PnL</th>
                            <th className={`${styles.tableTh} ${styles.thRight}`}>Insight</th>
                        </tr>
                    </thead>
                    <tbody style={{ opacity: loading ? 0.6 : 1, transition: 'opacity 0.2s' }}>
                        {traders.length > 0 ? traders.map((trader, index) => (
                            <tr key={`${trader.address}-${index}`} className={styles.tableRow}>
                                <td className={styles.tableTd}>
                                    <span className={`${styles.rankBadge} ${index < 3 ? styles.rankTop3 : ''}`}>
                                        {index + 1}
                                    </span>
                                </td>
                                <td className={styles.tableTd}>
                                    <div className={styles.traderInfo}>
                                        <div className={styles.avatarWrapper}>
                                            {trader.profileImage ? (
                                                <img src={trader.profileImage} alt="" className={styles.avatar} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>👤</div>
                                            )}
                                        </div>
                                        <div>
                                            <a
                                                href={`https://polymarket.com/profile/${trader.address}?via=polyhawk`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={styles.traderName}
                                            >
                                                {trader.username || 'Anonymous'}
                                            </a>
                                            <div className={styles.traderAddress}>
                                                {trader.address ? `${trader.address.slice(0, 8)}...${trader.address.slice(-6)}` : 'Unknown'}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className={`${styles.tableTd} ${styles.thCenter}`}>
                                    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <span className={`${styles.positionBadge} ${trader.activePositions && trader.activePositions > 0 ? styles.positionActive : ''}`}>
                                            {trader.activePositions || 0}
                                        </span>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px', textTransform: 'uppercase', fontWeight: 500 }}>positions</span>
                                    </div>
                                </td>
                                <td className={`${styles.tableTd} ${styles.thRight}`}>
                                    <span className={`${styles.pnlText} ${trader.pnl >= 0 ? styles.pnlPositive : styles.pnlNegative}`}>
                                        {trader.pnl >= 0 ? '+' : '-'}${Math.abs(trader.pnl).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </span>
                                </td>
                                <td className={`${styles.tableTd} ${styles.thRight}`}>
                                    <button
                                        onClick={() => onSelectTrader(trader.address)}
                                        className={styles.analyzeButton}
                                    >
                                        Analyze 📊
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5}>
                                    <div className={styles.emptyState}>
                                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>No top traders found for this selection</div>
                                        <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Try changing the time period or category filter.</div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className={styles.footerNote}>
                <span className={styles.noteText}>
                    🔥 Showing Top 50 traders by PnL. Smart caching enabled (5m).
                </span>
            </div>
        </div>
    );
}
