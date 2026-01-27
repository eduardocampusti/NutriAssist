
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
let supabaseUrl = '';
let supabaseAnonKey = '';

try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            if (key.trim() === 'VITE_SUPABASE_URL') supabaseUrl = value.trim();
            if (key.trim() === 'VITE_SUPABASE_ANON_KEY') supabaseAnonKey = value.trim();
        }
    });
} catch (e) { }

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verify() {
    const email = 'secretaria@sme.gov.br';
    const password = 'sme.secretaria';

    console.log(`Verifying login for: ${email}`);

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        console.error('Login Failed:', error.message);
        return;
    }

    console.log('Login OK. User ID:', data.user.id);

    // Check Profile
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

    if (profileError) {
        console.error('Profile Read Error:', profileError.message);
    } else {
        console.log('Profile found:');
        console.log('Role:', profile.role);
        console.log('Permissions:', profile.perfil);
    }
}

verify();
