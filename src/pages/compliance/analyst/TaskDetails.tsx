import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Loader2,
  ArrowLeft,
  Calendar,
  CheckCircle,
  FileText,
  Shield,
  Upload,
} from 'lucide-react'
import { toast } from 'sonner'
import { complianceService, ComplianceTask } from '@/services/complianceService'
import { adminService } from '@/services/adminService'
import { format } from 'date-fns'

export default function TaskDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [task, setTask] = useState<ComplianceTask | null>(null)
  const [loading, setLoading] = useState(true)
  const [documents, setDocuments] = useState<{
    code?: any
    commitment?: any
  }>({})
  const [reportFile, setReportFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (id) fetchTask()
  }, [id])

  const fetchTask = async () => {
    setLoading(true)
    try {
      const data = await complianceService.getTask(id!)
      setTask(data)

      if (data.institutional_docs_auth && data.escola_id) {
        // Fetch docs if authorized
        try {
          const [code, commitment] = await Promise.all([
            adminService.getCodeOfConduct(data.escola_id),
            adminService.getCommitment(data.escola_id),
          ])
          setDocuments({ code, commitment })
        } catch (e) {
          console.error('Failed to fetch docs', e)
        }
      }
    } catch (error) {
      console.error(error)
      toast.error('Erro ao carregar tarefa')
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteTask = async () => {
    if (!task) return
    try {
      await complianceService.updateTaskStatus(task.id, 'concluido')
      toast.success('Tarefa marcada como concluída')
      setTask({ ...task, status: 'concluido' })
    } catch (error) {
      toast.error('Erro ao atualizar status')
    }
  }

  const handleUploadReport = async () => {
    if (!task?.escola_id || !reportFile) return
    setUploading(true)
    try {
      await complianceService.uploadConsolidatedReport(
        task.escola_id,
        reportFile,
        new Date().getFullYear(),
      )
      toast.success('Relatório consolidado enviado com sucesso')
      setReportFile(null)
      // Optionally auto-complete task
      if (task.status !== 'concluido') {
        await handleCompleteTask()
      }
    } catch (error) {
      console.error(error)
      toast.error('Erro ao enviar relatório')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  if (!task) return null

  return (
    <div className="space-y-6 p-6 animate-fade-in pb-20">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/compliance/analyst/dashboard')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Detalhes da Tarefa</h1>
          <p className="text-muted-foreground">
            {task.escolas_instituicoes?.nome_escola}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge
            variant="outline"
            className="capitalize text-lg px-4 py-1 bg-background"
          >
            {task.tipo_modulo.replace('_', ' ')}
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Task Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Escopo de Trabalho</CardTitle>
            <CardDescription>
              Instruções e objetivos designados pela diretoria.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/30 p-4 rounded-lg border">
              <p className="whitespace-pre-wrap leading-relaxed">
                {task.descricao}
              </p>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  Prazo:{' '}
                  {task.prazo
                    ? format(new Date(task.prazo), 'dd/MM/yyyy')
                    : 'Sem prazo'}
                </span>
              </div>
            </div>

            {/* Consolidation Flow */}
            {task.tipo_modulo === 'consolidacao' && (
              <div className="mt-6 border-t pt-6">
                <h3 className="text-lg font-semibold mb-2">
                  Relatório Consolidado
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Faça o upload do relatório final consolidado para aprovação da
                  diretoria.
                </p>
                <div className="flex items-end gap-4">
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="report">Arquivo PDF</Label>
                    <Input
                      id="report"
                      type="file"
                      accept="application/pdf"
                      onChange={(e) =>
                        setReportFile(e.target.files?.[0] || null)
                      }
                    />
                  </div>
                  <Button
                    onClick={handleUploadReport}
                    disabled={!reportFile || uploading}
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Enviar Relatório
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-end border-t pt-6">
            {task.status !== 'concluido' ? (
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={handleCompleteTask}
              >
                <CheckCircle className="h-4 w-4 mr-2" /> Marcar como Concluída
              </Button>
            ) : (
              <Button variant="outline" disabled>
                <CheckCircle className="h-4 w-4 mr-2" /> Tarefa Concluída
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Sidebar Resources */}
        <div className="space-y-6">
          {task.institutional_docs_auth && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Documentos da Escola
                </CardTitle>
                <CardDescription>Acesso autorizado.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-muted/20 rounded-md border">
                  <FileText className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Código de Conduta</p>
                    {documents.code ? (
                      <a
                        href={documents.code.arquivo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Visualizar PDF
                      </a>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Não disponível
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-muted/20 rounded-md border">
                  <Shield className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Compromisso Gestão</p>
                    {documents.commitment ? (
                      <a
                        href={documents.commitment.arquivo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Visualizar PDF
                      </a>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Não disponível
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Permissões</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {task.institutional_docs_auth && (
                  <Badge variant="secondary" className="w-full justify-start">
                    <CheckCircle className="h-3 w-3 mr-2 text-green-600" />
                    Docs Institucionais
                  </Badge>
                )}
                {task.gestor_escolar_id && (
                  <Badge variant="secondary" className="w-full justify-start">
                    <CheckCircle className="h-3 w-3 mr-2 text-green-600" />
                    Colaboração com Gestor
                  </Badge>
                )}
                {!task.institutional_docs_auth && !task.gestor_escolar_id && (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma permissão especial.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
