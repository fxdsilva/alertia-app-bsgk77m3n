import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ClipboardList,
  UserCog,
  Loader2,
  Activity,
  AlertTriangle,
  FileCheck,
  ShieldAlert,
  GitPullRequest,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { complianceService } from '@/services/complianceService'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function DirectorDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingTasks: 0,
    completedTasks: 0,
    activeComplaints: 0,
    unassignedComplaints: 0,
  })
  const [recentAudits, setRecentAudits] = useState<any[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const [tasks, activeComplaintsCount, unassignedCount, audits] =
        await Promise.all([
          complianceService.getTasks(),
          complianceService.getActiveComplaintsCount(),
          complianceService.getUnassignedComplaintsCount(),
          complianceService.getRecentAudits(),
        ])

      setStats({
        totalTasks: tasks.length,
        pendingTasks: tasks.filter((t) => t.status === 'pendente').length,
        completedTasks: tasks.filter((t) => t.status === 'concluido').length,
        activeComplaints: activeComplaintsCount,
        unassignedComplaints: unassignedCount,
      })
      setRecentAudits(audits || [])
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Workflow Card - NEW */}
        <Card
          className="cursor-pointer hover:shadow-md transition-all group border-l-4 border-l-teal-500 bg-teal-50/20"
          onClick={() => navigate('/compliance/director/workflow')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Gestão de Workflow
            </CardTitle>
            <GitPullRequest className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-700">Fila</div>
            <p className="text-xs text-muted-foreground mt-1">
              Feedback de Analistas
            </p>
            <div className="mt-4 flex items-center text-sm text-teal-600 font-medium group-hover:translate-x-1 transition-transform">
              Aprovar Fases &rarr;
            </div>
          </CardContent>
        </Card>

        {/* Unassigned Complaints Card (Triage) */}
        <Card
          className="cursor-pointer hover:shadow-md transition-all group border-l-4 border-l-red-500"
          onClick={() => navigate('/compliance/director/complaints')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Triagem de Denúncias
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">
              {stats.unassignedComplaints}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Não atribuídas</p>
            <div className="mt-4 flex items-center text-sm text-red-600 font-medium group-hover:translate-x-1 transition-transform">
              Realizar Triagem &rarr;
            </div>
          </CardContent>
        </Card>

        {/* Analysts Card */}
        <Card
          className="cursor-pointer hover:shadow-md transition-all group border-l-4 border-l-blue-500"
          onClick={() => navigate('/compliance/director/analysts')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analistas</CardTitle>
            <UserCog className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Equipe</div>
            <p className="text-xs text-muted-foreground mt-1">
              Gestão de acessos
            </p>
            <div className="mt-4 flex items-center text-sm text-blue-600 font-medium group-hover:translate-x-1 transition-transform">
              Ver Equipe &rarr;
            </div>
          </CardContent>
        </Card>

        {/* Efficiency Card */}
        <Card className="bg-slate-50 border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-900">
              Taxa de Resolução
            </CardTitle>
            <Activity className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-700">
              {stats.totalTasks > 0
                ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-slate-600/80 mt-1">Eficiência geral</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Audits Table */}
        <Card className="col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Últimas Auditorias</CardTitle>
              <CardDescription>
                Monitoramento recente de conformidade institucional.
              </CardDescription>
            </div>
            <FileCheck className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {recentAudits.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShieldAlert className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p>Nenhuma auditoria recente encontrada.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Instituição</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Pendências</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentAudits.map((audit) => (
                    <TableRow key={audit.id}>
                      <TableCell className="font-medium">
                        {format(new Date(audit.data_auditoria), 'dd/MM/yyyy', {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell>
                        {audit.escolas_instituicoes?.nome_escola || 'N/A'}
                      </TableCell>
                      <TableCell>{audit.tipo}</TableCell>
                      <TableCell>{audit.responsavel}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            audit.status_auditoria?.nome_status === 'Concluída'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          }
                        >
                          {audit.status_auditoria?.nome_status || audit.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {audit.pendencias > 0 ? (
                          <span className="text-red-600 font-bold">
                            {audit.pendencias}
                          </span>
                        ) : (
                          <span className="text-green-600 font-medium">OK</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
