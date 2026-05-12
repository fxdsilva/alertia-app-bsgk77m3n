import { useState, useEffect } from 'react'
import useAppStore from '@/stores/useAppStore'
import { adminService } from '@/services/adminService'
import { complaintService, Complaint } from '@/services/complaintService'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { Plus, Eye, Trash2 } from 'lucide-react'

export default function ComplaintManager() {
  const { selectedSchool } = useAppStore()
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(false)

  // Create Dialog State
  const [createOpen, setCreateOpen] = useState(false)
  const [newDesc, setNewDesc] = useState('')
  const [newAnon, setNewAnon] = useState(true)

  // Details Dialog State
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    null,
  )
  const [detailOpen, setDetailOpen] = useState(false)
  const [history, setHistory] = useState<any[]>([])

  const fetchComplaints = async () => {
    setLoading(true)
    try {
      const data = await complaintService.getComplaints(
        selectedSchool ? { escola_id: selectedSchool.id } : undefined,
      )
      setComplaints(data as any)
    } catch (error) {
      toast.error('Erro ao carregar denúncias')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComplaints()
  }, [selectedSchool])

  const handleCreate = async () => {
    if (!selectedSchool || !newDesc) {
      if (!selectedSchool)
        toast.error('Selecione uma escola primeiro para registrar a denúncia')
      return
    }
    try {
      await adminService.createInternalComplaint(
        selectedSchool.id,
        newDesc,
        newAnon,
      )
      toast.success('Denúncia registrada')
      setCreateOpen(false)
      setNewDesc('')
      setNewAnon(true)
      fetchComplaints()
    } catch (error) {
      toast.error('Erro ao criar denúncia')
    }
  }

  const handleStatusUpdate = async (status: string) => {
    if (!selectedComplaint) return
    try {
      await adminService.updateComplaintStatus(selectedComplaint.id, status)
      toast.success('Status atualizado')
      setSelectedComplaint({ ...selectedComplaint, status })
      fetchComplaints()
    } catch (error) {
      toast.error('Erro ao atualizar status')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Confirmar exclusão?')) return
    try {
      await adminService.deleteComplaint(id)
      toast.success('Denúncia excluída')
      if (selectedComplaint?.id === id) setDetailOpen(false)
      fetchComplaints()
    } catch (error) {
      toast.error('Erro ao excluir')
    }
  }

  const openDetails = async (c: Complaint) => {
    setSelectedComplaint(c)
    setDetailOpen(true)
    setHistory([])

    try {
      const [{ data: logs }, { data: pareceres }] = await Promise.all([
        supabase
          .from('compliance_workflow_logs')
          .select(`*, changed_by:usuarios_escola(nome_usuario, perfil)`)
          .eq('complaint_id', c.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('workflow_pareceres')
          .select(`*, analista:usuarios_escola(nome_usuario)`)
          .eq('denuncia_id', c.id)
          .order('created_at', { ascending: false }),
      ])

      const manualLogs = []
      if (c.parecer_1)
        manualLogs.push({
          type: 'analyst',
          text: c.parecer_1,
          created_at: c.created_at,
          title: 'Parecer Preliminar',
        })
      if (c.relatorio_2)
        manualLogs.push({
          type: 'analyst',
          text: c.relatorio_2,
          created_at: c.created_at,
          title: 'Relatório Fase 2',
        })
      if (c.relatorio_3)
        manualLogs.push({
          type: 'analyst',
          text: c.relatorio_3,
          created_at: c.created_at,
          title: 'Relatório Fase 3',
        })

      const formattedLogs = (logs || []).map((l) => ({
        type: 'log',
        title: `Status alterado para: ${l.new_status}`,
        text: l.comments,
        user: (l.changed_by as any)?.nome_usuario || 'Sistema',
        perfil: (l.changed_by as any)?.perfil,
        created_at: l.created_at,
      }))

      const formattedPareceres = (pareceres || []).map((p) => ({
        type: 'parecer',
        title: `Parecer Fase ${p.fase} - ${p.conclusao}`,
        text: p.parecer_texto,
        user: (p.analista as any)?.nome_usuario || 'Analista',
        created_at: p.created_at,
      }))

      const allHistory = [
        ...formattedLogs,
        ...formattedPareceres,
        ...manualLogs,
      ].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )

      setHistory(allHistory)
    } catch (e) {
      console.error('Erro ao carregar histórico:', e)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestão de Denúncias</h1>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Nova Denúncia Interna
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Ocorrências</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="hidden sm:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Protocolo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Descrição (Resumo)</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {complaints.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground py-8"
                    >
                      Nenhuma denúncia encontrada.
                    </TableCell>
                  </TableRow>
                )}
                {complaints.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono">{c.protocolo}</TableCell>
                    <TableCell>
                      {new Date(c.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          'whitespace-normal text-center',
                          c.status === 'pendente'
                            ? 'bg-yellow-100 text-yellow-800'
                            : c.status === 'resolvido'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800',
                        )}
                      >
                        {c.status_nome || c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {c.descricao}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDetails(c)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(c.id)}
                        className="text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="sm:hidden flex flex-col space-y-4 p-4">
            {complaints.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                Nenhuma denúncia encontrada.
              </div>
            )}
            {complaints.map((c) => (
              <Card key={c.id} className="p-4 shadow-sm border-muted">
                <div className="flex justify-between items-start mb-3">
                  <span className="font-mono text-sm font-semibold">
                    {c.protocolo}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(c.created_at).toLocaleDateString()}
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    'mb-3 whitespace-normal text-center w-full',
                    c.status === 'pendente'
                      ? 'bg-yellow-100 text-yellow-800'
                      : c.status === 'resolvido'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800',
                  )}
                >
                  {c.status_nome || c.status}
                </Badge>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {c.descricao}
                </p>
                <div className="flex justify-end gap-2 border-t pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDetails(c)}
                  >
                    <Eye className="h-4 w-4 mr-2" /> Ver Detalhes
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(c.id)}
                    className="text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Denúncia Interna</DialogTitle>
            <DialogDescription>
              Use este formulário para registrar denúncias recebidas por outros
              canais.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Descrição Detalhada</Label>
              <Textarea
                placeholder="Descreva a ocorrência..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="h-32"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="anon"
                checked={newAnon}
                onCheckedChange={(c) => setNewAnon(c === true)}
              />
              <Label htmlFor="anon">Manter como anônimo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={!newDesc}>
              Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Denúncia</DialogTitle>
            <DialogDescription>
              Protocolo: {selectedComplaint?.protocolo}
            </DialogDescription>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
                <div>
                  <Label className="text-muted-foreground">Status Atual</Label>
                  <Select
                    value={selectedComplaint.status}
                    onValueChange={handleStatusUpdate}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="em_analise">Em Análise</SelectItem>
                      <SelectItem value="investigado">Investigado</SelectItem>
                      <SelectItem value="resolvido">Resolvido</SelectItem>
                      <SelectItem value="arquivado">Arquivado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-muted-foreground">
                    Data de Criação
                  </Label>
                  <div className="font-medium mt-1">
                    {new Date(selectedComplaint.created_at).toLocaleString()}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Tipo</Label>
                  <div className="font-medium mt-1">
                    {selectedComplaint.anonimo ? 'Anônima' : 'Identificada'}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Escola</Label>
                  <div className="font-medium mt-1">
                    {selectedComplaint.escola_nome || 'N/A'}
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-foreground font-semibold text-lg">
                  Descrição
                </Label>
                <div className="bg-muted p-4 rounded-md whitespace-pre-wrap mt-2 text-sm">
                  {selectedComplaint.descricao}
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-foreground font-semibold text-lg mb-4 block">
                  Histórico de Ações e Relatos
                </Label>
                {history.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">
                    Nenhum histórico registrado até o momento.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {history.map((h, i) => (
                      <div
                        key={i}
                        className={cn(
                          'p-4 rounded-lg border',
                          h.perfil === 'DIRETOR_COMPLIANCE'
                            ? 'border-primary/50 bg-primary/5'
                            : 'bg-card',
                        )}
                      >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-1">
                          <h4 className="font-semibold text-sm">{h.title}</h4>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(h.created_at).toLocaleString()}
                          </span>
                        </div>
                        {h.user && (
                          <div className="text-xs text-muted-foreground mb-3">
                            Usuário:{' '}
                            <span className="font-medium">{h.user}</span>
                          </div>
                        )}
                        {h.text && (
                          <div className="text-sm whitespace-pre-wrap text-foreground/90">
                            {h.text}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDetailOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
