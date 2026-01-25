import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  AlertCircle,
  UserCheck,
  Loader2,
  ArrowRight,
  Eye,
  Lock,
  Unlock,
} from 'lucide-react'
import { toast } from 'sonner'
import { complianceService } from '@/services/complianceService'
import { SchoolUser } from '@/services/schoolAdminService'

export default function ComplaintTriage() {
  const [complaints, setComplaints] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [analysts, setAnalysts] = useState<SchoolUser[]>([])
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null)
  const [selectedAnalyst, setSelectedAnalyst] = useState<string>('')
  const [assignOpen, setAssignOpen] = useState(false)
  const [assigning, setAssigning] = useState(false)

  // Details Modal
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [accessToggleLoading, setAccessToggleLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [complaintsData, analystsData] = await Promise.all([
        complianceService.getComplaintsForTriage(),
        complianceService.getAnalysts(),
      ])
      setComplaints(complaintsData)
      setAnalysts(analystsData)
    } catch (error) {
      console.error(error)
      toast.error('Erro ao carregar denúncias')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenAssign = (complaint: any) => {
    setSelectedComplaint(complaint)
    setSelectedAnalyst('')
    setAssignOpen(true)
  }

  const handleOpenDetails = (complaint: any) => {
    setSelectedComplaint(complaint)
    setDetailsOpen(true)
  }

  const handleAssign = async () => {
    if (!selectedComplaint || !selectedAnalyst) return
    setAssigning(true)
    try {
      await complianceService.assignInvestigation(
        selectedComplaint.id,
        selectedAnalyst,
        selectedComplaint.escola_id,
      )
      toast.success('Analista designado para apuração com sucesso')
      setAssignOpen(false)
      fetchData()
    } catch (error) {
      toast.error('Erro ao designar investigador')
    } finally {
      setAssigning(false)
    }
  }

  const handleToggleAccess = async (allowed: boolean) => {
    if (!selectedComplaint) return
    setAccessToggleLoading(true)
    try {
      await complianceService.toggleSchoolAccess(selectedComplaint.id, allowed)
      setSelectedComplaint({ ...selectedComplaint, autorizado_gestao: allowed })
      // Update list state locally
      setComplaints((prev) =>
        prev.map((c) =>
          c.id === selectedComplaint.id
            ? { ...c, autorizado_gestao: allowed }
            : c,
        ),
      )
      toast.success(
        allowed
          ? 'Acesso liberado para gestão escolar'
          : 'Acesso revogado da gestão escolar',
      )
    } catch (error) {
      toast.error('Erro ao alterar permissão')
    } finally {
      setAccessToggleLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Triagem de Denúncias
        </h1>
        <p className="text-muted-foreground">
          Gestão centralizada de novas denúncias e designação de apuração.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Entrada de Denúncias</CardTitle>
          <CardDescription>
            Todas as novas denúncias aparecem automaticamente aqui para análise
            preliminar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : complaints.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <AlertCircle className="h-10 w-10 mb-2 opacity-50" />
              <p>Nenhuma denúncia pendente de triagem.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Protocolo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Escola</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Confidencialidade</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {complaints.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono">{c.protocolo}</TableCell>
                    <TableCell>
                      {new Date(c.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {c.escolas_instituicoes?.nome_escola || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-yellow-50">
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {c.autorizado_gestao ? (
                        <div className="flex items-center text-green-600 gap-1 text-xs font-medium">
                          <Unlock className="h-3 w-3" />
                          Visível p/ Gestão
                        </div>
                      ) : (
                        <div className="flex items-center text-red-600 gap-1 text-xs font-medium">
                          <Lock className="h-3 w-3" />
                          Sigiloso
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDetails(c)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        className="gap-2"
                        onClick={() => handleOpenAssign(c)}
                        disabled={!!c.analista_id}
                      >
                        {c.analista_id ? (
                          'Designado'
                        ) : (
                          <>
                            Designar <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Assignment Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Designar Analista para Apuração</DialogTitle>
            <DialogDescription>
              Selecione o profissional responsável por conduzir a investigação
              do protocolo {selectedComplaint?.protocolo}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Analista de Compliance</Label>
              <Select
                value={selectedAnalyst}
                onValueChange={setSelectedAnalyst}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {analysts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.nome_usuario}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="bg-blue-50 p-3 rounded-md text-xs text-blue-700">
              <p>
                Ao designar, o status mudará automaticamente para "Em Análise" e
                o analista receberá acesso completo aos dados.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAssignOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAssign}
              disabled={!selectedAnalyst || assigning}
            >
              {assigning ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <UserCheck className="h-4 w-4 mr-2" />
              )}
              Confirmar Designação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details & Permission Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Denúncia</DialogTitle>
            <DialogDescription>
              Protocolo: {selectedComplaint?.protocolo}
            </DialogDescription>
          </DialogHeader>

          {selectedComplaint && (
            <div className="space-y-6 py-2">
              <div className="p-4 bg-muted/30 rounded-lg space-y-2 border">
                <h4 className="font-semibold text-sm">Relato Original</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedComplaint.descricao}
                </p>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg bg-card shadow-sm">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Label className="text-base font-semibold">
                      Compartilhar com Gestão Escolar
                    </Label>
                    {selectedComplaint.autorizado_gestao ? (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        Autorizado
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-muted-foreground"
                      >
                        Restrito
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground max-w-[350px]">
                    Habilitar permite que o diretor da escola visualize o
                    conteúdo desta denúncia. Mantenha desativado para garantir
                    sigilo total.
                  </p>
                </div>
                <Switch
                  checked={selectedComplaint.autorizado_gestao || false}
                  onCheckedChange={handleToggleAccess}
                  disabled={accessToggleLoading}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="secondary" onClick={() => setDetailsOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
