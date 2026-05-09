import { useParams, useNavigate } from 'react-router-dom'
import { useComplaint } from '@/hooks/useComplaints'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ArrowLeft,
  FileWarning,
  ShieldAlert,
  User,
  Building,
  History,
} from 'lucide-react'
import { AttachmentList } from '@/components/complaints/AttachmentList'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { supabase } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'

export default function ComplaintDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { complaint, loading, error } = useComplaint(id)

  const [logs, setLogs] = useState<any[]>([])
  const [pareceres, setPareceres] = useState<any[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)

  useEffect(() => {
    if (!id) return
    const fetchDetails = async () => {
      setLoadingLogs(true)
      const [logsRes, pareceresRes] = await Promise.all([
        supabase
          .from('compliance_workflow_logs')
          .select('*, usuarios_escola(nome_usuario, perfil)')
          .eq('complaint_id', id)
          .order('created_at', { ascending: false }),
        supabase
          .from('workflow_pareceres')
          .select('*, usuarios_escola(nome_usuario, perfil)')
          .eq('denuncia_id', id)
          .order('fase', { ascending: true }),
      ])
      setLogs(logsRes.data || [])
      setPareceres(pareceresRes.data || [])
      setLoadingLogs(false)
    }
    fetchDetails()
  }, [id])

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-1/4" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !complaint) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-[50vh]">
        <ShieldAlert className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold">
          Denúncia não encontrada ou sem permissão
        </h2>
        <p className="text-muted-foreground mb-6">
          Verifique se você tem acesso a esta denúncia.
        </p>
        <Button onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Protocolo: {complaint.protocolo}
            </h1>
            <p className="text-sm text-muted-foreground">
              Registrada em{' '}
              {format(
                new Date(complaint.created_at),
                "dd 'de' MMMM 'de' yyyy, HH:mm",
                { locale: ptBR },
              )}
            </p>
          </div>
        </div>
        <Badge
          variant={complaint.status === 'pendente' ? 'secondary' : 'default'}
          className="text-sm px-3 py-1.5 h-auto whitespace-normal text-center max-w-[250px] leading-tight"
        >
          {complaint.status_nome || complaint.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileWarning className="mr-2 h-5 w-5" />
                Relato da Denúncia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/30 p-4 rounded-md border text-sm leading-relaxed whitespace-pre-wrap">
                {complaint.descricao}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Anexos e Evidências</CardTitle>
              <CardDescription>
                Documentos e arquivos enviados para análise.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AttachmentList attachments={complaint.attachments} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileWarning className="mr-2 h-5 w-5" />
                Pareceres e Relatos
              </CardTitle>
              <CardDescription>
                Análises e conclusões da equipe de compliance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const directorConclusions = logs.filter(
                  (log) =>
                    log.usuarios_escola?.perfil === 'DIRETOR_COMPLIANCE' &&
                    log.comments &&
                    log.comments.trim() !== '' &&
                    [
                      'encerrada',
                      'concluída',
                      'arquivada',
                      'resolvido',
                      'arquivamento aprovado',
                    ].some((s) => log.new_status?.toLowerCase().includes(s)),
                )

                if (loadingLogs) {
                  return (
                    <div className="space-y-3">
                      <Skeleton className="h-20 w-full rounded-md" />
                    </div>
                  )
                }

                if (
                  pareceres.length === 0 &&
                  directorConclusions.length === 0 &&
                  !(complaint as any).parecer_1
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

                    {(complaint as any).parecer_1 && pareceres.length === 0 && (
                      <div className="bg-muted/30 border rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between border-b pb-2">
                          <span className="font-semibold text-sm">
                            Parecer do Analista
                          </span>
                        </div>
                        <div className="text-sm whitespace-pre-wrap text-muted-foreground">
                          {(complaint as any).parecer_1}
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
                          {log.usuarios_escola?.nome_usuario || 'Sistema'} •{' '}
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <History className="mr-2 h-5 w-5" />
                Histórico de Ações
              </CardTitle>
              <CardDescription>
                Registro de movimentações e decisões.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingLogs ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full rounded-md" />
                  <Skeleton className="h-16 w-full rounded-md" />
                </div>
              ) : logs.length === 0 ? (
                <div className="p-4 border border-dashed rounded-lg text-center text-muted-foreground text-sm">
                  Nenhum registro de histórico encontrado para esta denúncia.
                </div>
              ) : (
                <div className="relative space-y-4 pl-4 before:absolute before:inset-y-0 before:left-[7px] before:w-[2px] before:bg-muted">
                  {logs.map((log) => (
                    <div key={log.id} className="relative pl-6">
                      <div className="absolute left-[-13px] top-1.5 h-3 w-3 rounded-full border-2 border-background bg-primary" />
                      <div className="bg-muted/30 border rounded-lg p-4">
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
                          <div className="text-sm text-muted-foreground bg-background border p-3 rounded-md mb-2 whitespace-pre-wrap">
                            {log.comments}
                          </div>
                        )}

                        <div className="text-xs text-muted-foreground font-medium mt-2">
                          Por: {log.usuarios_escola?.nome_usuario || 'Sistema'}
                          {log.usuarios_escola?.perfil &&
                            ` • ${log.usuarios_escola.perfil.replace(/_/g, ' ')}`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detalhes da Ocorrência</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-sm font-medium text-muted-foreground block mb-1">
                  Escola / Instituição
                </span>
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">
                    {complaint.escola_nome || 'Não informada'}
                  </span>
                </div>
              </div>
              <Separator />
              <div>
                <span className="text-sm font-medium text-muted-foreground block mb-1">
                  Gravidade
                </span>
                <Badge
                  variant={
                    complaint.gravidade === 'Alta' ? 'destructive' : 'secondary'
                  }
                >
                  {complaint.gravidade || 'Não classificada'}
                </Badge>
              </div>
              <Separator />
              <div>
                <span className="text-sm font-medium text-muted-foreground block mb-1">
                  Categorias
                </span>
                <div className="flex flex-wrap gap-2">
                  {complaint.categoria && complaint.categoria.length > 0 ? (
                    complaint.categoria.map((cat, i) => (
                      <Badge key={i} variant="outline">
                        {cat}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm">Não categorizada</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Denunciante</CardTitle>
            </CardHeader>
            <CardContent>
              {complaint.anonimo ? (
                <div className="flex items-center text-muted-foreground bg-muted/50 p-3 rounded-md">
                  <User className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">Denúncia Anônima</span>
                </div>
              ) : (
                <div className="space-y-3 bg-muted/30 p-4 rounded-md border">
                  <div>
                    <span className="text-xs font-medium text-muted-foreground block">
                      Nome
                    </span>
                    <span className="text-sm font-medium">
                      {complaint.denunciante_nome || 'Não informado'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-muted-foreground block">
                      Vínculo
                    </span>
                    <span className="text-sm">
                      {complaint.denunciante_vinculo || 'Não informado'}
                    </span>
                  </div>
                  {(complaint.denunciante_email ||
                    complaint.denunciante_telefone) && (
                    <div className="pt-2 border-t mt-2">
                      <span className="text-xs font-medium text-muted-foreground block mb-1">
                        Contato
                      </span>
                      {complaint.denunciante_email && (
                        <span className="text-sm block truncate">
                          {complaint.denunciante_email}
                        </span>
                      )}
                      {complaint.denunciante_telefone && (
                        <span className="text-sm block">
                          {complaint.denunciante_telefone}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
