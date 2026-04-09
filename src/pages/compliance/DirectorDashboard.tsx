import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  UserCog,
  Loader2,
  Activity,
  AlertTriangle,
  FileCheck,
  ShieldAlert,
  Search,
  Archive,
  Inbox,
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
import { AuditDetailsSheet } from '@/components/audit/AuditDetailsSheet'

export default function DirectorDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    workflowTasks: 0,
    unassigned: 0,
    inAnalysis: 0,
    archived: 0,
    resolutionRate: 0,
  })
  const [recentAudits, setRecentAudits] = useState<any[]>([])
  const [selectedAudit, setSelectedAudit] = useState<any>(null)
  const [isAuditSheetOpen, setIsAuditSheetOpen] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const [tasks, summary, audits] = await Promise.all([
        complianceService.getTasks(),
        complianceService.getComplaintsSummary(),
        complianceService.getRecentAudits(),
      ])
      const totalComplaints = summary.active + summary.archived
      setStats({
        workflowTasks: tasks.filter((t) => t.status === 'pendente').length,
        unassigned: summary.unassigned,
        inAnalysis: summary.inAnalysis,
        archived: summary.archived,
        resolutionRate:
          totalComplaints > 0
            ? Math.round((summary.archived / totalComplaints) * 100)
            : 0,
      })
      setRecentAudits(audits || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading)
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )

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
          className="cursor-pointer hover:shadow-md transition-all group border-l-4 border-l-teal-500 bg-teal-50/10"
          onClick={() => navigate('/compliance/director/workflow')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Fila de Denúncias
            </CardTitle>
            <Inbox className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-700">
              {stats.workflowTasks > 0 ? stats.workflowTasks : 'Fila'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Feedback e aprovações
            </p>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer hover:shadow-md transition-all group border-l-4 border-l-red-500"
          onClick={() => navigate('/compliance/director/complaints')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Triagem</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">
              {stats.unassigned}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Não atribuídas</p>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer hover:shadow-md transition-all group border-l-4 border-l-amber-500"
          onClick={() => navigate('/compliance/director/workflow')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Análise</CardTitle>
            <Search className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">
              {stats.inAnalysis}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Com analistas</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-50 border-slate-200 border-l-4 border-l-slate-400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">
              Casos Encerrados
            </CardTitle>
            <Archive className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-700">
              {stats.archived}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Arquivados ou resolvidos
            </p>
          </CardContent>
        </Card>
        <Card className="bg-indigo-50/50 border-indigo-100 border-l-4 border-l-indigo-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-indigo-900">
              Taxa de Resolução
            </CardTitle>
            <Activity className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-700">
              {stats.resolutionRate}%
            </div>
            <p className="text-xs text-indigo-600/80 mt-1">Eficiência geral</p>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer hover:shadow-md transition-all group border-l-4 border-l-blue-500"
          onClick={() => navigate('/compliance/director/analysts')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analistas</CardTitle>
            <UserCog className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">Equipe</div>
            <p className="text-xs text-muted-foreground mt-1">
              Gestão de acessos
            </p>
          </CardContent>
        </Card>
      </div>
      <Card>
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
                {recentAudits.map((a) => (
                  <TableRow
                    key={a.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      setSelectedAudit(a)
                      setIsAuditSheetOpen(true)
                    }}
                  >
                    <TableCell className="font-medium">
                      {format(new Date(a.data_auditoria), 'dd/MM/yyyy', {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell>
                      {a.escolas_instituicoes?.nome_escola || 'N/A'}
                    </TableCell>
                    <TableCell>{a.tipo}</TableCell>
                    <TableCell>{a.responsavel}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          a.status_auditoria?.nome_status === 'Concluída'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }
                      >
                        {a.status_auditoria?.nome_status || a.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {a.pendencias > 0 ? (
                        <span className="text-red-600 font-bold">
                          {a.pendencias}
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
      <AuditDetailsSheet
        open={isAuditSheetOpen}
        onOpenChange={setIsAuditSheetOpen}
        audit={selectedAudit}
      />
    </div>
  )
}
