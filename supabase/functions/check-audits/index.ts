import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Find upcoming audits (within 48 hours)
    // We assume data_auditoria is the due date or event date
    const now = new Date()
    const future48h = new Date(now.getTime() + 48 * 60 * 60 * 1000)

    const { data: audits, error } = await supabase
      .from('auditorias')
      .select('id, data_auditoria, tipo, escolas_instituicoes(nome_escola)')
      .gte('data_auditoria', now.toISOString())
      .lte('data_auditoria', future48h.toISOString())
      .neq('status', 'Concluída') // Ideally use status ID but simplification for edge function logic

    if (error) throw error

    if (!audits || audits.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No upcoming audits found' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // 2. Find Directors
    const { data: directors, error: dirError } = await supabase
      .from('usuarios_escola')
      .select('id')
      .eq('perfil', 'DIRETOR_COMPLIANCE')

    if (dirError) throw dirError

    // 3. Insert Notifications
    const notificationsToInsert = []

    for (const audit of audits) {
      // Only notify if we haven't notified about this audit recently (basic check optimization)
      // In a real prod app, we'd have a 'notified' flag or separate tracking table

      for (const director of directors) {
        notificationsToInsert.push({
          user_id: director.id,
          title: 'Alerta de Auditoria Próxima',
          message: `Auditoria ${audit.tipo} em ${audit.escolas_instituicoes?.nome_escola} está agendada para ${new Date(audit.data_auditoria).toLocaleDateString('pt-BR')}.`,
          type: 'warning',
          link: '/compliance/director/dashboard',
          read: false,
        })
      }
    }

    if (notificationsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('notifications')
        .insert(notificationsToInsert)

      if (insertError) throw insertError
    }

    return new Response(
      JSON.stringify({
        message: 'Notifications processed',
        count: notificationsToInsert.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
