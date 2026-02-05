
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function check() {
    const env = fs.readFileSync('.env.local', 'utf-8');
    const config = Object.fromEntries(env.split('\n').filter(l => l.includes('=')).map(l => l.split('=').map(s => s.trim())));
    const s = createClient(config.VITE_SUPABASE_URL, config.VITE_SUPABASE_ANON_KEY);

    const tables = ['profiles', 'usuarios', 'users'];
    for (const t of tables) {
        const { count, error } = await s.from(t).select('*', { count: 'exact', head: true });
        if (error) {
            console.log(`${t}: ERROR ${error.code} - ${error.message}`);
        } else {
            console.log(`${t}: EXISTS, ${count} rows`);
            const { data } = await s.from(t).select('*').limit(1);
            if (data && data.length > 0) console.log(`  Cols: ${Object.keys(data[0]).join(', ')}`);
        }
    }
}
check();
