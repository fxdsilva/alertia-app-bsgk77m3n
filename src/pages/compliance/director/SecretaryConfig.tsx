import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { settingsService, ShareAppConfig } from '@/services/settingsService'
import { Save, Share2 } from 'lucide-react'

export default function SecretaryConfig() {
  const [config, setConfig] = useState<ShareAppConfig>({
    enabled: true,
    title: 'Compartilhar App',
    description:
      'Convide seus colegas para fazerem parte da cultura de conformidade e transparência da nossa instituição.',
    url: window.location.origin,
  })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      setFetching(true)
      const data = await settingsService.getShareAppConfig()
      if (data) {
        setConfig(data)
      }
    } catch (error) {
      console.error(error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as configurações.',
        variant: 'destructive',
      })
    } finally {
      setFetching(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await settingsService.updateShareAppConfig(config)
      toast({
        title: 'Sucesso',
        description: 'Configurações atualizadas com sucesso.',
      })
    } catch (error) {
      console.error(error)
      toast({
        title: 'Erro',
        description: 'Erro ao salvar as configurações.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Configurações da Secretaria
        </h1>
        <p className="text-muted-foreground mt-2">
          Gerencie as configurações e o conteúdo exibido para o perfil
          Secretaria de Educação.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Share2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Compartilhar App</CardTitle>
              <CardDescription>
                Personalize a mensagem exibida na página de compartilhamento do
                aplicativo para a Secretaria.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Título da Página</label>
            <Input
              value={config.title}
              onChange={(e) => setConfig({ ...config, title: e.target.value })}
              placeholder="Compartilhar App"
            />
            <p className="text-xs text-muted-foreground">
              O título principal que aparecerá na página de compartilhamento.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Descrição Institucional
            </label>
            <Textarea
              value={config.description}
              onChange={(e) =>
                setConfig({ ...config, description: e.target.value })
              }
              placeholder="Convide seus colegas para fazerem parte da cultura de conformidade e transparência da nossa instituição."
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Um texto motivacional encorajando os colegas a utilizarem o app.
            </p>
          </div>

          <div className="pt-4 flex justify-end">
            <Button onClick={handleSave} disabled={loading} className="gap-2">
              <Save className="h-4 w-4" />
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
