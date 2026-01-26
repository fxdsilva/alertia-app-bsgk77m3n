import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Loader2, Save, LifeBuoy } from 'lucide-react'
import { toast } from 'sonner'
import useAppStore from '@/stores/useAppStore'
import { settingsService, FAQItem } from '@/services/settingsService'

const contactSchema = z.object({
  email: z.string().email('Email inválido'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  whatsapp: z.string().url('Link do WhatsApp deve ser uma URL válida'),
})

export default function SupportManager() {
  const { profile, loading: appLoading } = useAppStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [faqs, setFaqs] = useState<FAQItem[]>([])

  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      email: '',
      phone: '',
      whatsapp: '',
    },
  })

  useEffect(() => {
    if (!appLoading && profile !== 'senior') {
      navigate('/')
      return
    }
  }, [profile, appLoading, navigate])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [info, faqData] = await Promise.all([
          settingsService.getSupportContactInfo(),
          settingsService.getSupportFAQs(),
        ])

        if (info) {
          form.reset(info)
        }
        if (faqData) {
          setFaqs(faqData)
        }
      } catch (error) {
        console.error(error)
        toast.error('Erro ao carregar configurações')
      } finally {
        setLoading(false)
      }
    }

    if (profile === 'senior') {
      fetchData()
    }
  }, [profile, form])

  const handleFAQChange = (
    id: string,
    field: 'question' | 'answer',
    value: string,
  ) => {
    setFaqs((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: value } : f)),
    )
  }

  const onSubmit = async (values: z.infer<typeof contactSchema>) => {
    setSaving(true)
    try {
      await Promise.all([
        settingsService.updateSupportContactInfo(values),
        settingsService.updateSupportFAQs(faqs),
      ])
      toast.success('Configurações de suporte atualizadas com sucesso!')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao salvar alterações.')
    } finally {
      setSaving(false)
    }
  }

  if (appLoading || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <LifeBuoy className="h-8 w-8 text-primary" />
            Configuração de Suporte
          </h1>
          <p className="text-muted-foreground">
            Gerencie as informações de contato e perguntas frequentes exibidas
            no portal de suporte.
          </p>
        </div>
        <Button onClick={form.handleSubmit(onSubmit)} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Salvar Alterações
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informações de Contato</CardTitle>
            <CardDescription>
              Canais oficiais exibidos para o público.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email de Suporte</FormLabel>
                      <FormControl>
                        <Input placeholder="suporte@exemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="0800 123 4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="whatsapp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link do WhatsApp</FormLabel>
                      <FormControl>
                        <Input placeholder="https://wa.me/..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* FAQs */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Perguntas Frequentes (FAQ)</CardTitle>
            <CardDescription>
              Edite o conteúdo das perguntas e respostas principais.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {faqs.map((faq, index) => (
              <div
                key={faq.id}
                className="p-4 border rounded-lg bg-slate-50/50 space-y-3"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-lg text-slate-400">
                    #{index + 1}
                  </span>
                  <Input
                    value={faq.question}
                    onChange={(e) =>
                      handleFAQChange(faq.id, 'question', e.target.value)
                    }
                    className="font-semibold"
                    placeholder="Pergunta"
                  />
                </div>
                <Textarea
                  value={faq.answer}
                  onChange={(e) =>
                    handleFAQChange(faq.id, 'answer', e.target.value)
                  }
                  className="min-h-[100px]"
                  placeholder="Resposta"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
