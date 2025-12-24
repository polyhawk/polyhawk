'use client';

import Leaderboard from '@/components/Leaderboard';
import { useRouter } from 'next/navigation';

export default function LeaderboardClient({ initialTraders = [] }: { initialTraders?: any[] }) {
    const router = useRouter();

    const handleSelectTrader = (address: string) => {
        router.push(`/wallet-checker?address=${address}`);
    };

    return <Leaderboard onSelectTrader={handleSelectTrader} initialTraders={initialTraders} />;
}
