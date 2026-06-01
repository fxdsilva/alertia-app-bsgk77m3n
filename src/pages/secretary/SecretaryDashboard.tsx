import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { settingsService, ShareAppConfig } from '@/services/settingsService'
import {
  Loader2,
  Share2,
  Copy,
  Users,
  BookOpen,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

export default function SecretaryDashboard() {
  const [config, setConfig] = useState<ShareAppConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    settingsService.getShareAppConfig().then((data) => {
      setConfig(data)
      setLoading(false)
    })
  }, [])

  const handleCopy = () => {
    if (config?.url) {
      navigator.clipboard.writeText(config.url)
      toast({
        title: 'Link copiado!',
        description: 'O link foi copiado para a área de transferência.',
      })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Painel da Secretaria
        </h1>
        <p className="text-muted-foreground text-lg">
          Visão geral e ferramentas institucionais
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Escolas na Rede
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">142</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total de instituições ativas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Denúncias</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">28</div>
              <p className="text-xs text-muted-foreground mt-1">
                Casos reportados este mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Treinamentos
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">85%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Taxa média de conclusão
              </p>
            </CardContent>
          </Card>

          {config?.enabled && (
            <Card className="border-l-4 border-l-blue-500 shadow-sm md:col-span-2 lg:col-span-3">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-blue-600" />
                  {config.title || 'Compartilhar App'}
                </CardTitle>
                <CardDescription>
                  {config.description ||
                    'Compartilhe o aplicativo com sua rede.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-4">
                  <div className="bg-muted px-4 py-3 rounded-md text-sm truncate flex-1 font-mono text-muted-foreground w-full">
                    {config.url}
                  </div>
                  <Button
                    variant="default"
                    className="w-full sm:w-auto gap-2"
                    onClick={handleCopy}
                  >
                    <Copy className="h-4 w-4" />
                    Copiar Link
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
