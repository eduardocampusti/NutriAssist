
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

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

    const s = createClient(config.VITE_SUPABASE_URL, config.VITE_SUPABASE_ANON_KEY);

    console.log('--- SCHEMA & RLS CHECK ---');

    // Attempt 1: Insert with minimal known columns
    console.log('Test 1: Minimal insert with ID only...');
    const dummyId = '00000000-0000-0000-0000-000000000000';
    const { error: e1 } = await s.from('profiles').insert({ id: dummyId });
    if (e1) console.log('Test 1 Error:', e1.message, e1.code);
    else console.log('Test 1: SUCCESS (ID only)');

    // Attempt 2: Select with explain or just see what's there
    const { data: cols, error: e2 } = await s.from('profiles').select('*').limit(1);
    if (e2) console.log('Test 2 Error:', e2.message);
    else console.log('Test 2: SUCCESS', cols);

    // cleanup
    await s.from('profiles').delete().eq('id', dummyId);

    console.log('--- END CHECK ---');
}
check();
