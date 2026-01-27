
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
let supabaseUrl = '';
let supabaseAnonKey = ''; // Use Anon for SignUp
let supabaseServiceKey = ''; // Optional: Use Service Role for Profile Insert bypass if needed

try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            if (key.trim() === 'VITE_SUPABASE_URL') supabaseUrl = value.trim();
            if (key.trim() === 'VITE_SUPABASE_ANON_KEY') supabaseAnonKey = value.trim();
            // Assuming no Service Key in .env.local usually, but if RLS blocks, we might need manual insert via SQL or just try std flow
        }
    });
} catch (e) {
    console.error('Error reading .env.local', e);
}

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTestUser() {
    const email = 'secretaria@sme.gov.br';
    const password = 'sme.secretaria';
    const name = 'Secretaria de Educação';
    const role = 'SECRETARIO'; // Must match UserRole in types.ts

    console.log(`Creating user: ${email}...`);

    // 1. SignUp
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    });

    if (authError) {
        console.error('Auth Error:', authError.message);
        // If user already exists, we might just want to ensure profile exists
        if (authError.message.includes('already registered')) {
            console.log('User exists, attempting to find ID...');
            // Need to sign in to get ID if we don't have service key? 
            // Or just try login
            const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (loginError) {
                console.error('Could not login to update profile:', loginError.message);
                return;
            }

            updateProfile(loginData.user.id, name, role, email);
            return;
        }
        return;
    }

    if (authData.user) {
        console.log(`Auth User Created: ${authData.user.id}`);
        await updateProfile(authData.user.id, name, role, email);
    }
}

async function updateProfile(userId, name, role, email) {
    // 2. Insert/Update Profile
    // Note: This relies on RLS allowing "insert own profile" or "update own profile".
    // If this fails, we might need to use a Service Key or SQL.

    console.log(`Upserting Profile for ${userId} with role ${role}...`);

    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: userId,
            nome: name,
            login: email, // Legacy field
            role: role,
            perfil: role, // Legacy field
            ativo: true,
            school_id: null // Secretaria sees all?
        });


    if (profileError) {
        console.error('Profile Upsert Error:', profileError);
        console.log('TIP: If RLS blocks this, you might need to run an SQL script manually.');
    } else {
        console.log('✅ upsert executed. Verifying...');
    }

    // 3. Verify
    const { data: loginCheck, error: loginCheckError } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (loginCheckError) {
        console.error('❌ Login verification failed:', loginCheckError.message);
        return;
    }

    const { data: profileCheck, error: profileCheckError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', loginCheck.user.id)
        .single();

    if (profileCheckError) {
        console.error('❌ Could not read profile:', profileCheckError.message);
    } else {
        console.log('🔍 Final Profile Check:');
        console.log(`   - Name: ${profileCheck.nome}`);
        console.log(`   - Role: ${profileCheck.role} (Expected: SECRETARIO)`);

        if (profileCheck.role === 'SECRETARIO') {
            console.log('🎉 SUCCESS! User is ready.');
        } else {
            console.log('⚠️ User created but Role is incorrect. You might need to update it manually in DB.');
            console.log(`SQL: UPDATE profiles SET role = 'SECRETARIO' WHERE login = '${email}';`);
        }
    }
}

createTestUser();
