import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts'
import {
  Building2,
  Users,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Info,
  Activity,
  GraduationCap,
  Calculator,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { adminDashboardService } from '@/services/adminDashboardService'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import TrainingsPage from '@/pages/trainings/TrainingsPage'
import { Button } from '@/components/ui/button'
import { AIReportGenerator } from '@/components/dashboard/AIReportGenerator'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { formatDistanceToNow, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { supabase } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

const chartConfig = {
  complaints: {
    label: 'Denúncias',
    color: '#1e3a8a', // blue-900 like
  },
  resolved: {
    label: 'Resolvidos',
    color: '#d97706', // amber-600
  },
}

export default function SeniorDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    schools: 0,
    users: 0,
    activeAlerts: 0,
    resolutionRate: 0,
    resolutionRateChange: 0,
  })
  const [chartData, setChartData] = useState<any[]>([])
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  // Modals state
  const [resolutionModalOpen, setResolutionModalOpen] = useState(false)
  const [resolutionDetails, setResolutionDetails] = useState({
    total: 0,
    resolved: 0,
  })
  const [alertsModalOpen, setAlertsModalOpen] = useState(false)
  const [criticalAlerts, setCriticalAlerts] = useState<any[]>([])
  const [detailsLoading, setDetailsLoading] = useState(false)

  const fetchData = async () => {
    try {
      const [kpis, charts, activities] = await Promise.all([
        adminDashboardService.getKPIs(),
        adminDashboardService.getChartsData(),
        adminDashboardService.getRecentActivities(),
      ])

      setStats(kpis)
      setChartData(charts)
      setRecentActivities(activities)
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      toast.error('Erro ao carregar estatísticas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const openResolutionModal = async () => {
    setResolutionModalOpen(true)
    setDetailsLoading(true)
    try {
      const { data, error } = await supabase.from('denuncias').select(`
        id, 
        status:status_denuncia(nome_status)
      `)

      if (data && !error) {
        const total = data.length
        const resolved = data.filter((d) => {
          const statusName = (d.status as any)?.nome_status?.toLowerCase() || ''
          return (
            statusName.includes('resolvid') ||
            statusName.includes('concluíd') ||
            statusName.includes('arquivad')
          )
        }).length
        setResolutionDetails({ total, resolved })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setDetailsLoading(false)
    }
  }

  const openAlertsModal = async () => {
    setAlertsModalOpen(true)
    setDetailsLoading(true)
    try {
      const { data, error } = await supabase
        .from('denuncias')
        .select(
          `
          id, protocolo, descricao, gravidade, created_at,
          status:status_denuncia(nome_status)
        `,
        )
        .in('gravidade', ['Alta', 'Crítica', 'Crítico', 'Alto'])
        .order('created_at', { ascending: false })
        .limit(20)

      if (data && !error) {
        // filter out resolved
        const active = data.filter((d) => {
          const statusName = (d.status as any)?.nome_status?.toLowerCase() || ''
          return !(
            statusName.includes('resolvid') ||
            statusName.includes('concluíd') ||
            statusName.includes('arquivad')
          )
        })
        setCriticalAlerts(active)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setDetailsLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Dashboard Global
          </h1>
          <p className="text-muted-foreground">
            Visão consolidada da rede de ensino e integridade corporativa.
          </p>
        </div>
        <AIReportGenerator onReportGenerated={fetchData} />
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="bg-muted/50 border">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="training">Portal de Capacitação</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-0">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            <Card
              className="border-t-4 border-t-purple-500 shadow-sm cursor-pointer hover:shadow-md transition-all flex flex-col h-full"
              onClick={() => setActiveTab('training')}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Capacitação
                </CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="flex flex-col flex-1">
                <div className="text-xl font-bold mt-1 text-purple-700">
                  Portal de Cursos
                </div>
                <p className="text-xs text-muted-foreground mt-1 mb-4">
                  Acessar treinamentos
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-auto"
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveTab('training')
                  }}
                >
                  Abrir Portal
                </Button>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-blue-500 shadow-sm flex flex-col h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Escolas
                </CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="flex flex-col flex-1">
                <div className="text-3xl font-bold">
                  {loading ? '-' : stats.schools}
                </div>
                <p className="text-xs text-muted-foreground mt-1 mb-4">
                  Instituições monitoradas
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-auto"
                  onClick={() => navigate('/senior/schools')}
                >
                  Ver Escolas
                </Button>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-indigo-500 shadow-sm flex flex-col h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Usuários Ativos
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="flex flex-col flex-1">
                <div className="text-3xl font-bold">
                  {loading ? '-' : stats.users}
                </div>
                <p className="text-xs text-muted-foreground mt-1 mb-4">
                  Gestores e colaboradores
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-auto"
                  onClick={() => navigate('/senior/users')}
                >
                  Gerenciar Usuários
                </Button>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-red-500 shadow-sm relative overflow-hidden flex flex-col h-full">
              <div className="absolute top-0 right-0 p-2 opacity-50">
                <AlertTriangle className="h-16 w-16 text-red-100 -rotate-12" />
              </div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-medium">
                    Alertas Críticos
                  </CardTitle>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Alertas Críticos: Ocorrências de alta gravidade ou
                        prazos de investigação expirados que exigem atenção
                        imediata.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent className="relative z-10 flex flex-col flex-1">
                <div className="text-3xl font-bold text-red-600">
                  {loading ? '-' : stats.activeAlerts}
                </div>
                <p className="text-xs text-muted-foreground mt-1 mb-4">
                  Requerem atenção imediata
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-auto border-red-200 hover:bg-red-50 hover:text-red-700"
                  onClick={openAlertsModal}
                >
                  Ver Lista de Alertas
                </Button>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-green-500 shadow-sm flex flex-col h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Taxa de Resolução
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent className="flex flex-col flex-1">
                <div className="text-3xl font-bold text-green-700">
                  {loading ? '-' : `${stats.resolutionRate}%`}
                </div>
                <div className="flex items-center text-xs text-muted-foreground mt-1 mb-4">
                  {stats.resolutionRateChange >= 0 ? (
                    <span className="text-green-600 flex items-center font-medium mr-1">
                      <TrendingUp className="h-3 w-3 mr-0.5" />+
                      {stats.resolutionRateChange}%
                    </span>
                  ) : (
                    <span className="text-red-500 flex items-center font-medium mr-1">
                      <TrendingUp className="h-3 w-3 mr-0.5 rotate-180" />
                      {stats.resolutionRateChange}%
                    </span>
                  )}
                  em relação ao mês anterior
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-auto border-green-200 hover:bg-green-50 hover:text-green-700"
                  onClick={openResolutionModal}
                >
                  Ver Detalhes do Cálculo
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="flex flex-col shadow-sm">
              <CardHeader>
                <CardTitle>Volume de Ocorrências</CardTitle>
                <CardDescription>
                  Comparativo mensal de novas denúncias vs. casos resolvidas.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pb-4">
                {loading ? (
                  <div className="h-[300px] w-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <ChartContainer
                    config={chartConfig}
                    className="h-[300px] w-full"
                  >
                    <BarChart
                      data={chartData}
                      margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid
                        vertical={false}
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        className="text-xs"
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        className="text-xs"
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar
                        dataKey="complaints"
                        fill="var(--color-complaints)"
                        radius={[4, 4, 0, 0]}
                        name="Denúncias"
                        barSize={30}
                      />
                      <Bar
                        dataKey="resolved"
                        fill="var(--color-resolved)"
                        radius={[4, 4, 0, 0]}
                        name="Resolvidos"
                        barSize={30}
                      />
                    </BarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            <Card className="flex flex-col shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <CardTitle>Tendência de Risco</CardTitle>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Tendência de Risco: Monitoramento do índice de risco
                          global calculado com base na gravidade e volume de
                          denúncias não resolvidas.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <CardDescription>
                    Monitoramento do índice de risco global da rede.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex-1 pb-4">
                {loading ? (
                  <div className="h-[300px] w-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <ChartContainer
                    config={chartConfig}
                    className="h-[300px] w-full"
                  >
                    <LineChart
                      data={chartData}
                      margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid
                        vertical={false}
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        className="text-xs"
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        className="text-xs"
                        domain={[0, 100]}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="risk"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        dot={{
                          r: 4,
                          fill: 'hsl(var(--primary))',
                          strokeWidth: 2,
                        }}
                        activeDot={{ r: 6 }}
                        name="Índice de Risco"
                      />
                    </LineChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-muted-foreground" />
                  Atividades Recentes
                </CardTitle>
              </div>
              <CardDescription>
                Histórico recente de ações e atualizações no sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-2.5 before:w-px before:bg-border before:content-['']">
                {recentActivities.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    Nenhuma atividade recente encontrada.
                  </div>
                ) : (
                  recentActivities.map((activity, i) => (
                    <div
                      key={activity.id || i}
                      className="flex items-start gap-4 relative pl-8"
                    >
                      <div className="absolute left-0 top-1 h-5 w-5 rounded-full border bg-background flex items-center justify-center z-10">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none text-foreground">
                          {activity.action}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>
                            {formatDistanceToNow(new Date(activity.timestamp), {
                              locale: ptBR,
                              addSuffix: true,
                            })}
                          </span>
                          <span>•</span>
                          <span className="font-medium text-foreground/80">
                            {activity.school}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value="training"
          className="mt-0 min-h-[600px] border-none p-0 outline-none"
        >
          {activeTab === 'training' && <TrainingsPage />}
        </TabsContent>
      </Tabs>

      {/* Resolution Rate Modal */}
      <Dialog open={resolutionModalOpen} onOpenChange={setResolutionModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-green-600" />
              Cálculo da Taxa de Resolução
            </DialogTitle>
            <DialogDescription>
              Entenda como o indicador de taxa de resolução é calculado para a
              sua rede de ensino.
            </DialogDescription>
          </DialogHeader>

          {detailsLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-6 py-4">
              <div className="bg-muted/50 p-4 rounded-lg border">
                <h4 className="text-sm font-semibold mb-2">Fórmula Aplicada</h4>
                <code className="text-sm text-muted-foreground bg-background px-2 py-1 rounded border block text-center">
                  (Denúncias Resolvidas ÷ Total de Denúncias) × 100
                </code>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card className="shadow-none border-dashed bg-background/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total de Denúncias
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {resolutionDetails.total}
                    </div>
                  </CardContent>
                </Card>
                <Card className="shadow-none border-dashed bg-background/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Casos Resolvidos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">
                      {resolutionDetails.resolved}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex items-center justify-between border-t pt-4">
                <span className="font-medium text-lg">
                  Taxa Atual Consolidada:
                </span>
                <span className="text-3xl font-bold text-green-700">
                  {resolutionDetails.total > 0
                    ? Math.round(
                        (resolutionDetails.resolved / resolutionDetails.total) *
                          100,
                      )
                    : 0}
                  %
                </span>
              </div>

              <div className="text-xs text-muted-foreground flex items-start gap-2 bg-blue-50/50 p-3 rounded-md border border-blue-100">
                <Info className="h-4 w-4 shrink-0 text-blue-500 mt-0.5" />
                <p className="text-blue-700/80">
                  Os dados refletem o volume histórico consolidado na tabela{' '}
                  <strong>denuncias</strong>. São consideradas resolvidas
                  ocorrências nos status "Concluída", "Resolvida" ou
                  "Arquivada".
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Critical Alerts Modal */}
      <Dialog open={alertsModalOpen} onOpenChange={setAlertsModalOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Alertas Críticos Pendentes
            </DialogTitle>
            <DialogDescription>
              Ocorrências de alta gravidade não resolvidas que exigem
              intervenção imediata.
            </DialogDescription>
          </DialogHeader>

          {detailsLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ScrollArea className="max-h-[500px] mt-2 rounded-md border bg-muted/20">
              <div className="p-4 space-y-3">
                {criticalAlerts.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 text-green-300/50 mx-auto mb-3" />
                    <p>Nenhum alerta crítico pendente no momento.</p>
                  </div>
                ) : (
                  criticalAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="bg-background border rounded-lg p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">
                              {alert.protocolo}
                            </span>
                            <Badge
                              variant="destructive"
                              className="shrink-0 text-[10px] h-5"
                            >
                              {alert.gravidade || 'Crítico'}
                            </Badge>
                          </div>
                          <h4 className="font-medium text-sm line-clamp-2 leading-relaxed">
                            {alert.descricao}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
                        <span className="flex items-center gap-1">
                          <Activity className="h-3.5 w-3.5" />
                          {(alert.status as any)?.nome_status ||
                            'Status não definido'}
                        </span>
                        <span>
                          Registrado em:{' '}
                          <strong className="font-medium text-foreground">
                            {format(new Date(alert.created_at), 'dd/MM/yyyy', {
                              locale: ptBR,
                            })}
                          </strong>
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
