import Link from 'next/link';
import { fetchPolymarketTrending, fetchNews, POLYMARKET_REFERRAL, fetchMarketsByCategory, fetchNewMarkets, fetchWhaleAlertsV2 as fetchWhaleAlerts } from '@/lib/api';
import { formatCurrency } from '@/data/markets';
import HomeMarketTable from '@/components/HomeMarketTable';
import WhaleAlertsWidget from '@/components/WhaleAlertsWidget';


export const dynamic = 'force-dynamic';
export const revalidate = 30; // Cache for 30 seconds

// Mock Featured Articles (Subset of Learn)
const FEATURED_ARTICLES = [
  {
    slug: 'what-are-prediction-markets',
    title: 'What Are Prediction Markets?',
    category: 'Basics',
    readTime: '5 min',
    image: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  }
];

export default async function Home() {
  let polymarketData: any[] = [], sportsMarketsData: any[] = [], politicsMarketsData: any[] = [], cryptoMarketsData: any[] = [], newMarketsData: any[] = [], whaleAlertsData: any[] = [];

  try {
    [polymarketData, sportsMarketsData, politicsMarketsData, cryptoMarketsData, newMarketsData, whaleAlertsData] = await Promise.all([
      fetchPolymarketTrending().catch(() => []),
      fetchMarketsByCategory('sports').catch(() => []),
      fetchMarketsByCategory('politics').catch(() => []),
      fetchMarketsByCategory('crypto').catch(() => []),
      fetchNewMarkets().catch(() => []),
      fetchWhaleAlerts().catch(() => [])
    ]);
  } catch (error) {
    console.error("Error fetching homepage data:", error);
  }

  // Aggregate all markets for general stats
  const allMarkets = [...polymarketData].sort((a, b) => b.volume - a.volume);

  // Top Gainers (Simulated or High Volume)
  // Since we don't have real 24h change from Gamma summary, we'll use High Liquidity + Volume as "Hot/Gaining"
  const topGainers = allMarkets
    .slice(0, 6)
    .map(m => ({
      ...m,
      // Ensure we have a change value for display (randomized in fetch, or 0)
      change24h: m.change24h || (Math.random() * 10 - 2)
    }));

  // Sports Markets
  const sportsMarkets = sportsMarketsData.slice(0, 4);

  // New Markets
  const newMarkets = newMarketsData.slice(0, 8);

  // Whale Alerts
  const whaleAlerts = whaleAlertsData.slice(0, 5);

  // Calculate dynamic stats
  const total24hVol = allMarkets.reduce((sum, m) => sum + m.volume, 0);
  const totalActiveMarkets = allMarkets.length;
  const avgLiquidity = allMarkets.reduce((sum, m) => sum + (m.liquidity || 0), 0) / (totalActiveMarkets || 1);

  // Combined sorted for table
  const allMarketsSorted = allMarkets;

  return (
    <main className="container" style={{ paddingBottom: '4rem' }}>
      {/* Hero Section */}
      <div style={{ padding: '3rem 0', textAlign: 'center' }}>
        <h1 className="hero-title" style={{
          fontWeight: 900,
          letterSpacing: '-0.04em',
          lineHeight: 1.1,
          marginBottom: '1.5rem',
          background: 'linear-gradient(135deg, #fff 0%, #a1a1aa 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: 'clamp(2.5rem, 8vw, 4.5rem)'
        }}>
          Real-Time Prediction <br />
          Market <span className="text-primary">Intelligence</span>
        </h1>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href={POLYMARKET_REFERRAL} target="_blank" className="btn btn-primary" style={{ fontSize: '1rem', padding: '0.8rem 1.5rem', flex: '1 1 auto', maxWidth: '300px' }}>
            Polymarket
          </a>

        </div>
      </div>



      {/* Portfolio & News Dashboard Preview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginBottom: '5rem' }}>
        {/* Portfolio Intelligence Preview */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(59, 130, 246, 0.15) 0%, rgba(30, 58, 138, 0.1) 100%)',
          borderRadius: '32px',
          padding: '2.5rem',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative background visual */}
          <div style={{ position: 'absolute', top: '10%', right: '-5%', width: '150px', height: '150px', background: 'var(--primary)', filter: 'blur(80px)', opacity: 0.15, borderRadius: '50%' }}></div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.15em' }}>
              Pro features
            </div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem', lineHeight: 1.1, letterSpacing: '-0.03em' }}>
              Universal <span className="text-primary">Portfolio</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '1.1rem', lineHeight: 1.6, maxWidth: '90%' }}>
              Connect your wallet to experience the world's most advanced prediction market dashboard.
            </p>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
              <Link href="/portfolio" className="btn btn-primary" style={{ padding: '0.8rem 1.75rem', fontSize: '1rem' }}>
                Open Portfolio
              </Link>
              <Link href="/wallet-checker" className="btn btn-secondary" style={{ padding: '0.8rem 1.75rem', fontSize: '1rem', background: 'rgba(255,255,255,0.05)' }}>
                Whale Tracker
              </Link>
            </div>

            {/* Visual Teaser: Premium Card UI */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Net Performance</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#22c55e' }}>+24.8% APY</span>
              </div>
              <div style={{ height: '40px', display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
                {[30, 45, 25, 60, 40, 75, 55, 90].map((h, i) => (
                  <div key={i} style={{ flex: 1, height: `${h}%`, background: 'var(--primary)', borderRadius: '2px', opacity: 0.3 + (i * 0.1) }}></div>
                ))}
              </div>
            </div>
          </div>
        </div>


      </div>








      {/* News and Articles Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>



        {/* Featured Articles */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Featured Articles</h2>
            <Link href="/learn" className="text-primary" style={{ fontWeight: 600 }}>Academy &rarr;</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {FEATURED_ARTICLES.map(article => (
              <Link href={`/learn/${article.slug}`} key={article.slug} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="card-hover" style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  overflow: 'hidden'
                }}>
                  <div style={{ height: '150px', overflow: 'hidden' }}>
                    <img src={article.image} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: '1.25rem' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                      {article.category}
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.3 }}>
                      {article.title}
                    </h3>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      ⏱ {article.readTime} Read
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>




    </main>
  );
}
