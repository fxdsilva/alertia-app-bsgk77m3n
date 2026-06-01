import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { settingsService, ShareAppConfig } from '@/services/settingsService'
import { Loader2, Save, Share2 } from 'lucide-react'

export default function SecretaryConfig() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const [config, setConfig] = useState<ShareAppConfig>({
    enabled: false,
    title: '',
    description: '',
    url: '',
  })

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    setLoading(true)
    try {
      const data = await settingsService.getShareAppConfig()
      if (data) {
        setConfig(data)
      }
    } catch (error) {
      console.error('Failed to fetch config', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await settingsService.updateShareAppConfig(config)
      toast({
        title: 'Configurações salvas',
        description:
          'As configurações de compartilhamento foram atualizadas com sucesso.',
      })
    } catch (error) {
      console.error('Failed to save config', error)
      toast({
        title: 'Erro ao salvar',
        description:
          'Não foi possível salvar as configurações. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Configurações da Secretaria
        </h1>
        <p className="text-muted-foreground text-lg">
          Gerencie o que é visível para a Secretaria de Educação
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-purple-600" />
            Compartilhar App
          </CardTitle>
          <CardDescription>
            Defina as informações do aplicativo que serão sugeridas para a
            Secretaria de Educação compartilhar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between border rounded-lg p-4 bg-muted/30">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">
                Habilitar Compartilhamento
              </Label>
              <p className="text-sm text-muted-foreground">
                Ative para exibir o card de compartilhamento no painel da
                Secretaria.
              </p>
            </div>
            <Switch
              checked={config.enabled}
              onCheckedChange={(checked) =>
                setConfig({ ...config, enabled: checked })
              }
            />
          </div>

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título do Card</Label>
              <Input
                id="title"
                value={config.title}
                onChange={(e) =>
                  setConfig({ ...config, title: e.target.value })
                }
                placeholder="Ex: Compartilhe nosso App"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={config.description}
                onChange={(e) =>
                  setConfig({ ...config, description: e.target.value })
                }
                placeholder="Ex: Ajude a promover um ambiente mais ético..."
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="url">URL de Compartilhamento</Label>
              <Input
                id="url"
                value={config.url}
                onChange={(e) => setConfig({ ...config, url: e.target.value })}
                placeholder="https://exemplo.com/portal"
                type="url"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Salvar Configurações
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
