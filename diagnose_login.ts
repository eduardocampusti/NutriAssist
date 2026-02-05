
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

async function diagnose() {
    const env = fs.readFileSync('.env.local', 'utf-8');
    const config = Object.fromEntries(env.split('\n').filter(l => l.includes('=')).map(l => l.split('=').map(s => s.trim())));

    const url = config.VITE_SUPABASE_URL;
    const key = config.VITE_SUPABASE_ANON_KEY;

    console.log('--- DIAGNOSTIC START ---');
    if (!url || !key) {
        console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
        return;
    }

    const supabase = createClient(url, key);

    // 1. Check Profiles table for ANY user matching the email/login
    console.log('Searching pnaebrotas@gmail.com in profiles...');
    const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .or(`login.eq.pnaebrotas@gmail.com,email.eq.pnaebrotas@gmail.com`);

    if (pError) {
        console.error('Database Error:', pError.message, pError.details);
    } else {
        console.log('Profiles found:', profiles.length);
        if (profiles.length > 0) {
            console.log('User Profile Data:', JSON.stringify(profiles[0], null, 2));
        } else {
            console.log('No profile found for pnaebrotas@gmail.com');
        }
    }

    // 2. Check if a user with login 'admin' exists to verify table accessibility
    console.log('\nVerifying table accessibility (searching admin)...');
    const { data: admin } = await supabase.from('profiles').select('nome').eq('login', 'admin');
    console.log('Admin check:', admin && admin.length > 0 ? 'FOUND' : 'NOT FOUND');

    console.log('--- DIAGNOSTIC END ---');
}

diagnose();
