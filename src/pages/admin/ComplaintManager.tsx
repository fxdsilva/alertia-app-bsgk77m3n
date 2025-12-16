import { useState, useEffect } from 'react'
import useAppStore from '@/stores/useAppStore'
import { adminService, Complaint } from '@/services/adminService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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

  const fetchComplaints = async () => {
    if (!selectedSchool) return
    setLoading(true)
    try {
      const data = await adminService.getComplaints(selectedSchool.id)
      setComplaints(data)
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
    if (!selectedSchool || !newDesc) return
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

  const openDetails = (c: Complaint) => {
    setSelectedComplaint(c)
    setDetailOpen(true)
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
        <CardContent>
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
                      className={
                        c.status === 'pendente'
                          ? 'bg-yellow-100 text-yellow-800'
                          : c.status === 'resolvido'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                      }
                    >
                      {c.status}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Denúncia</DialogTitle>
            <DialogDescription>
              Protocolo: {selectedComplaint?.protocolo}
            </DialogDescription>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Status Atual</Label>
                  <Select
                    value={selectedComplaint.status}
                    onValueChange={handleStatusUpdate}
                  >
                    <SelectTrigger>
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
                  <div className="font-medium">
                    {new Date(selectedComplaint.created_at).toLocaleString()}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Tipo</Label>
                  <div className="font-medium">
                    {selectedComplaint.anonimo ? 'Anônima' : 'Identificada'}
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Descrição</Label>
                <div className="bg-muted p-4 rounded-md whitespace-pre-wrap mt-1">
                  {selectedComplaint.descricao}
                </div>
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
