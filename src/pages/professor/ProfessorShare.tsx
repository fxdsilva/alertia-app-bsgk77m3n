import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Copy, QrCode, Share2, Mail, MessageCircle } from 'lucide-react'

export default function ProfessorShare() {
  const { toast } = useToast()
  const shareUrl = 'https://alertia.goskip.app'
  const shareMessage =
    'Olá! Convido você a conhecer o Alertia, nossa plataforma de conformidade escolar: ' +
    shareUrl

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast({
        title: 'Link copiado com sucesso!',
        description: 'O link foi copiado para a área de transferência.',
      })
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erro ao copiar',
        description: 'Não foi possível copiar o link.',
      })
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Alertia App',
          text: shareMessage,
        })
        toast({
          title: 'Compartilhado com sucesso!',
          description: 'Obrigado por divulgar o Alertia.',
        })
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          copyToClipboard()
        }
      }
    } else {
      copyToClipboard()
    }
  }

  const shareViaEmail = () => {
    const subject = 'Convite: Conheça o Alertia'
    const body = shareMessage
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = url
  }

  return (
    <div className="container max-w-4xl py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
          <Share2 className="h-8 w-8 text-primary" />
          Compartilhar App
        </h1>
        <p className="text-muted-foreground text-lg">
          Convide seus colegas para fazerem parte da cultura de conformidade e
          transparência da nossa instituição.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
          <Card className="border-border/50 shadow-sm flex-1">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Share2 className="h-5 w-5 text-primary" />
                Link de Compartilhamento
              </CardTitle>
              <CardDescription>
                Copie o link público e envie para sua rede.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="bg-muted text-muted-foreground"
                />
                <Button
                  onClick={copyToClipboard}
                  variant="default"
                  className="shrink-0"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copiar Link
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm flex-1">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                Compartilhamento Rápido
              </CardTitle>
              <CardDescription>
                Envie o convite diretamente pelos seus aplicativos favoritos.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {'share' in navigator && (
                <Button
                  onClick={handleNativeShare}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Share2 className="mr-2 h-5 w-5" />
                  Compartilhar App
                </Button>
              )}
              <Button
                asChild
                className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white cursor-pointer"
              >
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(shareMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Compartilhar no WhatsApp
                </a>
              </Button>
              <Button
                onClick={shareViaEmail}
                variant="outline"
                className="w-full"
              >
                <Mail className="mr-2 h-5 w-5" />
                Compartilhar por E-mail
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/50 shadow-sm flex flex-col h-full min-h-[350px]">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              Código QR
            </CardTitle>
            <CardDescription>
              Escaneie o código abaixo para acessar o app instantaneamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center flex-1 py-8 space-y-6">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-border">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(shareUrl)}&margin=10`}
                alt="QR Code do App"
                className="w-48 h-48 object-contain"
              />
            </div>
            <p className="text-sm font-medium text-muted-foreground text-center max-w-[200px]">
              Aponte a câmera do seu celular para escanear
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
