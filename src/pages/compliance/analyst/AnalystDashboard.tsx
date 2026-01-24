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
  Loader2,
} from 'lucide-react'
import { complianceService } from '@/services/complianceService'
import useAppStore from '@/stores/useAppStore'
import { format } from 'date-fns'

export default function AnalystDashboard() {
  const { user } = useAppStore()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<any[]>([])
  const [investigations, setInvestigations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) fetchData()
  }, [user])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [tasksData, invData] = await Promise.all([
        complianceService.getAnalystTasks(user!.id),
        complianceService.getAnalystInvestigations(user!.id),
      ])
      setTasks(tasksData)
      setInvestigations(invData)
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

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="tasks">Tarefas e Controles</TabsTrigger>
          <TabsTrigger value="investigations">Investigações</TabsTrigger>
        </TabsList>

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

        <TabsContent value="investigations" className="mt-6 space-y-4">
          <div className="grid gap-4">
            {investigations.map((inv) => (
              <Card
                key={inv.id}
                className="hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() =>
                  navigate(`/compliance/analyst/investigation/${inv.id}`)
                }
              >
                <div className="flex flex-col md:flex-row items-start md:items-center p-6 gap-4">
                  <div className="bg-red-100 p-3 rounded-full">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">
                        Protocolo: {inv.denuncias?.protocolo}
                      </h3>
                      <Badge variant="outline">
                        {inv.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Escola: {inv.escolas_instituicoes?.nome_escola}
                    </p>
                    <p className="text-sm">
                      {inv.denuncias?.descricao.substring(0, 100)}...
                    </p>
                  </div>
                  <Button variant="ghost" size="icon">
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </Card>
            ))}
            {investigations.length === 0 && (
              <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                <AlertTriangle className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>Nenhuma investigação em andamento.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
