import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  workflowService,
  WorkflowComplaint,
  WORKFLOW_STATUS,
} from '@/services/workflowService'
import { complaintService } from '@/services/complaintService'
import { useAuth } from '@/hooks/use-auth'
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowLeft, Send, History, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { AttachmentList } from '@/components/complaints/AttachmentList'

export default function WorkflowTask() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [complaint, setComplaint] = useState<WorkflowComplaint | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [conclusao, setConclusao] = useState<string>('Procedente')
  const [parecer, setParecer] = useState('')
  const [votes, setVotes] = useState<any[]>([])

  useEffect(() => {
    if (id && user) fetchDetails()
  }, [id, user])

  const fetchDetails = async () => {
    setLoading(true)
    try {
      const data = await workflowService.getComplaintDetails(id!)

      try {
        const fullComplaint = await complaintService.getComplaintById(id!)
        if (fullComplaint.attachments) {
          data.attachments = fullComplaint.attachments
        }
      } catch (e) {
        console.error('Failed to load attachments', e)
      }

      setComplaint(data)

      let currentPhase = 1
      if (data.status === WORKFLOW_STATUS.INVESTIGATION_2) currentPhase = 2
      if (
        [WORKFLOW_STATUS.MEDIATION_3, WORKFLOW_STATUS.DISCIPLINARY_3].includes(
          data.status,
        )
      )
        currentPhase = 3

      const allVotes = await workflowService.getAnalystVotes(id!, currentPhase)
      setVotes(allVotes || [])

      const me = allVotes?.find((v: any) => v.analista_id === user?.id)
      if (me) {
        setConclusao(me.conclusao)
        setParecer(me.parecer_texto)
      }
    } catch (error) {
      toast.error('Erro ao carregar detalhes da tarefa')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!parecer.trim()) {
      toast.error('Escreva a justificativa do seu parecer')
      return
    }
    setSubmitting(true)
    try {
      let phase: 1 | 2 | 3 = 1
      if (complaint?.status === WORKFLOW_STATUS.INVESTIGATION_2) phase = 2
      if (
        complaint?.status === WORKFLOW_STATUS.MEDIATION_3 ||
        complaint?.status === WORKFLOW_STATUS.DISCIPLINARY_3
      )
        phase = 3

      await workflowService.submitAnalystVote(
        complaint!.id,
        phase,
        user!.id,
        conclusao,
        parecer,
      )

      toast.success('Seu parecer foi registrado com sucesso!')
      navigate('/compliance/analyst/dashboard')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar parecer')
    } finally {
      setSubmitting(false)
    }
  }

  const copyPreviousDraft = () => {
    if (complaint?.parecer_1) {
      setParecer(complaint.parecer_1)
      toast.success('Draft anterior copiado para edição')
    }
  }

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    )
  if (!complaint) return null

  const isReturned = complaint.status === WORKFLOW_STATUS.RETURNED_1
  const isLeader = complaint.analista_1_id === user?.id

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 pb-20">
      <Button variant="ghost" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
      </Button>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Análise de Denúncia</h1>
          <p className="text-muted-foreground">
            Protocolo: {complaint.protocolo}
          </p>
        </div>
        <Badge variant="outline" className="text-lg">
          {complaint.status}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Descrição do Caso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-md text-sm whitespace-pre-wrap">
            {complaint.descricao}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Anexos e Evidências</CardTitle>
          <CardDescription>
            Documentos e arquivos enviados para análise.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AttachmentList attachments={complaint.attachments} />
        </CardContent>
      </Card>

      {isReturned && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" /> Devolvido para Ajustes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-red-700">
                A diretoria solicitou revisão deste parecer. Veja o histórico e
                faça os ajustes necessários abaixo.
              </p>
              {complaint.parecer_1 && (
                <div className="bg-white p-3 rounded border border-red-100 text-sm">
                  <h4 className="font-semibold mb-1 text-slate-700 flex justify-between items-center">
                    Parecer Anterior
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyPreviousDraft}
                    >
                      Copiar Texto
                    </Button>
                  </h4>
                  <div className="whitespace-pre-wrap text-slate-600">
                    {complaint.parecer_1}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-primary shadow-sm">
        <CardHeader>
          <CardTitle>Meu Parecer</CardTitle>
          <CardDescription>
            {isLeader
              ? 'Você é o Líder desta fase. Em caso de divergência com os outros analistas, seu voto será a decisão final.'
              : 'Registre sua conclusão independente. O sistema calculará o consenso da equipe.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label className="text-base">Conclusão</Label>
            <RadioGroup
              value={conclusao}
              onValueChange={setConclusao}
              className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Procedente" id="proc" />
                <Label
                  htmlFor="proc"
                  className="cursor-pointer font-medium text-green-700"
                >
                  Procedente
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Improcedente" id="imp" />
                <Label
                  htmlFor="imp"
                  className="cursor-pointer font-medium text-red-700"
                >
                  Improcedente
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Necessita mais análise" id="mais" />
                <Label
                  htmlFor="mais"
                  className="cursor-pointer font-medium text-yellow-700"
                >
                  Necessita mais análise
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label className="text-base">Justificativa e Análise</Label>
            <Textarea
              placeholder="Descreva detalhadamente os motivos da sua conclusão..."
              className="min-h-[200px]"
              value={parecer}
              onChange={(e) => setParecer(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || !parecer.trim()}
            >
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Registrar Meu Voto
            </Button>
          </div>
        </CardContent>
      </Card>

      {votes.length > 0 && (
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <History className="h-4 w-4" />
          Status da equipe: {votes.length} analista(s) já votaram.
        </div>
      )}
    </div>
  )
}
