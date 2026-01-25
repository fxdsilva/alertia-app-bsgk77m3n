import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FileText,
  Shield,
  AlertTriangle,
  BarChart3,
  GraduationCap,
  PieChart,
  FileCheck,
  Scale,
  SearchCheck,
  Gavel,
  BrainCircuit,
  Building2,
  Calendar,
  Download,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Loader2,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import useAppStore from '@/stores/useAppStore'
import {
  strategicDashboardService,
  DashboardMetrics,
  ChartData,
} from '@/services/strategicDashboardService'
import { cn } from '@/lib/utils'

export default function StrategicDashboard() {
  const { profile, selectedSchool, loading: appLoading } = useAppStore()
  const navigate = useNavigate()
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!appLoading && profile !== 'gestao_escola') {
      navigate('/')
      return
    }

    if (selectedSchool) {
      fetchData(selectedSchool.id)
    }
  }, [profile, selectedSchool, appLoading, navigate])

  const fetchData = async (schoolId: string) => {
    setLoading(true)
    try {
      const [metricsData, chartsData] = await Promise.all([
        strategicDashboardService.getMetrics(schoolId),
        strategicDashboardService.getChartsData(schoolId),
      ])
      setMetrics(metricsData)
      setChartData(chartsData)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (appLoading || loading || !metrics) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  // Helper to determine card styling based on status
  const getStatusColor = (status: string) => {
    const s = status.toUpperCase()
    if (['PENDENTE', 'INDISPONÍVEL', 'CRÍTICO', 'ATENÇÃO'].includes(s))
      return 'red'
    if (['ANÁLISE', 'AGENDADA', 'ABERTAS'].includes(s)) return 'amber'
    return 'emerald' // Default success/available/controlled
  }

  const MetricCard = ({
    title,
    status,
    count,
    icon: Icon,
    onClickUrl,
  }: {
    title: string
    status: string
    count?: number
    icon: any
    onClickUrl?: string
  }) => {
    const color = getStatusColor(status)
    const borderColor = {
      red: 'border-b-red-500',
      amber: 'border-b-amber-500',
      emerald: 'border-b-emerald-500',
    }[color]

    const iconColor = {
      red: 'text-red-500 bg-red-50',
      amber: 'text-amber-500 bg-amber-50',
      emerald: 'text-emerald-500 bg-emerald-50',
    }[color]

    const statusColor = {
      red: 'text-red-600',
      amber: 'text-amber-600',
      emerald: 'text-emerald-600',
    }[color]

    const statusIcon = {
      red: <AlertCircle className="h-4 w-4 text-red-500" />,
      amber: <HelpCircle className="h-4 w-4 text-amber-500" />,
      emerald: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
    }[color]

    return (
      <Card
        className={cn(
          'hover:shadow-md transition-all cursor-pointer border-b-4',
          borderColor,
        )}
        onClick={() => onClickUrl && navigate(onClickUrl)}
      >
        <CardContent className="p-5 flex flex-col h-full justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className={cn('p-2 rounded-lg', iconColor)}>
              <Icon className="h-6 w-6" />
            </div>
            {statusIcon}
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm mb-1">{title}</h3>
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  'text-[10px] font-bold uppercase tracking-wider',
                  statusColor,
                )}
              >
                {status}
              </span>
              {count !== undefined && (
                <span className="text-xs text-slate-500 font-medium">
                  {count > 0 ? `${count} REGISTROS` : ''}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            Gestão Estratégica
          </h1>
          <p className="text-slate-500 mt-1">
            Monitoramento de conformidade:{' '}
            <span className="font-semibold text-slate-700">
              {metrics.schoolName}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border shadow-sm">
          <Select defaultValue="all">
            <SelectTrigger className="w-[160px] border-0 h-9 focus:ring-0">
              <Calendar className="h-4 w-4 mr-2 text-slate-400" />
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo o Período</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Último Trimestre</SelectItem>
              <SelectItem value="year">Este Ano</SelectItem>
            </SelectContent>
          </Select>
          <div className="w-px h-6 bg-slate-200" />
          <Button variant="ghost" size="sm" className="h-9 gap-2">
            <Download className="h-4 w-4 text-slate-400" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Código de Conduta"
          status={metrics.codigoConduta.status}
          icon={FileText}
          onClickUrl="/admin/code-of-conduct"
        />
        <MetricCard
          title="Compromisso da Gestão"
          status={metrics.compromissoGestao.status}
          icon={Shield}
          onClickUrl="/admin/commitment"
        />
        <MetricCard
          title="Denúncias"
          status={`${metrics.denuncias.count} TOTAL`}
          icon={AlertTriangle}
          onClickUrl="/school-admin/complaints"
        />
        <MetricCard
          title="Relatórios"
          status={metrics.relatorios.status}
          icon={BarChart3}
          onClickUrl="/admin/reports"
        />

        <MetricCard
          title="Treinamentos"
          status={`${metrics.treinamentos.count} ATIVOS`}
          icon={GraduationCap}
          onClickUrl="/collaborator/training"
        />
        <MetricCard
          title="Gestão de Riscos"
          status={metrics.gestaoRiscos.status}
          icon={PieChart}
          onClickUrl="/manager/risks"
        />
        <MetricCard
          title="Auditorias"
          status={`${metrics.auditorias.count} ABERTAS`}
          icon={FileCheck}
          onClickUrl="/manager/audits"
        />
        <MetricCard
          title="Mediação de Conflitos"
          status={`${metrics.mediacoes.count} CASOS`}
          icon={Scale}
          onClickUrl="/manager/mediations"
        />

        <MetricCard
          title="Due Diligence"
          status={
            metrics.dueDiligence.count > 0
              ? `ANÁLISE ${metrics.dueDiligence.count}º`
              : 'SEM REGISTROS'
          }
          icon={SearchCheck}
          onClickUrl="/senior/due-diligence"
        />
        <MetricCard
          title="Decisões Disciplinares"
          status={`${metrics.decisoesDisciplinares.count} REGISTROS`}
          icon={Gavel}
          onClickUrl="/senior/decisions"
        />
        <MetricCard
          title="Relatórios IA"
          status={metrics.relatoriosIA.status}
          icon={BrainCircuit}
          onClickUrl="/senior/ai-reports"
        />
        <MetricCard
          title="Visão Consolidada"
          status={
            metrics.visaoConsolidada.status === 'DISPONÍVEL'
              ? 'GERAL'
              : 'INDISPONÍVEL'
          }
          icon={Building2}
          onClickUrl="/senior/consolidated"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Evolução do Score de Integridade
            </CardTitle>
            <CardDescription>
              Acompanhamento mensal do índice de conformidade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData?.integrityScore}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    tickMargin={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      fill: '#3b82f6',
                      strokeWidth: 2,
                      stroke: '#fff',
                    }}
                    activeDot={{ r: 6 }}
                    name="Índice de Compliance"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Ocorrências vs Auditorias
            </CardTitle>
            <CardDescription>Comparativo de volume mensal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData?.occurrencesVsAudits}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    tickMargin={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                  <Line
                    type="monotone"
                    dataKey="denuncias"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="Denúncias"
                  />
                  <Line
                    type="monotone"
                    dataKey="auditorias"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="Auditorias"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
