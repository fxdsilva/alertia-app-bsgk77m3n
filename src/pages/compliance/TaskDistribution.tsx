import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Calendar,
  Briefcase,
  User,
  Shield,
  Loader2,
  Lock,
} from 'lucide-react'
import { complianceService, ComplianceTask } from '@/services/complianceService'
import { TaskAssignmentDialog } from '@/components/compliance/TaskAssignmentDialog'
import { format } from 'date-fns'

export default function TaskDistribution() {
  const [tasks, setTasks] = useState<ComplianceTask[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const data = await complianceService.getTasks()
      setTasks(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Distribuição de Tarefas
          </h1>
          <p className="text-muted-foreground">
            Gestão de atribuições e permissões de acesso
          </p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="gap-2 shadow-ios bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
        >
          <Plus className="h-4 w-4" /> Nova Atribuição
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
        </div>
      ) : tasks.length === 0 ? (
        <Card className="border-dashed border-2 bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Briefcase className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
            <p className="text-lg font-medium text-foreground">
              Nenhuma tarefa atribuída
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Comece criando uma nova atribuição para seus analistas.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <Card
              key={task.id}
              className="border-none shadow-ios hover:shadow-ios-deep transition-all duration-300 group overflow-hidden flex flex-col"
            >
              <CardHeader className="bg-muted/5 border-b border-border/40 pb-4">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="bg-white">
                    {task.tipo_modulo.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <Badge
                    className={
                      task.status === 'concluido'
                        ? 'bg-green-500'
                        : task.status === 'pendente'
                          ? 'bg-yellow-500'
                          : 'bg-blue-500'
                    }
                  >
                    {task.status.replace('_', ' ')}
                  </Badge>
                </div>
                <CardTitle className="text-base font-semibold line-clamp-1">
                  {task.escolas_instituicoes?.nome_escola || 'Escola N/A'}
                </CardTitle>
                <CardDescription className="flex items-center gap-1 text-xs">
                  <Calendar className="h-3 w-3" />
                  Prazo:{' '}
                  {task.prazo
                    ? format(new Date(task.prazo), 'dd/MM/yyyy')
                    : 'Sem prazo'}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-4 flex-1 flex flex-col gap-4">
                <p className="text-sm text-muted-foreground line-clamp-3 min-h-[3rem]">
                  {task.descricao}
                </p>

                <div className="mt-auto space-y-3 pt-2 border-t border-border/40">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <User className="h-4 w-4 text-purple-600" />
                    <span>
                      Analista: {task.analista?.nome_usuario || 'N/A'}
                    </span>
                  </div>

                  {/* Permissions Badges */}
                  <div className="flex flex-wrap gap-2">
                    {task.institutional_docs_auth && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] bg-purple-50 text-purple-700 border-purple-200 gap-1"
                      >
                        <Shield className="h-3 w-3" /> Docs Institucionais
                      </Badge>
                    )}
                    {task.gestor_escolar_id && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] bg-orange-50 text-orange-700 border-orange-200 gap-1"
                      >
                        <Lock className="h-3 w-3" /> Gestor Liberado
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <TaskAssignmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onTaskCreated={fetchTasks}
      />
    </div>
  )
}
