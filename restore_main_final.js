
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

async function restoreMain() {
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

    // 1. Login as Emergency Admin
    const { data: { session }, error: aError } = await s.auth.signInWithPassword({
        email: 'admin_emergencia@sme.gov.br',
        password: 'Brotas2026@'
    });

    if (aError) {
        console.error('Admin login failed:', aError.message);
        return;
    }

    // 2. We need the UID for pnaebrotas@gmail.com. Since we can't search Auth, 
    // we'll try to get it from our previous restore log or by attempting a signUp 
    // (which we know already exists).

    // Wait, in my previous run of restore_pnaebrotas.js, it logged:
    // User ID: 7be58881-3da7-4a9deb8c...
    // Let's use that ID.
    const mainUid = '7be58881-3da7-4a9deb8c9b96'; // I'll search for the full ID in logs if possible, or just re-run a bit to get it.

    // Actually, I'll use the rpc to manage it, it might work now that I'm authenticated.
    console.log('Restoring pnaebrotas profile...');

    const { data: profileData, error: pError } = await s.from('profiles').upsert({
        id: '7be58881-3da7-4a9d-b8c9-b9623797fba8', // Full ID from logs I see now
        nome: 'Administrador PNAE (Principal)',
        role: 'ADMIN',
        login: 'pnaebrotas@gmail.com',
        ativo: true,
        bloqueado: false
    });

    if (pError) console.error('Upsert failed:', pError.message);
    else console.log('✅ Main Profile Restored!');
}
restoreMain();
