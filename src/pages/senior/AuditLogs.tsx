import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Loader2, Search, Eye, RefreshCw, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import useAppStore from '@/stores/useAppStore'
import { auditService, LogEntry } from '@/services/auditService'
import { seniorUserService } from '@/services/seniorUserService'
import { LogDetailsDialog } from '@/components/audit/LogDetailsDialog'

export default function AuditLogs() {
  const { profile, loading: appLoading } = useAppStore()
  const navigate = useNavigate()

  const [logs, setLogs] = useState<LogEntry[]>([])
  const [usersMap, setUsersMap] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Details Modal State
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    if (!appLoading && profile !== 'senior') {
      toast.error('Acesso restrito')
      navigate('/')
    }
  }, [profile, appLoading, navigate])

  useEffect(() => {
    if (profile === 'senior') {
      fetchData()
    }
  }, [profile])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch logs and users in parallel
      const [logsData, usersData] = await Promise.all([
        auditService.getLogs({ limit: 100 }),
        seniorUserService.getAllUsers(),
      ])

      setLogs(logsData)

      // Create a map of user_id -> user_name
      const userMap: Record<string, string> = {}
      usersData.forEach((u) => {
        userMap[u.id] = u.nome_usuario
      })
      setUsersMap(userMap)
    } catch (error) {
      console.error(error)
      toast.error('Erro ao carregar logs de auditoria')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (log: LogEntry) => {
    setSelectedLog(log)
    setDialogOpen(true)
  }

  const filteredLogs = logs.filter(
    (log) =>
      log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.user_id &&
        usersMap[log.user_id]
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())),
  )

  if (appLoading) return null

  return (
    <div className="space-y-6 p-6 animate-fade-in pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <ShieldAlert className="h-8 w-8 text-primary" />
          Logs de Auditoria
        </h1>
        <p className="text-muted-foreground">
          Monitoramento de segurança e rastreabilidade de ações no sistema.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Histórico de Atividades</CardTitle>
              <CardDescription>
                Exibindo os últimos 100 registros de atividade do sistema.
              </CardDescription>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar logs..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={fetchData}
                title="Atualizar"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
              <p>Carregando registros...</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Alvo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        Nenhum log encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {format(
                            new Date(log.created_at),
                            'dd/MM/yyyy HH:mm',
                            { locale: ptBR },
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">
                              {log.user_id
                                ? usersMap[log.user_id] ||
                                  'Usuário Desconhecido'
                                : 'Sistema'}
                            </span>
                            {log.user_id && (
                              <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                                ID: {log.user_id.split('-')[0]}...
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="font-mono text-xs"
                          >
                            {log.action_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">
                          {log.table_affected || '-'}
                        </TableCell>
                        <TableCell
                          className="max-w-[300px] truncate text-sm"
                          title={log.description || ''}
                        >
                          {log.description}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(log)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <LogDetailsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        log={selectedLog}
        userName={
          selectedLog?.user_id ? usersMap[selectedLog.user_id] : 'Sistema'
        }
      />
    </div>
  )
}
