import { useState, useEffect } from 'react'
import useAppStore from '@/stores/useAppStore'
import { complianceService } from '@/services/complianceService'
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Lock, EyeOff, Loader2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

export default function SchoolComplaints() {
  const { selectedSchool } = useAppStore()
  const [complaints, setComplaints] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null)

  useEffect(() => {
    if (selectedSchool) {
      fetchComplaints()
    }
  }, [selectedSchool])

  const fetchComplaints = async () => {
    setLoading(true)
    try {
      if (!selectedSchool) return
      const data = await complianceService.getComplaintsForSchool(
        selectedSchool.id,
      )
      setComplaints(data)
    } catch (error) {
      console.error(error)
      toast.error('Erro ao carregar denúncias')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (complaint: any) => {
    setSelectedComplaint(complaint)
    setDetailsOpen(true)
  }

  return (
    <div className="container mx-auto p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Denúncias na Instituição
        </h1>
        <p className="text-muted-foreground">
          Acompanhamento de registros de ouvidoria e integridade.
        </p>
      </div>

      <Card className="border-l-4 border-l-blue-500 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-blue-500" />
            <CardTitle>Política de Confidencialidade</CardTitle>
          </div>
          <CardDescription>
            Para garantir a imparcialidade e a integridade da apuração, o
            conteúdo detalhado das denúncias é restrito à Diretoria de
            Compliance. O acesso pela gestão escolar ocorre apenas mediante
            autorização expressa.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : complaints.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Nenhuma denúncia registrada para esta escola.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Protocolo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Visibilidade</TableHead>
                  <TableHead className="text-right">Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {complaints.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono font-medium">
                      {c.protocolo}
                    </TableCell>
                    <TableCell>
                      {new Date(c.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{c.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {!c.autorizado_gestao ? (
                        <div className="flex items-center text-muted-foreground gap-1.5 text-sm">
                          <Lock className="h-3.5 w-3.5" />
                          <span className="text-xs font-medium">
                            Conteúdo Restrito
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center text-green-600 gap-1.5 text-sm">
                          <span className="h-2 w-2 rounded-full bg-green-500" />
                          <span className="text-xs font-medium">
                            Acesso Liberado
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(c)}
                      >
                        Ver Status
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Protocolo</DialogTitle>
            <DialogDescription>
              {selectedComplaint?.protocolo}
            </DialogDescription>
          </DialogHeader>

          {selectedComplaint && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Data:</span>
                  <p className="font-medium">
                    {new Date(selectedComplaint.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status Atual:</span>
                  <Badge className="mt-1">{selectedComplaint.status}</Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Categoria:</span>
                  <p className="font-medium">
                    {selectedComplaint.categoria &&
                    selectedComplaint.categoria.length > 0
                      ? selectedComplaint.categoria.join(', ')
                      : 'Não categorizado'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Tipo:</span>
                  <p className="font-medium">
                    {selectedComplaint.anonimo ? 'Anônima' : 'Identificada'}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-sm font-semibold mb-2">Relato</h4>
                {selectedComplaint.autorizado_gestao ? (
                  <div className="p-4 bg-muted rounded-md text-sm whitespace-pre-wrap">
                    {selectedComplaint.descricao}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 bg-muted/40 rounded-md border border-dashed border-muted-foreground/30 text-center gap-2">
                    <EyeOff className="h-8 w-8 text-muted-foreground/50" />
                    <p className="font-medium text-foreground">
                      Conteúdo Sigiloso
                    </p>
                    <p className="text-xs text-muted-foreground max-w-xs">
                      Este conteúdo está sob análise da Diretoria de Compliance
                      e não foi liberado para visualização da gestão escolar.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
