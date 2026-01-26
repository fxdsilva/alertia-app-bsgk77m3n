import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  workflowService,
  WorkflowComplaint,
  WORKFLOW_STATUS,
} from '@/services/workflowService'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Loader2,
  Send,
  ArrowLeft,
  Save,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
} from 'lucide-react'
import { toast } from 'sonner'
import useAppStore from '@/stores/useAppStore'
import { cn } from '@/lib/utils'

export default function WorkflowTask() {
  const { id } = useParams()
  const { user } = useAppStore()
  const navigate = useNavigate()
  const [complaint, setComplaint] = useState<WorkflowComplaint | null>(null)
  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (id) fetchDetails()
  }, [id])

  const fetchDetails = async () => {
    setLoading(true)
    try {
      const data = await workflowService.getComplaintDetails(id!)
      setComplaint(data)

      if (user) {
        if (
          (data.status === WORKFLOW_STATUS.ANALYSIS_1 ||
            data.status === WORKFLOW_STATUS.RETURNED_1 ||
            data.status === WORKFLOW_STATUS.REVIEW_1) &&
          data.analista_1_id === user.id
        ) {
          setReport(data.parecer_1 || '')
        } else if (
          data.analista_2_id === user.id &&
          (data.status === WORKFLOW_STATUS.INVESTIGATION_2 ||
            data.status === WORKFLOW_STATUS.REVIEW_2)
        ) {
          setReport(data.relatorio_2 || '')
        } else if (
          data.analista_3_id === user.id &&
          (data.status === WORKFLOW_STATUS.MEDIATION_3 ||
            data.status === WORKFLOW_STATUS.DISCIPLINARY_3 ||
            data.status === WORKFLOW_STATUS.REVIEW_3)
        ) {
          setReport(data.relatorio_3 || '')
        }
        // Generic analyst might want to see previous generic report
        else if (
          data.analista_id === user.id &&
          !data.analista_1_id &&
          data.parecer_1
        ) {
          setReport(data.parecer_1)
        }
      }
    } catch (error) {
      toast.error('Erro ao carregar tarefa')
    } finally {
      setLoading(false)
    }
  }

  const getPhaseContext = () => {
    if (!complaint || !user) return null

    // Phase 1 Context
    if (complaint.analista_1_id === user.id) {
      const isEditable = [
        WORKFLOW_STATUS.ANALYSIS_1,
        WORKFLOW_STATUS.RETURNED_1,
      ].includes(complaint.status)
      return { phase: 1, isEditable }
    }

    // Phase 2 Context
    if (complaint.analista_2_id === user.id) {
      const isEditable = [WORKFLOW_STATUS.INVESTIGATION_2].includes(
        complaint.status,
      )
      return { phase: 2, isEditable }
    }

    // Phase 3 Context
    if (complaint.analista_3_id === user.id) {
      const isEditable = [
        WORKFLOW_STATUS.MEDIATION_3,
        WORKFLOW_STATUS.DISCIPLINARY_3,
      ].includes(complaint.status)
      return { phase: 3, isEditable }
    }

    // Generic / Legacy support (Phase 0)
    if (
      complaint.analista_id === user.id &&
      !complaint.analista_1_id &&
      !complaint.analista_2_id &&
      !complaint.analista_3_id &&
      ![WORKFLOW_STATUS.CLOSED, WORKFLOW_STATUS.ARCHIVED].includes(
        complaint.status,
      )
    ) {
      return { phase: 0, isEditable: true }
    }

    return null
  }

  const handleSaveDraft = async () => {
    const context = getPhaseContext()
    if (!context || !complaint) return
    setSubmitting(true)
    try {
      await workflowService.saveReportDraft(
        complaint.id,
        context.phase as any,
        report,
      )
      toast.success('Rascunho salvo com sucesso')
    } catch (error) {
      toast.error('Erro ao salvar rascunho')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = async (
    recommendationType?: 'investigate' | 'archive',
  ) => {
    const context = getPhaseContext()
    if (!context || !complaint) return
    setSubmitting(true)
    try {
      let recommendationMsg = ''
      if (recommendationType === 'investigate')
        recommendationMsg = 'Recomendação: Prosseguir com Investigação'
      if (recommendationType === 'archive')
        recommendationMsg = 'Recomendação: Arquivamento/Não Investigar'

      await workflowService.submitReport(
        complaint.id,
        context.phase as any,
        report,
        recommendationMsg,
      )
      toast.success('Relatório enviado com sucesso')
      navigate('/compliance/analyst/dashboard')
    } catch (error) {
      toast.error('Erro ao enviar relatório')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    )
  if (!complaint) return null

  const context = getPhaseContext()
  const isActionable = context !== null
  const phase = context?.phase ?? null
  const isEditable = context?.isEditable ?? false

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 pb-20 animate-fade-in">
      <Button
        variant="ghost"
        onClick={() => navigate('/compliance/analyst/dashboard')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Dashboard
      </Button>

      <div>
        <h1 className="text-2xl font-bold mb-2">Execução de Tarefa</h1>
        <div className="flex items-center gap-3">
          <Badge variant="outline">{complaint.protocolo}</Badge>
          <Badge
            className={cn(
              isEditable
                ? 'bg-primary'
                : 'bg-secondary text-secondary-foreground',
            )}
          >
            {complaint.status}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Denúncia</CardTitle>
          <CardDescription>
            {complaint.escolas_instituicoes?.nome_escola}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">
            {complaint.descricao}
          </p>
        </CardContent>
      </Card>

      {isActionable ? (
        <Card className="border-primary/20 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {phase === 0 && 'Parecer de Análise'}
                {phase === 1 && 'Parecer de Procedência'}
                {phase === 2 && 'Relatório de Investigação'}
                {phase === 3 &&
                  (complaint.tipo_resolucao === 'mediacao'
                    ? 'Relatório de Mediação'
                    : 'Relatório Disciplinar')}
              </CardTitle>
              {!isEditable && (
                <div className="flex items-center text-amber-600 text-sm font-medium gap-1">
                  <Clock className="w-4 h-4" />
                  Aguardando Aprovação
                </div>
              )}
            </div>
            <CardDescription>
              {isEditable
                ? 'Preencha o relatório técnico abaixo para submeter à aprovação ou atualização.'
                : 'O relatório foi enviado para revisão e não pode ser editado no momento.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              className="min-h-[200px]"
              placeholder="Digite seu relatório técnico detalhado aqui..."
              value={report}
              onChange={(e) => setReport(e.target.value)}
              disabled={!isEditable}
            />

            {isEditable ? (
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
                {/* Save Draft Button */}
                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={submitting}
                  className="w-full sm:w-auto"
                >
                  {submitting ? (
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Salvar Rascunho
                </Button>

                {phase === 1 ? (
                  <>
                    {/* Do Not Recommend / Archive */}
                    <Button
                      variant="secondary"
                      onClick={() => handleSubmit('archive')}
                      disabled={submitting || report.length < 5}
                      className="w-full sm:w-auto text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 border"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Não Recomendar Investigação
                    </Button>

                    {/* Recommend Investigation */}
                    <Button
                      onClick={() => handleSubmit('investigate')}
                      disabled={submitting || report.length < 5}
                      className="w-full sm:w-auto"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Recomendar Investigação
                    </Button>
                  </>
                ) : (
                  // Generic Submit for other phases
                  <Button
                    onClick={() => handleSubmit()}
                    disabled={submitting || report.length < 5}
                    className="w-full sm:w-auto"
                  >
                    {submitting ? (
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
                    Enviar para Aprovação
                  </Button>
                )}
              </div>
            ) : (
              <div className="p-4 bg-muted/20 rounded-md flex items-center gap-3 text-muted-foreground text-sm border">
                <AlertCircle className="h-5 w-5" />
                <span>
                  Modo de leitura. Aguarde o parecer do Diretor de Compliance.
                  Caso sejam solicitados ajustes, a edição será reabilitada.
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="p-8 text-center border rounded bg-muted/20">
          <p className="text-muted-foreground">
            Você não tem ações pendentes para esta denúncia no momento.
          </p>
        </div>
      )}
    </div>
  )
}
