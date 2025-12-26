
const { Client } = require('pg');

async function setup() {
    // Parse the password and encode special characters
    // User provided: postgres:[mUKESHJHA@2001]@db...
    const password = encodeURIComponent('mUKESHJHA@2001');
    const connectionString = `postgresql://postgres:${password}@db.ynskeorzscdknnrwkdlr.supabase.co:5432/postgres`;

    console.log('Connecting to database...');
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected successfully!');

        const queries = [
            `CREATE TABLE IF NOT EXISTS subscriptions (
                id uuid default gen_random_uuid() primary key,
                email text,
                telegram_chat_id text,
                min_usd integer default 5000,
                created_at timestamp with time zone default timezone('utc'::text, now())
            );`,
            // Since this is public, we might want to just enable RLS but allow inserts for anon
            // However, to keep it simple for now and since we are using backend logic to read it,
            // we will allow anon INSERT but only Service Role can SELECT/DELETE to prevent leak.
            `ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;`,
            `DO $$ 
            BEGIN 
                -- Allow anyone to subscribe (insert)
                IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can insert subscription') THEN 
                    CREATE POLICY "Anyone can insert subscription" ON subscriptions FOR INSERT WITH CHECK (true); 
                END IF; 
            END $$;`,
            `DO $$
            BEGIN
                -- Only service role can read (to prevent scraping emails)
                -- We don't add a SELECT policy for anon, so default denies.
                NULL;
            END $$;`
        ];

        for (const query of queries) {
            console.log('Executing query...');
            await client.query(query);
        }

        console.log('✅ Subscription table setup complete!');
    } catch (err) {
        console.error('❌ Error executing migration:', err);
    } finally {
        await client.end();
    }
}

setup();
