import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    const payload = await req.json()
    const record = payload.record || payload

    const { id: ticket_id, name, email, subject, message } = record

    if (!ticket_id || !name || !email || !subject || !message) {
      console.error('[ERROR] Missing required fields', {
        ticket_id,
        name,
        email,
        subject,
        message,
      })
      throw new Error('Missing required fields')
    }

    const resendApiKey =
      Deno.env.get('RESEND_API_KEY') || 're_6NQNT9W6_P6Ps1CmuKnzjqvKvQYGNCcCa'
    const fromAddress = 'Support Alertia <onboarding@resend.dev>'
    const toAddress = ['suporte@alertia.com.br', 'fxdsilva@gmail.com']

    const emailPayload = {
      from: fromAddress,
      to: toAddress,
      subject: `Novo Chamado de Suporte: ${subject}`,
      html: `
        <h2>Novo Chamado de Suporte</h2>
        <p><strong>Ticket ID:</strong> ${ticket_id}</p>
        <p><strong>Nome:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Assunto:</strong> ${subject}</p>
        <p><strong>Mensagem:</strong></p>
        <p>${message}</p>
      `,
    }

    console.log('[DEBUG] From address being used:', fromAddress)
    console.log(
      '[DEBUG] Full payload being sent to Resend:',
      JSON.stringify(emailPayload),
    )

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    })

    const responseData = await response.json()
    console.log(
      '[DEBUG] Complete response body from Resend API:',
      JSON.stringify(responseData),
    )

    if (!response.ok) {
      if (response.status === 401) {
        console.error(
          '[ERROR] Resend API Key issue (401 Unauthorized): Invalid or missing API Key.',
        )
      } else if (response.status === 403) {
        console.error(
          '[ERROR] Domain/Sender verification issue (403 Forbidden): The domain in the "from" address is not verified.',
        )
      } else if (response.status === 404) {
        console.error(
          '[ERROR] Not Found (404): The requested resource does not exist.',
        )
      } else if (response.status >= 500) {
        console.error(
          `[ERROR] Resend Internal Error (${response.status}): The service is experiencing issues. Consider retrying.`,
        )
      } else {
        console.error(
          `[ERROR] Resend request failed with status ${response.status}:`,
          responseData,
        )
      }

      await supabase.from('email_delivery_logs').insert({
        ticket_id,
        status: 'failed',
        error_message: responseData.message || `HTTP ${response.status}`,
      })

      throw new Error(
        `Resend API Error: ${response.status} ${JSON.stringify(responseData)}`,
      )
    }

    console.log('[SUCCESS] Message ID returned by Resend:', responseData.id)

    await supabase.from('email_delivery_logs').insert({
      ticket_id,
      status: 'delivered',
      resend_id: responseData.id,
    })

    return new Response(JSON.stringify({ success: true, data: responseData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error('[EXCEPTION] Error sending support email:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  }
})
