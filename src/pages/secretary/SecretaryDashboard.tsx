import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  secretaryService,
  DashboardSummary,
  SecretaryDashboardConfig,
  ShareAppConfig,
} from '@/services/secretaryService'
import {
  Building2,
  AlertTriangle,
  FileCheck,
  Scale,
  Share2,
  Loader2,
  Link as LinkIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default function SecretaryDashboard() {
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [config, setConfig] = useState<SecretaryDashboardConfig | null>(null)
  const [shareConfig, setShareConfig] = useState<ShareAppConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [dashData, dashConfig, shareData] = await Promise.all([
          secretaryService.getDashboardData(),
          secretaryService.getSecretaryConfig(),
          secretaryService.getShareAppConfig(),
        ])
        setData(dashData)
        setConfig(dashConfig)
        setShareConfig(shareData)
      } catch (error) {
        console.error('Error loading secretary dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const welcomeMessage =
    config?.welcomeMessage || 'Bem-vindo ao Painel da Secretaria de Educação'

  return (
    <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          Visão Institucional
        </h1>
        <p className="text-muted-foreground text-lg">{welcomeMessage}</p>
      </div>

      {config?.showStats !== false && data && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Total de Escolas
              </CardTitle>
              <Building2 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalSchools}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Escolas na rede
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Denúncias Ativas
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalComplaints}</div>
              <p className="text-xs text-muted-foreground mt-1">Em andamento</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Investigações
              </CardTitle>
              <FileCheck className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.totalInvestigations}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Processos abertos
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Mediações</CardTitle>
              <Scale className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalMediations}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Casos em mediação
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {config?.showSchools !== false && data && (
            <Card>
              <CardHeader>
                <CardTitle>Métricas por Escola</CardTitle>
                <CardDescription>
                  Resumo de conformidade por unidade escolar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Escola</TableHead>
                        <TableHead>Rede</TableHead>
                        <TableHead className="text-right">Denúncias</TableHead>
                        <TableHead className="text-right">
                          Investigações
                        </TableHead>
                        <TableHead className="text-right">Mediações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.schools.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center py-6 text-muted-foreground"
                          >
                            Nenhuma escola encontrada.
                          </TableCell>
                        </TableRow>
                      ) : (
                        data.schools.slice(0, 10).map((school) => (
                          <TableRow key={school.id}>
                            <TableCell className="font-medium">
                              {school.name}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{school.network}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {school.complaintsCount}
                            </TableCell>
                            <TableCell className="text-right">
                              {school.investigationsCount}
                            </TableCell>
                            <TableCell className="text-right">
                              {school.mediationsCount}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                {data.schools.length > 10 && (
                  <p className="text-xs text-muted-foreground mt-4 text-center">
                    Mostrando as primeiras 10 escolas.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {/* Share App Widget */}
          {shareConfig?.enabled !== false && (
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-primary" />
                  {shareConfig?.title || 'Compartilhar App'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm font-medium">
                  Compartilhar App: Convide seus colegas para fazerem parte da
                  cultura de conformidade e transparência da nossa instituição.
                </p>
                {shareConfig?.description && (
                  <p className="text-sm text-muted-foreground">
                    {shareConfig.description}
                  </p>
                )}
                <Button
                  className="w-full gap-2"
                  onClick={() => {
                    if (navigator.share) {
                      navigator
                        .share({
                          title: shareConfig?.title || 'Compartilhar App',
                          text: 'Convide seus colegas para fazerem parte da cultura de conformidade e transparência da nossa instituição.',
                          url: shareConfig?.url || window.location.origin,
                        })
                        .catch(console.error)
                    } else {
                      navigator.clipboard.writeText(
                        shareConfig?.url || window.location.origin,
                      )
                      alert('Link copiado para a área de transferência!')
                    }
                  }}
                >
                  <Share2 className="h-4 w-4" />
                  Compartilhar
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Custom Links Widget */}
          {config?.customLinks && config.customLinks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Acesso Rápido</CardTitle>
                <CardDescription>Links institucionais</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {config.customLinks.map((link, i) => (
                    <li key={i}>
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-2"
                        asChild
                      >
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <LinkIcon className="h-4 w-4" />
                          {link.title}
                        </a>
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
