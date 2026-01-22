import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ClipboardList,
  UserCog,
  Loader2,
  TrendingUp,
  Activity,
  AlertCircle,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { complianceService } from '@/services/complianceService'

export default function DirectorDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingTasks: 0,
    completedTasks: 0,
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const tasks = await complianceService.getTasks()
      setStats({
        totalTasks: tasks.length,
        pendingTasks: tasks.filter((t) => t.status === 'pendente').length,
        completedTasks: tasks.filter((t) => t.status === 'concluido').length,
      })
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Diretoria de Compliance
        </h1>
        <p className="text-muted-foreground text-lg">
          Visão geral e gestão estratégica
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card
          className="cursor-pointer hover:shadow-ios-deep transition-all group"
          onClick={() => navigate('/compliance/director/tasks')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tarefas Atribuídas
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.pendingTasks} pendentes
            </p>
            <div className="mt-4 flex items-center text-sm text-purple-600 font-medium group-hover:translate-x-1 transition-transform">
              Gerenciar Distribuição &rarr;
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-ios-deep transition-all group"
          onClick={() => navigate('/compliance/director/analysts')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analistas</CardTitle>
            <UserCog className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Gestão</div>
            <p className="text-xs text-muted-foreground mt-1">Equipe técnica</p>
            <div className="mt-4 flex items-center text-sm text-blue-600 font-medium group-hover:translate-x-1 transition-transform">
              Ver Equipe &rarr;
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">
              Taxa de Conclusão
            </CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">
              {stats.totalTasks > 0
                ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-purple-600/80 mt-1">
              Eficiência da equipe
            </p>
          </CardContent>
        </Card>
      </div>

      {stats.pendingTasks > 0 && (
        <div className="rounded-xl bg-orange-50 border border-orange-100 p-4 flex items-center gap-4">
          <div className="p-2 bg-orange-100 rounded-lg">
            <AlertCircle className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold text-orange-900">
              Atenção Necessária
            </h3>
            <p className="text-sm text-orange-800">
              Existem {stats.pendingTasks} tarefas pendentes que podem precisar
              de revisão ou reatribuição.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="ml-auto bg-white border-orange-200 text-orange-700 hover:bg-orange-50"
            onClick={() => navigate('/compliance/director/tasks')}
          >
            Ver Pendências
          </Button>
        </div>
      )}
    </div>
  )
}
