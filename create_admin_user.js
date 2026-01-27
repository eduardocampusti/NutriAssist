
// Script to create an Admin User using public credentials
// Run with: node create_admin_user.js

import { createClient } from '@supabase/supabase-js';

// Config from .env.local
const SUPABASE_URL = 'https://pqtovsgneehpdxewaeal.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_xr60lX8I71g3YAbDM7JBsg_L1gFqBLn'; // Using the key found in .env.local

console.log("Iniciando cliente Supabase...");
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createAdmin() {
    console.log("Tentando criar usuário admin...");

    const email = 'admin@sme.gov.br';
    const password = 'admin-strong-password';

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                nome: 'Super Admin',
                role: 'ADMIN' // Will try to set, might be ignored by RLS but good to allow
            }
        }
    });

    if (error) {
        console.error("Erro ao criar usuário:", error.message);
        if (error.message.includes("already registered")) {
            console.log("--> O usuário já existe! Você pode tentar fazer login.");
        }
    } else {
        console.log("--> Usuário criado com sucesso!");
        console.log("ID:", data.user?.id);
        console.log("Email:", data.user?.email);
        console.log("ATENÇÃO: Se o email confirmation estiver ativado, você precisa confirmar o email ou desabilitar essa opção no painel.");
    }
}

createAdmin();
