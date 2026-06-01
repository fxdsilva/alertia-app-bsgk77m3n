import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { complianceService } from '@/services/complianceService'
import { Loader2, SearchCheck, Building } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'

const riskColors: Record<string, string> = {
  critico: 'bg-red-100 text-red-700 hover:bg-red-200 border-transparent',
  alto: 'bg-orange-100 text-orange-700 hover:bg-orange-200 border-transparent',
  medio: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-transparent',
  baixo: 'bg-green-100 text-green-700 hover:bg-green-200 border-transparent',
}

const riskLabels: Record<string, string> = {
  critico: 'Crítico',
  alto: 'Alto',
  medio: 'Médio',
  baixo: 'Baixo',
}

export default function DueDiligence() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const data = await complianceService.getAllDueDiligence()
      setRecords(data || [])
    } catch (error) {
      console.error('Error fetching due diligence data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRecords = records.filter((r) => {
    const statusName = (r.status_due_diligence?.nome_status || '').toLowerCase()
    const isActive =
      !statusName.includes('conclu') && !statusName.includes('arquiv')

    const searchLower = search.toLowerCase()
    const matchesSearch =
      (r.fornecedor || '').toLowerCase().includes(searchLower) ||
      (r.tipo_servico || '').toLowerCase().includes(searchLower) ||
      (r.escolas_instituicoes?.nome_escola || '')
        .toLowerCase()
        .includes(searchLower)

    return isActive && matchesSearch
  })

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <SearchCheck className="h-6 w-6 text-primary" />
            </div>
            Investigações em Andamento
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Acompanhe o status e nível de risco das due diligences ativas.
          </p>
        </div>

        <div className="w-full md:w-80">
          <Input
            placeholder="Buscar fornecedor, escola ou serviço..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white shadow-sm border-slate-200"
          />
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white overflow-hidden ring-1 ring-slate-200">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-24 text-slate-400">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <p>Carregando registros de due diligence...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow className="hover:bg-slate-50 border-b-slate-200">
                    <TableHead className="font-semibold text-slate-700">
                      Fornecedor
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Tipo de Serviço
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Escola/Instituição
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Status
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Nível de Risco
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 text-right">
                      Data de Análise
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-16 text-slate-500"
                      >
                        <SearchCheck className="h-12 w-12 mx-auto text-slate-300 mb-4 opacity-50" />
                        <p className="text-lg font-medium text-slate-700">
                          Nenhuma due diligence ativa encontrada
                        </p>
                        <p className="text-sm">
                          Todos os processos de fornecedores parecem estar
                          concluídos.
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRecords.map((record) => (
                      <TableRow
                        key={record.id}
                        className="hover:bg-slate-50 transition-colors border-b-slate-100"
                      >
                        <TableCell className="font-medium text-slate-900">
                          {record.fornecedor}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {record.tipo_servico || '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-slate-600 font-medium">
                            <Building className="h-4 w-4 text-slate-400" />
                            {record.escolas_instituicoes?.nome_escola || '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-slate-100/50 text-slate-700 font-medium whitespace-nowrap"
                          >
                            {record.status_due_diligence?.nome_status ||
                              record.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              riskColors[record.nivel_risco?.toLowerCase()] ||
                              'bg-slate-100 text-slate-700'
                            }
                            variant="secondary"
                          >
                            {riskLabels[record.nivel_risco?.toLowerCase()] ||
                              record.nivel_risco ||
                              'Não definido'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-500 text-right whitespace-nowrap">
                          {record.data_analise
                            ? format(
                                new Date(record.data_analise),
                                'dd/MM/yyyy',
                              )
                            : '-'}
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
    </div>
  )
}
