import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  FileSearch,
  ArrowRight,
  Scale,
  CheckCircle2,
  Search,
  X,
} from 'lucide-react'
import {
  workflowService,
  WorkflowComplaint,
  WORKFLOW_STATUS,
} from '@/services/workflowService'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export default function ComplaintWorkflow() {
  const [data, setData] = useState<{
    f1: WorkflowComplaint[]
    f2: WorkflowComplaint[]
    f3: WorkflowComplaint[]
    closed: WorkflowComplaint[]
  }>({ f1: [], f2: [], f3: [], closed: [] })

  const [loading, setLoading] = useState(true)
  const [activePhase, setActivePhase] = useState<'f1' | 'f2' | 'f3' | 'closed'>(
    'f1',
  )
  const [subFilter, setSubFilter] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const res = await workflowService.getWorkflowDashboardData()
        setData(res)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const currentList = useMemo(() => {
    let list = data[activePhase] || []

    if (subFilter) {
      if (activePhase === 'f3') {
        if (subFilter === 'mediacao') {
          list = list.filter(
            (c) =>
              c.tipo_resolucao === 'mediacao' ||
              c.status?.toLowerCase().includes('mediação'),
          )
        } else if (subFilter === 'disciplinar') {
          list = list.filter(
            (c) =>
              c.tipo_resolucao === 'disciplinar' ||
              c.status?.toLowerCase().includes('disciplinar'),
          )
        }
      } else {
        list = list.filter((c) => c.status === subFilter)
      }
    }

    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (c) =>
          c.protocolo?.toLowerCase().includes(q) ||
          c.descricao?.toLowerCase().includes(q) ||
          c.status?.toLowerCase().includes(q),
      )
    }

    return list
  }, [data, activePhase, subFilter, search])

  const filtersF1 = [
    WORKFLOW_STATUS.REGISTERED,
    WORKFLOW_STATUS.WAITING_ANALYST_1,
    WORKFLOW_STATUS.ANALYSIS_1,
    WORKFLOW_STATUS.REVIEW_1,
    WORKFLOW_STATUS.RETURNED_1,
  ]
  const filtersF2 = [
    WORKFLOW_STATUS.APPROVED_PROCEDURE,
    WORKFLOW_STATUS.INVESTIGATION_2,
    WORKFLOW_STATUS.REVIEW_2,
  ]
  const filtersF3 = [
    { label: 'Mediações', value: 'mediacao' },
    { label: 'Processos Disciplinares', value: 'disciplinar' },
  ]
  const filtersClosed = [WORKFLOW_STATUS.CLOSED, WORKFLOW_STATUS.ARCHIVED]

  const selectPhase = (
    phase: typeof activePhase,
    filter: string | null = null,
  ) => {
    setActivePhase(phase)
    setSubFilter(filter)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">
          Workflow de Denúncias
        </h1>
      </div>

      {/* Phase Navigation */}
      <div className="flex items-center space-x-3 overflow-x-auto pb-4 scrollbar-thin">
        {/* F1 Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'rounded-full px-5 py-6 border-2 transition-all flex items-center space-x-2 text-sm shrink-0',
                activePhase === 'f1'
                  ? 'border-blue-400 bg-blue-100 text-blue-800 font-semibold shadow-sm'
                  : 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300',
              )}
            >
              <FileSearch className="w-5 h-5" />
              <span>Entrada & Análise</span>
              <Badge
                variant="secondary"
                className="ml-2 bg-white text-blue-700 rounded-full border border-blue-200"
              >
                {data.f1.length}
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="start">
            <DropdownMenuLabel>Filtrar por Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => selectPhase('f1', null)}>
              Todos da Entrada & Análise
            </DropdownMenuItem>
            {filtersF1.map((f) => (
              <DropdownMenuItem key={f} onClick={() => selectPhase('f1', f)}>
                {f}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <ArrowRight className="text-slate-300 w-5 h-5 flex-shrink-0" />

        {/* F2 Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'rounded-full px-5 py-6 border-2 transition-all flex items-center space-x-2 text-sm shrink-0',
                activePhase === 'f2'
                  ? 'border-amber-400 bg-amber-100 text-amber-800 font-semibold shadow-sm'
                  : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:border-amber-300',
              )}
            >
              <span>Investigação (F2)</span>
              <Badge
                variant="secondary"
                className="ml-2 bg-white text-amber-700 rounded-full border border-amber-200"
              >
                {data.f2.length}
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="start">
            <DropdownMenuLabel>Filtrar por Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => selectPhase('f2', null)}>
              Todos em Investigação
            </DropdownMenuItem>
            {filtersF2.map((f) => (
              <DropdownMenuItem key={f} onClick={() => selectPhase('f2', f)}>
                {f}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <ArrowRight className="text-slate-300 w-5 h-5 flex-shrink-0" />

        {/* F3 Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'rounded-full px-5 py-6 border-2 transition-all flex items-center space-x-2 text-sm shrink-0',
                activePhase === 'f3'
                  ? 'border-purple-400 bg-purple-100 text-purple-800 font-semibold shadow-sm'
                  : 'border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 hover:border-purple-300',
              )}
            >
              <Scale className="w-5 h-5" />
              <span>Execução (F3)</span>
              <Badge
                variant="secondary"
                className="ml-2 bg-white text-purple-700 rounded-full border border-purple-200"
              >
                {data.f3.length}
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="start">
            <DropdownMenuLabel>Filtrar por Tipo</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => selectPhase('f3', null)}>
              Todos em Execução
            </DropdownMenuItem>
            {filtersF3.map((f) => (
              <DropdownMenuItem
                key={f.value}
                onClick={() => selectPhase('f3', f.value)}
              >
                {f.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <ArrowRight className="text-slate-300 w-5 h-5 flex-shrink-0" />

        {/* Closed Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'rounded-full px-5 py-6 border-2 transition-all flex items-center space-x-2 text-sm shrink-0',
                activePhase === 'closed'
                  ? 'border-emerald-400 bg-emerald-100 text-emerald-800 font-semibold shadow-sm'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300',
              )}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Encerradas</span>
              <Badge
                variant="secondary"
                className="ml-2 bg-white text-emerald-700 rounded-full border border-emerald-200"
              >
                {data.closed.length}
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="start">
            <DropdownMenuLabel>Filtrar por Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => selectPhase('closed', null)}>
              Todas Encerradas
            </DropdownMenuItem>
            {filtersClosed.map((f) => (
              <DropdownMenuItem
                key={f}
                onClick={() => selectPhase('closed', f)}
              >
                {f}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por protocolo, status ou descrição..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {subFilter && (
          <div className="flex items-center">
            <Badge
              variant="secondary"
              className="px-3 py-1.5 text-sm flex items-center gap-2 bg-slate-100"
            >
              Filtro ativo:{' '}
              {subFilter === 'mediacao'
                ? 'Mediações'
                : subFilter === 'disciplinar'
                  ? 'Processos Disciplinares'
                  : subFilter}
              <button
                onClick={() => setSubFilter(null)}
                className="text-slate-500 hover:text-slate-700"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500 bg-white rounded-xl border border-slate-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800 mx-auto mb-4"></div>
          Carregando denúncias...
        </div>
      ) : currentList.length === 0 ? (
        <div className="text-center py-20 text-slate-500 bg-white rounded-xl border border-slate-100 flex flex-col items-center justify-center">
          <FileSearch className="w-12 h-12 text-slate-300 mb-4" />
          <p className="text-lg">Nenhuma denúncia encontrada nesta fase.</p>
          {(search || subFilter) && (
            <Button
              variant="link"
              onClick={() => {
                setSearch('')
                setSubFilter(null)
              }}
            >
              Limpar filtros
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {currentList.map((c) => (
            <Card
              key={c.id}
              className="hover:border-slate-300 transition-colors bg-white"
            >
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-bold text-slate-800 tracking-tight">
                      {c.protocolo}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        'bg-slate-50 border-slate-200 text-slate-600 font-medium',
                        activePhase === 'f1' &&
                          'bg-blue-50 border-blue-200 text-blue-700',
                        activePhase === 'f2' &&
                          'bg-amber-50 border-amber-200 text-amber-700',
                        activePhase === 'f3' &&
                          'bg-purple-50 border-purple-200 text-purple-700',
                        activePhase === 'closed' &&
                          'bg-emerald-50 border-emerald-200 text-emerald-700',
                      )}
                    >
                      {c.status}
                    </Badge>
                    {c.escolas_instituicoes?.nome_escola && (
                      <span
                        className="text-xs text-slate-500 truncate max-w-[200px]"
                        title={c.escolas_instituicoes.nome_escola}
                      >
                        {c.escolas_instituicoes.nome_escola}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {c.descricao}
                  </p>
                </div>
                <div className="flex-shrink-0 sm:self-center">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full sm:w-auto hover:bg-slate-50"
                  >
                    <Link to={`/compliance/director/workflow/${c.id}`}>
                      Ver Detalhes
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
