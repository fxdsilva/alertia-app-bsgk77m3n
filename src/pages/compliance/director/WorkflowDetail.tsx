import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  workflowService,
  WorkflowComplaint,
  WORKFLOW_STATUS,
} from '@/services/workflowService'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import {
  CheckCircle2,
  ArrowLeft,
  XCircle,
  History,
  Info,
  Clock,
  Ban,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import useAppStore from '@/stores/useAppStore'

export default function WorkflowDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { profile } = useAppStore()

  const canTriggerAction = [
    'DIRETOR_COMPLIANCE',
    'senior',
    'administrador',
    'admin_gestor',
  ].includes(profile || '')

  const [complaint, setComplaint] = useState<WorkflowComplaint | null>(null)
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [actionPhase, setActionPhase] = useState<1 | 2 | 3 | null>(null)
  const [actionType, setActionType] = useState<'approve' | 'return' | null>(
    null,
  )
  const [comments, setComments] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const fetchData = async () => {
    if (!id) return
    setLoading(true)
    try {
      const [compData, logsData] = await Promise.all([
        workflowService.getComplaintDetails(id),
        workflowService.getWorkflowLogs(id),
      ])
      setComplaint(compData)
      setLogs(logsData)
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
    fetchData()
  }, [id])

  const handleAction = async () => {
    if (!id || !actionPhase || !actionType) return
    setSubmitting(true)
    try {
      if (actionType === 'approve') {
        await workflowService.approvePhase(id, actionPhase, true, comments)
        toast({ title: 'Fase aprovada com sucesso!' })
      } else {
        if (!comments.trim()) {
          toast({ title: 'Justificativa obrigatória', variant: 'destructive' })
          setSubmitting(false)
          return
        }
        await workflowService.approvePhase(id, actionPhase, false, comments)
        toast({ title: 'Devolvido para ajustes' })
      }
      setDialogOpen(false)
      setComments('')
      await fetchData()
    } catch (error: any) {
      toast({
        title: 'Erro ao processar ação',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const status = complaint?.status || ''

  const isArchived = [
    WORKFLOW_STATUS.ARCHIVED,
    'arquivado',
    'Arquivamento aprovado',
  ].includes(status)

  const isClosed =
    [WORKFLOW_STATUS.CLOSED, 'resolvido', 'Denúncia encerrada'].includes(
      status,
    ) || isArchived

  const isPhase1Completed =
    [
      WORKFLOW_STATUS.APPROVED_PROCEDURE,
      WORKFLOW_STATUS.INVESTIGATION_2,
      WORKFLOW_STATUS.REVIEW_2,
      WORKFLOW_STATUS.WAITING_ANALYST_3,
      WORKFLOW_STATUS.MEDIATION_3,
      WORKFLOW_STATUS.DISCIPLINARY_3,
      WORKFLOW_STATUS.REVIEW_3,
    ].includes(status) || isClosed

  const isPhase2Completed =
    [
      WORKFLOW_STATUS.WAITING_ANALYST_3,
      WORKFLOW_STATUS.MEDIATION_3,
      WORKFLOW_STATUS.DISCIPLINARY_3,
      WORKFLOW_STATUS.REVIEW_3,
    ].includes(status) ||
    (isClosed && !isArchived)

  const isPhase3Completed = isClosed && !isArchived

  const getStatusColor = (s: string) => {
    if (isArchived) return 'bg-slate-100 text-slate-700 border-slate-200'
    if (isClosed) return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    if (s.includes('Aguardando') || s.includes('Devolvido'))
      return 'bg-amber-100 text-amber-700 border-amber-200'
    return 'bg-blue-100 text-blue-700 border-blue-200'
  }

  const phases = [
    {
      phase: 1,
      title: 'Análise Preliminar (Procedência)',
      completed: isPhase1Completed,
      canApprove: status === WORKFLOW_STATUS.REVIEW_1,
      reportText: complaint?.parecer_1,
      skipped: false,
      activeText:
        status === WORKFLOW_STATUS.ANALYSIS_1
          ? 'Em análise pelo analista designado'
          : status === WORKFLOW_STATUS.WAITING_ANALYST_1
            ? 'Aguardando designação do analista'
            : status === WORKFLOW_STATUS.RETURNED_1
              ? 'Devolvido ao analista para ajustes'
              : null,
    },
    {
      phase: 2,
      title: 'Investigação Detalhada',
      completed: isPhase2Completed,
      canApprove: status === WORKFLOW_STATUS.REVIEW_2,
      reportText: complaint?.relatorio_2,
      skipped: isArchived,
      activeText:
        status === WORKFLOW_STATUS.INVESTIGATION_2
          ? 'Investigação em andamento (Analista)'
          : status === WORKFLOW_STATUS.APPROVED_PROCEDURE
            ? 'Aguardando designação do analista'
            : null,
    },
    {
      phase: 3,
      title: 'Resolução Final (Medida / Mediação)',
      completed: isPhase3Completed,
      canApprove: status === WORKFLOW_STATUS.REVIEW_3,
      reportText: complaint?.relatorio_3,
      skipped: isArchived,
      activeText:
        status === WORKFLOW_STATUS.MEDIATION_3 ||
        status === WORKFLOW_STATUS.DISCIPLINARY_3
          ? 'Execução da resolução em andamento'
          : status === WORKFLOW_STATUS.WAITING_ANALYST_3
            ? 'Aguardando designação para resolução'
            : null,
    },
  ]

  const openActionDialog = (phase: 1 | 2 | 3, type: 'approve' | 'return') => {
    setActionPhase(phase)
    setActionType(type)
    setComments('')
    setDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground text-sm">
            Carregando detalhes do workflow...
          </p>
        </div>
      </div>
    )
  }

  if (!complaint) {
    return (
      <div className="p-8 text-center text-muted-foreground min-h-[60vh] flex items-center justify-center">
        Denúncia não encontrada ou acesso restrito.
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-6xl animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Aprovação de Workflow
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Protocolo:{' '}
            <span className="font-semibold text-foreground bg-muted px-2 py-0.5 rounded-md ml-1">
              {complaint.protocolo}
            </span>
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="shadow-sm"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Summary Card */}
          <Card className="shadow-sm border-muted/60">
            <CardHeader className="bg-muted/30 pb-4 border-b border-border/40">
              <CardTitle className="text-lg">Resumo da Denúncia</CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1.5">
                    Status Global
                  </p>
                  <Badge
                    className={cn(
                      'px-2.5 py-1 text-xs font-semibold',
                      getStatusColor(status),
                    )}
                    variant="outline"
                  >
                    {status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1.5">
                    Escola / Instituição
                  </p>
                  <p className="text-sm font-medium">
                    {complaint.escolas_instituicoes?.nome_escola ||
                      'Não informada'}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Descrição do Fato
                </p>
                <div className="bg-secondary/40 border border-secondary p-4 rounded-lg text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {complaint.descricao}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Workflow Timeline */}
          <div>
            <h2 className="text-lg font-bold mb-6 px-1 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Fases do Processo
            </h2>
            <div className="relative border-l-2 border-muted/80 ml-4 space-y-10 py-2">
              {phases.map((p) => (
                <div key={p.phase} className="relative pl-8">
                  {/* Circle Indicator */}
                  <div
                    className={cn(
                      'absolute -left-[17px] top-0 h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-background transition-all duration-500 shadow-sm z-10',
                      p.completed
                        ? 'bg-emerald-500 text-white'
                        : p.canApprove
                          ? 'bg-blue-600 text-white ring-blue-100 shadow-blue-200 animate-pulse'
                          : p.skipped
                            ? 'bg-slate-200 text-slate-400 ring-slate-50'
                            : 'bg-slate-100 text-slate-500 border border-slate-200',
                    )}
                  >
                    {p.completed ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : p.skipped ? (
                      <Ban className="h-4 w-4" />
                    ) : (
                      <span className="font-semibold text-sm">{p.phase}</span>
                    )}
                  </div>

                  {/* Phase Card */}
                  <Card
                    className={cn(
                      'transition-all duration-300 border',
                      p.canApprove
                        ? 'border-blue-300 shadow-md ring-1 ring-blue-100/50'
                        : 'shadow-sm border-muted/60',
                      p.skipped ? 'opacity-60 bg-muted/20' : '',
                      p.completed ? 'border-emerald-100/50' : '',
                    )}
                  >
                    <CardHeader
                      className={cn(
                        'py-4',
                        p.completed
                          ? 'bg-emerald-50/40 border-b border-emerald-100/50'
                          : p.canApprove
                            ? 'bg-blue-50/50 border-b border-blue-100/50'
                            : 'border-b border-transparent',
                      )}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <CardTitle
                          className={cn(
                            'text-base font-bold',
                            p.skipped && 'text-muted-foreground font-medium',
                          )}
                        >
                          {p.title}
                        </CardTitle>
                        {p.completed && (
                          <Badge
                            variant="outline"
                            className="w-fit bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm"
                          >
                            Fase Concluída
                          </Badge>
                        )}
                        {p.canApprove && (
                          <Badge
                            variant="default"
                            className="w-fit bg-blue-600 shadow-sm"
                          >
                            Aguardando sua Aprovação
                          </Badge>
                        )}
                        {p.skipped && (
                          <Badge variant="secondary" className="w-fit">
                            Fase Ignorada (Arquivado)
                          </Badge>
                        )}
                        {!p.completed &&
                          !p.canApprove &&
                          !p.skipped &&
                          p.activeText && (
                            <Badge
                              variant="outline"
                              className="w-fit bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1.5 shadow-sm"
                            >
                              <Clock className="h-3 w-3" /> {p.activeText}
                            </Badge>
                          )}
                      </div>
                    </CardHeader>

                    {/* Render Content if there is a report or actions available */}
                    {((p.reportText && !p.skipped) || p.canApprove) && (
                      <CardContent className="pt-5 space-y-5">
                        {p.reportText && (
                          <div>
                            <p className="text-sm font-semibold text-foreground mb-2.5 flex items-center gap-1.5">
                              <Info className="h-4 w-4 text-primary" /> Parecer
                              Consolidado da Equipe
                            </p>
                            <div className="bg-slate-50 border border-slate-200/60 p-4.5 rounded-lg text-sm text-slate-800 whitespace-pre-wrap leading-relaxed shadow-inner shadow-slate-100/50">
                              {p.reportText}
                            </div>
                          </div>
                        )}

                        {p.canApprove && (
                          <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            {canTriggerAction ? (
                              <>
                                <Button
                                  onClick={() =>
                                    openActionDialog(p.phase as any, 'approve')
                                  }
                                  className="bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all flex-1 sm:flex-none"
                                >
                                  <CheckCircle2 className="mr-2 h-4 w-4" />{' '}
                                  Aprovar e Avançar
                                </Button>
                                <Button
                                  onClick={() =>
                                    openActionDialog(p.phase as any, 'return')
                                  }
                                  variant="outline"
                                  className="text-destructive hover:bg-destructive/10 border-destructive/20 hover:border-destructive/30 transition-all flex-1 sm:flex-none"
                                >
                                  <XCircle className="mr-2 h-4 w-4" /> Devolver
                                  para Ajustes
                                </Button>
                              </>
                            ) : (
                              <div className="bg-amber-50 border border-amber-200 p-3 rounded-md w-full flex items-start gap-2.5">
                                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                                <p className="text-sm text-amber-800">
                                  Você não tem permissão para aprovar esta fase.
                                  Apenas perfis da Diretoria ou Administração
                                  podem realizar esta ação.
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Logs */}
        <div className="lg:col-span-1">
          <Card className="shadow-sm border-muted/60 sticky top-6">
            <CardHeader className="bg-muted/30 pb-4 border-b border-border/40">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                Histórico de Transições
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="space-y-6">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="relative pl-5 border-l-2 border-muted/60 pb-2 last:pb-0"
                  >
                    <div className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-muted-foreground/40 ring-4 ring-background"></div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">
                      {format(
                        new Date(log.created_at),
                        "dd/MM/yyyy 'às' HH:mm",
                      )}
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {log.new_status}
                    </p>
                    {log.comments && (
                      <p className="text-sm text-muted-foreground mt-1.5 bg-secondary/50 p-2.5 rounded-md italic border border-border/40">
                        "{log.comments}"
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground/80 mt-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/40 inline-block"></span>
                      {log.changed_by_user?.nome_usuario || 'Sistema Autônomo'}
                    </p>
                  </div>
                ))}
                {logs.length === 0 && (
                  <div className="text-center py-8">
                    <History className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">
                      Nenhum histórico registrado.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {actionType === 'approve'
                ? 'Confirmar Aprovação da Fase'
                : 'Devolver para Ajustes'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {actionType === 'approve' ? (
              <div className="bg-emerald-50 text-emerald-800 p-3.5 rounded-lg text-sm mb-5 border border-emerald-100 flex items-start gap-2.5">
                <Info className="h-5 w-5 shrink-0 mt-0.5 text-emerald-600" />
                <p>
                  Ao aprovar, esta fase será marcada definitivamente como{' '}
                  <strong>Concluída</strong> e a denúncia avançará para a
                  próxima etapa na esteira do workflow.
                </p>
              </div>
            ) : (
              <div className="bg-amber-50 text-amber-800 p-3.5 rounded-lg text-sm mb-5 border border-amber-100 flex items-start gap-2.5">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-amber-600" />
                <p>
                  Esta fase será devolvida ao analista responsável para
                  correções. O status retornará para o estágio de revisão.
                </p>
              </div>
            )}
            <div className="space-y-2.5">
              <Label className="text-sm font-semibold text-foreground">
                Comentários Adicionais{' '}
                {actionType === 'return' && (
                  <span className="text-destructive">*</span>
                )}
              </Label>
              <Textarea
                placeholder={
                  actionType === 'approve'
                    ? 'Insira alguma observação opcional para o registro...'
                    : 'Descreva detalhadamente o que precisa ser ajustado na análise...'
                }
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="min-h-[120px] resize-none focus-visible:ring-primary/50"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0 mt-2">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAction}
              disabled={
                submitting || (actionType === 'return' && !comments.trim())
              }
              className={
                actionType === 'approve'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                  : 'bg-destructive text-white hover:bg-destructive/90 shadow-sm'
              }
            >
              {submitting
                ? 'Processando...'
                : actionType === 'approve'
                  ? 'Confirmar Aprovação'
                  : 'Confirmar Devolução'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
