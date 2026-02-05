const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

async function diagnose() {
    // 1. Load Config
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

    if (!url || !key) {
        console.error('Missing Supabase URL or Key in .env.local');
        return;
    }

    const supabase = createClient(url, key);

    console.log('--- DIAGNOSING USER CREATION ---');

    // 2. Count existing profiles
    const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

    if (countError) {
        console.error('Error counting profiles:', countError.message);
    } else {
        console.log(`Current Profile Count: ${count}`);
    }

    // 3. Attempt RPC
    const testId = crypto.randomUUID();
    const testEmail = `test_limit_${Date.now()}@example.com`;

    console.log(`Attempting to call manage_user_profile for ID: ${testId}`);

    const { data, error } = await supabase.rpc('manage_user_profile', {
        p_id: testId,
        p_nome: 'Test User Limit',
        p_role: 'VISUALIZADOR',
        p_school_id: null,
        p_cpf: '000.000.000-00',
        p_crn: null,
        p_telefone: null,
        p_endereco: null,
        p_foto: null,
        p_login: testEmail,
        p_senha: 'password123',
        p_ativo: true,
        p_bloqueado: false,
        p_zona_id: null,
        p_senha_provisoria: true,
        p_data_alteracao_senha: null
    });

    if (error) {
        console.error('❌ RPC FAILED. Error details:', error);
        console.error('Message:', error.message);
    } else {
        console.log('✅ RPC SUCCESS! User profile created/updated.');
        // Clean up
        console.log('Cleaning up...');
        const { error: delError } = await supabase.from('profiles').delete().eq('id', testId);
        if (delError) console.error('Cleanup failed:', delError.message);
        else console.log('Cleanup successful.');
    }
}

diagnose();
