import { Metadata } from 'next';
import LeaderboardClient from './LeaderboardClient';
import styles from './leaderboard.module.css';

export const metadata: Metadata = {
    title: 'Top Prediction Market Traders | Profit Leaderboard | Poly Hawk',
    description: 'Discover the most successful traders on Polymarket and Kalshi. Analyze top-performing portfolios, PnL, and trading strategies.',
    openGraph: {
        title: 'Poly Hawk Leaderboard | Top Prediction Market Traders',
        description: 'Track the performance of the world\'s best binary market traders.',
        images: ['https://images.unsplash.com/photo-1526303328184-bfd54d92463e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80']
    }
};

import { fetchLeaderboardV2 } from '@/lib/api';

export default async function LeaderboardPage() {
    const initialTraders = await fetchLeaderboardV2('all', 50);

    return (
        <main className={`container ${styles.leaderboardContainer}`}>
            <div className={styles.headerSection}>
                <h1 className={styles.pageTitle}>
                    Top <span className="text-primary">Traders</span>
                </h1>
                <p className={styles.pageSubtitle}>
                    Analyze the most profitable portfolios on Polymarket
                </p>
            </div>

            <LeaderboardClient initialTraders={initialTraders} />
        </main>
    );
}
