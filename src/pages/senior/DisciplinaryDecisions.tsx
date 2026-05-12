import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { supabase } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Gavel, AlertTriangle, Eye, ShieldAlert, FileText } from 'lucide-react'

export default function DisciplinaryDecisions() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRecord, setSelectedRecord] = useState<any>(null)

  useEffect(() => {
    fetchRecords()
  }, [])

  async function fetchRecords() {
    try {
      const { data, error } = await supabase
        .from('processos_disciplinares')
        .select(
          `
          *,
          escola:escolas_instituicoes(nome_escola),
          status_obj:status_processo_disciplinar(nome_status),
          denuncia:denuncias(protocolo, gravidade, categoria)
        `,
        )
        .order('created_at', { ascending: false })

      if (error) throw error
      setRecords(data || [])
    } catch (err) {
      console.error('Error fetching disciplinary processes:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase() || ''
    if (s.includes('conclu')) return 'bg-green-100 text-green-800'
    if (s.includes('andamento') || s.includes('curso'))
      return 'bg-blue-100 text-blue-800'
    if (s.includes('abert') || s.includes('pendent'))
      return 'bg-yellow-100 text-yellow-800'
    return 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Gavel className="h-8 w-8 text-primary" />
          Decisões Disciplinares
        </h1>
        <p className="text-muted-foreground text-lg">
          Registro e rastreamento de sanções e processos disciplinares aplicados
          na instituição, com vínculo direto aos perfis de risco e denúncias
          relatadas.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Processos
            </CardTitle>
            <Gavel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{records.length}</div>
            <p className="text-xs text-muted-foreground">
              Registros ativos e passados
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Casos Críticos/Alta Severidade
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {
                records.filter(
                  (r) =>
                    r.denuncia?.gravidade === 'Alta' ||
                    r.denuncia?.gravidade === 'Crítica',
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Requerem atenção redobrada
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Processos Concluídos
            </CardTitle>
            <ShieldAlert className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {
                records.filter(
                  (r) =>
                    r.status_obj?.nome_status
                      ?.toLowerCase()
                      .includes('conclu') ||
                    r.status?.toLowerCase().includes('conclu'),
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Com decisão final aplicada
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Sanções e Processos</CardTitle>
          <CardDescription>
            Lista completa de processos disciplinares para análise de
            conformidade e integridade institucional.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">Carregando...</div>
          ) : records.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              Nenhum processo disciplinar registrado.
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título do Processo</TableHead>
                    <TableHead>Instituição</TableHead>
                    <TableHead>Data de Abertura</TableHead>
                    <TableHead>Vínculo (Denúncia)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell
                        className="font-medium max-w-[250px] truncate"
                        title={record.titulo}
                      >
                        {record.titulo}
                      </TableCell>
                      <TableCell>{record.escola?.nome_escola || '-'}</TableCell>
                      <TableCell>
                        {record.data_abertura
                          ? format(
                              new Date(record.data_abertura),
                              'dd/MM/yyyy',
                              { locale: ptBR },
                            )
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {record.denuncia ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {record.denuncia.protocolo}
                            </span>
                            {record.denuncia.gravidade && (
                              <Badge
                                variant="outline"
                                className={
                                  record.denuncia.gravidade === 'Alta' ||
                                  record.denuncia.gravidade === 'Crítica'
                                    ? 'text-red-600 border-red-200 bg-red-50'
                                    : ''
                                }
                              >
                                {record.denuncia.gravidade}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getStatusColor(
                            record.status_obj?.nome_status || record.status,
                          )}
                          variant="outline"
                        >
                          {record.status_obj?.nome_status || record.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedRecord(record)}
                            >
                              <Eye className="h-4 w-4 mr-2" /> Detalhes
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[650px]">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2 text-xl">
                                <Gavel className="h-5 w-5 text-primary" />
                                Detalhes do Processo Disciplinar
                              </DialogTitle>
                              <DialogDescription>
                                Processo ID:{' '}
                                <span className="font-mono text-xs">
                                  {record.id}
                                </span>
                              </DialogDescription>
                            </DialogHeader>
                            {selectedRecord && (
                              <div className="space-y-5 mt-4">
                                <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg border">
                                  <div>
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                      Título
                                    </h4>
                                    <p className="text-sm font-medium">
                                      {selectedRecord.titulo}
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                      Instituição
                                    </h4>
                                    <p className="text-sm">
                                      {selectedRecord.escola?.nome_escola ||
                                        'Não associado'}
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                      Status Atual
                                    </h4>
                                    <Badge
                                      className={getStatusColor(
                                        selectedRecord.status_obj
                                          ?.nome_status ||
                                          selectedRecord.status,
                                      )}
                                      variant="outline"
                                    >
                                      {selectedRecord.status_obj?.nome_status ||
                                        selectedRecord.status}
                                    </Badge>
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                      Data de Abertura
                                    </h4>
                                    <p className="text-sm">
                                      {selectedRecord.data_abertura
                                        ? format(
                                            new Date(
                                              selectedRecord.data_abertura,
                                            ),
                                            'dd/MM/yyyy',
                                            { locale: ptBR },
                                          )
                                        : 'Não informada'}
                                    </p>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
                                    Descrição dos Fatos
                                  </h4>
                                  <div className="bg-muted/50 p-3 rounded-md text-sm leading-relaxed whitespace-pre-wrap border">
                                    {selectedRecord.descricao || (
                                      <span className="italic text-muted-foreground">
                                        Nenhuma descrição fornecida para este
                                        processo.
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div>
                                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
                                    Decisão / Sanção Aplicada
                                  </h4>
                                  <div className="bg-primary/5 border border-primary/20 p-4 rounded-md text-sm text-foreground shadow-sm">
                                    {selectedRecord.decisao ? (
                                      selectedRecord.decisao
                                    ) : (
                                      <span className="italic text-muted-foreground flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4" />{' '}
                                        Decisão pendente ou não registrada no
                                        sistema.
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {selectedRecord.denuncia && (
                                  <div className="border-t pt-4">
                                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                                      <FileText className="h-4 w-4 text-blue-500" />
                                      Vínculo de Denúncia Originária
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3 text-sm bg-blue-50/50 p-4 rounded-md border border-blue-100">
                                      <div>
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                                          Protocolo
                                        </span>
                                        <span className="font-mono">
                                          {selectedRecord.denuncia.protocolo}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                                          Gravidade
                                        </span>
                                        <span
                                          className={
                                            selectedRecord.denuncia
                                              .gravidade === 'Alta' ||
                                            selectedRecord.denuncia
                                              .gravidade === 'Crítica'
                                              ? 'text-red-600 font-medium'
                                              : ''
                                          }
                                        >
                                          {selectedRecord.denuncia.gravidade ||
                                            'Não classificada'}
                                        </span>
                                      </div>
                                      <div className="col-span-2">
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                                          Categorias Identificadas
                                        </span>
                                        {selectedRecord.denuncia.categoria &&
                                        selectedRecord.denuncia.categoria
                                          .length > 0 ? (
                                          <div className="flex flex-wrap gap-1 mt-1">
                                            {selectedRecord.denuncia.categoria.map(
                                              (cat: string) => (
                                                <Badge
                                                  key={cat}
                                                  variant="secondary"
                                                  className="text-xs"
                                                >
                                                  {cat}
                                                </Badge>
                                              ),
                                            )}
                                          </div>
                                        ) : (
                                          <span className="text-muted-foreground">
                                            Não categorizada
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
