import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  workflowService,
  WorkflowComplaint,
  WORKFLOW_STATUS,
} from '@/services/workflowService'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { ArrowLeft, CheckCircle2, Lock, History } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function WorkflowDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [complaint, setComplaint] = useState<WorkflowComplaint | null>(null)
  const [submissions, setSubmissions] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [comments, setComments] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)

  const fetchAll = async () => {
    try {
      setLoading(true)
      if (!id) return
      const [compData, subsData, logsData] = await Promise.all([
        workflowService.getComplaintDetails(id),
        workflowService.getAllSubmissions(id),
        workflowService.getWorkflowLogs(id),
      ])
      setComplaint(compData)
      setSubmissions(subsData || [])
      setLogs(logsData || [])
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar dados',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [id])

  const isPhaseCompleted = (phase: number) => {
    if (!complaint) return false
    const status = complaint.status
    if (
      status === WORKFLOW_STATUS.CLOSED ||
      status === WORKFLOW_STATUS.ARCHIVED ||
      status === 'Denúncia encerrada' ||
      status === 'resolvido' ||
      status === 'arquivado'
    )
      return true

    if (phase === 1) {
      const p1CompletedStatuses = [
        WORKFLOW_STATUS.APPROVED_PROCEDURE,
        WORKFLOW_STATUS.INVESTIGATION_2,
        WORKFLOW_STATUS.REVIEW_2,
        WORKFLOW_STATUS.WAITING_ANALYST_3,
        WORKFLOW_STATUS.MEDIATION_3,
        WORKFLOW_STATUS.DISCIPLINARY_3,
        WORKFLOW_STATUS.REVIEW_3,
      ]
      return p1CompletedStatuses.includes(status)
    }
    if (phase === 2) {
      const p2CompletedStatuses = [
        WORKFLOW_STATUS.WAITING_ANALYST_3,
        WORKFLOW_STATUS.MEDIATION_3,
        WORKFLOW_STATUS.DISCIPLINARY_3,
        WORKFLOW_STATUS.REVIEW_3,
      ]
      return p2CompletedStatuses.includes(status)
    }
    return false
  }

  const canApprovePhase = (phase: number) => {
    if (!complaint) return false
    if (phase === 1 && complaint.status === WORKFLOW_STATUS.REVIEW_1)
      return true
    if (phase === 2 && complaint.status === WORKFLOW_STATUS.REVIEW_2)
      return true
    if (phase === 3 && complaint.status === WORKFLOW_STATUS.REVIEW_3)
      return true
    return false
  }

  const handleApprove = async (phase: 1 | 2 | 3, approved: boolean) => {
    if (!id) return
    try {
      setActionLoading(true)
      await workflowService.approvePhase(id, phase, approved, comments)
      if (phase === 3 && approved) {
        setShowCelebration(true)
      } else {
        toast({
          title: approved ? 'Fase Aprovada' : 'Devolvido',
          description: approved
            ? 'A fase foi aprovada com sucesso.'
            : 'O processo foi devolvido para ajustes.',
        })
        await fetchAll()
        setComments('')
      }
    } catch (error: any) {
      toast({
        title: 'Erro na operação',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setActionLoading(false)
    }
  }

  const getSubmissionsForPhase = (phase: number) => {
    return submissions.filter((s) => s.fase === phase)
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-muted-foreground animate-pulse">
          Carregando detalhes do workflow...
        </div>
      </div>
    )
  }

  if (!complaint) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-muted-foreground">Workflow não encontrado.</div>
      </div>
    )
  }

  const renderPhaseCard = (phase: 1 | 2 | 3, title: string) => {
    const completed = isPhaseCompleted(phase)
    const canApprove = canApprovePhase(phase)
    const phaseSubmissions = getSubmissionsForPhase(phase)

    let reportText = ''
    if (phase === 1) reportText = complaint.parecer_1 || ''
    if (phase === 2) reportText = complaint.relatorio_2 || ''
    if (phase === 3) reportText = complaint.relatorio_3 || ''

    return (
      <Card
        className={cn(
          'mb-6 transition-all duration-300',
          completed && 'opacity-70 bg-muted/20',
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              Fase {phase}: {title}
              {completed && (
                <Badge variant="secondary" className="ml-2 font-normal">
                  <Lock className="w-3 h-3 mr-1" /> Concluído
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-1">
              Acompanhamento e aprovação da etapa
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-sm mb-2 text-foreground/80">
              Relatório / Parecer
            </h4>
            {reportText ? (
              <div className="p-4 bg-muted/40 rounded-md text-sm whitespace-pre-wrap leading-relaxed">
                {reportText}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic bg-muted/20 p-4 rounded-md">
                Nenhum relatório emitido para esta fase ainda.
              </p>
            )}
          </div>

          {phaseSubmissions.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-2 text-foreground/80">
                Votos dos Analistas
              </h4>
              <div className="grid gap-3">
                {phaseSubmissions.map((sub, idx) => (
                  <div
                    key={idx}
                    className="p-4 border border-border/50 rounded-md bg-card"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-sm">
                        {sub.analista?.nome_usuario || 'Analista'}
                      </span>
                      <Badge
                        variant={
                          sub.conclusao.includes('Procedente')
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {sub.conclusao}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {sub.parecer_texto}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!completed && canApprove && (
            <div className="mt-6 pt-6 border-t border-border/50 space-y-4 animate-fade-in">
              <h4 className="font-semibold text-sm">Ações de Aprovação</h4>
              <Textarea
                placeholder="Comentários sobre a decisão (opcional)"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                disabled={actionLoading}
                className="resize-none"
                rows={3}
              />
              <div className="flex gap-3">
                <Button
                  onClick={() => handleApprove(phase, true)}
                  disabled={actionLoading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Aprovar Fase
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleApprove(phase, false)}
                  disabled={actionLoading}
                >
                  Devolver para Ajustes
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container max-w-5xl py-8 animate-fade-in-up">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-full"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Análise do Workflow
          </h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
            <span>
              Protocolo:{' '}
              <strong className="text-foreground ml-1">
                {complaint.protocolo}
              </strong>
            </span>
            <Separator orientation="vertical" className="h-4" />
            <Badge variant="outline" className="font-normal">
              {complaint.status_nome || complaint.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {renderPhaseCard(1, 'Análise de Procedência')}
          {renderPhaseCard(2, 'Investigação')}
          {renderPhaseCard(3, 'Resolução e Medidas')}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <History className="w-4 h-4" />
                Histórico de Transições
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {logs.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">
                    Nenhum histórico registrado.
                  </p>
                ) : (
                  logs.map((log) => (
                    <div
                      key={log.id}
                      className="relative pl-5 border-l-2 border-primary/20 pb-1 last:pb-0 last:border-transparent group"
                    >
                      <div className="absolute w-2.5 h-2.5 bg-primary/50 group-hover:bg-primary transition-colors rounded-full -left-[6px] top-1.5 ring-4 ring-background" />
                      <p className="text-sm font-medium leading-tight">
                        {log.new_status}
                      </p>
                      {log.comments && (
                        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed bg-muted/30 p-2 rounded">
                          {log.comments}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2 text-[11px] text-muted-foreground">
                        <span className="font-medium text-foreground/60">
                          {log.changed_by_user?.nome_usuario || 'Sistema'}
                        </span>
                        <span>
                          {new Date(log.created_at).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog
        open={showCelebration}
        onOpenChange={(open) => {
          if (!open) {
            setShowCelebration(false)
            fetchAll()
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="flex flex-col items-center sm:items-center space-y-4 pt-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <DialogTitle className="text-2xl font-bold text-center">
              Processo Concluído
            </DialogTitle>
            <DialogDescription className="text-center text-base">
              Parabéns! O caso foi encerrado e devidamente registrado. O
              histórico de aprovações está salvo e imutável.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center mt-6 pb-2">
            <Button
              size="lg"
              className="w-full sm:w-auto px-8"
              onClick={() => {
                setShowCelebration(false)
                fetchAll()
              }}
            >
              Finalizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
