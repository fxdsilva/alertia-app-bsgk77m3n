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
import { Badge } from '@/components/ui/badge'
import { Loader2, ArrowLeft, History, Building2 } from 'lucide-react'
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
import useAppStore from '@/stores/useAppStore'

export default function WorkflowDetailMaster() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile } = useAppStore()
  const [complaint, setComplaint] = useState<WorkflowComplaint | null>(null)
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile !== 'senior') {
      navigate('/')
      return
    }
    if (id) fetchDetails()
  }, [id, profile, navigate])

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
        <Button variant="ghost" onClick={() => navigate('/senior/workflow')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Detalhes do Processo (Master)</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <Building2 className="h-3.5 w-3.5" />
            {complaint.escolas_instituicoes?.nome_escola}
          </div>
        </div>
        <Badge variant="outline" className="ml-auto text-lg px-3 py-1">
          {complaint.protocolo}
        </Badge>
      </div>

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

      {/* Reports Section - Read Only for Master */}
      <Card>
        <CardHeader>
          <CardTitle>Relatórios e Pareceres</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {complaint.parecer_1 ? (
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs">
                  F1
                </span>
                Parecer de Procedência
              </h3>
              <div className="bg-indigo-50/50 p-4 rounded border border-indigo-100 whitespace-pre-wrap text-sm">
                {complaint.parecer_1}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Parecer F1 pendente.
            </p>
          )}

          {complaint.relatorio_2 ? (
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">
                  F2
                </span>
                Relatório de Investigação
              </h3>
              <div className="bg-blue-50/50 p-4 rounded border border-blue-100 whitespace-pre-wrap text-sm">
                {complaint.relatorio_2}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Relatório F2 pendente.
            </p>
          )}

          {complaint.relatorio_3 ? (
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs">
                  F3
                </span>
                Relatório de Execução ({complaint.tipo_resolucao})
              </h3>
              <div className="bg-orange-50/50 p-4 rounded border border-orange-100 whitespace-pre-wrap text-sm">
                {complaint.relatorio_3}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Relatório F3 pendente.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Audit Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" /> Timeline de Auditoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Ação / Comentário</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-xs whitespace-nowrap">
                    {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm', {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell className="text-xs">
                    <Badge variant="outline">{log.new_status}</Badge>
                  </TableCell>
                  <TableCell className="text-xs font-medium">
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
