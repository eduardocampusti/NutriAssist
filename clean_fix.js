
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

async function fix() {
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

    const email = 'pnaebrotas@gmail.com';
    const password = 'Brotas2026@'; // NEW PASSWORD
    const nome = 'Administrador PNAE';

    console.log(`--- FIXING USER: ${email} ---`);

    // 1. SignUp
    const { data: authData, error: authError } = await s.auth.signUp({
        email,
        password,
        options: {
            data: { nome, role: 'ADMIN' }
        }
    });

    if (authError) {
        console.log('SignUp Error:', authError.message);
        if (authError.message.includes('already registered')) {
            console.log('User already exists. Trying to reset password or overwrite profile.');
            // We can't reset without email. Let's try to just insert profile if we can.
        }
    } else {
        console.log('SignUp SUCCESS. User ID:', authData.user.id);

        // 2. Insert Profile (Since we just signed up, we are logged in!)
        const { error: pError } = await s.from('profiles').insert({
            id: authData.user.id,
            nome: nome,
            role: 'ADMIN',
            login: email,
            ativo: true,
            bloqueado: false
        });

        if (pError) console.error('Profile Insert Error:', pError.message);
        else console.log('✅ Profile Created Successfully!');
    }
}
fix();
