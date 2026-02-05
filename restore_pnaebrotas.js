
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

async function restore() {
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
    const s = createClient(url, key);

    const email = 'pnaebrotas@gmail.com';
    const password = 'Xanda123@'; // From user screenshot
    const nome = 'PNAE Brotas';
    const role = 'NUTRICIONISTA';

    console.log(`--- RESTORING USER: ${email} ---`);

    // 1. Try to SignUp
    const { data: authData, error: authError } = await s.auth.signUp({
        email,
        password,
        options: {
            data: { nome, role }
        }
    });

    let userId;

    if (authError) {
        if (authError.message.includes('already registered')) {
            console.log('User already exists in Auth. Attempting SignIn to get ID...');
            const { data: signInData, error: signInError } = await s.auth.signInWithPassword({
                email,
                password
            });

            if (signInError) {
                console.error('SignIn failed (wrong password?):', signInError.message);
                return;
            }
            userId = signInData.user.id;
        } else {
            console.error('SignUp Error:', authError.message);
            return;
        }
    } else if (authData.user) {
        console.log('User created in Auth.');
        userId = authData.user.id;
    }

    if (!userId) {
        console.error('Failed to obtain User ID.');
        return;
    }

    console.log('User ID:', userId);

    // 2. Try to create Profile via RPC (Security Definer)
    console.log('Attempting to create profile via RPC...');

    // The RPC manage_user_profile expects many arguments. 
    // Based on fix_rpc_manage_user_profile.sql:
    // manage_user_profile(p_id, p_nome, p_role, p_school_id, p_cpf, p_crn, p_telefone, p_endereco, p_foto, p_login, p_senha, p_ativo, p_bloqueado, p_zona_id, p_senha_provisoria, p_data_alteracao_senha)

    // Let's try the simple insert first if RPC fails or is hard to call with all params
    const { error: rpcError } = await s.rpc('manage_user_profile', {
        p_id: userId,
        p_nome: nome,
        p_role: role,
        p_school_id: null,
        p_cpf: null,
        p_crn: null,
        p_telefone: null,
        p_endereco: null,
        p_foto: null,
        p_login: email,
        p_senha: password,
        p_ativo: true,
        p_bloqueado: false,
        p_zona_id: 'SEDE',
        p_senha_provisoria: true,
        p_data_alteracao_senha: null
    });

    if (rpcError) {
        console.warn('RPC Error (might be signature mismatch):', rpcError.message);
        console.log('Attempting manual insert into profiles table...');

        // Try manual insert (might fail if RLS is strict)
        const { error: insError } = await s.from('profiles').upsert({
            id: userId,
            nome: nome,
            role: role,
            login: email,
            ativo: true,
            bloqueado: false,
            senha_provisoria: true
        });

        if (insError) {
            console.error('Manual insert failed:', insError.message);
            console.log('Recommended fix: Run the following SQL in Supabase Dashboard:');
            console.log(`INSERT INTO profiles (id, nome, role, login, ativo, bloqueado, senha_provisoria) VALUES ('${userId}', '${nome}', '${role}', '${email}', true, false, true);`);
        } else {
            console.log('✅ Manual Profile Insert SUCCESS!');

            // VERIFICATION
            const { data: verify, error: vEr } = await s.from('profiles').select('*').eq('id', userId);
            if (vEr) console.error('Verification query failed:', vEr.message);
            else console.log('Verification result:', JSON.stringify(verify, null, 2));
        }
    } else {
        console.log('✅ RPC Profile Management SUCCESS!');
    }

    console.log('--- RESTORE COMPLETE ---');
}

restore();
