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
import {
  AlertCircle,
  UserCheck,
  Loader2,
  ArrowRight,
  Eye,
  EyeOff,
  User,
  Inbox,
  Filter,
} from 'lucide-react'
import { toast } from 'sonner'
import { complianceService } from '@/services/complianceService'
import { SchoolUser } from '@/services/schoolAdminService'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { DateRangePicker } from '@/components/DateRangePicker'
import { DateRange } from 'react-day-picker'

export default function ComplaintTriage() {
  const [complaints, setComplaints] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [analysts, setAnalysts] = useState<SchoolUser[]>([])
  const [schools, setSchools] = useState<any[]>([])
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null)
  const [selectedAnalyst, setSelectedAnalyst] = useState<string>('')
  const [assignOpen, setAssignOpen] = useState(false)
  const [assigning, setAssigning] = useState(false)

  // Filters
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [selectedSchool, setSelectedSchool] = useState<string>('all')
  const [selectedGravity, setSelectedGravity] = useState<string>('all')

  // Details Modal
  const [detailsOpen, setDetailsOpen] = useState(false)

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    fetchComplaints()
  }, [dateRange, selectedSchool, selectedGravity])

  const fetchInitialData = async () => {
    try {
      const [analystsData, schoolsData] = await Promise.all([
        complianceService.getAnalysts(),
        complianceService.getSchools(),
      ])
      setAnalysts(analystsData)
      setSchools(schoolsData)
    } catch (error) {
      console.error('Error fetching initial data', error)
      toast.error('Erro ao carregar dados iniciais')
    }
  }

  const fetchComplaints = async () => {
    setLoading(true)
    try {
      const data = await complianceService.getComplaintsForTriage({
        schoolId: selectedSchool,
        gravity: selectedGravity,
        startDate: dateRange?.from,
        endDate: dateRange?.to,
      })
      setComplaints(data || [])
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
      fetchComplaints() // Refresh list
    } catch (error) {
      console.error(error)
      toast.error('Erro ao designar investigador')
    } finally {
      setAssigning(false)
    }
  }

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Entrada de Denúncias
        </h1>
        <p className="text-muted-foreground">
          Triagem e designação de novas denúncias recebidas (Status: A
          designar).
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-end bg-card p-4 rounded-lg border">
        <div className="space-y-2 w-full md:w-auto">
          <Label>Período</Label>
          <DateRangePicker date={dateRange} onDateChange={setDateRange} />
        </div>
        <div className="space-y-2 w-full md:w-[250px]">
          <Label>Escola</Label>
          <Select value={selectedSchool} onValueChange={setSelectedSchool}>
            <SelectTrigger>
              <SelectValue placeholder="Todas as escolas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as escolas</SelectItem>
              {schools.map((school) => (
                <SelectItem key={school.id} value={school.id}>
                  {school.nome_escola}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 w-full md:w-[200px]">
          <Label>Gravidade</Label>
          <Select value={selectedGravity} onValueChange={setSelectedGravity}>
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="Alta">Alta</SelectItem>
              <SelectItem value="Média">Média</SelectItem>
              <SelectItem value="Baixa">Baixa</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 pb-1 text-sm text-muted-foreground ml-auto">
          <Filter className="h-4 w-4" />
          <span>{complaints.length} registro(s) encontrado(s)</span>
        </div>
      </div>

      <Card className="border-t-4 border-t-primary">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Inbox className="h-5 w-5 text-primary" />
            <CardTitle>Aguardando Designação</CardTitle>
          </div>
          <CardDescription>
            Lista estrita de denúncias pendentes de designação de analista.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : complaints.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground bg-muted/10 rounded-lg border-2 border-dashed">
              <AlertCircle className="h-12 w-12 mb-3 opacity-20" />
              <p className="text-lg font-medium">Tudo limpo por aqui!</p>
              <p className="text-sm">
                Não há denúncias pendentes de designação com os filtros atuais.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Protocolo</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Escola</TableHead>
                    <TableHead>Gravidade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Confidencialidade</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complaints.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono font-medium text-primary">
                        {c.protocolo}
                      </TableCell>
                      <TableCell>
                        {format(new Date(c.created_at), 'dd/MM/yyyy', {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {c.escolas_instituicoes?.nome_escola || 'N/A'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            c.gravidade === 'Alta'
                              ? 'border-red-500 text-red-600 bg-red-50'
                              : c.gravidade === 'Média'
                                ? 'border-yellow-500 text-yellow-600 bg-yellow-50'
                                : 'border-blue-200 text-blue-600 bg-blue-50'
                          }
                        >
                          {c.gravidade || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200"
                        >
                          {c.status_denuncia?.nome_status || 'A designar'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {c.anonimo ? (
                          <Badge
                            variant="secondary"
                            className="gap-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200"
                          >
                            <EyeOff className="h-3 w-3" />
                            Sigiloso
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="gap-1.5 text-blue-700 border-blue-200"
                          >
                            <User className="h-3 w-3" />
                            Identificado
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDetails(c)}
                          title="Ver detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          className="gap-2 bg-primary hover:bg-primary/90"
                          onClick={() => handleOpenAssign(c)}
                        >
                          Designar <ArrowRight className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assignment Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Designar Analista</DialogTitle>
            <DialogDescription>
              Selecione o profissional responsável por iniciar a análise do
              protocolo{' '}
              <span className="font-mono">{selectedComplaint?.protocolo}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="space-y-2">
              <Label>Analista de Compliance</Label>
              <Select
                value={selectedAnalyst}
                onValueChange={setSelectedAnalyst}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um analista..." />
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
            <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-700 flex gap-2 border border-blue-100">
              <ArrowRight className="h-5 w-5 shrink-0 mt-0.5" />
              <p>
                Ao confirmar, o status da denúncia será alterado para "Em
                Análise de Procedência" e ela sairá desta lista de triagem.
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

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes da Denúncia</DialogTitle>
            <DialogDescription>
              Protocolo: {selectedComplaint?.protocolo}
            </DialogDescription>
          </DialogHeader>

          {selectedComplaint && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4 text-sm bg-muted/20 p-3 rounded-lg border">
                <div>
                  <span className="text-muted-foreground block text-xs uppercase tracking-wider">
                    Escola
                  </span>
                  <span className="font-medium">
                    {selectedComplaint.escolas_instituicoes?.nome_escola}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs uppercase tracking-wider">
                    Data
                  </span>
                  <span className="font-medium">
                    {format(
                      new Date(selectedComplaint.created_at),
                      'dd/MM/yyyy HH:mm',
                      { locale: ptBR },
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs uppercase tracking-wider">
                    Categoria
                  </span>
                  <span className="font-medium">
                    {selectedComplaint.categoria?.join(', ') || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs uppercase tracking-wider">
                    Gravidade
                  </span>
                  <Badge
                    variant="outline"
                    className={
                      selectedComplaint.gravidade === 'Alta'
                        ? 'border-red-500 text-red-600 bg-red-50'
                        : selectedComplaint.gravidade === 'Média'
                          ? 'border-yellow-500 text-yellow-600 bg-yellow-50'
                          : 'border-blue-200 text-blue-600 bg-blue-50'
                    }
                  >
                    {selectedComplaint.gravidade || 'Não classificado'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold">Relato</Label>
                <div className="p-4 bg-muted/30 rounded-lg border text-sm text-muted-foreground whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                  {selectedComplaint.descricao}
                </div>
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
