import Link from 'next/link';
import { fetchPolymarketTrending, fetchMarketsByCategory, fetchNewMarkets, Market } from '@/lib/api';
import { formatCurrency } from '@/data/markets';
import { Metadata } from 'next';
import styles from './markets.module.css';

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ filter?: string }> }): Promise<Metadata> {
    const params = await searchParams;
    const filter = params.filter || 'live';
    const label = filter.charAt(0).toUpperCase() + filter.slice(1).replace('-', ' ');

    return {
        title: `${label} Prediction Markets | Poly Hawk`,
        description: `Explore live ${label.toLowerCase()} prediction markets. Real-time data, volume, and liquidity on Poly Hawk.`,
        openGraph: {
            title: `${label} Prediction Markets | Poly Hawk`,
            description: `Track real-time ${label.toLowerCase()} prediction markets with Poly Hawk aggregator.`,
        }
    };
}

// This is a server component
export default async function MarketsPage({
    searchParams,
}: {
    searchParams: Promise<{ filter?: string }>;
}) {
    // 1. Determine which data to fetch based on filter
    const params = await searchParams;
    const filter = params.filter || 'live';

    let markets: Market[] = [];
    let title = 'Live Events';
    let subtitle = 'Currently active prediction events on Polymarket';

    if (filter === 'new') {
        markets = await fetchNewMarkets();
        title = 'New Markets';
        subtitle = 'Recently created markets';
    } else if (filter === 'resolved') {
        markets = [];
        title = 'Resolved Markets';
        subtitle = 'Markets that have ended';
    } else if (['politics', 'crypto', 'sports', 'business', 'science', 'pop-culture'].includes(filter)) {
        const displayLabel = filter === 'pop-culture' ? 'Pop Culture' : filter.charAt(0).toUpperCase() + filter.slice(1);
        markets = await fetchMarketsByCategory(displayLabel);
        title = displayLabel;
        subtitle = `${displayLabel} prediction markets`;
    } else {
        markets = await fetchPolymarketTrending();
    }

    return (
        <main className={`container ${styles.marketsPageContainer}`}>
            {/* Sidebar Navigation - Fixed for Mobile */}
            <aside className={styles.marketsSidebar}>
                <div className={styles.sidebarSticky}>
                    <h3 className={styles.sidebarHeader}>Filters</h3>

                    {/* Main Categories */}
                    <nav className={styles.sidebarNav}>
                        {[
                            { id: 'live', label: '⚡ Live' },
                            { id: 'new', label: '🆕 New' },
                        ].map(cat => (
                            <Link
                                key={cat.id}
                                href={`/markets?filter=${cat.id}`}
                                className={`${styles.sidebarLink} ${filter === cat.id ? styles.sidebarLinkActive : ''}`}
                            >
                                <span className={styles.emoji}>{cat.label.split(' ')[0]}</span>
                                <span className={styles.labelText}>{cat.label.split(' ').slice(1).join(' ')}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* Topic Categories */}
                    <div className={styles.sidebarDivider}></div>
                    <div className={styles.sidebarHeaderSm}>Topics</div>
                    <nav className={styles.sidebarNav}>
                        {[
                            { id: 'politics', label: '⚖️ Politics' },
                            { id: 'crypto', label: '₿ Crypto' },
                            { id: 'sports', label: '⚽ Sports' },
                            { id: 'business', label: '💼 Business' },
                            { id: 'science', label: '🧬 Science' },
                            { id: 'pop-culture', label: '🎭 Pop Culture' },
                        ].map(cat => (
                            <Link
                                key={cat.id}
                                href={`/markets?filter=${cat.id}`}
                                className={`${styles.sidebarLink} ${filter === cat.id ? styles.sidebarLinkActive : ''}`}
                            >
                                <span className={styles.emoji}>{cat.label.split(' ')[0]}</span>
                                <span className={styles.labelText}>{cat.label.split(' ').slice(1).join(' ')}</span>
                            </Link>
                        ))}
                    </nav>

                    <div className={styles.sidebarDivider}></div>
                    <div className={styles.sidebarHeaderSm}>Status</div>
                    <nav className={styles.sidebarNav}>
                        <Link
                            href="/markets?filter=resolved"
                            className={`${styles.sidebarLink} ${filter === 'resolved' ? styles.sidebarLinkActive : ''}`}
                        >
                            <span className={styles.emoji}>🏁</span>
                            <span className={styles.labelText}>Resolved</span>
                        </Link>
                    </nav>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className={styles.marketsContent}>
                <div className={styles.contentHeader}>
                    <h1>{title}</h1>
                    <p className="text-secondary">{subtitle}</p>
                </div>

                <div className={styles.tableResponsiveWrapper}>
                    <div className="desktop-only">
                        <table className={styles.marketTableV2Full}>
                            <thead>
                                <tr>
                                    <th>Market</th>
                                    <th>Price</th>
                                    <th>Liquidity</th>
                                    <th>Volume</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {markets.map((market, i) => (
                                    <tr key={market.id}>
                                        <td>
                                            <div className={styles.marketCell}>
                                                <span className={styles.marketIndex}>{i + 1}</span>
                                                {market.image && (
                                                    <img src={market.image} alt="" className={styles.marketThumb} />
                                                )}
                                                <a href={market.url} target="_blank" className={styles.marketLinkMain}>
                                                    {market.title}
                                                </a>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.priceStack}>
                                                <span className="price-indicator price-yes">{(market.yesPrice * 100).toFixed(1)}%</span>
                                                <span className="price-indicator price-no">{(market.noPrice * 100).toFixed(1)}%</span>
                                            </div>
                                        </td>
                                        <td className={styles.fontNumeric}>{formatCurrency(market.liquidity)}</td>
                                        <td className={styles.fontNumeric}>{formatCurrency(market.volume)}</td>
                                        <td>
                                            <a href={market.url} target="_blank" className="btn btn-secondary btn-sm">
                                                Polymarket
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card Layout for Better UX */}
                    <div className="mobile-only">
                        <div className={styles.mobileCardStack}>
                            {markets.map((market, i) => (
                                <a href={market.url} target="_blank" key={market.id} className={styles.marketMobileCard}>
                                    <div className={styles.mCardHeader}>
                                        <span className={styles.mCardRank}>#{i + 1}</span>
                                        <div className={styles.mCardTitle}>{market.title}</div>
                                    </div>
                                    <div className={styles.mCardBody}>
                                        <div className={styles.mPriceRow}>
                                            <div className={`${styles.mPriceBox} ${styles.mPriceBoxYes}`}>
                                                <span className={styles.mLabel}>YES</span>
                                                <span className={styles.mValue}>{(market.yesPrice * 100).toFixed(0)}¢</span>
                                            </div>
                                            <div className={`${styles.mPriceBox} ${styles.mPriceBoxNo}`}>
                                                <span className={styles.mLabel}>NO</span>
                                                <span className={styles.mValue}>{(market.noPrice * 100).toFixed(0)}¢</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.mCardFooter}>
                                        <span>Vol: {formatCurrency(market.volume)}</span>
                                        <span className="btn btn-secondary btn-xs">Details</span>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>

                    {markets.length === 0 && (
                        <div className={styles.emptyState}>
                            No markets found in this category currently.
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
