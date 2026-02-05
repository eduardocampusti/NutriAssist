
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function check() {
    const envPath = path.resolve(process.cwd(), '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const config = {};
    envContent.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            config[parts[0].trim()] = parts.slice(1).join('=').trim();
        }
    });

    const url = config.VITE_SUPABASE_URL;
    const key = config.VITE_SUPABASE_ANON_KEY;

    if (!url || !key) {
        console.error('Missing credentials');
        return;
    }

    const s = createClient(url, key);

    const tables = ['profiles', 'usuarios', 'users'];
    for (const t of tables) {
        try {
            const { data, error, count } = await s.from(t).select('*', { count: 'exact' });
            if (error) {
                console.log(`${t}: ERROR ${error.code} - ${error.message}`);
            } else {
                console.log(`${t}: EXISTS, ${count} rows`);
                if (data && data.length > 0) {
                    console.log(`  Cols: ${Object.keys(data[0]).join(', ')}`);
                }
            }
        } catch (e) {
            console.log(`${t}: EXCEPTION ${e.message}`);
        }
    }
}
check();
