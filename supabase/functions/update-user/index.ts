import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } },
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing Authorization header')
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

    const body = await req.json()
    const {
      user_id,
      email,
      password,
      nome,
      perfil,
      escola_id,
      cargo,
      departamento,
      ativo,
    } = body

    if (!user_id) throw new Error('Missing user_id')

    // Update Auth user
    const authUpdatePayload: any = {
      email,
      user_metadata: {
        nome_usuario: nome,
        email,
        perfil,
        escola_id: escola_id || null,
        cargo: cargo || null,
        departamento: departamento || null,
        ativo: ativo !== undefined ? ativo : true,
      },
    }

    if (password) {
      authUpdatePayload.password = password
    }

    const { data: updateData, error: updateError } =
      await supabaseClient.auth.admin.updateUserById(user_id, authUpdatePayload)

    if (updateError) throw updateError

    // Update public.usuarios_escola
    const { error: dbError } = await supabaseClient
      .from('usuarios_escola')
      .update({
        nome_usuario: nome,
        email,
        perfil,
        escola_id: escola_id || null,
        cargo: cargo || null,
        departamento: departamento || null,
        ativo: ativo !== undefined ? ativo : true,
      })
      .eq('id', user_id)

    if (dbError) throw new Error(`Database error: ${dbError.message}`)

    return new Response(JSON.stringify({ user: updateData.user }), {
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
