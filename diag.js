
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

async function check() {
    try {
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
        const supabase = createClient(url, key);

        console.log('--- FINAL DIAGNOSTIC ---');

        // List all logins in profiles
        const { data: allLogins, error: lError } = await supabase.from('profiles').select('login, nome');
        if (lError) console.error('Error fetching profiles:', lError.message);
        else {
            console.log('Total profiles:', allLogins.length);
            console.log('Registered logins:', allLogins.map(p => p.login).join(', '));
        }

        // Check specifically for pnaebrotas@gmail.com in login column
        const { data: exact, error: eError } = await supabase.from('profiles').select('*').eq('login', 'pnaebrotas@gmail.com');
        if (eError) console.error('Exact search error:', eError.message);
        else console.log('Exact search result:', JSON.stringify(exact, null, 2));

        console.log('--- END ---');
    } catch (err) {
        console.error('Fatal error:', err.message);
    }
}
check();
