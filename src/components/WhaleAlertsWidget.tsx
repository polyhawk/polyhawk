'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { WhaleAlert } from '@/lib/api';

interface WhaleAlertsWidgetProps {
    initialAlerts: WhaleAlert[];
}

export default function WhaleAlertsWidget({ initialAlerts }: WhaleAlertsWidgetProps) {
    const [alerts, setAlerts] = useState<WhaleAlert[]>(initialAlerts);
    const [timeFrame, setTimeFrame] = useState('24H');
    const STORAGE_KEY = 'polyhawk_whale_alerts_v1';

    // 1. Load from backend on mount (with localStorage as fallback)
    useEffect(() => {
        const loadAlerts = async () => {
            try {
                // Try to fetch from backend first
                const response = await fetch('/api/whale-alerts-store?limit=100');
                if (response.ok) {
                    const data = await response.json();
                    if (data.alerts && data.alerts.length > 0) {
                        setAlerts(data.alerts);
                        // Update localStorage cache
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.alerts.slice(0, 1000)));
                        return;
                    }
                }
            } catch (err) {
                console.error('Failed to fetch from backend, using localStorage:', err);
            }

            // Fallback to localStorage if backend fails
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    setAlerts(parsed);
                } catch (e) {
                    console.error('Failed to parse stored alerts', e);
                }
            }
        };

        loadAlerts();
    }, []);

    // 2. Poll every 15 seconds: fetch fresh alerts and store in backend
    useEffect(() => {
        const poll = async () => {
            try {
                // Fetch fresh alerts from Polymarket
                const freshResponse = await fetch('/api/whale-alerts', { cache: 'no-store' });
                if (freshResponse.ok) {
                    const freshAlerts = await freshResponse.json();
                    // Store them in backend
                    if (freshAlerts && freshAlerts.length > 0) {
                        await fetch('/api/whale-alerts-store', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(freshAlerts)
                        }).catch(() => { }); // Silent fail if storage fails
                    }
                }

                // Then fetch from backend storage to get all accumulated alerts
                const response = await fetch('/api/whale-alerts-store?limit=100', { cache: 'no-store' });
                if (!response.ok) return;
                const data = await response.json();
                const newAlerts: WhaleAlert[] = data.alerts || [];

                setAlerts(prev => {
                    const combined = [...newAlerts]
                        .sort((a, b) => b.timestamp - a.timestamp)
                        .slice(0, 1000);

                    // Update localStorage cache
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(combined));
                    return combined;
                });
            } catch (err) {
                console.error('Polling error:', err);
            }
        };

        const interval = setInterval(poll, 15000);
        return () => clearInterval(interval);
    }, []);

    // Filter Logic based on selected time frame
    const filteredAlerts = alerts.filter(alert => {
        const secondsAgo = Date.now() / 1000 - alert.timestamp;
        if (timeFrame === '10M' && secondsAgo > 600) return false;
        if (timeFrame === '1H' && secondsAgo > 3600) return false;
        if (timeFrame === '24H' && secondsAgo > 86400) return false;
        if (timeFrame === '7D' && secondsAgo > 604800) return false;
        return true;
    });

    // Display only top 5 of filtered for the widget
    const displayedAlerts = filteredAlerts.slice(0, 5);
    const timeFrames = ['10M', '1H', '24H'];

    return (
        <div style={{ marginBottom: '4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        🐋 Whale Alerts
                    </h2>
                    <span style={{
                        fontSize: '0.8rem',
                        padding: '3px 10px',
                        background: 'rgba(239, 68, 68, 0.15)',
                        color: '#ef4444',
                        borderRadius: '20px',
                        fontWeight: 700,
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        letterSpacing: '0.05em'
                    }}>LIVE</span>
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Time Frame */}
                    <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                        {timeFrames.map((tf) => (
                            <button
                                key={tf}
                                onClick={() => setTimeFrame(tf)}
                                style={{
                                    padding: '0.4rem 0.8rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: timeFrame === tf ? 'rgba(255,255,255,0.08)' : 'transparent',
                                    color: timeFrame === tf ? 'var(--text-main)' : 'var(--text-secondary)',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {tf}
                            </button>
                        ))}
                    </div>

                    <Link href="/whale-alerts" className="text-primary hover-glow" style={{ fontWeight: 700, fontSize: '0.9rem', marginLeft: '0.5rem', textDecoration: 'none' }}>
                        All 🐋 →
                    </Link>
                </div>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {displayedAlerts.length > 0 ? displayedAlerts.map((alert) => {
                    const timeAgo = (() => {
                        const seconds = Math.floor(Date.now() / 1000 - alert.timestamp);
                        if (seconds < 60) return `${seconds}s ago`;
                        const minutes = Math.floor(seconds / 60);
                        if (minutes < 60) return `${minutes}m ago`;
                        const hours = Math.floor(minutes / 60);
                        if (hours < 24) return `${hours}h ago`;
                        return `${Math.floor(hours / 24)}d ago`;
                    })();

                    const whaleEmoji = alert.amount >= 50000 ? '🐋🐋🐋' : alert.amount >= 20000 ? '🐋🐋' : '🐋';

                    return (
                        <div
                            key={alert.id}
                            className="card-hover"
                            style={{
                                background: 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: '16px',
                                padding: '1.25rem',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '3px',
                                background: alert.amount >= 50000
                                    ? 'linear-gradient(90deg, #ef4444, #f59e0b)'
                                    : alert.amount >= 20000
                                        ? 'linear-gradient(90deg, #f59e0b, #eab308)'
                                        : 'linear-gradient(90deg, #3b82f6, #8b5cf6)'
                            }} />

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                <div style={{ flex: 1, minWidth: '250px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                        <span style={{ fontSize: '1.25rem' }}>{whaleEmoji}</span>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{timeAgo}</div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>
                                                ${alert.amount.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                    <Link
                                        href={alert.marketUrl}
                                        target="_blank"
                                        style={{
                                            fontSize: '1rem',
                                            fontWeight: 600,
                                            color: 'var(--text-main)',
                                            textDecoration: 'none',
                                            display: 'block',
                                            marginBottom: '0.75rem',
                                            transition: 'color 0.2s ease'
                                        }}
                                        className="whale-market-link"
                                    >
                                        {alert.marketTitle}
                                    </Link>
                                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.85rem' }}>
                                        <div>
                                            <span style={{ color: 'var(--text-secondary)' }}>Side: </span>
                                            <span
                                                style={{
                                                    fontWeight: 600,
                                                    color: alert.side === 'YES' ? '#10b981' : '#ef4444',
                                                    padding: '0.2rem 0.4rem',
                                                    background: alert.side === 'YES' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                    borderRadius: '4px'
                                                }}
                                            >
                                                {alert.side}
                                            </span>
                                        </div>
                                        <div>
                                            <span style={{ color: 'var(--text-secondary)' }}>Price: </span>
                                            <span style={{ fontWeight: 600 }}>{(alert.price * 100).toFixed(1)}¢</span>
                                        </div>
                                    </div>
                                </div>
                                <a
                                    href={alert.marketUrl}
                                    target="_blank"
                                    className="btn btn-primary"
                                    style={{ padding: '0.6rem 1.25rem', whiteSpace: 'nowrap' }}
                                >
                                    Polymarket
                                </a>
                            </div>
                        </div>
                    );
                }) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                        No whale activity in the last {timeFrame}.
                    </div>
                )}
            </div>
            <style jsx>{`
                .whale-market-link:hover {
                    color: var(--primary) !important;
                }
            `}</style>
        </div>
    );
}
