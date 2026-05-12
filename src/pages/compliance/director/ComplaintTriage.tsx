import { useState, useEffect } from 'react'
import { useComplaints } from '@/hooks/useComplaints'
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
import { Eye, History } from 'lucide-react'
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
import { Separator } from '@/components/ui/separator'
import { supabase } from '@/lib/supabase/client'

export default function ComplaintTriage() {
  const { complaints, loading, error } = useComplaints()
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    null,
  )
  const [logs, setLogs] = useState<any[]>([])
  const [pareceres, setPareceres] = useState<any[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)

  useEffect(() => {
    if (!selectedComplaint) {
      setLogs([])
      setPareceres([])
      return
    }
    const fetchDetails = async () => {
      setLoadingLogs(true)
      const [logsRes, pareceresRes] = await Promise.all([
        supabase
          .from('compliance_workflow_logs')
          .select('*, usuarios_escola(nome_usuario, perfil)')
          .eq('complaint_id', selectedComplaint.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('workflow_pareceres')
          .select('*, usuarios_escola(nome_usuario, perfil)')
          .eq('denuncia_id', selectedComplaint.id)
          .order('fase', { ascending: true }),
      ])
      setLogs(logsRes.data || [])
      setPareceres(pareceresRes.data || [])
      setLoadingLogs(false)
    }
    fetchDetails()
  }, [selectedComplaint])

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Triagem de Denúncias
        </h1>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : error ? (
        <div className="text-center py-8 text-destructive border rounded-md bg-card">
          Erro ao carregar denúncias.
        </div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground border rounded-md bg-card">
          Nenhuma denúncia encontrada.
        </div>
      ) : (
        <>
          {/* Mobile View */}
          <div className="md:hidden space-y-4">
            {complaints.map((complaint) => (
              <div
                key={complaint.id}
                className="bg-card border rounded-lg p-4 space-y-3 shadow-sm"
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="font-semibold">{complaint.protocolo}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(
                        new Date(complaint.created_at),
                        'dd/MM/yyyy HH:mm',
                      )}
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[10px] sm:text-xs text-center whitespace-normal leading-tight px-2 py-1 h-auto max-w-[140px]"
                  >
                    {complaint.status_nome || complaint.status}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground text-[10px] uppercase tracking-wider block mb-0.5">
                      Escola
                    </span>
                    <span className="font-medium line-clamp-1">
                      {complaint.escola_nome || 'Não informada'}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground text-[10px] uppercase tracking-wider block mb-0.5">
                      Categoria
                    </span>
                    <span className="line-clamp-1">
                      {complaint.categoria?.join(', ') || '-'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t mt-3">
                  <Badge
                    variant={
                      complaint.gravidade === 'Alta'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {complaint.gravidade || 'Baixa'}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedComplaint(complaint)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Visualizar
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View */}
          <div className="hidden md:block rounded-md border bg-card">
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
                {complaints.map((complaint) => (
                  <TableRow key={complaint.id}>
                    <TableCell className="font-medium">
                      {complaint.protocolo}
                    </TableCell>
                    <TableCell>
                      {format(
                        new Date(complaint.created_at),
                        'dd/MM/yyyy HH:mm',
                      )}
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
                    <TableCell className="max-w-[200px]">
                      <Badge
                        variant="outline"
                        className="inline-flex items-center justify-center whitespace-normal text-center min-w-[120px] w-full py-1.5 px-3 h-auto leading-tight"
                      >
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
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <Dialog
        open={!!selectedComplaint}
        onOpenChange={(open) => !open && setSelectedComplaint(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedComplaint && (
            <>
              <DialogHeader>
                <DialogTitle>Detalhes da Denúncia</DialogTitle>
                <DialogDescription>
                  Protocolo: {selectedComplaint.protocolo}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-2">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-muted/20 p-4 rounded-lg border">
                  <div className="col-span-2 md:col-span-1">
                    <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">
                      Escola
                    </span>
                    <span className="font-medium">
                      {selectedComplaint.escola_nome || 'Não informada'}
                    </span>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">
                      Data
                    </span>
                    <span className="font-medium">
                      {format(
                        new Date(selectedComplaint.created_at),
                        'dd/MM/yyyy HH:mm',
                      )}
                    </span>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">
                      Categoria
                    </span>
                    <span className="font-medium">
                      {selectedComplaint.categoria?.join(', ') || '-'}
                    </span>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">
                      Gravidade
                    </span>
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-blue-50 text-blue-600 border-blue-200">
                      {selectedComplaint.gravidade || 'Baixa'}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-semibold">Relato</Label>
                  <div className="p-4 bg-muted/30 rounded-lg border text-sm text-muted-foreground whitespace-pre-wrap max-h-[250px] overflow-y-auto">
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

                <Separator />

                <div className="space-y-2">
                  <Label className="text-base font-semibold">
                    Pareceres e Relatos
                  </Label>
                  <div className="pt-2">
                    {(() => {
                      const directorConclusions = logs.filter(
                        (log) =>
                          log.usuarios_escola?.perfil ===
                            'DIRETOR_COMPLIANCE' &&
                          log.comments &&
                          log.comments.trim() !== '' &&
                          [
                            'encerrada',
                            'concluída',
                            'arquivada',
                            'resolvido',
                            'arquivamento aprovado',
                          ].some((s) =>
                            log.new_status?.toLowerCase().includes(s),
                          ),
                      )

                      if (
                        pareceres.length === 0 &&
                        directorConclusions.length === 0 &&
                        !(selectedComplaint as any).parecer_1
                      ) {
                        return (
                          <div className="p-4 border border-dashed rounded-lg text-center text-muted-foreground text-sm">
                            Nenhum relato ou parecer registrado até o momento.
                          </div>
                        )
                      }

                      return (
                        <div className="space-y-4">
                          {pareceres.map((p) => (
                            <div
                              key={p.id}
                              className="bg-muted/30 border rounded-lg p-4 space-y-2"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2">
                                <span className="font-semibold text-sm">
                                  Fase {p.fase} - Parecer do Analista
                                </span>
                                <Badge
                                  variant={
                                    p.conclusao === 'Procedente'
                                      ? 'destructive'
                                      : p.conclusao === 'Improcedente'
                                        ? 'secondary'
                                        : 'default'
                                  }
                                >
                                  {p.conclusao}
                                </Badge>
                              </div>
                              <div className="text-sm whitespace-pre-wrap text-muted-foreground">
                                {p.parecer_texto || 'Sem texto de parecer.'}
                              </div>
                              <div className="text-xs text-muted-foreground font-medium pt-2 border-t">
                                Analista:{' '}
                                {p.usuarios_escola?.nome_usuario || 'Sistema'}
                              </div>
                            </div>
                          ))}

                          {(selectedComplaint as any).parecer_1 &&
                            pareceres.length === 0 && (
                              <div className="bg-muted/30 border rounded-lg p-4 space-y-2">
                                <div className="flex items-center justify-between border-b pb-2">
                                  <span className="font-semibold text-sm">
                                    Parecer do Analista
                                  </span>
                                </div>
                                <div className="text-sm whitespace-pre-wrap text-muted-foreground">
                                  {(selectedComplaint as any).parecer_1}
                                </div>
                              </div>
                            )}

                          {directorConclusions.map((log) => (
                            <div
                              key={log.id}
                              className="bg-primary/5 border-primary/20 border rounded-lg p-4 space-y-2"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-primary/10 pb-2">
                                <span className="font-semibold text-sm text-primary">
                                  Conclusão do Diretor
                                </span>
                                <Badge
                                  variant="default"
                                  className="bg-primary text-primary-foreground"
                                >
                                  {log.new_status}
                                </Badge>
                              </div>
                              <div className="text-sm whitespace-pre-wrap text-foreground">
                                {log.comments}
                              </div>
                              <div className="text-xs text-muted-foreground font-medium pt-2 border-t border-primary/10">
                                Diretor:{' '}
                                {log.usuarios_escola?.nome_usuario || 'Sistema'}{' '}
                                •{' '}
                                {format(
                                  new Date(log.created_at),
                                  "dd/MM/yyyy 'às' HH:mm",
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    })()}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <History className="h-5 w-5 text-muted-foreground" />
                    <Label className="text-base font-semibold">
                      Histórico de Ações
                    </Label>
                  </div>

                  {loadingLogs ? (
                    <div className="space-y-3">
                      <Skeleton className="h-16 w-full rounded-md" />
                      <Skeleton className="h-16 w-full rounded-md" />
                    </div>
                  ) : logs.length === 0 ? (
                    <div className="p-4 border border-dashed rounded-lg text-center text-muted-foreground text-sm">
                      Nenhum registro de histórico encontrado para esta
                      denúncia.
                    </div>
                  ) : (
                    <div className="relative space-y-4 pl-4 before:absolute before:inset-y-0 before:left-[7px] before:w-[2px] before:bg-muted">
                      {logs.map((log) => (
                        <div key={log.id} className="relative pl-6">
                          <div className="absolute left-[-13px] top-1.5 h-3 w-3 rounded-full border-2 border-background bg-primary" />
                          <div className="bg-muted/30 border rounded-lg p-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                              <span className="font-semibold text-sm">
                                {log.new_status}
                              </span>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {format(
                                  new Date(log.created_at),
                                  "dd/MM/yyyy 'às' HH:mm",
                                )}
                              </span>
                            </div>

                            {log.comments && (
                              <div className="text-sm text-muted-foreground bg-background border p-2 rounded-md mb-2 whitespace-pre-wrap">
                                {log.comments}
                              </div>
                            )}

                            <div className="text-xs text-muted-foreground font-medium">
                              Por:{' '}
                              {log.usuarios_escola?.nome_usuario || 'Sistema'}
                              {log.usuarios_escola?.perfil &&
                                ` • ${log.usuarios_escola.perfil.replace(/_/g, ' ')}`}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4 border-t">
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
