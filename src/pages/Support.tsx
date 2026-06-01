import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent } from '@/components/ui/card'
import {
  PanelLeft,
  Mail,
  Phone,
  ArrowLeft,
  MessageCircle,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import {
  settingsService,
  SupportContactInfo,
  FAQItem,
  OfficialChannelsData,
} from '@/services/settingsService'

export default function Support() {
  const navigate = useNavigate()
  const [contactInfo, setContactInfo] = useState<SupportContactInfo | null>(
    null,
  )
  const [faqs, setFaqs] = useState<FAQItem[]>([])
  const [channels, setChannels] = useState<OfficialChannelsData | null>(null)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [info, faqData, channelsData] = await Promise.all([
          settingsService.getSupportContactInfo(),
          settingsService.getSupportFAQs(),
          settingsService.getOfficialChannels(),
        ])
        setContactInfo(info)
        if (faqData) setFaqs(faqData)
        if (channelsData) setChannels(channelsData)
      } catch (error) {
        console.error('Error loading support settings:', error)
      }
    }
    fetchSettings()
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 animate-fade-in">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 shadow-sm px-4 lg:px-8 h-16 flex items-center justify-between">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <div className="bg-emerald-700/10 p-1.5 rounded-md">
            <PanelLeft className="h-5 w-5 text-emerald-800" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            ALERTIA
          </span>
        </div>
        <Button variant="ghost" onClick={() => navigate('/')} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
      </header>

      <main className="flex-1 container mx-auto max-w-5xl px-4 py-10 space-y-12">
        {/* Hero */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Como podemos ajudar?
          </h1>
          <p className="text-lg text-slate-500">
            Encontre respostas para suas dúvidas ou entre em contato com nossa
            equipe através dos nossos canais de atendimento.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column: Contact & Channels */}
          <div className="space-y-10">
            {/* Contact Info */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight">
                Canais de Atendimento
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-6 flex flex-col items-center text-center space-y-2">
                    <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                      <Mail className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold">Email</h3>
                    <p className="text-sm text-slate-500">
                      {contactInfo?.email || 'fxdsilva@gmail.com'}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 flex flex-col items-center text-center space-y-2">
                    <div className="p-3 bg-green-50 rounded-full text-green-600">
                      <Phone className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold">Telefone</h3>
                    <p className="text-sm text-slate-500">
                      {contactInfo?.phone || '(00) 0000-0000'}
                    </p>
                  </CardContent>
                </Card>
                {(contactInfo?.whatsapp || contactInfo?.phone) && (
                  <Card
                    className="sm:col-span-2 hover:bg-slate-50 transition-colors cursor-pointer border-green-200"
                    onClick={() => {
                      const phoneToUse =
                        contactInfo.whatsapp || contactInfo.phone
                      let cleanPhone = phoneToUse!.replace(/\D/g, '')
                      if (cleanPhone.length >= 10 && cleanPhone.length <= 11) {
                        cleanPhone = `55${cleanPhone}`
                      }
                      window.open(`https://wa.me/${cleanPhone}`, '_blank')
                    }}
                  >
                    <CardContent className="p-4 flex items-center justify-center gap-3">
                      <div className="p-2 bg-green-100 rounded-full text-green-700">
                        <MessageCircle className="h-5 w-5" />
                      </div>
                      <span className="font-semibold text-green-800">
                        Atendimento via WhatsApp
                      </span>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Official External Channels */}
            {channels && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold tracking-tight">
                  Canais Oficiais Externos
                </h2>

                {channels.emergency && channels.emergency.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                      Emergência
                    </h3>
                    {channels.emergency.map((contact, idx) => (
                      <Card key={idx} className="border-red-200 bg-red-50">
                        <CardContent className="p-4 flex items-center gap-3">
                          <div className="p-2 bg-red-100 rounded-full text-red-600 flex-shrink-0">
                            <ShieldAlert className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-red-900">
                              {contact.name}
                            </h4>
                            <p className="text-sm font-bold text-red-700">
                              {contact.number}
                            </p>
                            {contact.description && (
                              <p className="text-xs text-red-600 mt-0.5">
                                {contact.description}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {(channels.brasil?.length > 0 ||
                  channels.mato_grosso?.length > 0) && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                      Links Úteis
                    </h3>
                    {[
                      ...(channels.brasil || []),
                      ...(channels.mato_grosso || []),
                    ].map((channel, idx) => (
                      <Card
                        key={idx}
                        className="hover:bg-slate-50 transition-colors cursor-pointer group"
                        onClick={() => window.open(channel.url, '_blank')}
                      >
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 rounded-full text-slate-600 group-hover:bg-slate-200 transition-colors flex-shrink-0">
                              <ExternalLink className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm text-slate-900">
                                {channel.name}
                              </h4>
                              {channel.description && (
                                <p className="text-xs text-slate-500 line-clamp-1">
                                  {channel.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: FAQ */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Perguntas Frequentes
            </h2>
            {faqs.length > 0 ? (
              <Accordion
                type="single"
                collapsible
                className="w-full bg-white rounded-lg border border-slate-200 shadow-sm"
              >
                {faqs.map((faq) => (
                  <AccordionItem key={faq.id} value={faq.id} className="px-4">
                    <AccordionTrigger className="text-left font-medium hover:no-underline hover:text-emerald-700">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="whitespace-pre-wrap text-slate-600">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="text-center p-8 bg-white rounded-lg border border-slate-200 shadow-sm">
                <p className="text-slate-500">
                  Nenhuma pergunta frequente disponível no momento.
                </p>
                <p className="text-sm text-slate-400 mt-2">
                  Se precisar de ajuda, entre em contato através do email{' '}
                  <span className="font-semibold">fxdsilva@gmail.com</span>.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-sm text-slate-400 border-t border-slate-200 mt-auto bg-white">
        © {new Date().getFullYear()} ALERTIA. Todos os direitos reservados.
      </footer>
    </div>
  )
}
