'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './whale-alerts.module.css';

interface WhaleAlert {
    id: string;
    marketId: string;
    marketTitle: string;
    marketSlug: string;
    walletAddress: string;
    amount: number;
    side: 'YES' | 'NO';
    price: number;
    timestamp: number;
    marketUrl: string;
    icon?: string;
    category?: string;
}

interface WhaleAlertsClientProps {
    initialAlerts: WhaleAlert[];
}

export default function WhaleAlertsClient({ initialAlerts }: WhaleAlertsClientProps) {
    const [whaleAlerts, setWhaleAlerts] = useState<WhaleAlert[]>(initialAlerts);
    const [timeFrame, setTimeFrame] = useState('24H');
    const [isClient, setIsClient] = useState(false);

    const STORAGE_KEY = 'polyhawk_whale_alerts_v1';

    useEffect(() => {
        setIsClient(true);
        // Load from storage and merge with initial alerts
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setWhaleAlerts(prev => {
                    const existingIds = new Set(parsed.map((a: WhaleAlert) => a.id));
                    const uniqueNew = initialAlerts.filter(a => !existingIds.has(a.id));
                    const combined = [...uniqueNew, ...parsed]
                        .sort((a, b) => b.timestamp - a.timestamp)
                        .slice(0, 1000); // Increased to 1000

                    // Update storage with merged results
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(combined));
                    return combined;
                });
            } catch (e) {
                console.error('Failed to parse stored alerts', e);
            }
        } else if (initialAlerts.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(initialAlerts));
        }
    }, [initialAlerts]);

    const fetchWhaleAlerts = async () => {
        try {
            const response = await fetch('/api/whale-alerts', { cache: 'no-store' });
            if (!response.ok) return;

            const newAlerts: WhaleAlert[] = await response.json();

            setWhaleAlerts(prev => {
                const existingIds = new Set(prev.map(a => a.id));
                const uniqueNew = newAlerts.filter(a => !existingIds.has(a.id));

                if (uniqueNew.length === 0) return prev;

                const combined = [...uniqueNew, ...prev]
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .slice(0, 1000);

                if (typeof window !== 'undefined') {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(combined));
                }

                return combined;
            });
        } catch (error) {
            console.error('Error fetching whale alerts:', error);
        }
    };

    useEffect(() => {
        // Reduced to 15s to match homepage for consistent live experience
        const interval = setInterval(fetchWhaleAlerts, 15000);
        return () => clearInterval(interval);
    }, []);

    const formatTimeAgo = (timestamp: number) => {
        const seconds = Math.floor(Date.now() / 1000 - timestamp);
        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    const getWhaleEmoji = (amount: number) => {
        if (amount >= 50000) return '🐋🐋🐋';
        if (amount >= 20000) return '🐋🐋';
        return '🐋';
    };

    const timeFrames = ['10M', '1H', '24H', '7D'];

    const filteredAlerts = whaleAlerts.filter(alert => {
        const secondsAgo = Date.now() / 1000 - alert.timestamp;
        if (timeFrame === '10M' && secondsAgo > 600) return false;
        if (timeFrame === '1H' && secondsAgo > 3600) return false;
        if (timeFrame === '24H' && secondsAgo > 86400) return false;
        if (timeFrame === '7D' && secondsAgo > 604800) return false;
        return true;
    });

    return (
        <div className={styles.alertsGrid}>
            <div className={styles.filtersBar}>
                <div className={styles.timeFramePicker}>
                    {timeFrames.map(tf => (
                        <button
                            key={tf}
                            onClick={() => setTimeFrame(tf)}
                            className={`${styles.tfButton} ${timeFrame === tf ? styles.tfButtonActive : ''}`}
                        >
                            {tf}
                        </button>
                    ))}
                </div>
            </div>

            {filteredAlerts.length > 0 ? (
                filteredAlerts.map((alert) => (
                    <div key={alert.id} className={styles.whaleAlertCard}>
                        <div className={`
                            ${styles.alertAccent} 
                            ${alert.amount >= 50000 ? styles.accentWhale : alert.amount >= 20000 ? styles.accentBigFish : styles.accentRegular}
                        `} />

                        <div className={styles.cardHeader}>
                            <div style={{ flex: 1, minWidth: '300px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                    {alert.icon ? (
                                        <img src={alert.icon} alt="" className={styles.marketIcon} />
                                    ) : (
                                        <span className={styles.whaleEmoji}>{getWhaleEmoji(alert.amount)}</span>
                                    )}

                                    <div>
                                        <div className={styles.timeAgo}>
                                            {formatTimeAgo(alert.timestamp)}
                                        </div>
                                        <div className={styles.amountText}>
                                            ${alert.amount.toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                <Link
                                    href={alert.marketUrl}
                                    target="_blank"
                                    className={styles.marketLink}
                                >
                                    {alert.marketTitle}
                                </Link>

                                <div className={styles.metadataRow}>
                                    <div>
                                        <span className={styles.metaLabel}>Side: </span>
                                        <span className={`${styles.sideTerm} ${alert.side === 'YES' ? styles.sideYes : styles.sideNo}`}>
                                            {alert.side}
                                        </span>
                                    </div>
                                    <div className={styles.walletInfo}>
                                        <span className={styles.walletLabel}>Trader:</span>
                                        <span className={styles.walletAddress}>
                                            {isClient ? (
                                                `${alert.walletAddress.slice(0, 6)}...${alert.walletAddress.slice(-4)}`
                                            ) : (
                                                '0x...'
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className={styles.emptyState}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎣</div>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No whales spotted in this time frame</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Try selecting a longer duration or check back later.</p>
                </div>
            )}
        </div>
    );
}
