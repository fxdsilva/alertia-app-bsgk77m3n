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
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import {
  Building2,
  Users,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
} from 'lucide-react'
import { adminService } from '@/services/adminService'
import { toast } from 'sonner'

const chartConfig = {
  complaints: {
    label: 'Denúncias',
    color: 'hsl(var(--chart-1))',
  },
  resolved: {
    label: 'Resolvidos',
    color: 'hsl(var(--chart-2))',
  },
}

const mockActivityData = [
  { month: 'Jan', complaints: 45, resolved: 32 },
  { month: 'Fev', complaints: 52, resolved: 40 },
  { month: 'Mar', complaints: 48, resolved: 45 },
  { month: 'Abr', complaints: 61, resolved: 50 },
  { month: 'Mai', complaints: 55, resolved: 48 },
  { month: 'Jun', complaints: 67, resolved: 60 },
]

export default function SeniorDashboard() {
  const [stats, setStats] = useState({
    schools: 0,
    users: 1250, // Mocked for now
    activeAlerts: 15, // Mocked for now
    resolutionRate: 88, // Mocked for now
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGlobalStats = async () => {
      try {
        // Fetch real school count
        const schools = await adminService.getAllSchools()
        setStats((prev) => ({
          ...prev,
          schools: schools.length,
        }))
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        toast.error('Erro ao carregar estatísticas')
      } finally {
        setLoading(false)
      }
    }

    fetchGlobalStats()
  }, [])

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Global</h1>
        <p className="text-muted-foreground">
          Visão consolidada da rede de ensino e integridade corporativa.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Escolas
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '-' : stats.schools}
            </div>
            <p className="text-xs text-muted-foreground">
              Instituições monitoradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Usuários Ativos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users}</div>
            <p className="text-xs text-muted-foreground">
              Gestores e colaboradores
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Alertas Críticos
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.activeAlerts}
            </div>
            <p className="text-xs text-muted-foreground">
              Requerem atenção imediata
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Resolução
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.resolutionRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              +2.5% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Volume de Ocorrências</CardTitle>
            <CardDescription>
              Comparativo mensal de novas denúncias vs. casos resolvidos.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-4">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={mockActivityData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis axisLine={false} tickLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="complaints"
                  fill="var(--color-complaints)"
                  radius={[4, 4, 0, 0]}
                  name="Denúncias"
                />
                <Bar
                  dataKey="resolved"
                  fill="var(--color-resolved)"
                  radius={[4, 4, 0, 0]}
                  name="Resolvidos"
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Tendência de Risco</CardTitle>
            <CardDescription>
              Monitoramento do índice de risco global da rede.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-4">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <LineChart
                data={mockActivityData.map((d) => ({
                  ...d,
                  risk: Math.floor(Math.random() * 100),
                }))}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis axisLine={false} tickLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="risk"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Índice de Risco"
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Atividades Recentes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div
                key={i}
                className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0"
              >
                <div className="h-2 w-2 mt-2 rounded-full bg-blue-500" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Novo relatório de auditoria gerado
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Há 2 horas • Escola Municipal Central
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
