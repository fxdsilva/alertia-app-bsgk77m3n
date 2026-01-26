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
import { Loader2, Check, X, ArrowLeft, History, User } from 'lucide-react'
import { toast } from 'sonner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function WorkflowDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [complaint, setComplaint] = useState<WorkflowComplaint | null>(null)
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (id) fetchDetails()
  }, [id])

  const fetchDetails = async () => {
    setLoading(true)
    try {
      const [data, logsData] = await Promise.all([
        workflowService.getComplaintDetails(id!),
        workflowService.getWorkflowLogs(id!),
      ])
      setComplaint(data)
      setLogs(logsData || [])
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
      let phase: 1 | 2 | 3 = 1
      if (complaint.status === WORKFLOW_STATUS.REVIEW_2) phase = 2
      if (complaint.status === WORKFLOW_STATUS.REVIEW_3) phase = 3

      await workflowService.approvePhase(complaint.id, phase, approved, comment)
      toast.success(
        approved
          ? phase === 1
            ? 'Procedência Aprovada. Investigação Criada.'
            : 'Fase aprovada com sucesso'
          : 'Devolvido para ajustes do analista',
      )
      navigate('/compliance/director/workflow')
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
      navigate('/compliance/director/workflow')
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

  const isPhase1Review = complaint.status === WORKFLOW_STATUS.REVIEW_1

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 pb-20">
      <Button
        variant="ghost"
        onClick={() => navigate('/compliance/director/workflow')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
      </Button>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Revisão de Workflow</h1>
        <Badge variant="outline" className="text-lg px-3">
          {complaint.status}
        </Badge>
      </div>

      {/* Identification Alert */}
      {!complaint.anonimo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-4">
          <div className="bg-blue-100 p-2 rounded-full">
            <User className="h-5 w-5 text-blue-700" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900">
              Denunciante Identificado
            </h3>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 text-sm text-blue-800">
              <p>
                <span className="font-medium">Nome:</span>{' '}
                {complaint.denunciante_nome}
              </p>
              <p>
                <span className="font-medium">Email:</span>{' '}
                {complaint.denunciante_email}
              </p>
              <p>
                <span className="font-medium">Telefone:</span>{' '}
                {complaint.denunciante_telefone || 'N/A'}
              </p>
              <p>
                <span className="font-medium">Vínculo:</span>{' '}
                {complaint.denunciante_vinculo}
              </p>
            </div>
          </div>
        </div>
      )}

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
            <div className="bg-muted p-3 rounded text-sm whitespace-pre-wrap">
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
          <CardTitle>Pareceres e Relatórios (Submissões)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {complaint.parecer_1 && (
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                Parecer e Recomendação do Analista (Fase 1)
                {isPhase1Review && (
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                    Aguardando Aprovação
                  </Badge>
                )}
              </h3>
              <div className="bg-slate-50 p-4 rounded border whitespace-pre-wrap">
                {complaint.parecer_1}
              </div>
            </div>
          )}
          {complaint.relatorio_2 && (
            <div>
              <h3 className="font-semibold mb-2">
                Relatório de Investigação (Analista 2)
              </h3>
              <div className="bg-blue-50 p-4 rounded border whitespace-pre-wrap">
                {complaint.relatorio_2}
              </div>
            </div>
          )}
          {complaint.relatorio_3 && (
            <div>
              <h3 className="font-semibold mb-2">
                Relatório de Execução (Analista 3)
              </h3>
              <div className="bg-orange-50 p-4 rounded border whitespace-pre-wrap">
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
              placeholder="Insira observações, justificativas ou instruções de ajuste..."
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
                <X className="mr-2 h-4 w-4" /> Devolver para Ajustes
              </Button>
              <Button
                onClick={() => handleApproval(true)}
                disabled={processing}
              >
                <Check className="mr-2 h-4 w-4" />
                {isPhase1Review
                  ? 'Aprovar para Investigação'
                  : 'Aprovar e Avançar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audit Log Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" /> Histórico de Auditoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Comentários</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-xs">
                    {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm', {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell className="text-xs">{log.new_status}</TableCell>
                  <TableCell className="text-xs">
                    {log.changed_by_user?.nome_usuario || 'Sistema'}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {log.comments}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
