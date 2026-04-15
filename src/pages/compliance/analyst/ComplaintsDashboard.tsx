import { useState } from 'react'
import { useComplaints } from '@/hooks/useComplaints'
import { useAuth } from '@/hooks/use-auth'
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
import { Eye } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AttachmentList } from '@/components/complaints/AttachmentList'
import type { Complaint } from '@/services/complaintService'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'

export default function ComplaintsDashboard() {
  const { user } = useAuth()
  const { complaints, loading, error } = useComplaints({
    analista_id: user?.id,
  })
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    null,
  )

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Minhas Denúncias</h1>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Protocolo</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Escola</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Gravidade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Skeleton className="h-8 w-full max-w-md mx-auto" />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-destructive"
                >
                  Erro ao carregar denúncias.
                </TableCell>
              </TableRow>
            ) : complaints.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  Nenhuma denúncia encontrada.
                </TableCell>
              </TableRow>
            ) : (
              complaints.map((complaint) => (
                <TableRow key={complaint.id}>
                  <TableCell className="font-medium">
                    {complaint.protocolo}
                  </TableCell>
                  <TableCell>
                    {format(new Date(complaint.created_at), 'dd/MM/yyyy HH:mm')}
                  </TableCell>
                  <TableCell>
                    {complaint.escola_nome || 'Não informada'}
                  </TableCell>
                  <TableCell>
                    {complaint.categoria?.join(', ') || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        complaint.gravidade === 'Alta'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {complaint.gravidade || 'Baixa'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {complaint.status_nome || complaint.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedComplaint(complaint)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Visualizar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={!!selectedComplaint}
        onOpenChange={(open) => !open && setSelectedComplaint(null)}
      >
        <DialogContent className="max-w-lg max-h-screen overflow-y-auto">
          {selectedComplaint && (
            <>
              <DialogHeader>
                <DialogTitle>Detalhes da Denúncia</DialogTitle>
                <DialogDescription>
                  Protocolo: {selectedComplaint.protocolo}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-4 text-sm bg-muted/20 p-3 rounded-lg border">
                  <div>
                    <span className="text-muted-foreground block text-xs uppercase tracking-wider">
                      Escola
                    </span>
                    <span className="font-medium">
                      {selectedComplaint.escola_nome || 'Não informada'}
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
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs uppercase tracking-wider">
                      Categoria
                    </span>
                    <span className="font-medium">
                      {selectedComplaint.categoria?.join(', ') || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs uppercase tracking-wider">
                      Gravidade
                    </span>
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-blue-200 text-blue-600 bg-blue-50">
                      {selectedComplaint.gravidade || 'Baixa'}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-semibold">Relato</Label>
                  <div className="p-4 bg-muted/30 rounded-lg border text-sm text-muted-foreground whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                    {selectedComplaint.descricao}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-semibold">
                    Anexos e Evidências
                  </Label>
                  <div className="pt-2">
                    <AttachmentList
                      attachments={selectedComplaint.attachments}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                <Button
                  variant="secondary"
                  onClick={() => setSelectedComplaint(null)}
                >
                  Fechar
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
