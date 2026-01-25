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
} from 'lucide-react'
import { adminDashboardService } from '@/services/adminDashboardService'
import { toast } from 'sonner'
import { AIReportGenerator } from '@/components/dashboard/AIReportGenerator'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-t-4 border-t-blue-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Escolas
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? '-' : stats.schools}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Instituições monitoradas
            </p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-indigo-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Usuários Ativos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? '-' : stats.users}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Gestores e colaboradores
            </p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-red-500 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-50">
            <AlertTriangle className="h-16 w-16 text-red-100 -rotate-12" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">
                Alertas Críticos
              </CardTitle>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Alertas Críticos: Ocorrências de alta gravidade ou prazos de
                    investigação expirados que exigem atenção imediata.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-red-600">
              {loading ? '-' : stats.activeAlerts}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Requerem atenção imediata
            </p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-green-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Resolução
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">
              {loading ? '-' : `${stats.resolutionRate}%`}
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
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
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col shadow-sm">
          <CardHeader>
            <CardTitle>Volume de Ocorrências</CardTitle>
            <CardDescription>
              Comparativo mensal de novas denúncias vs. casos resolvidos.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-4">
            {loading ? (
              <div className="h-[300px] w-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
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
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
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
                    dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 2 }}
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
    </div>
  )
}
