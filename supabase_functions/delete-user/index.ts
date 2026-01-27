
// Function to fully delete a user (Auth + Profile)
// Deploy as 'delete-user'

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
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

        const { user_id } = await req.json()

        if (!user_id) {
            return new Response(
                JSON.stringify({ error: 'User ID is required' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            )
        }

        // 1. Delete from Auth (This usually cascades to profiles if set up, but we'll be safe)
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(user_id)
        if (authError) throw authError

        // 2. Determine if we need to manually delete profile (if Cascade not set)
        // We attempt it, if it's already gone due to cascade, no problem.
        await supabaseAdmin.from('profiles').delete().eq('id', user_id)

        return new Response(
            JSON.stringify({ message: 'Usuário excluído permanentemente.' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
