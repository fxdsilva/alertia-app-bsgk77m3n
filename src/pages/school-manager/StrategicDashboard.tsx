import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAppStore from '@/stores/useAppStore'
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
  LayoutGrid,
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
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'
import { schoolDashboardService, DashboardMetrics, ChartData } from '@/services/schoolDashboardService'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function StrategicDashboard() {
  const { user, selectedSchool, profile, loading: appLoading } = useAppStore()
  const navigate = useNavigate()
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!appLoading && profile !== 'gestao_escola') {
      navigate('/')
      return
    }
    
    if (selectedSchool) {
      loadDashboardData()
    }
  }, [selectedSchool, profile, appLoading, navigate])

  const loadDashboardData = async () => {
    if (!selectedSchool) return
    setLoading(true)
    try {
      const [metricsData, charts] = await Promise.all([
        schoolDashboardService.getMetrics(selectedSchool.id),
        schoolDashboardService.getChartData(selectedSchool.id)
      ])
      setMetrics(metricsData)
      setChartData(charts)
    } catch (error) {
      toast.error('Erro ao carregar dados do dashboard')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || appLoading || !metrics) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    )
  }

  const MetricCard = ({
    title,
    status,
    icon: Icon,
    color = 'slate',
    onClick,
    subtext,
    indicator
  }: {
    title: string
    status: string
    icon: any
    color?: 'slate' | 'indigo' | 'emerald' | 'amber' | 'rose'
    onClick?: () => void
    subtext?: string
    indicator?: 'success' | 'warning' | 'error' | 'neutral'
  }) => {
    const colorClasses = {
      slate: 'text-slate-600 bg-slate-100',
      indigo: 'text-indigo-600 bg-indigo-100',
      emerald: 'text-emerald-600 bg-emerald-100',
      amber: 'text-amber-600 bg-amber-100',
      rose: 'text-rose-600 bg-rose-100',
    }

    const indicatorIcons = {
      success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
      warning: <AlertCircle className="h-5 w-5 text-amber-500" />,
      error: <AlertTriangle className="h-5 w-5 text-rose-500" />,
      neutral: <Clock className="h-5 w-5 text-slate-400" />,
    }

    return (
      <Card 
        className={cn(
          "relative overflow-hidden cursor-pointer hover:shadow-md transition-all duration-300 border-l-4",
          indicator === 'success' ? 'border-l-emerald-500' : 
          indicator === 'warning' ? 'border-l-amber-500' :
          indicator === 'error' ? 'border-l-rose-500' : 'border-l-slate-300'
        )}
        onClick={onClick}
      >
        <CardContent className="p-5">
          <div className="flex justify-between items-start mb-4">
            <div className={cn("p-2.5 rounded-xl", colorClasses[color])}>
              <Icon className="h-6 w-6" />
            </div>
            {indicator && indicatorIcons[indicator]}
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 text-base">{title}</h3>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              {status}
            </p>
            {subtext && <p className="text-xs text-slate-400">{subtext}</p>}
          </div>
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight className="h-5 w-5 text-slate-400" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <LayoutGrid className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Gestão Estratégica</h1>
          </div>
          <p className="text-slate-500 ml-1">
            Monitoramento de conformidade: <span className="font-semibold text-indigo-700">{selectedSchool?.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select defaultValue="all">
            <SelectTrigger className="w-[160px] bg-white">
              <Calendar className="h-4 w-4 mr-2 text-slate-500" />
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo o Período</SelectItem>
              <SelectItem value="year">Este Ano</SelectItem>
              <SelectItem value="month">Este Mês</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2 bg-white hover:bg-slate-50 text-slate-700 border-slate-200">
            <Download className="h-4 w-4" /> Exportar
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        <MetricCard
          title="Código de Conduta"
          status={metrics.codigoConduta.status.toUpperCase()}
          icon={FileText}
          color="rose"
          indicator={metrics.codigoConduta.status === 'Concluído' ? 'success' : 'error'}
          onClick={() => navigate('/admin/code-of-conduct')}
        />
        <MetricCard
          title="Compromisso da Gestão"
          status={metrics.compromissoGestao.status.toUpperCase()}
          icon={Shield}
          color="amber"
          indicator={metrics.compromissoGestao.status === 'Concluído' ? 'success' : 'warning'}
          onClick={() => navigate('/admin/commitment')}
        />
        <MetricCard
          title="Denúncias"
          status={`${metrics.denuncias.total} TOTAL`}
          subtext={`${metrics.denuncias.active} ativas`}
          icon={AlertTriangle}
          color="emerald"
          indicator={metrics.denuncias.active > 0 ? 'warning' : 'success'}
          onClick={() => navigate('/school-admin/complaints')}
        />
        <MetricCard
          title="Relatórios"
          status={metrics.relatorios.available ? 'DISPONÍVEL' : 'INDISPONÍVEL'}
          icon={BarChart3}
          color="emerald"
          indicator={metrics.relatorios.available ? 'success' : 'neutral'}
          onClick={() => navigate('/admin/reports')}
        />
        <MetricCard
          title="Treinamentos"
          status={`${metrics.treinamentos.active} ATIVOS`}
          icon={GraduationCap}
          color="emerald"
          indicator="success"
          onClick={() => navigate('/collaborator/training')}
        />
        <MetricCard
          title="Gestão de Riscos"
          status={metrics.riscos.level.toUpperCase()}
          icon={PieChart}
          color="emerald"
          indicator={metrics.riscos.level === 'Crítico' ? 'error' : metrics.riscos.level === 'Alto' ? 'warning' : 'success'}
          onClick={() => navigate('/manager/risks')}
        />
        <MetricCard
          title="Auditorias"
          status={`${metrics.auditorias.open} ABERTAS`}
          icon={FileCheck}
          color="emerald"
          indicator={metrics.auditorias.open > 0 ? 'warning' : 'success'}
          onClick={() => navigate('/manager/audits')}
        />
        <MetricCard
          title="Mediação de Conflitos"
          status={`${metrics.mediacoes.count} CASOS`}
          icon={Scale}
          color="emerald"
          indicator="success"
          onClick={() => navigate('/manager/mediations')}
        />
        <MetricCard
          title="Due Diligence"
          status={metrics.dueDiligence.status.toUpperCase()}
          icon={SearchCheck}
          color="emerald"
          indicator={metrics.dueDiligence.status === 'Concluído' ? 'success' : 'neutral'}
          onClick={() => navigate('/senior/due-diligence')}
        />
        <MetricCard
          title="Decisões Disciplinares"
          status={`${metrics.decisoes.count} REGISTROS`}
          icon={Gavel}
          color="emerald"
          indicator="success"
          onClick={() => navigate('/senior/decisions')}
        />
        <MetricCard
          title="Relatórios IA"
          status={metrics.relatoriosIA.available ? 'DISPONÍVEL' : 'INDISPONÍVEL'}
          icon={BrainCircuit}
          color="amber"
          indicator={metrics.relatoriosIA.available ? 'warning' : 'neutral'}
          onClick={() => navigate('/senior/ai-reports')}
        />
        <MetricCard
          title="Visão Consolidada"
          status={metrics.visaoConsolidada.status.toUpperCase()}
          icon={Building2}
          color="emerald"
          indicator="success"
          onClick={() => navigate('/senior/consolidated')}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm border-slate-100">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800">Evolução do Score de Integridade</CardTitle>
            <CardDescription>Monitoramento mensal do índice de conformidade</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#4f46e5" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} 
                    activeDot={{ r: 6 }} 
                    name="Índice de Compliance"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-100">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800">Ocorrências vs Auditorias</CardTitle>
            <CardDescription>Comparativo de volume mensal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <defs>
                    <linearGradient id="colorDenuncias" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorAuditorias" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="denuncias" 
                    stroke="#f97316" 
                    fillOpacity={1} 
                    fill="url(#colorDenuncias)" 
                    name="Denúncias"
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="auditorias" 
                    stroke="#10b981" 
                    fillOpacity={1} 
                    fill="url(#colorAuditorias)" 
                    name="Auditorias"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
