import Link from 'next/link';

// Map slugs to images for demo purposes
const ARTICLE_IMAGES: Record<string, string> = {
    'what-are-prediction-markets': 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    'how-to-arbitrage': 'https://images.unsplash.com/photo-1611974765270-ca1258634369?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    'polymarket-vs-kalshi': 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    'understanding-order-books': 'https://images.unsplash.com/photo-1611095773760-41253b85638a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    'managing-risk-bankroll': 'https://images.unsplash.com/photo-1579621909532-2d6ef9d32b78?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    'identifying-positive-ev': 'https://images.unsplash.com/photo-1504868584819-f8e90526354c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    'correlation-trading': 'https://images.unsplash.com/photo-1551288049-bbbda536339a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    'history-of-prediction-markets': 'https://images.unsplash.com/photo-1456324504439-367cef3bafc3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    'hedging-real-world-risks': 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80'
};

const ARTICLE_CONTENT: Record<string, { title: string; date: string; readTime: string; content: React.ReactNode }> = {
    'what-are-prediction-markets': {
        title: 'What Are Prediction Markets?',
        date: 'Dec 24, 2025',
        readTime: '15 min read',
        content: (
            <>
                <p>Prediction markets are one of the most powerful tools for information aggregation in the modern world. At their core, they are exchange-traded markets created for the purpose of trading the outcome of future events. Unlike traditional stock markets where you trade ownership in a company, in a prediction market, you trade the probability of a specific outcome occurring.</p>

                <h2>The Wisdom of the Crowds</h2>
                <p>The theoretical foundation of prediction markets is the "Wisdom of the Crowds" hypothesis. This suggests that the collective knowledge of a large group of people—each with different pieces of information, perspectives, and biases—is often more accurate than any single expert. In a prediction market, participants have "skin in the game." If they are wrong, they lose money; if they are right, they profit. This financial incentive forces participants to be honest and research thoroughly, leading to highly accurate market prices that reflect the true probability of an event.</p>

                <h2>How the Mechanics Work (The Binary System)</h2>
                <p>Most prediction markets use a binary share system. Each contract represents a "Yes" or "No" outcome. These shares trade between $0.01 and $0.99. The price represents the market's estimated probability of the event happening.</p>
                <ul>
                    <li>If a "Yes" share trades at <strong>$0.65</strong>, the market believes there is a <strong>65% chance</strong> the event will occur.</li>
                    <li>If the event occurs (resolves as True), every "Yes" share pays out exactly <strong>$1.00</strong>.</li>
                    <li>If the event does not occur, the share becomes worthless (<strong>$0.00</strong>).</li>
                </ul>
                <p>This simplicity allows for clear calculation of ROI. Buying at 65¢ for a $1.00 payout offers a 53.8% return if you are correct. However, the risk is a 100% loss of the principal if you are wrong.</p>

                <h2>Types of Prediction Markets</h2>
                <p>While elections and sports are the most visible categories, the architecture can be applied to almost anything:</p>
                <ul>
                    <li><strong>Political Events:</strong> Presidential winners, legislative approvals, cabinet appointments.</li>
                    <li><strong>Economic Indicators:</strong> Fed rate hikes, CPI inflation data, GDP growth figures.</li>
                    <li><strong>Technological Milestones:</strong> AI model release dates, SpaceX launch successes, hardware ship dates.</li>
                    <li><strong>Pop Culture & Science:</strong> Movie box office numbers, Nobel Prize winners, viral social media trends.</li>
                </ul>

                <h2>Why Prediction Markets Matter</h2>
                <p>Beyond personal profit, prediction markets serve a vital social function. They provide "truth-seeking" data in an era of polarized media. When a news anchor says an event is "certain," but the prediction market shows it at 40%, the market is usually correct. They are real-time, dynamic, and resistant to "expert" bias since they are governed by the harsh reality of profit and loss.</p>
            </>
        )
    },
    'how-to-arbitrage': {
        title: 'Arbitrage Strategy 101: Risk-Minimization Tactics',
        date: 'Dec 24, 2025',
        readTime: '20 min read',
        content: (
            <>
                <p>Arbitrage is the primary method used by professional traders to secure consistent returns with minimal risk. In the context of prediction markets, arbitrage involves exploiting price discrepancies for the same underlying event across different platforms, such as Polymarket and Kalshi.</p>

                <h2>The Anatomy of a Spread</h2>
                <p>Discrepancies occur for several reasons: different user bases, varying liquidity depths, and different regional regulations. For instance, an offshore market like Polymarket might be flooded with retail "hype" traders, while a regulated market like Kalshi might be dominated by more conservative, institutional-style players. This creates "the spread"—a gap in pricing that you can exploit.</p>

                <h2>Mathematical Execution: The Hedge</h2>
                <p>True arbitrage in binary markets is achieved when you can buy the "Yes" outcome on Platform A and the "No" outcome on Platform B for a combined cost of less than $1.00. Because one of these outcomes <em>must</em> be true, you are guaranteed a $1.00 payout.</p>

                <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '2rem', borderRadius: '16px', margin: '2rem 0', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                    <h3 style={{ marginTop: 0, color: 'var(--primary)' }}>Case Study: The $10k Fed Trade</h3>
                    <p>Imagine the market "Will the Fed hike rates in January?"</p>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li style={{ marginBottom: '0.5rem' }}>🔵 <strong>Polymarket:</strong> "Yes" is trading at <strong>62¢</strong></li>
                        <li style={{ marginBottom: '1rem' }}>🔴 <strong>Kalshi:</strong> "No" is trading at <strong>34¢</strong></li>
                    </ul>
                    <p><strong>Operation:</strong> You buy 10,000 shares of Yes on Polymarket ($6,200) and 10,000 shares of No on Kalshi ($3,400).</p>
                    <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                        <p style={{ margin: 0 }}><strong>Total Capital Risked:</strong> $9,600</p>
                        <p style={{ margin: '0.5rem 0 0' }}><strong>Guaranteed Payout:</strong> $10,000</p>
                        <p style={{ margin: '0.5rem 0 0', fontWeight: 'bold', color: '#10b981' }}>Net Profit: $400 (4.16% ROI)</p>
                    </div>
                </div>

                <h2>Identifying Opportunities</h2>
                <p>At Poly Hawk, our arbitrage scanner looks for several patterns:</p>
                <ul>
                    <li><strong>Directional Spread:</strong> Yes on A + No on B &lt; $1.00.</li>
                    <li><strong>Outcome Conversion:</strong> Sometimes Platform A has "Trump Wins" and Platform B has "Harris Wins". While not strictly the same (a third party could win), in a two-horse race, they function as inverse correlates.</li>
                    <li><strong>Liquidity Lags:</strong> When major news breaks, one platform often updates its order book slower than the other. This "latency arbitrage" allows quick traders to buy at 'old' prices on the slow platform while the outcome is already known.</li>
                </ul>

                <h2>Pro-Tip: Accounting for Fees and Slippage</h2>
                <p>Beginners often see a 1% spread and jump in, forgetting that transaction fees, network costs (gas), and order book slippage can eat that entire margin. Professional arbitrageurs typically look for spreads of at least <strong>1.5% to 2%</strong> to ensure profitability after all overhead. Always check the "depth" of the order book; if you need 5,000 shares but only 100 are available at the target price, your average cost will rise, and your arbitrage profit will vanish.</p>

                <h2>Risks to Consider</h2>
                <p>While often called "risk-free," there are operational risks:</p>
                <ul>
                    <li><strong>Platform Risk:</strong> One of the exchanges could go down or halt trading.</li>
                    <li><strong>Resolution Variance:</strong> Rarely, two platforms might interpret an ambiguous event outcome differently.</li>
                    <li><strong>Execution Risk:</strong> You buy one side but the price moves on the other platform before you can fill your hedge.</li>
                </ul>
            </>
        )
    },
    'understanding-order-books': {
        title: 'Reading the Order Book: Spotting the Real Moves',
        date: 'Dec 24, 2025',
        readTime: '15 min read',
        content: (
            <>
                <p>If you want to move beyond being a "vibes" trader and start acting like a professional, you have to learn how to read the order book. The price chart tells you where the market <em>was</em>, but the order book tells you where it is <em>going</em>. It’s the raw, unfiltered record of every buyer and seller currently standing in line to trade.</p>

                <h2>The Basics: Bids and Asks</h2>
                <p>At any given moment, the "price" you see on the screen is just the last transaction that happened. But behind that number is a battleground:</p>
                <ul>
                    <li><strong>The Bid (The Floor):</strong> This is the highest price someone is willing to pay right now. If you want to sell your shares instantly, this is the price you’ll get.</li>
                    <li><strong>The Ask (The Ceiling):</strong> This is the lowest price someone is willing to sell for. If you want to buy instantly, you’re paying the ask.</li>
                    <li><strong>The Spread:</strong> The gap between the bid and the ask. In high-volume markets, this spread might be 0.1¢. In "ghost town" markets, it could be 5¢ or more. <em>Don't trade in markets with wide spreads unless you have a massive edge.</em></li>
                </ul>

                <h2>What "Market Depth" Actually Tells You</h2>
                <p>Most beginners just look at the price. Pros look at the "depth map." This shows you how many shares are sitting at each price level. If you see a $50,000 "buy wall" at 45¢ and only $2,000 of "sell pressure" up to 55¢, the path of least resistance is upward. The big money has set a floor at 45¢, effectively saying "we won't let it go lower."</p>

                <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '1.5rem', borderRadius: '12px', margin: '2rem 0', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <h3 style={{ marginTop: 0, color: '#10b981' }}>How to Spot "Spoofing"</h3>
                    <p>Be careful: big traders sometimes put up massive orders just to scare the market, then cancel them before they ever get filled. This is called spoofing. If you see a massive order that keeps moving every time the price gets close to it, it’s probably a fake. Real orders want to be filled; fake orders want to be seen.</p>
                </div>

                <h2>The Psychology of the Tape</h2>
                <p>When you watch the "recent trades" list (often called the tape), look for speed. If you see five small "Yes" buys followed by one massive $10,000 "Yes" buy, that’s a signal. Small retail traders are clicking buttons, but a "whale" just took a position. On Poly Hawk, our Whale Alerts are designed to catch exactly these moves so you don't have to stare at the tape 24/7.</p>
            </>
        )
    },
    'polymarket-vs-kalshi': {
        title: 'Polymarket vs. Kalshi: Which One Should You Actually Use?',
        date: 'Dec 24, 2025',
        readTime: '12 min read',
        content: (
            <>
                <p>I get asked this constantly: "Should I use Polymarket or Kalshi?" The truth is, there isn't a single "better" platform—they are built for entirely different types of people. Let’s break it down like humans, not like a marketing brochure.</p>

                <h2>Polymarket: The Wild West (with better odds)</h2>
                <p>Polymarket is where the action is. Because it runs on Polygon (a crypto network) and uses USDC, it’s accessible to basically the whole world. This global liquidity means the prices are usually "sharper"—meaning they are closer to the true probability because a massive amount of money is keeping them honest.</p>
                <p><strong>The Good:</strong> Incredible variety. You can bet on everything from the color of a celebrity's dress to the next AI model release. Massive volume means you can often enter $50k positions without moving the price.</p>
                <p><strong>The Bad:</strong> It's technically offshore. US residents have to jump through hoops (like VPNs) which some find stressful. Also, if you don't know how to use Metamask or buy crypto, the learning curve is steep.</p>

                <h2>Kalshi: The Regulated, Safe Choice</h2>
                <p>Kalshi is the first platform to be fully regulated by the CFTC in the US. It’s "legal" in the most traditional sense of the word. You connect your bank account, deposit USD, and trade.</p>
                <p><strong>The Good:</strong> Taxes are easy; they send you an official form. It’s reliable—you aren't worried about "web3 glitches." It’s also the destination for major election markets if you live in the US and want to stay 100% compliant.</p>
                <p><strong>The Bad:</strong> Lower volume. You can’t always trade huge sizes. The variety is also more limited to "serious" topics like economics and macro-politics because the regulators aren't fond of "frivolous" pop-culture markets.</p>

                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', margin: '2rem 0' }}>
                    <h3>Final Verdict</h3>
                    <p>If you’re a <strong>US-based beginner</strong> who wants to deposit $500 and bet on the Fed or the Election, go <strong>Kalshi</strong>. If you’re a <strong>serious trader</strong> looking for the best prices, highest volume, and a massive range of markets, <strong>Polymarket</strong> is king. (Or better yet, use both so you can arbitrage the difference!)</p>
                </div>
            </>
        )
    },
    'managing-risk-bankroll': {
        title: 'The Hidden Secret of Pro Traders: Bankroll Management',
        date: 'Dec 24, 2025',
        readTime: '15 min read',
        content: (
            <>
                <p>Listen, I’m going to be real with you: you can be the best election forecaster on the planet, but if you don’t manage your bankroll, you <em>will</em> go broke. I’ve seen it a thousand times. Traders get a "sure thing" tip, bet 50% of their account, a black swan event happens, and they’re out of the game. Professional trading isn’t about being right; it’s about staying in the game long enough for your edge to manifest.</p>

                <h2>The 1-5% Rule (The Golden Rule)</h2>
                <p>If you take nothing else from this article, take this: <strong>Never put more than 5% of your total bankroll on a single outcome.</strong> Ideally, most of your positions should be between 1% and 3%.</p>
                <p>Why? Because even if you have a 70% edge (which is massive), there is still a 30% chance you’re wrong. If you bet 20% of your bankroll every time, you only need to be wrong five times in a row to hit zero. Statistically, a 30% event happening five times in a row isn't just possible—over a long enough timeframe, it's inevitable.</p>

                <h2>The Psychology of the "All-In"</h2>
                <p>We all feel the urge. You see a market like "Will it rain in London tomorrow?" and you think, "I live in London, it definitely will!" You want to go all-in. Resist. Prediction markets are binary. There is no middle ground. You are either 100% right or 100% wrong. Diversification across multiple, unrelated markets is your only defense against the unpredictable.</p>

                <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '1.5rem', borderRadius: '12px', margin: '2rem 0', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <h3 style={{ marginTop: 0, color: '#ef4444' }}>Emotional Capital is a Resource</h3>
                    <p>When you bet too much, you stop making logical decisions. You start "revenge trading" to win back losses or "panic selling" at the first sign of a price dip. If you can't sleep because of a position, it’s too big. Period.</p>
                </div>

                <h2>The Kelly Criterion: Trading Like a Scientist</h2>
                <p>If you want to get technical, look up the Kelly Criterion. It’s a mathematical formula used by gamblers and investors to determine the optimal bet size. It looks like this: <code>f = (bp - q) / b</code>.</p>
                <p>But here’s the secret: most pros use "Fractional Kelly" (like Half-Kelly or Quarter-Kelly). They take the formula’s result and divide it by 2 or 4. This gives you a much smoother equity curve and protects you from overestimating your own edge (which we all do).</p>
            </>
        )
    },
    'identifying-positive-ev': {
        title: 'Finding +EV: Stop Guessing, Start Calculating',
        date: 'Dec 24, 2025',
        readTime: '18 min read',
        content: (
            <>
                <p>In the world of professional betting and trading, there is only one term that matters: <strong>+EV (Positive Expected Value)</strong>. If you only take trades with a positive expected value, you are mathematically guaranteed to make money over time. If you take -EV trades, you are just a gambler waiting for the house to win.</p>

                <h2>What exactly is EV?</h2>
                <p>Expected Value is the amount you can expect to win or lose on average if you were to place the same bet thousands of times. It’s a simple calculation of probability vs. payout.</p>

                <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '2rem', borderRadius: '16px', margin: '2rem 0', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                    <h3 style={{ marginTop: 0, color: 'var(--primary)' }}>The Coin Flip Example</h3>
                    <p>Imagine I offer you a bet: We flip a fair coin (50/50). If it’s heads, I pay you $1.10. If it’s tails, you pay me $1.00.</p>
                    <ul>
                        <li><strong>Win:</strong> 50% chance of +$1.10 (0.5 * 1.10 = 0.55)</li>
                        <li><strong>Loss:</strong> 50% chance of -$1.00 (0.5 * -1.00 = -0.50)</li>
                        <li><strong>EV:</strong> +$0.05 per flip.</li>
                    </ul>
                    <p>This is a <strong>+EV trade</strong>. Even if you lose the first flip, you should keep taking this bet until I run out of money.</p>
                </div>

                <h2>Applying +EV to Prediction Markets</h2>
                <p>This is where it gets fun. A prediction market gives you the "market probability." If a share is 60¢, the market says there’s a 60% chance. Your job is to find instances where the <strong>actual probability</strong> is higher than the market says.</p>
                <p>If you’ve done your research and you are 80% sure an event will happen, but the shares are only 60¢, you have found a massive +EV opportunity. You aren't "betting" that it will happen; you are "buying" probability at a discount.</p>

                <h2>Common Places to Find +EV</h2>
                <ul>
                    <li><strong>Specialized Knowledge:</strong> You follow a specific industry or niche closer than the general public.</li>
                    <li><strong>Speed:</strong> Major news breaks, and you react before the market bots have fully adjusted the price.</li>
                    <li><strong>Sentiment Overreaction:</strong> The crowd gets emotional (fear or hype) and pushes the price too far in one direction.</li>
                </ul>

                <h2>The Discipline to Wait</h2>
                <p>The hardest part of +EV trading is doing nothing. Some days, there are no mispriced markets. A pro trader is like a sniper; they wait hours for the one shot where the math is on their side. If you feel like you "have" to trade, you’re probably looking for entertainment, not profit.</p>
            </>
        )
    },
    'regulatory-landscape': {
        title: 'The Future of Regulation: Is Your Trading Legal?',
        date: 'Dec 24, 2025',
        readTime: '12 min read',
        content: (
            <>
                <p>Let’s talk about the elephant in the room: the law. For years, prediction markets in the US were treated like illegal gambling houses. But the winds are shifting. We are currently living through the most important regulatory transition in the history of event contracts. If you’re trading on these platforms, you need to understand where the red lines are.</p>

                <h2>The CFTC vs. The World</h2>
                <p>In the United States, the Commodity Futures Trading Commission (CFTC) is the school principal. For a long time, their rule was simple: "If it looks like a bet on a horse race or an election, it’s illegal." They viewed these markets as having no "economic purpose" and being ripe for manipulation.</p>
                <p>However, recent court battles (led largely by Kalshi) have challenged this. The courts are starting to agree that prediction markets actually provide a <em>massive</em> public service: they are the most accurate forecasting tool we have. This has opened the door for legal, regulated election markets for the first time in decades.</p>

                <h2>Polymarket’s "Grey Area" Status</h2>
                <p>Polymarket lives in a different world. It’s an offshore, decentralized platform. While they technically don't allow US residents to trade, the decentralized nature of the blockchain makes that hard to enforce. This leads to what we call "regulatory arbitrage." You get better variety and higher volume on Polymarket, but you lack the legal protections given by a US-regulated exchange like Kalshi.</p>

                <div style={{ background: 'rgba(255,165,0,0.05)', padding: '1.5rem', borderRadius: '12px', margin: '2rem 0', border: '1px solid rgba(255,165,0,0.2)' }}>
                    <h3 style={{ marginTop: 0, color: '#ffa500' }}>Will They Ban It?</h3>
                    <p>Total bans are becoming less likely. The cats are out of the bag. Governments are realizing that if they ban it, people will just move to offshore crypto sites where there is zero oversight. The future is likely <strong>regulated integration</strong>—where you’ll be able to trade these markets through your standard brokarage account, just like a stock.</p>
                </div>

                <h2>What This Means for You</h2>
                <p>If you trade on Kalshi, keep your tax documents in order. If you trade on Polymarket, be aware that you are operating in a fast-moving legal environment. At Poly Hawk, we track these shifts daily to ensure our tools remain compliant and our users stay informed.</p>
            </>
        )
    },
    'impact-of-news-on-markets': {
        title: 'Trading News Events: How to Win the Information War',
        date: 'Dec 24, 2025',
        readTime: '15 min read',
        content: (
            <>
                <p>In most markets, news is something you read. In prediction markets, news is the <strong>weapon</strong>. Everything moves the second a headline hits the tape. If you’re five minutes late to a news break, you aren’t just behind—you’re the "exit liquidity" for the people who were faster than you.</p>

                <h2>The Three Stages of a News Break</h2>
                <ol>
                    <li><strong>The Rumor (Speculation):</strong> This is where the big money is made. Usually, someone with specialized knowledge or a "hunch" starts buying. The price moves from 30¢ to 45¢ without any public news.</li>
                    <li><strong>The Break (The Spike):</strong> A major news outlet tweets or reports the event. Within 30 seconds, the market jumps from 45¢ to 85¢. This is purely bot-driven speed.</li>
                    <li><strong>The Confirmation (Settlement):</strong> The official source (like the AP or the White House) confirms the result. The price hits 99¢. The trade is over.</li>
                </ol>

                <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '2rem', borderRadius: '16px', margin: '2rem 0', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                    <h3 style={{ marginTop: 0, color: 'var(--primary)' }}>Pro Tip: Use the Poly Hawk News Feed</h3>
                    <p>We built our real-time news feed specifically for Stage 2. We aggregate sources faster than the average browser refresh. If you see a headline on our dashboard, check the corresponding market immediately. Often, there is a 10-20 second "lag" where you can still get in at a profitable price before the crowd catches up.</p>
                </div>

                <h2>The "Invalidation" Risk</h2>
                <p>Trading news is dangerous because of "fake news." In October 2023, a fake report about a Bitcoin ETF approval sent markets flying, only to crash minutes later when the report was debunked. <strong>Always verify the source.</strong> A tweet from "BreakingNews123" is not the same as a report from Reuters or Bloomberg.</p>

                <h2>Holding Through the Event</h2>
                <p>The most common mistake beginners make is holding a position <em>too long</em>. If you bought at 40¢ and the news breaks and it’s now at 90¢, <strong>take your profit</strong>. Don't wait for the last 9¢. The risk of a last-minute reversal is almost never worth that final bit of gain. Real pros sell into the hype.</p>
            </>
        )
    },
    'correlation-trading': {
        title: 'Correlation Trading: The Art of the "Chain Reaction"',
        date: 'Dec 24, 2025',
        readTime: '18 min read',
        content: (
            <>
                <p>Most traders treat every market as an isolated island. They look at "Will Trump win?" and they look at "Will Bitcoin hit $100k?" as two completely separate bets. Pro traders know better. In the real world, everything is connected. <strong>Correlation trading</strong> is the art of identifying how the outcome of one event <em>guarantees</em> or <em>implies</em> the outcome of another.</p>

                <h2>What are Correlated Markets?</h2>
                <p>Correlation happens when two binary contracts move together. For example, if a pro-crypto candidate's win probability goes up 10%, Bitcoin’s price often follows. If one market is moving and the other isn't, there is a "correlation gap" you can trade.</p>

                <h2>Case Study: The "Election-Crypto" Flywheel</h2>
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '2rem', borderRadius: '16px', margin: '2rem 0', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                    <p>Imagine Candidate X is publicly supporting a Bitcoin reserve fund. Their win probability jumps from 40% to 55% over a weekend due to a strong debate performance.</p>
                    <p>The "Bitcoin &gt; $100k" market is still trading at 25¢ (25%). If Candidate X winning makes the Bitcoin moonshot significantly more likely, that 25¢ price is <strong>wrong</strong>. It hasn't "priced in" the candidate's momentum yet.</p>
                    <p><strong>The Play:</strong> You buy the lagging market (Bitcoin &gt; $100k) before the rest of the world realizes the connection. You are effectively getting "Election Alpha" at a discount.</p>
                </div>

                <h2>Positive vs. Negative Correlation</h2>
                <ul>
                    <li><strong>Positive Correlation (Moving Together):</strong> "Candidate X wins" and "Bitcoin hits New Highs." When one goes up, the other usually does too.</li>
                    <li><strong>Negative Correlation (Moving Apart):</strong> "Fed Hikes Rates" and "S&P 500 hits New Highs." Generally, higher rates are bad for stocks. If you see rate hike probability spiking, the "S&P New High" market should be dropping. If it isn't, someone is mispricing the risk.</li>
                </ul>

                <h2>The Danger of "False Correlations"</h2>
                <p>Just because two things happened together in the past doesn't mean they will in the future. This is the classic "Correlation vs. Causation" trap. For example, "Shark attacks" and "Ice cream sales" are positively correlated (both go up in the summer), but buying ice cream doesn't cause shark attacks. <strong>Always look for the causal mechanism.</strong> If there is no logical link between the two events, the correlation is just noise and will eventually break, likely blowing up your trade.</p>

                <h2>Pro Tip: Cross-Platform Correlations</h2>
                <p>At Poly Hawk, we often see correlations between Polymarket (crypto/global audience) and Kalshi (regulated/US audience). Sometimes a "pop culture" event on Polymarket actually hints at how a "serious" economic event on Kalshi will resolve. These hidden links are where the true "alpha" lives.</p>
            </>
        )
    },
    'history-of-prediction-markets': {
        title: 'The History of Prediction Markets: From DARPA to DeFi',
        date: 'Dec 24, 2025',
        readTime: '15 min read',
        content: (
            <>
                <p>Prediction markets didn't start with crypto. They didn't even start with the internet. In fact, the idea of using "wisdom of the crowd" through markets has a dark, fascinating, and often controversial history. To know where we’re going, we have to look at where we came from.</p>

                <h2>The Early Days: Betting on Popes and Kings</h2>
                <p>As far back as the 1500s, people in Italy were betting on the outcome of papal elections. In the 1800s, "Wall Street Betting" was widespread in New York, with massive pools of money following presidential elections. These were "prediction markets" in everything but name: they aggregated private information into a public price.</p>

                <h2>The DARPA Controversy (Project PAM)</h2>
                <p>The modern era began in the early 2000s when DARPA (the US military’s research arm) proposed the Policy Analysis Market (PAM). The goal? Use a market to predict stability in the Middle East, including the likelihood of terrorist attacks. The media went into a frenzy, calling it a "terrorism betting parlor," and the project was killed within 24 hours. But the seed was planted: markets are incredibly good at predicting complex events.</p>

                <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '2rem', borderRadius: '16px', margin: '2rem 0', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                    <h3 style={{ marginTop: 0, color: 'var(--primary)' }}>Why It Matters Today</h3>
                    <p>That military experiment proved a point: people with real skin in the game are less likely to lie and more likely to do deep research. This is why Polymarket predictions are often more accurate than traditional pundits or news anchors.</p>
                </div>

                <h2>The DeFi Revolution</h2>
                <p>The final piece of the puzzle was the blockchain. Traditional markets like InTrade and PredictIt were always limited by payment processors and government bans. Crypto changed that. By using USDC and smart contracts, sites like Polymarket took prediction markets global, permissionless, and unstoppable.</p>
            </>
        )
    },
    'hedging-real-world-risks': {
        title: 'Beyond Betting: Hedging Real World Risks',
        date: 'Dec 24, 2025',
        readTime: '12 min read',
        content: (
            <>
                <p>Most people look at prediction markets and see a "casino." I look at them and see <strong>the world’s most flexible insurance policy</strong>. If you use these markets correctly, you can hedge against events that traditional insurance companies won't touch.</p>

                <h2>What is Hedging?</h2>
                <p>Hedging is taking a position that will pay you if something bad happens in your real life. You aren't "betting" because you want it to happen; you're betting because you want to be compensated if it <em>does</em> happen.</p>

                <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '1.5rem', borderRadius: '12px', margin: '2rem 0', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <h3 style={{ marginTop: 0, color: '#10b981' }}>Example: The Business Hedge</h3>
                    <p>Imagine you run a solar panel installation company. Your business thrives when the government provides "Green Energy Subsidies." There is a market: "Will the Green Subsidy be repealed in 2026?"</p>
                    <ul style={{ paddingLeft: '1.5rem' }}>
                        <li>If you buy "Yes" (Repeal), and the subsidy is killed, your business loses money, but your Polymarket position pays out.</li>
                        <li>This payout provides the cash flow you need to keep your employees while you pivot your business model.</li>
                    </ul>
                </div>

                <h2>The Future: Micro-Insurance</h2>
                <p>In the future, we’ll see markets for everything. Worried about your local commute being blocked by a transit strike? Hedge it. Worried about a specific flight being delayed? Hedge it. Prediction markets allow us to quantify and trade "risk" directly, without a massive insurance company taking a 30% cut in the middle.</p>

                <h2>Summary</h2>
                <p>Prediction markets are a tool for <strong>radical honesty</strong>. They strip away the "vibes" and the "opinions" and replace them with numbers and truth. Whether you’re an arbitrageur, a hedger, or a historian, you’re part of a movement to make the world’s information more transparent and accurate.</p>
            </>
        )
    }
};

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const articleData = ARTICLE_CONTENT[slug] || {
        title: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        date: 'Recently Updated',
        readTime: '5 min read',
        content: <p>Article content coming soon...</p>
    };

    const heroImage = ARTICLE_IMAGES[slug] || 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80';

    return (
        <main className="container" style={{ paddingBottom: '4rem', maxWidth: '800px' }}>
            <Link href="/learn" style={{ display: 'inline-block', marginTop: '2rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                &larr; Back to Academy
            </Link>

            <article style={{ marginTop: '2rem' }}>
                <div style={{ width: '100%', height: '400px', borderRadius: '24px', overflow: 'hidden', marginBottom: '2rem' }}>
                    <img src={heroImage} alt={slug} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.2 }}>
                    {articleData.title}
                </h1>

                <div style={{ display: 'flex', gap: '2rem', color: 'var(--text-secondary)', marginBottom: '3rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
                    <span>📅 {articleData.date}</span>
                    <span>✍️ Poly Team</span>
                    <span>⏱ {articleData.readTime}</span>
                </div>

                <div className="prose" style={{ lineHeight: 1.8, fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
                    {articleData.content}


                </div>
            </article>
        </main>
    );
}
