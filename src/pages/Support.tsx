import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { PanelLeft, Mail, Phone, ArrowLeft, Send } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function Support() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Mock submission
    setTimeout(() => {
      setLoading(false)
      toast.success(
        'Mensagem enviada com sucesso! Entraremos em contato em breve.',
      )
    }, 1500)
  }

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
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
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
            equipe de suporte.
          </p>
        </div>

        {/* Contact & FAQ Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Entre em contato</CardTitle>
              <CardDescription>
                Preencha o formulário abaixo para enviar uma mensagem.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input id="name" placeholder="Seu nome" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Assunto</Label>
                  <Input
                    id="subject"
                    placeholder="Como podemos ajudar?"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Mensagem</Label>
                  <Textarea
                    id="message"
                    placeholder="Descreva sua dúvida ou problema..."
                    className="min-h-[120px]"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Enviando...' : 'Enviar Mensagem'}
                  {!loading && <Send className="ml-2 h-4 w-4" />}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-8">
            {/* Contact Info */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-6 flex flex-col items-center text-center space-y-2">
                  <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                    <Mail className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold">Email</h3>
                  <p className="text-sm text-slate-500">
                    suporte@alertia.com.br
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 flex flex-col items-center text-center space-y-2">
                  <div className="p-3 bg-green-50 rounded-full text-green-600">
                    <Phone className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold">Telefone</h3>
                  <p className="text-sm text-slate-500">0800 123 4567</p>
                </CardContent>
              </Card>
            </div>

            {/* FAQ */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight">
                Perguntas Frequentes
              </h2>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>
                    Como faço uma denúncia anônima?
                  </AccordionTrigger>
                  <AccordionContent>
                    Para fazer uma denúncia anônima, acesse a página inicial e
                    clique em "Registrar Denúncia". No formulário, certifique-se
                    de marcar a opção "Denúncia Anônima" na etapa de
                    identificação.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>
                    Como acompanhar meu protocolo?
                  </AccordionTrigger>
                  <AccordionContent>
                    Você pode acompanhar o status da sua denúncia acessando a
                    opção "Consultar Status" na página inicial e informando o
                    número do protocolo gerado no momento do registro.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>
                    Esqueci minha senha, o que fazer?
                  </AccordionTrigger>
                  <AccordionContent>
                    Na tela de login, clique em "Esqueceu a senha?" e siga as
                    instruções enviadas para o seu e-mail cadastrado para
                    redefinir sua senha de acesso.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>
                    Os meus dados estão seguros?
                  </AccordionTrigger>
                  <AccordionContent>
                    Sim. O ALERTIA utiliza criptografia de ponta a ponta e segue
                    rigorosos padrões de segurança e privacidade em conformidade
                    com a LGPD para proteger todas as informações.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-sm text-slate-400 border-t border-slate-200 mt-auto bg-white">
        © {new Date().getFullYear()} ALERTIA. Todos os direitos reservados.
      </footer>
    </div>
  )
}
