
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

async function verify() {
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

    const email = 'admin_emergencia@sme.gov.br';
    const password = 'Brotas2026@';

    console.log(`--- AUTHENTICATED VERIFICATION ---`);
    const { data: { session }, error: aError } = await s.auth.signInWithPassword({ email, password });

    if (aError) {
        console.error('SignIn failed:', aError.message);
        return;
    }

    console.log('SignIn Successful. Session obtained.');

    const { data: profiles, error: pError } = await s.from('profiles').select('*');
    if (pError) console.error('Profile fetch failed:', pError.message);
    else {
        console.log('Profiles found:', profiles.length);
        console.log(JSON.stringify(profiles, null, 2));
    }
}
verify();
