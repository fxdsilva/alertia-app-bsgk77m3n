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
  Briefcase,
  Calendar,
  ChevronRight,
  FileCheck,
  GitPullRequest,
  Loader2,
} from 'lucide-react'
import { complianceService } from '@/services/complianceService'
import { workflowService, WorkflowComplaint } from '@/services/workflowService'
import useAppStore from '@/stores/useAppStore'
import { format } from 'date-fns'

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
      const [tasksData, wfData] = await Promise.all([
        complianceService.getAnalystTasks(user!.id),
        workflowService.getAnalystActiveComplaints(user!.id),
      ])
      setTasks(tasksData)
      setWorkflowTasks(wfData)
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
    <div className="space-y-8 p-6 animate-fade-in pb-20">
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
                  className="cursor-pointer hover:border-primary transition-colors hover:shadow-sm"
                  onClick={() =>
                    navigate(`/compliance/analyst/workflow/${w.id}`)
                  }
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base font-medium">
                          {w.protocolo}
                        </CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {w.escolas_instituicoes?.nome_escola || 'Escola N/A'}
                        </Badge>
                      </div>
                      <CardDescription>
                        {format(new Date(w.created_at), 'dd/MM/yyyy')}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      {w.status.replace(/_/g, ' ')}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {w.descricao}
                    </p>
                    <div className="mt-4 flex items-center justify-end">
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
              <Card
                key={task.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/compliance/analyst/task/${task.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="capitalize">
                      {task.tipo_modulo?.replace('_', ' ')}
                    </Badge>
                    <Badge
                      className={
                        task.status === 'concluido'
                          ? 'bg-green-500'
                          : 'bg-blue-500'
                      }
                    >
                      {task.status?.replace('_', ' ')}
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
                  <Button variant="outline" className="w-full gap-2">
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
