import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Live Prediction Markets | Poly Hawk - Real-Time Market Aggregator',
  description: 'Trade on live prediction markets at Poly Hawk. Real-time data on politics, crypto, sports, and current events with prices, liquidity, and volume.',
  keywords: 'prediction markets, live markets, trading, crypto predictions, political markets, sports betting, polymarket aggregator',
  authors: [{ name: 'Poly Hawk' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://polyhawk.fun/markets',
  },

  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://polyhawk.fun',
    siteName: 'Poly Hawk',
    title: 'Poly Hawk | Live Prediction Markets',
    description: 'Real-time prediction market aggregator with live trading, liquidity, and volume data.',
    images: [
      {
        url: 'https://polyhawk.fun/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Poly Hawk - Real-Time Prediction Market Aggregator',
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'Poly Hawk Prediction Markets',
    description: 'Live prediction markets with real-time data on politics, crypto, and more.',
    images: ['https://polyhawk.fun/og-image.jpg'],
    creator: '@polyhawk',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <Navbar />
        <main>{children}</main>
        <footer style={{
          borderTop: '1px solid var(--border)',
          padding: '3rem 1rem',
          marginTop: 'auto',
          background: '#111'
        }}>
          <div className="container">
            <div style={{ display: 'grid', gap: '2rem', marginBottom: '2rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>POLY<span className="text-primary">HAWK</span></h3>
                <p className="text-secondary" style={{ maxWidth: '400px', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  Advanced prediction market insights for smarter trading
                </p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <a href="https://x.com/PolyHawk0" target="_blank" rel="noopener noreferrer" style={{
                    color: 'white',
                    background: 'rgba(255,255,255,0.05)',
                    padding: '0.6rem 1rem',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s',
                    border: '1px solid var(--border)'
                  }} className="social-link">
                    <span style={{ fontSize: '1.2rem' }}>𝕏</span>
                    Follow @PolyHawk0
                  </a>
                </div>
              </div>
            </div>
            <div style={{
              borderTop: '1px solid #222',
              paddingTop: '2rem',
              color: '#666',
              fontSize: '0.8rem',
              lineHeight: 1.6,
              textAlign: 'justify'
            }}>
              <p style={{ marginBottom: '1rem' }}>IMPORTANT DISCLAIMER:</p>
              <p>
                We are not affiliated with anyone and do not offer trading or anything. This is for informational purposes only.
              </p>
              <p style={{ marginTop: '0.5rem', opacity: 0.7 }}>
                All content provided herein our website, hyperlinked sites, associated applications, forums, blogs, social media accounts and other platforms ("Site") is for your general information only, procured from third party sources. We make no warranties of any kind in relation to our content, including but not limited to accuracy and updatedness. No part of the content that we provide constitutes financial advice, legal advice or any other form of advice meant for your specific reliance for any purpose.
              </p>
              <p style={{ marginTop: '1rem' }}>&copy; {new Date().getFullYear()} Poly Hawk. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
