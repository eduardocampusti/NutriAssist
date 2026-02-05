
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

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

        console.log('--- USER SEARCH ---');
        const { data: profiles, error: pError } = await supabase.from('profiles').select('*').or('login.eq.pnaebrotas@gmail.com,email.eq.pnaebrotas@gmail.com');
        console.log('Profiles search:', pError ? pError.message : (profiles.length + ' found'));
        if (profiles && profiles.length > 0) console.log(JSON.stringify(profiles[0], null, 2));

        const { data: usuarios, error: uError } = await supabase.from('usuarios').select('*').or('email.eq.pnaebrotas@gmail.com');
        console.log('Usuarios search:', uError ? uError.message : (usuarios.length + ' found'));
        if (usuarios && usuarios.length > 0) console.log(JSON.stringify(usuarios[0], null, 2));

        console.log('--- END SEARCH ---');
    } catch (err) {
        console.error('Fatal error:', err.message);
    }
}
check();
