import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface NotificationRequest {
    channel: 'email' | 'telegram';
    destination: string; // email address or chat ID
    alert: {
        amount: number;
        marketTitle: string;
        side: 'YES' | 'NO';
        price: number;
        marketUrl: string;
        timestamp: number;
    };
    test?: boolean;
}

export async function POST(request: Request) {
    try {
        const body: NotificationRequest = await request.json();
        const { channel, destination, alert, test } = body;

        switch (channel) {
            case 'email':
                return await sendEmailNotification(destination, alert, test);
            case 'telegram':
                return await sendTelegramNotification(destination, alert, test);
            default:
                return NextResponse.json({ error: 'Invalid channel' }, { status: 400 });
        }
    } catch (error) {
        console.error('Notification error:', error);
        return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
    }
}

async function sendEmailNotification(email: string, alert: any, test?: boolean) {
    if (!process.env.RESEND_API_KEY) {
        return NextResponse.json({ error: 'Email service not configured. Please add RESEND_API_KEY to environment variables.' }, { status: 503 });
    }

    const subject = test
        ? '🔔 PolyHawk Test Alert'
        : `🐋 Whale Alert: $${alert.amount.toLocaleString()} Trade`;

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                .alert-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
                .metric { display: inline-block; margin: 10px 20px 10px 0; }
                .metric-label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
                .metric-value { font-size: 24px; font-weight: bold; color: #111827; }
                .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0;">🐋 Whale Alert${test ? ' (Test)' : ''}</h1>
                </div>
                <div class="content">
                    ${test ? '<p><strong>This is a test notification.</strong> Your alerts are configured correctly!</p>' : ''}
                    <div class="alert-box">
                        <h2 style="margin-top: 0;">${alert.marketTitle}</h2>
                        <div class="metric">
                            <div class="metric-label">Trade Amount</div>
                            <div class="metric-value">$${alert.amount.toLocaleString()}</div>
                        </div>
                        <div class="metric">
                            <div class="metric-label">Side</div>
                            <div class="metric-value">${alert.side} @ ${(alert.price * 100).toFixed(0)}¢</div>
                        </div>
                        <div class="metric">
                            <div class="metric-label">Time</div>
                            <div class="metric-value">${getTimeAgo(alert.timestamp)}</div>
                        </div>
                    </div>
                    <a href="${alert.marketUrl}" class="button">View on Polymarket →</a>
                    <div class="footer">
                        <p>Manage your alerts at <a href="https://polyhawk.fun/whale-alerts">polyhawk.fun/whale-alerts</a></p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;

    try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);

        await resend.emails.send({
            from: 'PolyHawk Alerts <alerts@polyhawk.fun>',
            to: email,
            subject,
            html
        });

        return NextResponse.json({ success: true, message: 'Email sent successfully' });
    } catch (error: any) {
        console.error('Resend error:', error);
        return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
    }
}

async function sendTelegramNotification(chatId: string, alert: any, test?: boolean) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
        return NextResponse.json({ error: 'Telegram bot not configured' }, { status: 503 });
    }

    const message = test
        ? `🔔 *PolyHawk Test Alert*\n\nThis is a test notification. Your alerts are configured correctly!`
        : `🐋 *Whale Alert: $${alert.amount.toLocaleString()}*\n\n*Market:* ${alert.marketTitle}\n*Side:* ${alert.side} @ ${(alert.price * 100).toFixed(0)}¢\n*Time:* ${getTimeAgo(alert.timestamp)}`;

    const payload = {
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [[
                { text: 'View on Polymarket', url: alert.marketUrl }
            ]]
        }
    };

    try {
        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!data.ok) {
            throw new Error(data.description || 'Telegram API error');
        }

        return NextResponse.json({ success: true, message: 'Telegram notification sent' });
    } catch (error: any) {
        console.error('Telegram error:', error);
        return NextResponse.json({ error: error.message || 'Failed to send Telegram notification' }, { status: 500 });
    }
}

function getTimeAgo(timestamp: number): string {
    const seconds = Math.floor(Date.now() / 1000 - timestamp);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}
