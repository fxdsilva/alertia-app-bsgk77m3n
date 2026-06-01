import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, Share2, Check } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import useAppStore from '@/stores/useAppStore'
import { settingsService, ShareAppConfig } from '@/services/settingsService'

export default function ShareApp() {
  const { profile } = useAppStore()
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  const [config, setConfig] = useState<ShareAppConfig>({
    enabled: true,
    title: 'Compartilhar App',
    description:
      'Convide seus colegas para fazerem parte da cultura de conformidade e transparência da nossa instituição.',
    url: window.location.origin,
  })

  useEffect(() => {
    if (profile === 'SECRETARIA DE EDUCAÇÃO') {
      loadConfig()
    } else {
      setLoading(false)
    }
  }, [profile])

  const loadConfig = async () => {
    try {
      setLoading(true)
      const data = await settingsService.getShareAppConfig()
      if (data) {
        setConfig(data)
      }
    } catch (error) {
      console.error('Failed to load share config', error)
    } finally {
      setLoading(false)
    }
  }

  const shareUrl = window.location.origin

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({
      title: 'Link copiado!',
      description: 'O link foi copiado para a área de transferência.',
    })
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: config.title,
          text: config.description,
          url: shareUrl,
        })
      } catch (error) {
        console.error('Error sharing', error)
      }
    } else {
      handleCopy()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl animate-fade-in-up">
      <Card className="border-none shadow-md bg-gradient-to-br from-background to-secondary/20 overflow-hidden">
        <div className="h-2 w-full bg-primary" />
        <CardHeader className="text-center space-y-4 pb-8 pt-8">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Share2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-foreground">
            {config.title}
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground max-w-md mx-auto">
            {config.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pb-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="w-full sm:w-auto gap-2"
              onClick={handleShare}
            >
              <Share2 className="h-5 w-5" />
              Compartilhar
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto gap-2"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
              {copied ? 'Copiado' : 'Copiar Link'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
