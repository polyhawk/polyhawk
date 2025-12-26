'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import styles from '@/app/whale-alerts/whale-alerts.module.css';

export default function WhaleSubscription() {
    const [email, setEmail] = useState('');
    const [telegram, setTelegram] = useState('');
    const [minUsd, setMinUsd] = useState(5000);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');

    // Create client using env vars (public)
    // Note: The table allows public inserts via RLS
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus('IDLE');

        if (!email && !telegram) {
            alert('Please enter either Email or Telegram ID');
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase
                .from('subscriptions')
                .insert([
                    { email: email || null, telegram_chat_id: telegram || null, min_usd: minUsd }
                ]);

            if (error) throw error;

            setStatus('SUCCESS');
            setEmail('');
            setTelegram('');
        } catch (err) {
            console.error('Subscription error:', err);
            setStatus('ERROR');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.subscriptionCard}>
            <div className={styles.subHeader}>
                <h3>🔔 Get Alerts 24/7</h3>
                <p>Don't miss a move. Get notified even when you're away.</p>
            </div>

            {status === 'SUCCESS' ? (
                <div className={styles.successMessage}>
                    ✅ Subscribed! You will receive alerts for whales over ${minUsd.toLocaleString()}.
                    <button onClick={() => setStatus('IDLE')} className={styles.resetBtn}>Add another</button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className={styles.subForm}>
                    <div className={styles.inputGroup}>
                        <label>Minimum Trade ($)</label>
                        <select
                            value={minUsd}
                            onChange={(e) => setMinUsd(Number(e.target.value))}
                            className={styles.selectInput}
                        >
                            <option value={5000}>$5,000</option>
                            <option value={10000}>$10,000</option>
                            <option value={20000}>$20,000</option>
                            <option value={50000}>$50,000 (Whales Only)</option>
                        </select>
                    </div>

                    <div className={styles.rowInputs}>
                        <input
                            type="email"
                            placeholder="Email (optional)"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.textInput}
                        />
                        <input
                            type="text"
                            placeholder="Telegram Chat ID (optional)"
                            value={telegram}
                            onChange={(e) => setTelegram(e.target.value)}
                            className={styles.textInput}
                        />
                    </div>

                    <button type="submit" className={styles.subButton} disabled={loading}>
                        {loading ? 'Saving...' : 'Subscribe For Free'}
                    </button>
                    {status === 'ERROR' && <p className={styles.errorText}>Something went wrong. Try again.</p>}
                </form>
            )}
        </div>
    );
}
