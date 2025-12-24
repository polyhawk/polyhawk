import { NextResponse } from 'next/server';
import { fetchWhaleAlertsV2 } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// This endpoint is called by Vercel Cron every 6 hours
// It can also be called manually to trigger an immediate fetch
export async function GET(request: Request) {
    try {
        // Verify this is a cron request (optional security check)
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            // If CRON_SECRET is not set, allow the request (for initial testing)
            if (process.env.CRON_SECRET) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
        }

        console.log('[CRON] Fetching whale alerts...');

        // Fetch latest whale alerts
        const whaleAlerts = await fetchWhaleAlertsV2();

        if (!whaleAlerts || whaleAlerts.length === 0) {
            console.log('[CRON] No whale alerts found');
            return NextResponse.json({
                message: 'No alerts found',
                count: 0
            });
        }

        console.log(`[CRON] Found ${whaleAlerts.length} whale alerts`);

        // Store alerts in KV via the storage API
        const storeResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/whale-alerts-store`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(whaleAlerts),
        });

        if (!storeResponse.ok) {
            throw new Error('Failed to store alerts');
        }

        const storeResult = await storeResponse.json();
        console.log(`[CRON] Stored ${storeResult.added} new alerts. Total: ${storeResult.total}`);

        return NextResponse.json({
            message: 'Cron job completed successfully',
            fetched: whaleAlerts.length,
            stored: storeResult.added,
            total: storeResult.total
        });
    } catch (error) {
        console.error('[CRON] Error in whale alerts cron job:', error);
        return NextResponse.json({
            error: 'Cron job failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
