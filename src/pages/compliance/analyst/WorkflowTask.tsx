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
import { Loader2, Send, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import useAppStore from '@/stores/useAppStore'

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
          data.status === WORKFLOW_STATUS.RETURNED_1 &&
          data.analista_1_id === user.id
        ) {
          setReport(data.parecer_1 || '')
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

  const getMyPhase = (): 0 | 1 | 2 | 3 | null => {
    if (!complaint || !user) return null
    if (
      complaint.analista_1_id === user.id &&
      (complaint.status === WORKFLOW_STATUS.ANALYSIS_1 ||
        complaint.status === WORKFLOW_STATUS.RETURNED_1)
    )
      return 1
    if (
      complaint.analista_2_id === user.id &&
      complaint.status === WORKFLOW_STATUS.INVESTIGATION_2
    )
      return 2
    if (
      complaint.analista_3_id === user.id &&
      [WORKFLOW_STATUS.MEDIATION_3, WORKFLOW_STATUS.DISCIPLINARY_3].includes(
        complaint.status,
      )
    )
      return 3

    // Generic / Legacy support (Phase 0)
    // Allows editing if assigned generically and status is active
    if (
      complaint.analista_id === user.id &&
      !complaint.analista_1_id &&
      !complaint.analista_2_id &&
      !complaint.analista_3_id &&
      ![WORKFLOW_STATUS.CLOSED, WORKFLOW_STATUS.ARCHIVED].includes(
        complaint.status,
      )
    ) {
      return 0
    }

    return null
  }

  const handleSubmit = async () => {
    const phase = getMyPhase()
    if (phase === null || !complaint) return
    setSubmitting(true)
    try {
      await workflowService.submitReport(complaint.id, phase, report)
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

  const phase = getMyPhase()
  const isActionable = phase !== null

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
          <Badge>{complaint.status}</Badge>
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
            <CardTitle>
              {phase === 0 && 'Parecer de Análise'}
              {phase === 1 && 'Parecer de Procedência'}
              {phase === 2 && 'Relatório de Investigação'}
              {phase === 3 &&
                (complaint.tipo_resolucao === 'mediacao'
                  ? 'Relatório de Mediação'
                  : 'Relatório Disciplinar')}
            </CardTitle>
            <CardDescription>
              Preencha o relatório técnico abaixo para submeter à aprovação ou
              atualização.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              className="min-h-[200px]"
              placeholder="Digite seu relatório técnico detalhado aqui..."
              value={report}
              onChange={(e) => setReport(e.target.value)}
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={submitting || report.length < 5}
              >
                {submitting ? (
                  <Loader2 className="animate-spin mr-2" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                {phase === 0 ? 'Salvar Relatório' : 'Enviar para Aprovação'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="p-8 text-center border rounded bg-muted/20">
          <p className="text-muted-foreground">
            Você não tem ações pendentes para esta denúncia no momento ou o
            status atual não permite edição.
          </p>
        </div>
      )}
    </div>
  )
}
