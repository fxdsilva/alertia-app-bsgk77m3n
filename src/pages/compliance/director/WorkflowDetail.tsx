import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  workflowService,
  WorkflowComplaint,
  WORKFLOW_STATUS,
} from '@/services/workflowService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Loader2, Check, X, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

export default function WorkflowDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [complaint, setComplaint] = useState<WorkflowComplaint | null>(null)
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (id) fetchDetails()
  }, [id])

  const fetchDetails = async () => {
    setLoading(true)
    try {
      const data = await workflowService.getComplaintDetails(id!)
      setComplaint(data)
    } catch (error) {
      toast.error('Erro ao carregar detalhes')
    } finally {
      setLoading(false)
    }
  }

  const handleApproval = async (approved: boolean) => {
    if (!complaint) return
    setProcessing(true)
    try {
      // Determine phase based on status
      let phase: 1 | 2 | 3 = 1
      if (complaint.status === WORKFLOW_STATUS.REVIEW_2) phase = 2
      if (complaint.status === WORKFLOW_STATUS.REVIEW_3) phase = 3

      if (!approved && phase === 1) {
        // Special case for Archiving (Improcedente) vs Returning
        // For simplicity: False = Return, True = Next Phase
        // If archived needed, we'd need another button.
        // Let's assume the UI provides "Reprovar/Devolver" (False) and "Aprovar" (True)
        // If approved, it goes to next phase.
      }

      await workflowService.approvePhase(complaint.id, phase, approved, comment)
      toast.success(approved ? 'Fase aprovada' : 'Fase devolvida/reprovada')
      navigate('/compliance/director/dashboard')
    } catch (error) {
      toast.error('Erro ao processar aprovação')
    } finally {
      setProcessing(false)
    }
  }

  const handleArchive = async () => {
    if (!complaint) return
    if (
      !confirm(
        'Tem certeza que deseja arquivar esta denúncia como improcedente?',
      )
    )
      return
    setProcessing(true)
    try {
      await workflowService.archiveComplaint(
        complaint.id,
        comment || 'Arquivado pelo diretor',
      )
      toast.success('Denúncia arquivada')
      navigate('/compliance/director/dashboard')
    } catch (e) {
      toast.error('Erro ao arquivar')
    } finally {
      setProcessing(false)
    }
  }

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    )
  if (!complaint) return null

  const isReviewPhase = [
    WORKFLOW_STATUS.REVIEW_1,
    WORKFLOW_STATUS.REVIEW_2,
    WORKFLOW_STATUS.REVIEW_3,
  ].includes(complaint.status)

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 pb-20">
      <Button
        variant="ghost"
        onClick={() => navigate('/compliance/director/dashboard')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
      </Button>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Revisão de Workflow</h1>
        <Badge variant="outline" className="text-lg px-3">
          {complaint.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Dados da Denúncia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="font-semibold">Protocolo:</span>{' '}
              {complaint.protocolo}
            </div>
            <div>
              <span className="font-semibold">Escola:</span>{' '}
              {complaint.escolas_instituicoes?.nome_escola}
            </div>
            <div className="bg-muted p-3 rounded text-sm">
              {complaint.descricao}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Responsáveis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between border-b pb-2">
              <span>Analista 1 (Procedência):</span>
              <span className="font-medium">
                {complaint.analista_1?.nome_usuario || '-'}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span>Analista 2 (Investigação):</span>
              <span className="font-medium">
                {complaint.analista_2?.nome_usuario || '-'}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span>Analista 3 (Execução):</span>
              <span className="font-medium">
                {complaint.analista_3?.nome_usuario || '-'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports View */}
      <Card>
        <CardHeader>
          <CardTitle>Pareceres e Relatórios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {complaint.parecer_1 && (
            <div>
              <h3 className="font-semibold mb-2">
                Parecer de Procedência (Analista 1)
              </h3>
              <div className="bg-slate-50 p-4 rounded border">
                {complaint.parecer_1}
              </div>
            </div>
          )}
          {complaint.relatorio_2 && (
            <div>
              <h3 className="font-semibold mb-2">
                Relatório de Investigação (Analista 2)
              </h3>
              <div className="bg-blue-50 p-4 rounded border">
                {complaint.relatorio_2}
              </div>
            </div>
          )}
          {complaint.relatorio_3 && (
            <div>
              <h3 className="font-semibold mb-2">
                Relatório de Execução (Analista 3)
              </h3>
              <div className="bg-orange-50 p-4 rounded border">
                {complaint.relatorio_3}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Area */}
      {isReviewPhase && (
        <Card className="border-primary">
          <CardHeader className="bg-primary/5">
            <CardTitle>Decisão da Diretoria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <Textarea
              placeholder="Insira observações, justificativas ou instruções de revisão..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              {complaint.status === WORKFLOW_STATUS.REVIEW_1 && (
                <Button
                  variant="destructive"
                  onClick={handleArchive}
                  disabled={processing}
                >
                  Arquivar (Improcedente)
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => handleApproval(false)}
                disabled={processing}
              >
                <X className="mr-2 h-4 w-4" /> Devolver para Revisão
              </Button>
              <Button
                onClick={() => handleApproval(true)}
                disabled={processing}
              >
                <Check className="mr-2 h-4 w-4" /> Aprovar e Avançar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
