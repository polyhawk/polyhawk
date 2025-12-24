import Link from 'next/link';
import { fetchPolymarketTrending, fetchKalshiMarkets, fetchNews, POLYMARKET_REFERRAL, fetchMarketsByCategory, fetchNewMarkets, fetchWhaleAlertsV2 as fetchWhaleAlerts } from '@/lib/api';
import { formatCurrency } from '@/data/markets';
import NewsletterSection from '@/components/NewsletterSection';
import HomeMarketTable from '@/components/HomeMarketTable';
import WhaleAlertsWidget from '@/components/WhaleAlertsWidget';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
  const [polymarketData, kalshiData, news, sportsMarketsData, politicsMarketsData, cryptoMarketsData, newMarketsData, whaleAlertsData] = await Promise.all([
    fetchPolymarketTrending(),
    fetchKalshiMarkets(),
    fetchNews(),
    fetchMarketsByCategory('sports'),
    fetchMarketsByCategory('politics'),
    fetchMarketsByCategory('crypto'),
    fetchNewMarkets(),
    fetchWhaleAlerts()
  ]);

  // Aggregate all markets for general stats
  const allMarkets = [...polymarketData, ...kalshiData].sort((a, b) => b.volume - a.volume);

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
        <p className="hero-subtitle" style={{
          color: 'var(--text-secondary)',
          marginBottom: '2.5rem',
          maxWidth: '600px',
          margin: '0 auto 2.5rem',
          lineHeight: 1.6,
          fontSize: 'clamp(1rem, 4vw, 1.25rem)'
        }}>
          Advanced prediction market insights for smarter trading | Portfolio & whale tracking | wallet analytics, news, and learn
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href={POLYMARKET_REFERRAL} target="_blank" className="btn btn-primary" style={{ fontSize: '1rem', padding: '0.8rem 1.5rem', flex: '1 1 auto', maxWidth: '300px' }}>
            Polymarket
          </a>
        </div>
      </div>

      {/* Market Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
        <div style={{ background: 'var(--surface)', padding: '1.25rem', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Global Volume (24h)</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>${(total24hVol / 1000000).toFixed(1)}M</div>
          <div className="text-green" style={{ fontSize: '0.85rem', fontWeight: 600 }}>↑ Dynamic Real-time</div>
        </div>
        <div style={{ background: 'var(--surface)', padding: '1.25rem', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Active Markets</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>{totalActiveMarkets.toLocaleString()}</div>
          <div className="text-primary" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Across 2 Platforms</div>
        </div>
        <div style={{ background: 'var(--surface)', padding: '1.25rem', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Avg Liquidity/Order</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>${(avgLiquidity / 1000).toFixed(1)}k</div>
          <div className="text-green" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Stable Depth</div>
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

        {/* Live News Pulse */}
        <div style={{
          background: 'var(--surface)',
          borderRadius: '32px',
          border: '1px solid var(--border)',
          padding: '2rem',
          boxShadow: '0 4px 30px rgba(0,0,0,0.15)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 900 }}>Latest Pulse</h2>
            <Link href="/news" className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>View All</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {news.slice(0, 3).map(item => (
              <a href={item.url} target="_blank" key={item.id} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                <div style={{ width: '70px', height: '70px', borderRadius: '16px', background: 'var(--bg)', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--border)' }}>
                  <img src={item.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>{item.source} • {item.time}</div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.3 }}>{item.title}</h3>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Market Table (Formerly Top Gainers) */}
      <div style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>🚀 Trending</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {topGainers.map(market => (
            <a href={market.url} target="_blank" key={market.id} style={{ textDecoration: 'none' }}>
              <div className="card-hover" style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '1.5rem',
                height: '100%'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }}></div>
                    {market.source}
                  </div>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', lineHeight: 1.4, color: 'var(--text-main)' }}>
                  {market.title}
                </h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Yes Price</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)' }}>{(market.yesPrice * 100).toFixed(1)}¢</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Volume</div>
                    <div style={{ fontWeight: 600 }}>${(market.volume / 1000).toFixed(1)}k</div>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Whale Alerts Section (Widget) */}
      <div style={{ marginBottom: '4rem' }}>
        <WhaleAlertsWidget initialAlerts={whaleAlertsData} />
      </div>

      {/* Leaderboard Teaser */}
      <div style={{
        marginBottom: '4rem',
        padding: '3rem',
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(30, 58, 138, 0.05) 100%)',
        borderRadius: '32px',
        border: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '2rem'
      }}>
        <div style={{ flex: '1 1 400px' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-0.02em' }}>🏆 Performance <span className="text-primary">Leaderboard</span></h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6 }}>Track the top 50 most profitable traders on Polymarket. See their active positions, volume, and total PnL in real-time.</p>
        </div>
        <Link href="/leaderboard" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
          View Full Leaderboard &rarr;
        </Link>
      </div>


      {/* News and Articles Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>

        {/* Latest News */}
        <div style={{ flex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Latest News</h2>
            <Link href="/news" className="text-primary" style={{ fontWeight: 600 }}>See all &rarr;</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {news.slice(0, 4).map(item => (
              <a href={item.url} target="_blank" key={item.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="card-hover" style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  padding: '1rem',
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'center'
                }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                    <img src={item.imageUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '4px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{item.source}</span>
                      <span>•</span>
                      <span>{item.time}</span>
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1.4, marginBottom: '4px' }}>{item.title}</h3>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

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



      {/* Newsletter Subscription Section */}
      <NewsletterSection />
    </main>
  );
}
