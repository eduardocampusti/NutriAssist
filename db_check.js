
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf-8');
const config = Object.fromEntries(env.split('\n').filter(l => l.includes('=')).map(l => l.split('=').map(s => s.trim())));
const s = createClient(config.VITE_SUPABASE_URL, config.VITE_SUPABASE_ANON_KEY);

async function check() {
    console.log('--- DB CHECK ---');
    const tests = ['profiles', 'usuarios', 'users'];
    for (const t of tests) {
        try {
            const { data, error, count } = await s.from(t).select('*', { count: 'exact' });
            if (error) {
                console.log(`${t}: ERROR ${error.code} - ${error.message}`);
            } else {
                console.log(`${t}: SUCCESS, ${count} rows`);
                if (data && data.length > 0) {
                    console.log(`  Columns: ${Object.keys(data[0]).join(', ')}`);
                    console.log(`  Sample: ${JSON.stringify(data[0])}`);
                }
            }
        } catch (e) {
            console.log(`${t}: EXCEPTION`, e.message);
        }
    }
}
check();
