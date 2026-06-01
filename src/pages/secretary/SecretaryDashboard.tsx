import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  AlertTriangle,
  Building2,
  FileCheck,
  GraduationCap,
  Scale,
  ExternalLink,
} from 'lucide-react'
import {
  secretaryService,
  DashboardSummary,
  SecretaryDashboardConfig,
} from '@/services/secretaryService'
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [dashData, dashConfig] = await Promise.all([
        secretaryService.getDashboardData(),
        secretaryService.getSecretaryConfig(),
      ])
      setData(dashData)
      setConfig(dashConfig)
    } catch (error) {
      console.error('Failed to load secretary dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground animate-pulse">
        Carregando painel...
      </div>
    )
  }

  if (!config) {
    return (
      <div className="p-8 flex flex-col items-center justify-center text-center space-y-4 min-h-[50vh] animate-fade-in">
        <Building2 className="h-16 w-16 text-muted-foreground opacity-20" />
        <h2 className="text-2xl font-bold">Aguardando Configuração</h2>
        <p className="text-muted-foreground max-w-md">
          O painel da Secretaria está aguardando as definições da Diretoria de
          Compliance. Em breve as informações estarão disponíveis.
        </p>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Painel da Secretaria de Educação
          </h1>
          <p className="text-muted-foreground mt-2 max-w-3xl">
            {config.welcomeMessage}
          </p>
        </div>
      </div>

      {config.showStats && data && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Escolas
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalSchools}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Denúncias Ativas
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalComplaints}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Investigações em Curso
              </CardTitle>
              <FileCheck className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.totalInvestigations}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mediações</CardTitle>
              <Scale className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalMediations}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {config.showSchools && data && (
            <Card>
              <CardHeader>
                <CardTitle>Situação por Escola</CardTitle>
                <CardDescription>
                  Resumo dos indicadores de compliance das unidades
                  educacionais.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Escola</TableHead>
                        <TableHead>Rede</TableHead>
                        <TableHead className="text-center">Denúncias</TableHead>
                        <TableHead className="text-center">Investig.</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.schools.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="text-center py-6 text-muted-foreground"
                          >
                            Nenhuma escola registrada ou ativa no momento.
                          </TableCell>
                        </TableRow>
                      ) : (
                        data.schools.map((school) => (
                          <TableRow key={school.id}>
                            <TableCell className="font-medium">
                              {school.name}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{school.network}</Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              {school.complaintsCount > 0 ? (
                                <Badge variant="destructive">
                                  {school.complaintsCount}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">0</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {school.investigationsCount > 0 ? (
                                <Badge variant="secondary">
                                  {school.investigationsCount}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">0</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {config.showReports && (
            <Card>
              <CardHeader>
                <CardTitle>Relatórios Consolidados</CardTitle>
                <CardDescription>
                  Acesse os relatórios de integridade macro da rede educacional.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center p-8 border border-dashed rounded-lg bg-secondary/20">
                  <div className="text-center">
                    <FileCheck className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm font-medium">
                      Módulo de relatórios disponível para a Secretaria.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                      Você será notificado quando novos relatórios consolidados
                      forem publicados pela Diretoria.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {config.customLinks && config.customLinks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Links e Aplicativos Úteis</CardTitle>
                <CardDescription>
                  Materiais de apoio e acessos disponibilizados pelo Compliance.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {config.customLinks.map((link, idx) => (
                    <li key={idx}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-3 rounded-lg border hover:bg-secondary/50 transition-colors group"
                      >
                        <div className="flex-1 font-medium text-sm group-hover:text-primary transition-colors">
                          {link.title}
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                      </a>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Treinamentos da Rede</CardTitle>
              <CardDescription>
                Acompanhamento dos programas de capacitação.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 bg-primary/5 p-4 rounded-lg border border-primary/10">
                <GraduationCap className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm font-medium text-primary">
                    Capacitação Contínua
                  </p>
                  <p className="text-xs text-muted-foreground">
                    O programa de integridade possui trilhas de treinamento
                    ativas para os servidores.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
