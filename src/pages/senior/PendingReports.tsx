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
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Loader2, Eye, AlertTriangle, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import useAppStore from '@/stores/useAppStore'
import { useNavigate } from 'react-router-dom'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

// define local interface
interface Complaint {
  id: string
  protocolo: string
  created_at: string
  descricao: string
  anonimo: boolean
  escolas_instituicoes: { nome_escola: string } | null
  status_denuncia: { nome_status: string } | null
}

export default function PendingReports() {
  const { profile, loading: appLoading } = useAppStore()
  const navigate = useNavigate()
  const [reports, setReports] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)

  // Details Dialog
  const [selectedReport, setSelectedReport] = useState<Complaint | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  // Delete Dialog
  const [deleteReport, setDeleteReport] = useState<Complaint | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!appLoading) {
      if (profile !== 'senior') {
        navigate('/')
        return
      }
      fetchReports()
    }
  }, [profile, appLoading, navigate])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('denuncias')
        .select(
          `
          id,
          protocolo,
          created_at,
          descricao,
          anonimo,
          escolas_instituicoes ( nome_escola ),
          status_denuncia ( nome_status )
        `,
        )
        .order('created_at', { ascending: false })

      if (error) throw error
      setReports(data as unknown as Complaint[])
    } catch (error) {
      console.error(error)
      toast.error('Erro ao carregar denúncias')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDetails = (report: Complaint) => {
    setSelectedReport(report)
    setDetailOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteReport) return
    setIsDeleting(true)
    try {
      const { error } = await supabase.rpc('delete_denuncia', {
        p_denuncia_id: deleteReport.id,
      })

      if (error) throw error

      toast.success('Denúncia excluída com sucesso')
      setDeleteReport(null)
      setDetailOpen(false)
      fetchReports()
    } catch (error) {
      console.error(error)
      toast.error('Erro ao excluir denúncia')
    } finally {
      setIsDeleting(false)
    }
  }

  if (appLoading) return null

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <AlertTriangle className="h-8 w-8 text-primary" />
          Gestão de Denúncias
        </h1>
        <p className="text-muted-foreground">
          Visão geral de todas as ocorrências na rede em todas as etapas. O
          perfil sênior possui acesso integral e permissão de exclusão.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todas as Denúncias</CardTitle>
          <CardDescription>
            Mostrando {reports.length} ocorrências cadastradas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Nenhuma denúncia encontrada.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Protocolo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Escola</TableHead>
                  <TableHead>Etapa/Status</TableHead>
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
                      <Badge variant="outline" className="bg-primary/10">
                        {r.status_denuncia?.nome_status || 'Sem status'}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[250px] truncate">
                      {r.descricao}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDetails(r)}
                        >
                          <Eye className="h-4 w-4" /> Detalhes
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setDeleteReport(r)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
                  <div className="mt-1">
                    <Badge variant="outline" className="bg-primary/10">
                      {selectedReport.status_denuncia?.nome_status ||
                        'Sem status'}
                    </Badge>
                  </div>
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

          <DialogFooter className="flex justify-between w-full sm:justify-between">
            <Button
              variant="destructive"
              onClick={() => {
                setDetailOpen(false)
                setTimeout(() => setDeleteReport(selectedReport), 200)
              }}
            >
              Excluir Denúncia
            </Button>
            <DialogClose asChild>
              <Button variant="secondary">Fechar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteReport}
        onOpenChange={(o) => !o && setDeleteReport(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir denúncia?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a denúncia protocolo{' '}
              <strong>{deleteReport?.protocolo}</strong>? Esta ação é
              irreversível e removerá todos os dados associados a ela em todas
              as etapas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
