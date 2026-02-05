
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

async function emergency() {
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
    const nome = 'Admin de Emergência';

    console.log(`--- EMERGENCY ACCESS ---`);

    const { data: authData, error: authError } = await s.auth.signUp({
        email,
        password,
        options: {
            data: { nome, role: 'ADMIN' }
        }
    });

    if (authError) {
        console.log('User might already exist. Attempting SignIn...');
        const { data: sData, error: sError } = await s.auth.signInWithPassword({ email, password });
        if (sError) {
            console.error('Failed to get session:', sError.message);
            return;
        }
        authData.user = sData.user;
    }

    console.log('User ID:', authData.user.id);

    // Insert profile
    const { error: pError } = await s.from('profiles').upsert({
        id: authData.user.id,
        nome: nome,
        role: 'ADMIN',
        login: email,
        ativo: true,
        bloqueado: false
    });

    if (pError) {
        console.error('Profile insertion blocked by RLS.');
        console.log('Action required: Run this SQL in Supabase Dashboard:');
        console.log(`INSERT INTO profiles (id, nome, role, login, ativo, bloqueado) VALUES ('${authData.user.id}', '${nome}', 'ADMIN', '${email}', true, false);`);
    } else {
        console.log('✅ EMERGENCY ADMIN READY!');
        console.log('Email:', email);
        console.log('Password:', password);
    }
}
emergency();
