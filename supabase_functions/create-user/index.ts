
// Folow the instructions to deploy this function to Supabase.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 1. Create Supabase Client with Admin Privileges (Service Role)
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SERVICE_ROLE_KEY') ?? '',
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        // 2. Get Request Data
        const {
            email,
            password,
            nome,
            role,
            perfil,
            school_id,
            cpf,
            crn,
            telefone,
            endereco,
            foto,
            zona_id,
            ativo,
            status
        } = await req.json()

        if (!email || !password || !nome) {
            return new Response(
                JSON.stringify({ error: 'Email, senha e nome são obrigatórios.' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            )
        }

        const normalizedRole = String(role || perfil || 'NUTRICIONISTA').toUpperCase()
        const requestedStatus = String(status || 'ATIVO').toUpperCase()
        const normalizedStatus = ['ATIVO', 'INATIVO', 'BLOQUEADO'].includes(requestedStatus)
            ? requestedStatus
            : 'ATIVO'

        // 3. Create User in Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm email since admin created it
            user_metadata: { nome, role: normalizedRole }
        })

        if (authError) throw authError

        const userId = authData.user.id

        // 4. Create Profile in Database
        // We use the same ID as the Auth User
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .insert({
                id: userId,
                nome,
                email,
                role: normalizedRole,
                school_id: school_id || null,
                cpf,
                crn,
                telefone,
                endereco,
                foto,
                zona_id: zona_id || null,
                login: email, // Keep consistency
                ativo: ativo !== false,
                status: normalizedStatus,
                bloqueado: false,
                senha_provisoria: true
            })

        if (profileError) {
            // Rollback: Delete auth user if profile creation fails
            await supabaseAdmin.auth.admin.deleteUser(userId)
            throw profileError
        }

        return new Response(
            JSON.stringify({ user: authData.user, message: 'Usuário criado com sucesso!' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
