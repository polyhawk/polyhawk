import Link from 'next/link';

export const metadata = {
    title: 'Learn | Poly Scope',
    description: 'Master the art of prediction markets.',
};

const ARTICLES = [
    {
        slug: 'what-are-prediction-markets',
        title: 'What Are Prediction Markets?',
        category: 'Basics',
        readTime: '15 min',
        description: 'Understand the fundamentals of trading on future outcomes and how probabilities are calculated.'
    },
    {
        slug: 'history-of-prediction-markets',
        title: 'The History of Prediction Markets: From DARPA to DeFi',
        category: 'Foundations',
        readTime: '15 min',
        description: 'How a controversial military experiment birthed a billion-dollar industry.'
    },
    {
        slug: 'how-to-arbitrage',
        title: 'Arbitrage Strategy 101',
        category: 'Strategy',
        readTime: '20 min',
        description: 'Learn how to profit from price differences between Polymarket and Kalshi risk-free.'
    },
    {
        slug: 'understanding-order-books',
        title: 'Reading the Order Book',
        category: 'Advanced',
        readTime: '15 min',
        description: 'Deep dive into bids, asks, liquidity depth, and how to spot market manipulation.'
    },
    {
        slug: 'polymarket-vs-kalshi',
        title: 'Polymarket vs. Kalshi: Which One Should You Use?',
        category: 'Guides',
        readTime: '12 min',
        description: 'Which platform is right for you? We compare fees, market variety, and regulation.'
    },
    {
        slug: 'hedging-real-world-risks',
        title: 'Beyond Betting: Hedging Real World Risks',
        category: 'Advanced',
        readTime: '12 min',
        description: 'Using prediction markets as a better alternative to traditional insurance.'
    },
    {
        slug: 'managing-risk-bankroll',
        title: 'Bankroll Management for Traders',
        category: 'Strategy',
        readTime: '15 min',
        description: 'How to survive a string of losses and stay in the game.'
    },
    {
        slug: 'identifying-positive-ev',
        title: 'Finding +EV Opportunities',
        category: 'Advanced',
        readTime: '18 min',
        description: 'Mathematical frameworks for identifying when the market probability is wrong.'
    },
    {
        slug: 'regulatory-landscape',
        title: 'The Future of Regulation',
        category: 'Insight',
        readTime: '12 min',
        description: 'Analysis of recent CFTC rulings and what they mean for the future of onshore prediction markets.'
    },
    {
        slug: 'impact-of-news-on-markets',
        title: 'Trading News Events',
        category: 'Strategy',
        readTime: '15 min',
        description: 'How to set up alerts and trade instantly on breaking news before the market adjusts.'
    },
    {
        slug: 'correlation-trading',
        title: 'Correlation Trading Strategies',
        category: 'Advanced',
        readTime: '18 min',
        description: 'Leveraging correlations between crypto assets and specific prediction market outcomes.'
    }
];

export default function LearnPage() {
    return (
        <main className="container" style={{ paddingBottom: '4rem' }}>
            <div style={{ margin: '4rem 0 3rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <h1 style={{ fontSize: '3rem', fontWeight: 800 }}>Learn</h1>
            </div>
            <p className="text-secondary" style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 2rem', textAlign: 'center' }}>
                <strong>Disclaimer:</strong> The information provided in these articles is for educational purposes only and may or may not be accurate. Please conduct your own research before making any trading decisions.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                {ARTICLES.map((article) => (
                    <Link href={`/learn/${article.slug}`} key={article.slug} style={{ textDecoration: 'none' }}>
                        <div className="card-hover" style={{
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: '16px',
                            padding: '2rem',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <div style={{
                                display: 'inline-block',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                background: 'rgba(163, 230, 53, 0.1)',
                                color: 'var(--primary)',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                marginBottom: '1rem',
                                alignSelf: 'flex-start'
                            }}>
                                {article.category}
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
                                {article.title}
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, flex: 1 }}>
                                {article.description}
                            </p>
                            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                <span>⏱ {article.readTime} read</span>
                                <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Read Article &rarr;</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </main>
    );
}
