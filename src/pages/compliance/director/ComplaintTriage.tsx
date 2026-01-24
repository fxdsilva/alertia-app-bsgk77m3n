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
import { AlertCircle, UserCheck, Loader2, ArrowRight } from 'lucide-react'
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

  const handleAssign = async () => {
    if (!selectedComplaint || !selectedAnalyst) return
    setAssigning(true)
    try {
      await complianceService.assignInvestigation(
        selectedComplaint.id,
        selectedAnalyst,
        selectedComplaint.escola_id,
      )
      toast.success('Investigador designado com sucesso')
      setAssignOpen(false)
      fetchData()
    } catch (error) {
      toast.error('Erro ao designar investigador')
    } finally {
      setAssigning(false)
    }
  }

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Triagem de Denúncias
        </h1>
        <p className="text-muted-foreground">
          Gerencie e designe investigadores para denúncias recebidas.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Denúncias Pendentes</CardTitle>
          <CardDescription>
            Aguardando análise e designação de responsável.
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
              <p>Nenhuma denúncia pendente no momento.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Protocolo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Escola</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Descrição Resumida</TableHead>
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
                    <TableCell className="max-w-[300px] truncate">
                      {c.descricao}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        className="gap-2"
                        onClick={() => handleOpenAssign(c)}
                      >
                        Designar <ArrowRight className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Designar Investigador</DialogTitle>
            <DialogDescription>
              Selecione um analista de compliance para conduzir a investigação
              do protocolo {selectedComplaint?.protocolo}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Analista Responsável</Label>
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
    </div>
  )
}
