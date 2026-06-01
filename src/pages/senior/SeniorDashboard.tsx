import { useState, useEffect } from 'react'
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
  Activity,
  ArrowRight,
  PlayCircle,
  Globe,
  LayoutDashboard,
} from 'lucide-react'
import { adminDashboardService } from '@/services/adminDashboardService'
import { useToast } from '@/hooks/use-toast'

export default function SeniorDashboard() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [metrics, setMetrics] = useState({
    schools: 0,
    users: 0,
    activeAlerts: 0,
    resolutionRate: 0,
    resolutionRateChange: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const data = await adminDashboardService.getKPIs()
        setMetrics(data)
      } catch (error: any) {
        toast({
          title: 'Erro',
          description: 'Erro ao carregar dados do dashboard.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [toast])

  return (
    <div className="flex flex-col gap-6 p-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard Global
          </h1>
          <p className="text-muted-foreground mt-1">
            Visão geral de toda a rede de instituições.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => navigate('/trainings')}
          >
            <PlayCircle className="h-4 w-4" /> Acessar treinamentos
          </Button>
          <Button
            className="gap-2 bg-emerald-700 hover:bg-emerald-800 text-white"
            onClick={() => navigate('/public/portal')}
          >
            <Globe className="h-4 w-4" /> Abrir Portal
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="flex flex-col shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Escolas
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <div>
              <div className="text-3xl font-bold">
                {loading ? '-' : metrics.schools}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Instituições monitoradas
              </p>
            </div>
            <Button
              variant="ghost"
              className="w-full mt-4 justify-between"
              onClick={() => navigate('/senior/schools')}
            >
              Ver Escolas <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Usuários Ativos
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <div>
              <div className="text-3xl font-bold">
                {loading ? '-' : metrics.users}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Gestores e colaboradores
              </p>
            </div>
            <Button
              variant="ghost"
              className="w-full mt-4 justify-between"
              onClick={() => navigate('/senior/users')}
            >
              Gerenciar Usuários <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col border-red-200 bg-red-50/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-800">
              Alertas Críticos
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <div>
              <div className="text-3xl font-bold text-red-600">
                {loading ? '-' : metrics.activeAlerts}
              </div>
              <p className="text-xs text-red-600/80 mt-1">
                Requerem atenção imediata
              </p>
            </div>
            <Button
              variant="ghost"
              className="w-full mt-4 justify-between text-red-700 hover:text-red-800 hover:bg-red-100"
              onClick={() => navigate('/senior/workflow')}
            >
              Ver Lista de Alertas <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taxa de Resolução
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <div>
              <div className="text-3xl font-bold">
                {loading ? '-' : `${metrics.resolutionRate}%`}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.resolutionRateChange >= 0 ? '+' : ''}
                {loading ? '0' : metrics.resolutionRateChange}% em relação ao
                mês anterior
              </p>
            </div>
            <Button
              variant="ghost"
              className="w-full mt-4 justify-between"
              onClick={() => navigate('/senior/consolidated')}
            >
              Ver Detalhes do Cálculo <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Módulos de Gestão</CardTitle>
            <CardDescription>
              Acesse rapidamente as ferramentas do sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-slate-50"
              onClick={() => navigate('/senior/consolidated')}
            >
              <LayoutDashboard className="h-6 w-6 text-slate-600" />
              <span className="text-slate-700 font-medium">
                Dados Consolidados
              </span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-slate-50"
              onClick={() => navigate('/senior/due-diligence')}
            >
              <Activity className="h-6 w-6 text-slate-600" />
              <span className="text-slate-700 font-medium">Due Diligence</span>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Painel de Risco</CardTitle>
            <CardDescription>
              Acompanhe a evolução do risco nas instituições.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-40 flex items-center justify-center bg-slate-50 rounded-md border border-dashed border-slate-300">
            <span className="text-muted-foreground flex items-center gap-2">
              <Activity className="h-5 w-5" /> Os dados de risco detalhados
              estarão disponíveis em breve.
            </span>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
