import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertTriangle,
  Briefcase,
  Calendar,
  ChevronRight,
  FileCheck,
  GitPullRequest,
  Loader2,
} from 'lucide-react'
import { complianceService } from '@/services/complianceService'
import { supabase } from '@/lib/supabase/client'
import useAppStore from '@/stores/useAppStore'
import { format } from 'date-fns'
import { WorkflowComplaint, WORKFLOW_STATUS } from '@/services/workflowService'

export default function AnalystDashboard() {
  const { user } = useAppStore()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<any[]>([])
  const [workflowTasks, setWorkflowTasks] = useState<WorkflowComplaint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) fetchData()
  }, [user])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [tasksData] = await Promise.all([
        complianceService.getAnalystTasks(user!.id),
      ])
      setTasks(tasksData)

      // Fetch Workflow Tasks assigned to this analyst
      const { data: wfData } = await supabase
        .from('denuncias')
        .select('*, escolas_instituicoes(nome_escola)')
        .or(
          `analista_1_id.eq.${user!.id},analista_2_id.eq.${user!.id},analista_3_id.eq.${user!.id}`,
        )
        .not(
          'status',
          'in',
          `("${WORKFLOW_STATUS.CLOSED}","${WORKFLOW_STATUS.ARCHIVED}")`,
        )

      // Filter strictly by active status for the specific analyst phase
      const activeWf = (wfData || []).filter((w: any) => {
        if (
          w.analista_1_id === user!.id &&
          (w.status === WORKFLOW_STATUS.ANALYSIS_1 ||
            w.status === WORKFLOW_STATUS.RETURNED_1)
        )
          return true
        if (
          w.analista_2_id === user!.id &&
          w.status === WORKFLOW_STATUS.INVESTIGATION_2
        )
          return true
        if (
          w.analista_3_id === user!.id &&
          (w.status === WORKFLOW_STATUS.MEDIATION_3 ||
            w.status === WORKFLOW_STATUS.DISCIPLINARY_3)
        )
          return true
        return false
      })

      setWorkflowTasks(activeWf)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Meu Workspace</h1>
        <p className="text-muted-foreground">
          Gestão de tarefas designadas e investigações em andamento.
        </p>
      </div>

      <Tabs defaultValue="workflow" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="workflow">Workflow de Denúncias</TabsTrigger>
          <TabsTrigger value="tasks">Tarefas Gerais</TabsTrigger>
        </TabsList>

        <TabsContent value="workflow" className="mt-6 space-y-4">
          {workflowTasks.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
              <GitPullRequest className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>Nenhuma etapa de workflow pendente.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {workflowTasks.map((w) => (
                <Card
                  key={w.id}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() =>
                    navigate(`/compliance/analyst/workflow/${w.id}`)
                  }
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-base font-medium">
                      {w.protocolo}
                    </CardTitle>
                    <Badge variant="secondary">{w.status}</Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {w.descricao}
                    </p>
                    <div className="mt-3 flex items-center justify-end">
                      <Button size="sm" className="gap-2">
                        Abrir Tarefa <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tasks" className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <Card key={task.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="capitalize">
                      {task.tipo_modulo.replace('_', ' ')}
                    </Badge>
                    <Badge
                      className={
                        task.status === 'concluido'
                          ? 'bg-green-500'
                          : 'bg-blue-500'
                      }
                    >
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <CardTitle className="text-base line-clamp-1">
                    {task.escolas_instituicoes?.nome_escola}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1 text-xs">
                    <Calendar className="h-3 w-3" />
                    Prazo:{' '}
                    {task.prazo
                      ? format(new Date(task.prazo), 'dd/MM/yyyy')
                      : 'N/A'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {task.descricao}
                  </p>
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() =>
                      navigate(`/compliance/analyst/task/${task.id}`)
                    }
                  >
                    <Briefcase className="h-4 w-4" /> Detalhes
                  </Button>
                </CardContent>
              </Card>
            ))}
            {tasks.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                <FileCheck className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>Nenhuma tarefa atribuída no momento.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
