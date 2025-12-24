'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { getPortfolio } from '@/lib/api';

interface Asset {
    id: string;
    symbol: string;
    name: string;
    amount: number;
    value: number;
    type: 'CRYPTO' | 'NFT';
    image?: string;
}

interface PortfolioItem {
    marketId: string;
    title: string;
    outcome: string;
    price: number;
    shares: number;
    value: number;
    pnl: number;
    image?: string;
}

export default function PortfolioPage() {
    const [user, setUser] = useState<any>(null);
    const [wallets, setWallets] = useState<string[]>([]);
    const [newWallet, setNewWallet] = useState('');
    const [polymarketPositions, setPolymarketPositions] = useState<PortfolioItem[]>([]);
    const [cryptoAssets, setCryptoAssets] = useState<Asset[]>([]);
    const [nftAssets, setNftAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'POLYMARKET' | 'CRYPTO' | 'NFTS'>('OVERVIEW');

    const supabase = createClient();
    const router = useRouter();

    // Load User & Data
    useEffect(() => {
        const loadData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                // Fetch wallets from Supabase
                const { data: userWallets } = await supabase
                    .from('portfolios')
                    .select('wallet_address')
                    .eq('user_id', user.id);

                if (userWallets) {
                    setWallets(userWallets.map(w => w.wallet_address));
                }

                // Fetch assets (Mock for now, would be DB)
                setCryptoAssets([
                    { id: '1', symbol: 'ETH', name: 'Ethereum', amount: 1.5, value: 3200 * 1.5, type: 'CRYPTO', image: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png' },
                    { id: '2', symbol: 'SOL', name: 'Solana', amount: 45, value: 145 * 45, type: 'CRYPTO', image: 'https://assets.coingecko.com/coins/images/4128/small/solana.png' }
                ]);

                setNftAssets([
                    { id: '1', symbol: 'BAYC', name: 'Bored Ape #1234', amount: 1, value: 12.5 * 3200, type: 'NFT', image: 'https://img.seadn.io/files/8a6875ee93526c88f918076a911a374d.png?auto=format&fit=max&w=384' }
                ]);

            } else {
                // Load from localStorage for guest
                const stored = localStorage.getItem('user_wallets');
                if (stored) setWallets(JSON.parse(stored));
            }
            setLoading(false);
        };
        loadData();
    }, []);

    // Fetch Polymarket Data when wallets change
    useEffect(() => {
        const fetchPositions = async () => {
            if (wallets.length === 0) return;

            let allPositions: PortfolioItem[] = [];
            for (const wallet of wallets) {
                try {
                    const data = await getPortfolio(wallet);
                    // Transform API data to PortfolioItem
                    const items = data.map((pos: any) => ({
                        marketId: pos.asset_id,
                        title: pos.title,
                        outcome: pos.outcome,
                        price: Number(pos.price),
                        shares: Number(pos.size),
                        value: Number(pos.value),
                        pnl: 0, // API doesn't provide history easily
                        image: pos.image
                    }));
                    allPositions = [...allPositions, ...items];
                } catch (e) {
                    console.error('Error fetching portfolio for', wallet, e);
                }
            }
            setPolymarketPositions(allPositions);
        };
        fetchPositions();
    }, [wallets]);

    const addWallet = async () => {
        if (!newWallet) return;

        const updated = [...wallets, newWallet];
        setWallets(updated);
        setNewWallet('');

        if (user) {
            // Save to DB
            await supabase.from('portfolios').insert({
                user_id: user.id,
                wallet_address: newWallet,
                chain: 'polymarket'
            });
        } else {
            // Save to LocalStorage
            localStorage.setItem('user_wallets', JSON.stringify(updated));
        }
    };

    const removeWallet = async (address: string) => {
        const updated = wallets.filter(w => w !== address);
        setWallets(updated);

        if (user) {
            await supabase.from('portfolios').delete().match({ user_id: user.id, wallet_address: address });
        } else {
            localStorage.setItem('user_wallets', JSON.stringify(updated));
        }
    };

    // Calculations
    const totalPolyValue = polymarketPositions.reduce((sum, item) => sum + item.value, 0);
    const totalCryptoValue = cryptoAssets.reduce((sum, item) => sum + item.value, 0);
    const totalNftValue = nftAssets.reduce((sum, item) => sum + item.value, 0);
    const grandTotal = totalPolyValue + totalCryptoValue + totalNftValue;

    if (loading) return <div className="p-10 text-center">Loading portfolio...</div>;

    return (
        <div className="container py-8">
            {/* Header */}
            <div className="header mb-8">
                <h1 className="text-3xl font-bold mb-2">My Portfolio</h1>
                <div className="flex justify-between items-end">
                    <div>
                        <div className="text-gray-400 text-sm">Net Worth</div>
                        <div className="text-4xl font-bold text-primary">${grandTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                    </div>

                    {!user && (
                        <Link href="/login" className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
                            Sign In to Sync
                        </Link>
                    )}
                </div>
            </div>

            {/* Wallet Management */}
            <div className="bg-surface border border-border rounded-xl p-6 mb-8">
                <h3 className="font-bold mb-4">Tracked Wallets</h3>
                <div className="flex gap-2 mb-4">
                    <input
                        type="text"
                        placeholder="Add Polymarket/ETH Address (0x...)"
                        className="flex-1 bg-background border border-border rounded-lg px-4 py-2"
                        value={newWallet}
                        onChange={e => setNewWallet(e.target.value)}
                    />
                    <button onClick={addWallet} className="bg-primary px-6 py-2 rounded-lg font-bold">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {wallets.map(w => (
                        <div key={w} className="bg-background px-3 py-1 rounded-full border border-border text-sm flex items-center gap-2">
                            <span className="font-mono">{w.slice(0, 6)}...{w.slice(-4)}</span>
                            <button onClick={() => removeWallet(w)} className="text-red-400 hover:text-red-300">×</button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-6 border-b border-border mb-6">
                {[
                    { id: 'OVERVIEW', label: 'Overview' },
                    { id: 'POLYMARKET', label: 'Polymarket' },
                    { id: 'CRYPTO', label: 'Crypto Assets' },
                    { id: 'NFTS', label: 'NFTs' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`pb-3 font-semibold transition ${activeTab === tab.id ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-white'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="content">

                {/* POLYMARKET SECTION */}
                {(activeTab === 'OVERVIEW' || activeTab === 'POLYMARKET') && (
                    <div className="mb-10">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <span className="text-2xl">🦅</span> Polymarket Positions
                            </h2>
                            <span className="text-xl font-mono">${totalPolyValue.toLocaleString()}</span>
                        </div>

                        {polymarketPositions.length > 0 ? (
                            <div className="grid gap-4">
                                {polymarketPositions.map((pos, i) => (
                                    <div key={i} className="bg-surface p-4 rounded-xl border border-border flex items-center justify-between hover:border-primary/50 transition">
                                        <div className="flex items-center gap-4">
                                            {pos.image && <img src={pos.image} className="w-10 h-10 rounded-full" />}
                                            <div>
                                                <div className="font-medium">{pos.title}</div>
                                                <div className="text-sm text-gray-400">{pos.outcome} • {pos.shares.toFixed(0)} shares</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold">${pos.value.toFixed(2)}</div>
                                            <div className="text-sm text-gray-400">@ {pos.price.toFixed(2)}¢</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 bg-surface rounded-xl border border-border text-gray-500">
                                No active positions found in tracked wallets.
                            </div>
                        )}
                    </div>
                )}

                {/* CRYPTO SECTION */}
                {(activeTab === 'OVERVIEW' || activeTab === 'CRYPTO') && (
                    <div className="mb-10">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <span className="text-2xl">🪙</span> Crypto Assets
                            </h2>
                            <span className="text-xl font-mono">${totalCryptoValue.toLocaleString()}</span>
                        </div>

                        <div className="grid gap-4">
                            {cryptoAssets.map(asset => (
                                <div key={asset.id} className="bg-surface p-4 rounded-xl border border-border flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <img src={asset.image} className="w-10 h-10 rounded-full" />
                                        <div>
                                            <div className="font-medium">{asset.name}</div>
                                            <div className="text-sm text-gray-400">{asset.amount} {asset.symbol}</div>
                                        </div>
                                    </div>
                                    <div className="font-bold">${asset.value.toLocaleString()}</div>
                                </div>
                            ))}
                            {user && <button className="w-full py-3 border border-dashed border-gray-600 rounded-xl text-gray-400 hover:border-primary hover:text-primary transition">+ Add Asset</button>}
                        </div>
                    </div>
                )}

                {/* NFT SECTION */}
                {(activeTab === 'OVERVIEW' || activeTab === 'NFTS') && (
                    <div className="mb-10">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <span className="text-2xl">🖼️</span> NFT Gallery
                            </h2>
                            <span className="text-xl font-mono">${totalNftValue.toLocaleString()}</span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {nftAssets.map(nft => (
                                <div key={nft.id} className="bg-surface rounded-xl border border-border overflow-hidden group">
                                    <div className="aspect-square bg-gray-800 relative">
                                        <img src={nft.image} className="object-cover w-full h-full group-hover:scale-105 transition duration-500" />
                                    </div>
                                    <div className="p-3">
                                        <div className="font-medium truncate">{nft.name}</div>
                                        <div className="text-sm text-gray-400">${nft.value.toLocaleString()}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

// Helper Style
const styles = {
    // Add custom styles here if needed, or stick to Tailwind classes above
};
