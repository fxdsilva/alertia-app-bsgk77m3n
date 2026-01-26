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
import { Badge } from '@/components/ui/badge'
import { FileCheck, Loader2, Calendar, User, SearchCheck } from 'lucide-react'
import { complianceService } from '@/services/complianceService'
import useAppStore from '@/stores/useAppStore'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'

export default function AuditingDashboard() {
  const { user, profile } = useAppStore()
  const [audits, setAudits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && profile === 'ANALISTA_COMPLIANCE') {
      fetchAudits()
    }
  }, [user, profile])

  const fetchAudits = async () => {
    setLoading(true)
    try {
      if (!user) return
      const data = await complianceService.getAnalystAudits(user.id)
      setAudits(data || [])
    } catch (error) {
      console.error('Error fetching audits:', error)
      toast.error('Erro ao carregar auditorias')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (statusName: string, statusCode: string) => {
    // Using status name or fallback to status code
    const displayStatus = statusName || statusCode || 'Desconhecido'
    const s = displayStatus.toLowerCase()

    if (s.includes('concluída') || s.includes('finalizada')) {
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200"
        >
          {displayStatus}
        </Badge>
      )
    }
    if (s.includes('andamento') || s.includes('análise')) {
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200"
        >
          {displayStatus}
        </Badge>
      )
    }
    if (s.includes('pendente') || s.includes('agendada')) {
      return (
        <Badge
          variant="outline"
          className="bg-yellow-50 text-yellow-700 border-yellow-200"
        >
          {displayStatus}
        </Badge>
      )
    }
    if (s.includes('atrasada') || s.includes('crítica')) {
      return <Badge variant="destructive">{displayStatus}</Badge>
    }

    return <Badge variant="outline">{displayStatus}</Badge>
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 animate-fade-in pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Gestão de Auditorias
        </h1>
        <p className="text-muted-foreground">
          Acompanhamento e rastreamento de auditorias designadas.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-primary" />
            <CardTitle>Minhas Auditorias</CardTitle>
          </div>
          <CardDescription>
            Registros de auditoria sob sua responsabilidade técnica.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {audits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10">
              <SearchCheck className="h-10 w-10 mb-2 opacity-30" />
              <p className="text-lg font-medium">
                Nenhuma auditoria encontrada.
              </p>
              <p className="text-sm">
                As auditorias designadas aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Escola</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Pendências</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {audits.map((audit) => (
                    <TableRow key={audit.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          {format(
                            new Date(audit.data_auditoria),
                            'dd/MM/yyyy',
                            { locale: ptBR },
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {audit.escolas_instituicoes?.nome_escola || 'N/A'}
                      </TableCell>
                      <TableCell>{audit.tipo}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          {audit.responsavel}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(
                          audit.status_auditoria?.nome_status,
                          audit.status,
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {audit.pendencias > 0 ? (
                          <span className="inline-flex items-center justify-center px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                            {audit.pendencias}
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                            0
                          </span>
                        )}
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
