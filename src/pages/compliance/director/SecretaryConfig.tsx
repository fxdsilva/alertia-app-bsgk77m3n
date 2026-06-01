import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import {
  secretaryService,
  SecretaryDashboardConfig,
  ShareAppConfig,
} from '@/services/secretaryService'
import { supabase } from '@/lib/supabase/client'

export default function SecretaryConfig() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [config, setConfig] = useState<SecretaryDashboardConfig>({
    welcomeMessage: 'Bem-vindo ao Painel da Secretaria de Educação',
    showStats: true,
    showSchools: true,
    showReports: true,
    customLinks: [],
  })

  const [shareConfig, setShareConfig] = useState<ShareAppConfig>({
    enabled: true,
    title: 'Compartilhar App',
    description: '',
    url: 'https://alertia.goskip.app/public/portal',
  })

  useEffect(() => {
    async function loadData() {
      try {
        const [dashConfig, sConfig] = await Promise.all([
          secretaryService.getSecretaryConfig(),
          secretaryService.getShareAppConfig(),
        ])
        if (dashConfig) setConfig(dashConfig)
        if (sConfig) setShareConfig(sConfig)
      } catch (error) {
        console.error('Error loading config:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await secretaryService.updateSecretaryConfig(config)

      const { error } = await supabase.from('admin_settings').upsert(
        {
          key: 'secretary_share_app_config',
          settings: shareConfig as any,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' },
      )

      if (error) throw error

      toast({
        title: 'Sucesso',
        description: 'Configurações salvas com sucesso.',
      })
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Falha ao salvar configurações: ' + error.message,
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const addLink = () => {
    setConfig((prev) => ({
      ...prev,
      customLinks: [...prev.customLinks, { title: '', url: '' }],
    }))
  }

  const updateLink = (index: number, field: 'title' | 'url', value: string) => {
    const newLinks = [...config.customLinks]
    newLinks[index] = { ...newLinks[index], [field]: value }
    setConfig((prev) => ({ ...prev, customLinks: newLinks }))
  }

  const removeLink = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      customLinks: prev.customLinks.filter((_, i) => i !== index),
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Configuração da Secretaria
        </h1>
        <p className="text-muted-foreground">
          Gerencie o que a Secretaria de Educação pode visualizar no seu painel.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Painel Principal</CardTitle>
            <CardDescription>
              Configurações de exibição do dashboard institucional
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="welcomeMessage">Mensagem de Boas-vindas</Label>
              <Textarea
                id="welcomeMessage"
                value={config.welcomeMessage}
                onChange={(e) =>
                  setConfig({ ...config, welcomeMessage: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="showStats" className="flex flex-col space-y-1">
                  <span>Mostrar Estatísticas</span>
                  <span className="font-normal text-xs text-muted-foreground">
                    Exibe os cards de totalizadores
                  </span>
                </Label>
                <Switch
                  id="showStats"
                  checked={config.showStats}
                  onCheckedChange={(c) =>
                    setConfig({ ...config, showStats: c })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label
                  htmlFor="showSchools"
                  className="flex flex-col space-y-1"
                >
                  <span>Mostrar Lista de Escolas</span>
                  <span className="font-normal text-xs text-muted-foreground">
                    Exibe a tabela de escolas da rede
                  </span>
                </Label>
                <Switch
                  id="showSchools"
                  checked={config.showSchools}
                  onCheckedChange={(c) =>
                    setConfig({ ...config, showSchools: c })
                  }
                />
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <Label>Links Úteis (Acesso Rápido)</Label>
                <Button variant="outline" size="sm" onClick={addLink}>
                  <Plus className="h-4 w-4 mr-2" /> Adicionar Link
                </Button>
              </div>

              <div className="space-y-3">
                {config.customLinks.map((link, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="space-y-2 flex-1">
                      <Input
                        placeholder="Título do Link"
                        value={link.title}
                        onChange={(e) =>
                          updateLink(index, 'title', e.target.value)
                        }
                      />
                      <Input
                        placeholder="URL (https://...)"
                        value={link.url}
                        onChange={(e) =>
                          updateLink(index, 'url', e.target.value)
                        }
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLink(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                {config.customLinks.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    Nenhum link configurado.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Módulo Compartilhar App</CardTitle>
            <CardDescription>
              Configure como a Secretaria pode compartilhar o portal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="shareEnabled" className="flex flex-col space-y-1">
                <span>Habilitar Módulo</span>
                <span className="font-normal text-xs text-muted-foreground">
                  Exibir o card no dashboard da Secretaria
                </span>
              </Label>
              <Switch
                id="shareEnabled"
                checked={shareConfig.enabled}
                onCheckedChange={(c) =>
                  setShareConfig({ ...shareConfig, enabled: c })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shareTitle">Título do Card</Label>
              <Input
                id="shareTitle"
                value={shareConfig.title}
                onChange={(e) =>
                  setShareConfig({ ...shareConfig, title: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shareDesc">Descrição Opcional</Label>
              <Textarea
                id="shareDesc"
                value={shareConfig.description}
                onChange={(e) =>
                  setShareConfig({
                    ...shareConfig,
                    description: e.target.value,
                  })
                }
                placeholder="Ex: Compartilhe o link do portal público..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shareUrl">URL para Compartilhamento</Label>
              <Input
                id="shareUrl"
                value={shareConfig.url}
                onChange={(e) =>
                  setShareConfig({ ...shareConfig, url: e.target.value })
                }
                placeholder="https://alertia.goskip.app/public/portal"
              />
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium">Preview do Texto Fixo:</p>
              <p className="text-sm mt-2">
                "Compartilhar App: Convide seus colegas para fazerem parte da
                cultura de conformidade e transparência da nossa instituição."
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full md:w-auto"
        >
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          Salvar Configurações
        </Button>
      </div>
    </div>
  )
}
