import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Loader2, Eye, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { adminService, Complaint } from '@/services/adminService'
import useAppStore from '@/stores/useAppStore'
import { useNavigate } from 'react-router-dom'

export default function PendingReports() {
  const { profile, loading: appLoading } = useAppStore()
  const navigate = useNavigate()
  const [reports, setReports] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)

  // Details Dialog
  const [selectedReport, setSelectedReport] = useState<Complaint | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  useEffect(() => {
    if (!appLoading) {
      if (profile !== 'senior' && profile !== 'DIRETOR_COMPLIANCE') {
        navigate('/')
        return
      }
      fetchReports()
    }
  }, [profile, appLoading, navigate])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const data = await adminService.getAllPendingComplaints()
      setReports(data)
    } catch (error) {
      console.error(error)
      toast.error('Erro ao carregar denúncias pendentes')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (status: string) => {
    if (!selectedReport) return
    try {
      await adminService.updateComplaintStatus(selectedReport.id, status)
      toast.success('Status atualizado com sucesso')
      setDetailOpen(false)
      fetchReports()
    } catch (error) {
      console.error(error)
      toast.error('Erro ao atualizar status')
    }
  }

  const handleOpenDetails = (report: Complaint) => {
    setSelectedReport(report)
    setDetailOpen(true)
  }

  if (appLoading) return null

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <AlertTriangle className="h-8 w-8 text-orange-600" />
          Denúncias Pendentes
        </h1>
        <p className="text-muted-foreground">
          Ocorrências que aguardam triagem ou análise inicial em toda a rede.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fila de Pendências</CardTitle>
          <CardDescription>
            Mostrando {reports.length} ocorrências pendentes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Nenhuma denúncia pendente encontrada.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Protocolo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Escola</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Descrição (Resumo)</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono font-medium">
                      {r.protocolo}
                    </TableCell>
                    <TableCell>
                      {new Date(r.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {r.escolas_instituicoes?.nome_escola || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200">
                        Pendente
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[250px] truncate">
                      {r.descricao}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDetails(r)}
                      >
                        <Eye className="h-4 w-4" /> Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Denúncia</DialogTitle>
            <DialogDescription>
              Protocolo: {selectedReport?.protocolo}
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Escola</Label>
                  <div className="font-medium">
                    {selectedReport.escolas_instituicoes?.nome_escola || 'N/A'}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Data</Label>
                  <div className="font-medium">
                    {new Date(selectedReport.created_at).toLocaleString()}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Tipo</Label>
                  <div className="font-medium">
                    {selectedReport.anonimo ? 'Anônima' : 'Identificada'}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status Atual</Label>
                  <Select
                    defaultValue={selectedReport.status}
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
              </div>

              <div>
                <Label className="text-muted-foreground">Descrição</Label>
                <div className="bg-muted p-4 rounded-md whitespace-pre-wrap mt-2 text-sm">
                  {selectedReport.descricao}
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
