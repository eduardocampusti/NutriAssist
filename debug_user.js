
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function debug() {
    const envContent = fs.readFileSync('.env.local', 'utf-8');
    let url, key;
    envContent.split('\n').forEach(l => {
        if (l.includes('VITE_SUPABASE_URL')) url = l.split('=')[1].trim();
        if (l.includes('VITE_SUPABASE_ANON_KEY')) key = l.split('=')[1].trim();
    });

    console.log('Connecting to:', url);
    const supabase = createClient(url, key);

    console.log('Checking profiles table...');
    const { data: profiles, error: pError } = await supabase.from('profiles').select('*');
    if (pError) console.error('Profiles Error:', pError);
    else console.log('Profiles count:', profiles ? profiles.length : 0);

    console.log('Checking specifically for pnaebrotas@gmail.com...');
    const { data: user, error: uError } = await supabase.from('profiles').select('*').or(`login.eq.pnaebrotas@gmail.com,email.eq.pnaebrotas@gmail.com`);
    if (uError) console.error('User search error:', uError);
    else console.log('User found in profiles:', JSON.stringify(user, null, 2));
}

debug();
