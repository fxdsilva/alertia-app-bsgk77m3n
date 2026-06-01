import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useComplaints } from '@/hooks/useComplaints'
import { Search, ArrowUpDown, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function SeniorDashboard() {
  const { complaints, loading } = useComplaints()
  const [search, setSearch] = useState('')
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: 'asc' | 'desc'
  } | null>(null)

  // Derived metrics for UI matching the requested design
  const stats = {
    escolas: 3,
    usuarios: 0,
    alertas:
      complaints.filter(
        (c) =>
          c.gravidade?.toLowerCase().includes('alta') ||
          c.gravidade?.toLowerCase().includes('crítica'),
      ).length || 0,
    taxa: 0,
  }

  const severityOrder: Record<string, number> = {
    baixa: 1,
    média: 2,
    media: 2,
    alta: 3,
    crítica: 4,
    critica: 4,
  }

  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) =>
      c.protocolo?.toLowerCase().includes(search.toLowerCase()),
    )
  }, [complaints, search])

  const sortedComplaints = useMemo(() => {
    const sorted = [...filteredComplaints]
    if (sortConfig !== null) {
      sorted.sort((a, b) => {
        if (sortConfig.key === 'data') {
          const aTime = new Date(a.created_at).getTime()
          const bTime = new Date(b.created_at).getTime()
          return sortConfig.direction === 'asc' ? aTime - bTime : bTime - aTime
        }
        if (sortConfig.key === 'gravidade') {
          const aSev = severityOrder[a.gravidade?.toLowerCase() || ''] || 0
          const bSev = severityOrder[b.gravidade?.toLowerCase() || ''] || 0
          return sortConfig.direction === 'asc' ? aSev - bSev : bSev - aSev
        }
        return 0
      })
    }
    return sorted
  }, [filteredComplaints, sortConfig])

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'desc'
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'desc'
    ) {
      direction = 'asc'
    }
    setSortConfig({ key, direction })
  }

  const getSeverityBadge = (severity?: string | null) => {
    if (!severity) return <Badge variant="outline">Não classificada</Badge>
    const lower = severity.toLowerCase()
    if (lower.includes('alta') || lower.includes('crítica')) {
      return (
        <Badge className="bg-red-500 hover:bg-red-600 border-transparent text-white">
          {severity}
        </Badge>
      )
    }
    if (lower.includes('média') || lower.includes('media')) {
      return (
        <Badge className="bg-amber-500 hover:bg-amber-600 border-transparent text-white">
          {severity}
        </Badge>
      )
    }
    return (
      <Badge className="bg-blue-500 hover:bg-blue-600 border-transparent text-white">
        {severity}
      </Badge>
    )
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-8 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Dashboard Senior
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Capacitação Card */}
        <Card className="border-t-4 border-t-purple-500 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow min-w-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground truncate">
              Capacitação
            </CardTitle>
            <div className="text-2xl font-bold text-purple-700 mt-2 leading-tight">
              Portal
              <br />
              de
              <br />
              Cursos
            </div>
          </CardHeader>
          <CardContent className="pt-0 pb-4 mt-auto">
            <p className="text-xs text-muted-foreground mb-4 truncate">
              Acessar treinamentos
            </p>
            <Button
              variant="outline"
              className="w-full text-purple-700 border-purple-200 hover:bg-purple-50 text-xs sm:text-sm h-auto py-2 whitespace-normal"
            >
              Abrir Portal
            </Button>
          </CardContent>
        </Card>

        {/* Total de Escolas Card */}
        <Card className="border-t-4 border-t-blue-500 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow min-w-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground truncate">
              Total de Escolas
            </CardTitle>
            <div className="text-4xl font-bold text-slate-900 mt-2">
              {stats.escolas}
            </div>
          </CardHeader>
          <CardContent className="pt-0 pb-4 mt-auto">
            <p className="text-xs text-muted-foreground mb-4 truncate">
              Instituições monitoradas
            </p>
            <Button
              variant="outline"
              className="w-full text-blue-700 border-blue-200 hover:bg-blue-50 text-xs sm:text-sm h-auto py-2 whitespace-normal"
            >
              Ver Escolas
            </Button>
          </CardContent>
        </Card>

        {/* Usuários Ativos Card */}
        <Card className="border-t-4 border-t-indigo-600 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow min-w-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground truncate">
              Usuários Ativos
            </CardTitle>
            <div className="text-4xl font-bold text-slate-900 mt-2">
              {stats.usuarios}
            </div>
          </CardHeader>
          <CardContent className="pt-0 pb-4 mt-auto">
            <p className="text-xs text-muted-foreground mb-4 truncate">
              Gestores e colaboradores
            </p>
            <Button
              variant="outline"
              className="w-full text-indigo-700 border-indigo-200 hover:bg-indigo-50 text-xs sm:text-sm h-auto py-2 whitespace-normal"
            >
              Gerenciar
            </Button>
          </CardContent>
        </Card>

        {/* Alertas Críticos Card */}
        <Card className="border-t-4 border-t-red-500 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow min-w-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground truncate">
              Alertas Críticos
            </CardTitle>
            <div className="text-4xl font-bold text-red-500 mt-2">
              {stats.alertas}
            </div>
          </CardHeader>
          <CardContent className="pt-0 pb-4 mt-auto">
            <p className="text-xs text-muted-foreground mb-4 truncate">
              Requerem atenção imediata
            </p>
            <Button
              variant="outline"
              className="w-full text-red-600 border-red-200 hover:bg-red-50 text-xs sm:text-sm h-auto py-2 whitespace-normal"
            >
              Ver Alertas
            </Button>
          </CardContent>
        </Card>

        {/* Taxa de Resolução Card */}
        <Card className="border-t-4 border-t-green-500 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow min-w-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground truncate">
              Taxa de Resolução
            </CardTitle>
            <div className="text-4xl font-bold text-green-600 mt-2">
              {stats.taxa}%
            </div>
          </CardHeader>
          <CardContent className="pt-0 pb-4 mt-auto">
            <p className="text-xs text-green-600 flex items-start gap-1 mb-4 font-medium leading-tight">
              <svg
                className="w-3 h-3 mt-0.5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
              <span>
                +0%{' '}
                <span className="text-muted-foreground font-normal">
                  relativo ao mês anterior
                </span>
              </span>
            </p>
            <Button
              variant="outline"
              className="w-full text-green-700 border-green-200 hover:bg-green-50 text-xs sm:text-sm h-auto py-2 whitespace-normal"
            >
              Detalhes
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-border overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="text-lg font-semibold">
              Monitoramento de Denúncias da Rede
            </CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por protocolo..."
                className="pl-8 bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[140px]">Protocolo</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="w-[150px]">
                  <Button
                    variant="ghost"
                    className="h-8 px-2 -ml-2 hover:bg-slate-100 font-medium"
                    onClick={() => handleSort('gravidade')}
                  >
                    Gravidade
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="w-[220px]">Status</TableHead>
                <TableHead className="w-[120px] text-right">
                  <Button
                    variant="ghost"
                    className="h-8 px-2 -mr-2 hover:bg-slate-100 font-medium"
                    onClick={() => handleSort('data')}
                  >
                    Data
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center">
                    <div className="flex items-center justify-center text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      Carregando denúncias da rede...
                    </div>
                  </TableCell>
                </TableRow>
              ) : sortedComplaints.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-40 text-center text-muted-foreground"
                  >
                    {search
                      ? 'Nenhuma denúncia encontrada para esta busca.'
                      : 'Nenhuma denúncia encontrada para a rede.'}
                  </TableCell>
                </TableRow>
              ) : (
                sortedComplaints.map((complaint) => (
                  <TableRow
                    key={complaint.id}
                    className="cursor-pointer hover:bg-slate-50 group"
                  >
                    <TableCell className="font-medium">
                      <Link
                        to={`/senior/workflow/${complaint.id}`}
                        className="text-blue-600 group-hover:underline group-hover:text-blue-800 transition-colors"
                      >
                        {complaint.protocolo || '-'}
                      </Link>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {complaint.categoria && complaint.categoria.length > 0
                        ? complaint.categoria.join(', ')
                        : 'Não especificada'}
                    </TableCell>
                    <TableCell>
                      {getSeverityBadge(complaint.gravidade)}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border">
                        {complaint.status_nome || 'Status Desconhecido'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground whitespace-nowrap">
                      {new Date(complaint.created_at).toLocaleDateString(
                        'pt-BR',
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
