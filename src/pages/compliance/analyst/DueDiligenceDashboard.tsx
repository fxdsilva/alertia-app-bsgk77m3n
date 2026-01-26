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
import {
  SearchCheck,
  Loader2,
  Calendar,
  Building2,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react'
import { complianceService } from '@/services/complianceService'
import useAppStore from '@/stores/useAppStore'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'

export default function DueDiligenceDashboard() {
  const { user, profile } = useAppStore()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && profile === 'ANALISTA_COMPLIANCE') {
      fetchData()
    }
  }, [user, profile])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (!user) return
      const data = await complianceService.getAnalystDueDiligence(user.id)
      setItems(data || [])
    } catch (error) {
      console.error('Error fetching due diligence:', error)
      toast.error('Erro ao carregar dados de Due Diligence')
    } finally {
      setLoading(false)
    }
  }

  const getRiskBadge = (risk: string | null) => {
    const r = (risk || 'Desconhecido').toLowerCase()

    if (r.includes('crítico') || r.includes('alto')) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          {risk || 'Alto'}
        </Badge>
      )
    }
    if (r.includes('médio')) {
      return (
        <Badge
          variant="secondary"
          className="bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200 gap-1"
        >
          <AlertTriangle className="h-3 w-3" />
          {risk || 'Médio'}
        </Badge>
      )
    }
    if (r.includes('baixo')) {
      return (
        <Badge
          variant="secondary"
          className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200 gap-1"
        >
          <ShieldCheck className="h-3 w-3" />
          {risk || 'Baixo'}
        </Badge>
      )
    }

    return <Badge variant="outline">{risk || 'N/A'}</Badge>
  }

  const getStatusBadge = (statusName: string | undefined) => {
    const s = (statusName || 'Desconhecido').toLowerCase()

    if (s.includes('aprovado') || s.includes('concluído')) {
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200"
        >
          {statusName}
        </Badge>
      )
    }
    if (s.includes('reprovado')) {
      return <Badge variant="destructive">{statusName}</Badge>
    }
    if (s.includes('andamento') || s.includes('análise')) {
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200"
        >
          {statusName}
        </Badge>
      )
    }

    return (
      <Badge
        variant="outline"
        className="bg-yellow-50 text-yellow-700 border-yellow-200"
      >
        {statusName || 'Pendente'}
      </Badge>
    )
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
        <h1 className="text-3xl font-bold tracking-tight">Due Diligence</h1>
        <p className="text-muted-foreground">
          Análise de riscos de fornecedores e parceiros.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <SearchCheck className="h-5 w-5 text-primary" />
            <CardTitle>Processos em Análise</CardTitle>
          </div>
          <CardDescription>
            Lista de verificações de conformidade sob sua responsabilidade.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10">
              <SearchCheck className="h-10 w-10 mb-2 opacity-30" />
              <p className="text-lg font-medium">Nenhum processo encontrado.</p>
              <p className="text-sm">
                As análises de due diligence aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data Análise</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Tipo Serviço</TableHead>
                    <TableHead>Escola</TableHead>
                    <TableHead>Risco</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          {item.data_analise
                            ? format(
                                new Date(item.data_analise),
                                'dd/MM/yyyy',
                                { locale: ptBR },
                              )
                            : '-'}
                        </div>
                      </TableCell>
                      <TableCell>{item.fornecedor}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {item.tipo_servico || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                          {item.escolas_instituicoes?.nome_escola || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>{getRiskBadge(item.nivel_risco)}</TableCell>
                      <TableCell>
                        {getStatusBadge(item.status_due_diligence?.nome_status)}
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
