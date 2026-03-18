import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    )

    // Authorization
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing Authorization header')
    }
    const token = authHeader.replace('Bearer ', '')
    const {
      data: { user: requestUser },
      error: userError,
    } = await supabaseClient.auth.getUser(token)

    if (userError || !requestUser) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check against usuarios_admin_master table
    const { data: adminRecord } = await supabaseClient
      .from('usuarios_admin_master')
      .select('id')
      .eq('id', requestUser.id)
      .eq('ativo', true)
      .single()

    if (!adminRecord) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Not an active Admin Master' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const { email, password, nome } = await req.json()

    if (!email || !password || !nome) {
      throw new Error('Email, password and name are required')
    }

    // Create User in Auth
    const { data: authData, error: authError } =
      await supabaseClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          nome,
          type: 'senior',
          perfil: 'senior',
        },
      })

    if (authError) throw authError

    // Create User in usuarios_admin_master
    const { error: dbError } = await supabaseClient
      .from('usuarios_admin_master')
      .insert({
        id: authData.user.id,
        email,
        nome,
        senha_hash: 'MANAGED_BY_SUPABASE_AUTH',
        ativo: true,
      })

    if (dbError) {
      await supabaseClient.auth.admin.deleteUser(authData.user.id)
      throw dbError
    }

    return new Response(JSON.stringify({ user: authData.user }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
