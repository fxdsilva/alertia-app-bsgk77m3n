import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  // Handle CORS preflight request
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

    // 1. Authorization Check
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

    // 2. Parse Body
    const body = await req.json()
    const {
      email,
      password,
      nome,
      perfil,
      escola_id,
      cargo,
      departamento,
      permissoes,
    } = body

    if (!email || !nome || !perfil) {
      throw new Error('Missing required fields: email, nome, perfil')
    }

    // 3. Create or find Auth User
    let userId: string
    let authUser

    const { data: authData, error: authError } =
      await supabaseClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          nome_usuario: nome,
          email,
          perfil,
          escola_id: escola_id || null, // Allow null
          cargo: cargo || null,
          departamento: departamento || null,
          ativo: true,
        },
      })

    if (authError) {
      // If user already exists, try to sync it
      if (
        authError.status === 422 ||
        authError.message.toLowerCase().includes('already')
      ) {
        const { data: existingId, error: rpcError } = await supabaseClient.rpc(
          'get_user_id_by_email',
          { p_email: email },
        )

        if (rpcError || !existingId) {
          throw new Error(
            'Failed to create user and could not retrieve existing user: ' +
              authError.message,
          )
        }

        userId = existingId

        // Update the existing user's password and metadata to resync
        const { data: updateData, error: updateError } =
          await supabaseClient.auth.admin.updateUserById(userId, {
            password: password,
            user_metadata: {
              nome_usuario: nome,
              email,
              perfil,
              escola_id: escola_id || null,
              cargo: cargo || null,
              departamento: departamento || null,
              ativo: true,
            },
          })

        if (updateError) throw updateError
        authUser = updateData.user
      } else {
        throw authError
      }
    } else {
      if (!authData.user) throw new Error('Failed to create auth user')
      userId = authData.user.id
      authUser = authData.user
    }

    // 4. Upsert into public.usuarios_escola
    // Using upsert to avoid duplicate key errors if a database trigger
    // already inserted the row after the user was created in auth.users
    const { error: dbError } = await supabaseClient
      .from('usuarios_escola')
      .upsert(
        {
          id: userId,
          nome_usuario: nome,
          email,
          perfil,
          escola_id: escola_id || null, // Allow null for Analysts
          cargo: cargo || null,
          departamento: departamento || null,
          ativo: true,
          permissoes: permissoes || null,
        },
        { onConflict: 'id' },
      )

    if (dbError) {
      // Rollback: delete auth user if DB insert fails to maintain consistency
      console.error('Database insert failed, rolling back auth user:', dbError)
      // Only delete if we originally created it
      if (!authError) {
        await supabaseClient.auth.admin.deleteUser(userId)
      }
      throw new Error(`Database error: ${dbError.message}`)
    }

    return new Response(JSON.stringify({ user: authUser }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error in create-user:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
