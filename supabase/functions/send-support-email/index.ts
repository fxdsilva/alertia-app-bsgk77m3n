import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    
    const supabase = createClient(supabaseUrl, supabaseKey)

    const payload = await req.json()
    const record = payload.record || payload

    const { name, email, subject, message } = record

    if (!name || !email || !subject || !message) {
      throw new Error('Missing required fields')
    }

    // Obter o e-mail de suporte configurado nas configurações globais
    const { data: settingsData } = await supabase
      .from('admin_settings')
      .select('settings')
      .eq('key', 'support_contact_info')
      .single()

    const toEmail = settingsData?.settings?.email || 'suporte@alertia.goskip.app'

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    
    if (RESEND_API_KEY) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Suporte Alertia <suporte@alertia.goskip.app>',
          to: [toEmail],
          reply_to: email,
          subject: `Novo chamado de suporte: ${subject}`,
          html: `
            <h2>Novo contato de suporte</h2>
            <p><strong>Nome:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Assunto:</strong> ${subject}</p>
            <hr />
            <p><strong>Mensagem:</strong></p>
            <p>${message.replace(/\n/g, '<br/>')}</p>
          `,
        }),
      })
      
      const data = await res.json()
      console.log('Resend response:', data)
    } else {
      console.log(`[MOCK EMAIL] Simulating email sending.`)
      console.log(`To: ${toEmail}`)
      console.log(`Reply-To: ${email}`)
      console.log(`Subject: ${subject}`)
      console.log(`Message: ${message}`)
    }

    return new Response(JSON.stringify({ success: true, deliveredTo: toEmail }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error('Error sending email:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
