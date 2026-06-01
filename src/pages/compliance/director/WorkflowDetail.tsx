import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { workflowService, WorkflowComplaint } from '@/services/workflowService'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Loader2,
  ArrowLeft,
  Building2,
  User,
  RefreshCw,
  Send,
  CheckCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import useAppStore from '@/stores/useAppStore'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

export default function WorkflowDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile } = useAppStore()

  const [complaint, setComplaint] = useState<WorkflowComplaint | null>(null)
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [returnModalOpen, setReturnModalOpen] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null)
  const [adjustmentNotes, setAdjustmentNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isDirectorOrHigher =
    profile === 'DIRETOR_COMPLIANCE' ||
    profile === 'senior' ||
    profile === 'administrador'

  useEffect(() => {
    if (!isDirectorOrHigher) {
      navigate('/')
      return
    }
    if (id) fetchDetails()
  }, [id, profile, navigate])

  const fetchDetails = async () => {
    setLoading(true)
    try {
      const [data, subs] = await Promise.all([
        workflowService.getComplaintDetails(id!),
        workflowService.getAllSubmissions(id!),
      ])
      setComplaint(data)
      setSubmissions(subs || [])
    } catch (error) {
      toast.error('Erro ao carregar detalhes')
    } finally {
      setLoading(false)
    }
  }

  const handleReturnClick = (submission: any) => {
    setSelectedSubmission(submission)
    setAdjustmentNotes('')
    setReturnModalOpen(true)
  }

  const confirmReturn = async () => {
    if (!adjustmentNotes.trim()) {
      toast.error('Informe as notas de ajuste')
      return
    }

    setIsSubmitting(true)
    try {
      await workflowService.returnForAdjustments(
        id!,
        selectedSubmission.fase,
        selectedSubmission.analista_id,
        adjustmentNotes,
      )
      toast.success('Retornado para ajustes com sucesso')
      setReturnModalOpen(false)
      fetchDetails()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao devolver para ajustes')
    } finally {
      setIsSubmitting(false)
    }
  }

  const approveCurrentPhase = async (phase: 1 | 2 | 3) => {
    try {
      await workflowService.approvePhase(id!, phase, true)
      toast.success('Fase aprovada com sucesso')
      fetchDetails()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao aprovar')
    }
  }

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  if (!complaint) return null

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 pb-20 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/compliance/director/workflow')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Detalhes do Processo</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <Building2 className="h-3.5 w-3.5" />
            {complaint.escolas_instituicoes?.nome_escola}
          </div>
        </div>
        <Badge variant="outline" className="ml-auto text-lg px-3 py-1">
          {complaint.protocolo}
        </Badge>
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Dados da Denúncia</CardTitle>
            <CardDescription>Status Atual: {complaint.status}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-md text-sm whitespace-pre-wrap leading-relaxed">
              {complaint.descricao}
            </div>
            {complaint.categoria && complaint.categoria.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {complaint.categoria.map((cat, i) => (
                  <Badge key={i} variant="secondary">
                    {cat}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Responsáveis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Analista 1 (Procedência)
              </p>
              <p className="font-medium">
                {complaint.analista_1?.nome_usuario || 'Não designado'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Analista 2 (Investigação)
              </p>
              <p className="font-medium">
                {complaint.analista_2?.nome_usuario || 'Não designado'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Analista 3 (Execução)
              </p>
              <p className="font-medium">
                {complaint.analista_3?.nome_usuario || 'Não designado'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pareceres e Relatórios (Submissões)</CardTitle>
          <CardDescription>
            Avalie as submissões dos analistas e devolva para ajustes se
            necessário.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <p className="text-sm text-muted-foreground italic text-center py-4">
              Nenhuma submissão registrada até o momento.
            </p>
          ) : (
            <div className="space-y-6">
              {submissions.map((sub) => (
                <div key={sub.id} className="border rounded-md p-4 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">Fase {sub.fase}</Badge>
                        <span className="font-medium text-sm">
                          {sub.analista?.nome_usuario}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(
                            new Date(sub.created_at),
                            'dd/MM/yyyy HH:mm',
                            { locale: ptBR },
                          )}
                        </span>
                      </div>
                      <p className="text-sm font-semibold">
                        Conclusão: {sub.conclusao}
                      </p>
                    </div>
                    {isDirectorOrHigher && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700 shrink-0"
                        onClick={() => handleReturnClick(sub)}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Devolver para Ajustes
                      </Button>
                    )}
                  </div>
                  <div className="bg-muted/50 p-3 rounded text-sm whitespace-pre-wrap">
                    {sub.parecer_texto || 'Sem texto detalhado.'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {isDirectorOrHigher && (
        <Card>
          <CardHeader>
            <CardTitle>Ações de Aprovação</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4 flex-wrap">
            <Button
              onClick={() => approveCurrentPhase(1)}
              variant="outline"
              className="border-green-200 hover:bg-green-50"
            >
              <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
              Aprovar Procedência (F1)
            </Button>
            <Button
              onClick={() => approveCurrentPhase(2)}
              variant="outline"
              className="border-green-200 hover:bg-green-50"
            >
              <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
              Aprovar Investigação (F2)
            </Button>
            <Button
              onClick={() => approveCurrentPhase(3)}
              variant="outline"
              className="border-green-200 hover:bg-green-50"
            >
              <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
              Aprovar Execução (F3)
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={returnModalOpen} onOpenChange={setReturnModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Devolver para Ajustes</DialogTitle>
            <DialogDescription>
              Informe as orientações para que o analista possa corrigir a
              submissão.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">
              Notas de Ajuste
            </label>
            <Textarea
              placeholder="Descreva o que precisa ser corrigido ou melhorado..."
              value={adjustmentNotes}
              onChange={(e) => setAdjustmentNotes(e.target.value)}
              className="min-h-[120px]"
            />
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setReturnModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={confirmReturn}
              disabled={isSubmitting || !adjustmentNotes.trim()}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Confirmar Devolução
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
